import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./passwordAuth";
import { insertMessageSchema } from "@shared/schema";
import { generateMessageImage } from "./imageGenerator";
import Stripe from "stripe";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { sendMessageNotification, isValidEmail } from "./emailService";
import { NOWPaymentsPayoutService } from "./nowpaymentsPayoutService";
import { getBaseUrl } from "./url";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

// NOWPayments configuration
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

if (!process.env.NOWPAYMENTS_API_KEY) {
  console.warn('NOWPAYMENTS_API_KEY not set - crypto payments will not work');
} else {
  console.log('NOWPayments configured successfully');
}

// Pending crypto payouts are now stored in the database (see schema.ts)

// Calculate platform fee: $1.69 + 6.9% of amount
// Works in cents (integers) to avoid floating point rounding errors
function calculatePlatformFee(amount: number): { platformFee: number; senderEarnings: number } {
  // Convert amount to cents for integer arithmetic
  const amountCents = Math.round(amount * 100);
  
  // Calculate platform fee in cents: $1.69 (169 cents) + 6.9% of amount
  const calculatedFeeCents = 169 + Math.round(amountCents * 0.069);
  
  // Clamp platform fee to not exceed the total amount
  const platformFeeCents = Math.min(calculatedFeeCents, amountCents);
  
  // Calculate sender earnings as remainder (guaranteed to sum exactly to amount)
  const senderEarningsCents = amountCents - platformFeeCents;
  
  return {
    platformFee: platformFeeCents / 100,
    senderEarnings: senderEarningsCents / 100,
  };
}

// Admin middleware - only allows specific admin email
const ADMIN_EMAIL = "message4u@secretmessage4u.com";

const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.user || !req.user.id) {
    return res.status(403).json({ message: "Unauthorized - Admin access required" });
  }
  
  // Fetch fresh user data from database to verify email
  const user = await storage.getUser(req.user.id);
  if (!user || user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ message: "Unauthorized - Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Health check for Render/monitoring
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/payments', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allPayments = await storage.getAllPayments();
      res.json(allPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get('/api/admin/analytics', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/admin/payouts/pending', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pendingPayouts = await storage.getPendingPayouts();
      res.json(pendingPayouts);
    } catch (error) {
      console.error("Error fetching pending payouts:", error);
      res.status(500).json({ message: "Failed to fetch pending payouts" });
    }
  });

  app.post('/api/admin/payouts', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId, amount, adminNotes } = req.body;
      const adminId = req.user.id;

      // Validate required fields
      if (!userId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate amount is a positive number
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }

      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let stripePayoutId = null;
      let stripeTransferId = null;
      let actualPayoutMethod = null;
      let actualPayoutAddress = null;
      let payoutStatus = "completed";

      // Check if user has Stripe Connect account configured
      if (user.stripeAccountId && user.stripeOnboardingComplete) {
        try {
          // Perform automated Stripe transfer
          const transfer = await stripe.transfers.create({
            amount: Math.round(parsedAmount * 100),
            currency: 'usd',
            destination: user.stripeAccountId,
            description: `Payout for message earnings`,
          });

          stripeTransferId = transfer.id;
          actualPayoutMethod = 'stripe';
          actualPayoutAddress = user.stripeAccountId;
          payoutStatus = 'completed';

          console.log(`Automated Stripe transfer completed: ${transfer.id} for $${parsedAmount}`);
        } catch (stripeError: any) {
          console.error("Error creating Stripe transfer:", stripeError);
          return res.status(500).json({ 
            message: `Failed to process Stripe transfer: ${stripeError.message}` 
          });
        }
      } else if (user.payoutMethod && user.payoutAddress) {
        // Manual payout method (PayPal, Venmo, Cash App, Zelle)
        actualPayoutMethod = user.payoutMethod;
        actualPayoutAddress = user.payoutAddress;
        payoutStatus = 'completed';
        console.log(`Manual payout marked for ${user.email}: ${actualPayoutMethod} - ${actualPayoutAddress}`);
      } else if (user.cryptoWalletType && user.cryptoWalletAddress) {
        // Crypto wallet payout - use stored wallet info
        actualPayoutMethod = user.cryptoWalletType;
        actualPayoutAddress = user.cryptoWalletAddress;
        payoutStatus = 'completed';
        console.log(`Manual crypto payout marked for ${user.email}: ${actualPayoutMethod} - ${actualPayoutAddress}`);
      } else {
        // No payout method configured
        return res.status(400).json({ 
          message: "User doesn't have a payout method configured. Please ask them to set up PayPal, Venmo, Cash App, or Zelle in their dashboard." 
        });
      }

      const payout = await storage.createPayout({
        userId,
        amount: parsedAmount.toString(),
        payoutMethod: actualPayoutMethod,
        payoutAddress: actualPayoutAddress,
        stripePayoutId,
        stripeTransferId,
        payoutStatus,
        adminNotes: adminNotes || null,
        completedBy: adminId,
      });

      res.json(payout);
    } catch (error) {
      console.error("Error creating payout:", error);
      res.status(500).json({ message: "Failed to create payout" });
    }
  });

  app.get('/api/admin/payouts/history', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const payoutHistory = await storage.getPayoutHistory();
      res.json(payoutHistory);
    } catch (error) {
      console.error("Error fetching payout history:", error);
      res.status(500).json({ message: "Failed to fetch payout history" });
    }
  });

  // NOWPayments crypto payout routes
  app.post('/api/admin/payouts/crypto/create', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Clean up expired pending payouts
      await storage.cleanupExpiredPendingPayouts();

      if (!process.env.NOWPAYMENTS_API_KEY) {
        return res.status(500).json({ message: "NOWPayments not configured" });
      }

      const { userId, amount, currency, adminNotes } = req.body;
      const adminId = req.user.id;

      if (!userId || !amount || !currency) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.cryptoWalletAddress) {
        return res.status(400).json({ message: "User doesn't have a crypto wallet configured" });
      }

      const payoutService = new NOWPaymentsPayoutService(process.env.NOWPAYMENTS_API_KEY);

      const payout = await payoutService.createPayout({
        address: user.cryptoWalletAddress,
        currency: currency.toLowerCase(),
        amount: parsedAmount,
        ipn_callback_url: `${req.protocol}://${req.get('host')}/api/webhook/nowpayments-payout`,
      });

      // Store payout data server-side to prevent tampering
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      await storage.createPendingCryptoPayout({
        payoutId: payout.id,
        userId,
        amount: parsedAmount.toString(),
        currency: currency.toLowerCase(),
        adminNotes: adminNotes || null,
        createdBy: adminId,
        expiresAt,
      });

      res.json({
        payoutId: payout.id,
        status: payout.status,
        amount: payout.amount,
        currency: payout.currency,
        address: payout.address,
        requiresVerification: true,
        message: "Payout created. Please verify with 2FA code."
      });
    } catch (error: any) {
      console.error("Error creating crypto payout:", error);
      res.status(500).json({ message: error.message || "Failed to create crypto payout" });
    }
  });

  app.post('/api/admin/payouts/crypto/verify', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      if (!process.env.NOWPAYMENTS_API_KEY) {
        return res.status(500).json({ message: "NOWPayments not configured" });
      }

      const { payoutId, verificationCode } = req.body;
      const adminId = req.user.id;

      if (!payoutId || !verificationCode) {
        return res.status(400).json({ message: "Missing payout ID or verification code" });
      }

      // Retrieve stored payout data (prevents tampering)
      const storedPayout = await storage.getPendingCryptoPayout(payoutId);
      if (!storedPayout) {
        return res.status(400).json({ message: "Invalid payout ID or payout expired" });
      }

      // Check if payout has expired
      if (new Date() > new Date(storedPayout.expiresAt)) {
        await storage.deletePendingCryptoPayout(payoutId);
        return res.status(400).json({ message: "Payout verification expired" });
      }

      const payoutService = new NOWPaymentsPayoutService(process.env.NOWPAYMENTS_API_KEY);

      await payoutService.verifyPayout({
        id: payoutId,
        verification_code: verificationCode,
      });

      const user = await storage.getUser(storedPayout.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const payoutHistory = await storage.createPayout({
        userId: storedPayout.userId,
        amount: storedPayout.amount,
        payoutMethod: 'nowpayments',
        payoutAddress: user.cryptoWalletAddress || '',
        nowpaymentsPayoutId: payoutId,
        cryptoCurrency: storedPayout.currency,
        payoutStatus: 'processing',
        adminNotes: storedPayout.adminNotes,
        completedBy: adminId,
      });

      // Remove from pending table after successful verification
      await storage.deletePendingCryptoPayout(payoutId);

      res.json({
        success: true,
        message: "Payout verified and processing",
        payoutHistory
      });
    } catch (error: any) {
      console.error("Error verifying crypto payout:", error);
      res.status(500).json({ message: error.message || "Failed to verify crypto payout" });
    }
  });

  app.get('/api/admin/payouts/crypto/balance', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      if (!process.env.NOWPAYMENTS_API_KEY) {
        return res.status(500).json({ message: "NOWPayments not configured" });
      }

      const payoutService = new NOWPaymentsPayoutService(process.env.NOWPAYMENTS_API_KEY);
      const balance = await payoutService.getCustodyBalance();

      res.json(balance);
    } catch (error: any) {
      console.error("Error getting custody balance:", error);
      res.status(500).json({ message: error.message || "Failed to get custody balance" });
    }
  });

  app.get('/api/admin/payouts/crypto/:id/status', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      if (!process.env.NOWPAYMENTS_API_KEY) {
        return res.status(500).json({ message: "NOWPayments not configured" });
      }

      const { id } = req.params;

      const payoutService = new NOWPaymentsPayoutService(process.env.NOWPAYMENTS_API_KEY);
      const status = await payoutService.getPayoutStatus(id);

      res.json(status);
    } catch (error: any) {
      console.error("Error getting payout status:", error);
      res.status(500).json({ message: error.message || "Failed to get payout status" });
    }
  });

  // User crypto wallet routes
  app.patch('/api/auth/crypto-wallet', isAuthenticated, async (req: any, res) => {
    try {
      const { cryptoWalletType, cryptoWalletAddress } = req.body;
      const userId = req.user.id;

      if (!cryptoWalletType || !cryptoWalletAddress) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      await storage.updateUserCryptoWallet(userId, cryptoWalletAddress, cryptoWalletType);
      res.json({ message: "Crypto wallet updated successfully" });
    } catch (error) {
      console.error("Error updating crypto wallet:", error);
      res.status(500).json({ message: "Failed to update crypto wallet" });
    }
  });

  // User payout method routes
  app.patch('/api/auth/payout-method', isAuthenticated, async (req: any, res) => {
    try {
      const { payoutMethod, payoutAddress } = req.body;
      const userId = req.user.id;

      if (!payoutMethod || !payoutAddress) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const validMethods = ['paypal', 'venmo', 'cashapp', 'zelle'];
      if (!validMethods.includes(payoutMethod)) {
        return res.status(400).json({ message: "Invalid payout method" });
      }

      await storage.updateUserPayoutMethod(userId, payoutMethod, payoutAddress);
      res.json({ message: "Payout method updated successfully" });
    } catch (error) {
      console.error("Error updating payout method:", error);
      res.status(500).json({ message: "Failed to update payout method" });
    }
  });

  app.get('/api/auth/payout-method', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        payoutMethod: user.payoutMethod || null, 
        payoutAddress: user.payoutAddress || null 
      });
    } catch (error) {
      console.error("Error fetching payout method:", error);
      res.status(500).json({ message: "Failed to fetch payout method" });
    }
  });

  // Stripe Connect routes
  app.post('/api/stripe/create-connect-account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Debug: Log the API key prefix to verify we're using live keys
      const keyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 12) || 'undefined';
      console.log(`[Stripe Debug] API Key prefix: ${keyPrefix}...`);
      console.log(`[Stripe Debug] User ${user?.email} - Current stripeAccountId: ${user?.stripeAccountId || 'NULL'}`);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeAccountId) {
        console.log(`[Stripe Debug] Returning existing account: ${user.stripeAccountId}`);
        return res.json({ 
          accountId: user.stripeAccountId,
          onboardingComplete: user.stripeOnboardingComplete 
        });
      }

      console.log(`[Stripe Debug] Creating NEW Stripe Connect account for ${user.email}...`);
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
      });
      
      console.log(`[Stripe Debug] NEW account created: ${account.id}`);

      await storage.updateUserStripeAccount(userId, account.id, false);
      console.log(`[Stripe Debug] Saved account ${account.id} to database for user ${userId}`);

      res.json({ accountId: account.id, onboardingComplete: false });
    } catch (error: any) {
      console.error("Error creating Stripe Connect account:", error);
      console.error("Stripe error details:", {
        type: error.type,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        raw: error.raw
      });
      res.status(500).json({ 
        message: "Failed to create Connect account",
        error: error.message,
        code: error.code
      });
    }
  });

  app.post('/api/stripe/create-account-link', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Debug: Log the API key prefix
      const keyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 12) || 'undefined';
      console.log(`[Stripe Debug] create-account-link - API Key prefix: ${keyPrefix}...`);
      console.log(`[Stripe Debug] create-account-link - User stripeAccountId: ${user?.stripeAccountId || 'NULL'}`);

      if (!user || !user.stripeAccountId) {
        console.log(`[Stripe Debug] No Stripe account found for user`);
        return res.status(400).json({ message: "No Stripe account found" });
      }

      const baseUrl = getBaseUrl({ req });
      const returnUrl = `${baseUrl}/dashboard?stripe_onboarding=complete`;
      const refreshUrl = `${baseUrl}/dashboard?stripe_onboarding=refresh`;

      console.log("[Stripe Debug] Creating account link for:", {
        accountId: user.stripeAccountId,
        baseUrl,
        returnUrl,
        refreshUrl
      });

      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      console.log(`[Stripe Debug] Account link created successfully: ${accountLink.url?.substring(0, 50)}...`);
      res.json({ url: accountLink.url });
    } catch (error: any) {
      console.error("[Stripe Debug] Error creating account link:", error);
      console.error("[Stripe Debug] Stripe error details:", {
        type: error.type,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode
      });
      res.status(500).json({ 
        message: "Failed to create account link",
        error: error.message,
        code: error.code
      });
    }
  });

  app.get('/api/stripe/connect-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || !user.stripeAccountId) {
        return res.json({ 
          connected: false, 
          onboardingComplete: false 
        });
      }

      const account = await stripe.accounts.retrieve(user.stripeAccountId);
      const onboardingComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled;

      if (onboardingComplete && !user.stripeOnboardingComplete) {
        await storage.updateUserStripeAccount(userId, user.stripeAccountId, true);
      }

      res.json({ 
        connected: true,
        onboardingComplete,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
      });
    } catch (error: any) {
      console.error("Error checking connect status:", error);
      console.error("Stripe error details:", {
        type: error.type,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode
      });
      res.status(500).json({ 
        message: "Failed to check connect status",
        error: error.message,
        code: error.code
      });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Convert expiresAt from ISO string to Date if present
      const messageData = {
        ...validatedData,
        expiresAt: validatedData.expiresAt 
          ? (typeof validatedData.expiresAt === 'string' 
              ? new Date(validatedData.expiresAt) 
              : validatedData.expiresAt)
          : undefined,
      };
      
      // Create message
      const message = await storage.createMessage(userId, messageData);
      
      // Generate image only if no file was uploaded and messageBody exists
      if (!validatedData.fileUrl && validatedData.messageBody) {
        try {
          const imageUrl = await generateMessageImage(
            validatedData.messageBody,
            message.id
          );
          await storage.updateMessageImage(message.id, imageUrl);
        } catch (imageError) {
          console.error("Error generating image:", imageError);
        }
      }
      
      // Send email notification if recipient identifier is a valid email
      if (isValidEmail(validatedData.recipientIdentifier)) {
        try {
          await sendMessageNotification({
            recipientEmail: validatedData.recipientIdentifier,
            messageTitle: validatedData.title,
            price: message.price,
            slug: message.slug,
          });
          
          console.log(`Email notification sent to ${validatedData.recipientIdentifier}`);
        } catch (emailError) {
          // Don't fail the request if email fails, just log it
          console.error("Error sending email notification:", emailError);
        }
      }
      
      // Don't expose messageBody in response
      const { messageBody, ...safeMessage } = message;
      res.json(safeMessage);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: error.message || "Failed to create message" });
    }
  });

  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userMessages = await storage.getMessagesByUserId(userId);
      res.json(userMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/messages/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const message = await storage.getMessageBySlug(slug);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Return message but don't expose messageBody to protect the content
      // Also only return imageUrl, fileUrl, fileType if message is unlocked
      const { messageBody, ...safeMessage } = message;
      
      // If not unlocked, also hide the imageUrl, fileUrl, and fileType
      if (!message.unlocked) {
        const { imageUrl, fileUrl, fileType, ...lockedMessage } = safeMessage;
        return res.json(lockedMessage);
      }
      
      res.json(safeMessage);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  app.post('/api/messages/:id/resend', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const message = await storage.getMessageById(id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      if (message.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to resend this message" });
      }
      
      if (message.unlocked) {
        return res.json({ message: "Message already unlocked, notification not sent" });
      }
      
      if (!isValidEmail(message.recipientIdentifier)) {
        return res.status(400).json({ message: "Message recipient is not an email address" });
      }
      
      await sendMessageNotification({
        recipientEmail: message.recipientIdentifier,
        messageTitle: message.title,
        price: message.price,
        slug: message.slug,
      });
      
      console.log(`Resent email notification to ${message.recipientIdentifier} for message ${message.id}`);
      
      res.json({ message: "Notification sent successfully" });
    } catch (error: any) {
      console.error("Error resending notification:", error);
      res.status(500).json({ message: error.message || "Failed to resend notification" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { messageId } = req.body;
      
      // messageId here is actually the slug from the frontend
      const message = await storage.getMessageBySlug(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Don't allow payment if already unlocked
      if (message.unlocked) {
        return res.status(400).json({ message: "Message already unlocked" });
      }

      // Don't allow payment if expired
      if (message.expiresAt && new Date(message.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Message has expired" });
      }

      const baseUrl = getBaseUrl({ req });
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: message.title,
                description: 'Unlock this secret message',
              },
              unit_amount: Math.round(parseFloat(message.price) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/m/${message.slug}/unlocked?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/m/${message.slug}`,
        metadata: {
          messageId: message.id,
          slug: message.slug,
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // NOWPayments invoice creation
  app.post("/api/create-crypto-payment", async (req, res) => {
    try {
      if (!process.env.NOWPAYMENTS_API_KEY) {
        return res.status(500).json({ message: "Crypto payments not configured - missing API key" });
      }

      const { messageId } = req.body;
      
      const message = await storage.getMessageBySlug(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      if (message.unlocked) {
        return res.status(400).json({ message: "Message already unlocked" });
      }

      if (message.expiresAt && new Date(message.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Message has expired" });
      }

      const baseUrl = getBaseUrl({ req });
      
      const invoiceData = {
        price_amount: parseFloat(message.price),
        price_currency: 'usd',
        order_id: `msg_${message.id}_${Date.now()}`,
        order_description: `Unlock message: ${message.title}`,
        ipn_callback_url: `${baseUrl}/api/webhook/nowpayments`,
        success_url: `${baseUrl}/m/${message.slug}/unlocked`,
        cancel_url: `${baseUrl}/m/${message.slug}`,
      };

      console.log('Creating NOWPayments invoice with data:', JSON.stringify(invoiceData, null, 2));
      
      const response = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NOWPayments API error:', errorData);
        throw new Error(`NOWPayments API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const invoice = await response.json();
      
      console.log('NOWPayments invoice created successfully!');
      console.log('Full NOWPayments response:', JSON.stringify(invoice, null, 2));
      console.log('Invoice ID:', invoice.id);
      console.log('Invoice URL:', invoice.invoice_url);
      
      // Store the invoice ID and message mapping for webhook processing
      // We'll use the order_id to track which message this payment is for
      
      res.json({ 
        invoiceId: invoice.id,
        hostedUrl: invoice.invoice_url,
        orderId: invoice.order_id,
      });
    } catch (error: any) {
      console.error("Error creating NOWPayments invoice - Full error details:");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ 
        message: "Error creating crypto payment: " + error.message,
      });
    }
  });

  // NOWPayments IPN webhook for payment confirmation
  app.post('/api/webhook/nowpayments', async (req: any, res) => {
    try {
      const signature = req.headers['x-nowpayments-sig'];
      
      if (!signature || !process.env.NOWPAYMENTS_IPN_SECRET) {
        console.error('Missing webhook signature or IPN secret');
        return res.status(400).send('No signature or IPN secret');
      }

      // Verify signature using HMAC
      const crypto = await import('crypto');
      const payload = JSON.stringify(req.body);
      const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET);
      const calculatedSignature = hmac.update(payload).digest('hex');
      
      if (signature !== calculatedSignature) {
        console.error('NOWPayments webhook signature verification failed');
        return res.status(400).send('Invalid signature');
      }

      console.log(`NOWPayments webhook event received:`, JSON.stringify(req.body, null, 2));

      const payment = req.body;
      
      // NOWPayments sends payment_status: finished when payment is complete
      if (payment.payment_status === 'finished' || payment.payment_status === 'confirmed') {
        // Extract messageId from order_id (format: msg_{messageId}_{timestamp})
        const orderId = payment.order_id;
        if (!orderId || !orderId.startsWith('msg_')) {
          console.error('Invalid order_id format:', orderId);
          return res.status(400).send('Invalid order_id');
        }
        
        const messageId = orderId.split('_')[1];
        if (!messageId) {
          console.error('No messageId in order_id:', orderId);
          return res.status(400).send('No messageId in order_id');
        }

        // Check if payment already exists to prevent duplicates
        const existingPayment = await storage.getPaymentByNowPaymentsId(payment.payment_id);
        if (existingPayment) {
          console.log(`Payment already processed for NOWPayments ID ${payment.payment_id}`);
          return res.json({ received: true, status: 'already_processed' });
        }

        const amount = parseFloat(payment.price_amount);
        const { platformFee, senderEarnings } = calculatePlatformFee(amount);
        
        await storage.createPayment({
          messageId,
          paymentProvider: 'nowpayments',
          nowpaymentsPaymentId: payment.payment_id.toString(),
          nowpaymentsOrderId: orderId,
          amount: amount.toString(),
          platformFee: platformFee.toString(),
          senderEarnings: senderEarnings.toString(),
        });

        await storage.markMessageUnlocked(messageId);
        
        console.log(`Successfully processed NOWPayments payment for message ${messageId}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing NOWPayments webhook:', error);
      res.status(500).send('Error processing payment');
    }
  });

  // Stripe webhook for payment confirmation
  // Security: Return 400 for invalid signatures (blocks spoofed events)
  // Return 200 for all verified events (prevents retry storms for events we've processed or don't need)
  app.post('/api/webhook/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      console.error('[Stripe Webhook] No signature header present - rejecting');
      return res.status(400).send('No signature');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      // Return 400 for security - reject potentially spoofed events
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (ID: ${event.id})`);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      try {
        const messageId = session.metadata?.messageId;
        if (!messageId) {
          console.error('[Stripe Webhook] checkout.session.completed - No messageId in session metadata, session ID:', session.id);
          // Return 200 - this might be a checkout not related to our messages
          return res.status(200).json({ received: true, skipped: 'No messageId in metadata' });
        }

        console.log(`[Stripe Webhook] Processing checkout.session.completed for message ${messageId}`);

        // Create payment record with platform fee calculation
        const amount = session.amount_total! / 100;
        const { platformFee, senderEarnings } = calculatePlatformFee(amount);
        
        await storage.createPayment({
          messageId,
          paymentProvider: 'stripe',
          stripeSessionId: session.id,
          amount: amount.toString(),
          platformFee: platformFee.toString(),
          senderEarnings: senderEarnings.toString(),
        });

        // Mark message as unlocked
        await storage.markMessageUnlocked(messageId);
        console.log(`[Stripe Webhook] Successfully processed payment for message ${messageId}`);
      } catch (error) {
        console.error('[Stripe Webhook] Error processing checkout.session.completed:', error);
        // Still return 200 to prevent retry - we logged the error for debugging
      }
    }
    
    // Handle account.updated (Stripe Connect)
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;
      
      try {
        console.log(`[Stripe Webhook] Processing account.updated for account ${account.id}`);
        const user = await storage.getUserByStripeAccountId(account.id);
        
        if (user) {
          const onboardingComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled;
          
          if (onboardingComplete !== user.stripeOnboardingComplete) {
            await storage.updateUserStripeAccount(user.id, account.id, onboardingComplete);
            console.log(`[Stripe Webhook] Connect account ${account.id} onboarding status changed to ${onboardingComplete} for user ${user.id}`);
          } else {
            console.log(`[Stripe Webhook] Connect account ${account.id} status unchanged for user ${user.id}`);
          }
        } else {
          console.log(`[Stripe Webhook] No user found for Connect account ${account.id} - this may be expected for new accounts`);
        }
      } catch (error) {
        console.error('[Stripe Webhook] Error updating Connect account status:', error);
        // Still return 200 to prevent retry
      }
    }
    
    // Handle transfer events
    if (event.type.startsWith('transfer.')) {
      const transfer = event.data.object as Stripe.Transfer;
      console.log(`[Stripe Webhook] Transfer ${event.type}: ${transfer.id} for $${transfer.amount / 100}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  });

  // Toggle message active status
  app.patch('/api/messages/:id/toggle-active', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { active } = req.body;
      const userId = req.user.id;

      // Verify ownership - id could be either slug or database ID
      let message = await storage.getMessageById(id);
      if (!message) {
        message = await storage.getMessageBySlug(id);
      }
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      if (message.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.toggleMessageActive(message.id, active);
      res.json({ success: true });
    } catch (error) {
      console.error("Error toggling message active status:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  // Get all payments for user's messages
  app.get('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get all user's messages
      const messages = await storage.getMessagesByUserId(userId);
      const messageIds = messages.map(m => m.id);
      
      // Get all payments for these messages
      const allPayments = await Promise.all(
        messageIds.map(id => storage.getPaymentsByMessageId(id))
      );
      
      // Flatten the array of arrays
      const payments = allPayments.flat();
      
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Manual unlock check for success page (fallback if webhook fails)
  app.get('/api/messages/:slug/check-payment', async (req, res) => {
    try {
      const { slug } = req.params;
      const { session_id } = req.query;

      if (!session_id) {
        return res.status(400).json({ message: "No session ID provided" });
      }

      const message = await storage.getMessageBySlug(slug);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Check if payment exists
      const payment = await storage.getPaymentBySessionId(session_id as string);
      
      if (payment) {
        // Mark as unlocked if not already
        if (!message.unlocked) {
          await storage.markMessageUnlocked(message.id);
        }
        return res.json({ unlocked: true });
      }

      // Verify with Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      if (session.payment_status === 'paid') {
        // Create payment record with platform fee calculation
        const amount = session.amount_total! / 100;
        const { platformFee, senderEarnings } = calculatePlatformFee(amount);
        
        await storage.createPayment({
          messageId: message.id,
          stripeSessionId: session.id,
          amount: amount.toString(),
          platformFee: platformFee.toString(),
          senderEarnings: senderEarnings.toString(),
        });

        // Mark message as unlocked
        await storage.markMessageUnlocked(message.id);
        
        return res.json({ unlocked: true });
      }

      res.json({ unlocked: false });
    } catch (error) {
      console.error("Error checking payment:", error);
      res.status(500).json({ message: "Failed to check payment" });
    }
  });

  // Public endpoint to serve files for unlocked messages
  app.get('/api/messages/:slug/file', async (req, res) => {
    try {
      const { slug } = req.params;
      const message = await storage.getMessageBySlug(slug);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Only serve file if message is unlocked
      if (!message.unlocked) {
        return res.status(403).json({ message: "Message not unlocked" });
      }

      // Check if message has a file
      if (!message.fileUrl) {
        return res.status(404).json({ message: "No file attached to this message" });
      }

      // Get the file from object storage
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(message.fileUrl);
      
      // Serve the file
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving message file:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ message: "File not found" });
      }
      return res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Object storage routes for file uploads
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Handle actual file upload (for local storage)
  app.put("/api/upload/:objectId", isAuthenticated, async (req: any, res) => {
    try {
      const { objectId } = req.params;
      const contentType = req.get('content-type') || 'application/octet-stream';
      
      // Get raw body as buffer
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      if (buffer.length === 0) {
        return res.status(400).json({ error: "No file data received" });
      }
      
      // Determine file extension from content type
      const extMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'video/mp4': '.mp4',
        'audio/mpeg': '.mp3',
        'application/pdf': '.pdf',
      };
      const ext = extMap[contentType] || '';
      
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.saveUploadedFile(
        objectId, 
        buffer, 
        `file${ext}`
      );
      
      res.json({ objectPath, success: true });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.put("/api/messages/:id/file", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { fileURL, fileType } = req.body;

      if (!fileURL) {
        return res.status(400).json({ error: "fileURL is required" });
      }

      const userId = req.user.id;
      const message = await storage.getMessageById(id);

      if (!message || message.userId !== userId) {
        return res.status(404).json({ error: "Message not found" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        fileURL,
        {
          owner: userId,
          visibility: "private",
        }
      );

      await storage.updateMessageFile(id, objectPath, fileType);

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting message file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const objectStorageService = new ObjectStorageService();
      
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });

      if (!canAccess) {
        return res.sendStatus(401);
      }

      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
