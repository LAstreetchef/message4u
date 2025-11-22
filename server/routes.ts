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

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

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
      const { userId, amount, payoutMethod, payoutAddress, adminNotes } = req.body;
      const adminId = req.user.id;

      // Validate required fields
      if (!userId || !amount || !payoutMethod || !payoutAddress) {
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

      const payout = await storage.createPayout({
        userId,
        amount: parsedAmount.toString(),
        payoutMethod,
        payoutAddress,
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
        success_url: `${req.protocol}://${req.get('host')}/m/${message.slug}/unlocked?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/m/${message.slug}`,
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

  // Stripe webhook for payment confirmation
  app.post('/api/webhook/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
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
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      try {
        const messageId = session.metadata?.messageId;
        if (!messageId) {
          console.error('No messageId in session metadata');
          return res.status(400).send('No messageId in metadata');
        }

        // Create payment record with platform fee calculation
        const amount = session.amount_total! / 100;
        const { platformFee, senderEarnings } = calculatePlatformFee(amount);
        
        await storage.createPayment({
          messageId,
          stripeSessionId: session.id,
          amount: amount.toString(),
          platformFee: platformFee.toString(),
          senderEarnings: senderEarnings.toString(),
        });

        // Mark message as unlocked
        await storage.markMessageUnlocked(messageId);
      } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).send('Error processing payment');
      }
    }

    res.json({ received: true });
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
  // Reference: blueprint:javascript_object_storage
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

  // Update payout information
  app.patch("/api/auth/payout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { payoutMethod, payoutAddress } = req.body;

      if (!payoutMethod || !payoutAddress) {
        return res.status(400).json({ error: "Payment method and address are required" });
      }

      await storage.updateUserPayout(userId, payoutMethod, payoutAddress);

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating payout info:", error);
      res.status(500).json({ error: "Failed to update payout information" });
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
