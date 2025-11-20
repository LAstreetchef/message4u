import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMessageSchema } from "@shared/schema";
import { generateMessageImage } from "./imageGenerator";
import Stripe from "stripe";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Create message
      const message = await storage.createMessage(userId, validatedData);
      
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
      const userId = req.user.claims.sub;
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
      // Also only return imageUrl if message is unlocked
      const { messageBody, ...safeMessage } = message;
      
      // If not unlocked, also hide the imageUrl
      if (!message.unlocked) {
        const { imageUrl, ...lockedMessage } = safeMessage;
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

      res.json({ sessionId: session.id });
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

        // Create payment record
        await storage.createPayment({
          messageId,
          stripeSessionId: session.id,
          amount: (session.amount_total! / 100).toString(),
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
      const userId = req.user.claims.sub;

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
      const userId = req.user.claims.sub;
      
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
        // Create payment record
        await storage.createPayment({
          messageId: message.id,
          stripeSessionId: session.id,
          amount: (session.amount_total! / 100).toString(),
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

      const userId = req.user.claims.sub;
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
      const userId = req.user?.claims?.sub;
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
