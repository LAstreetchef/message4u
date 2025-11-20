import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMessageSchema } from "@shared/schema";
import { generateMessageImage } from "./imageGenerator";
import Stripe from "stripe";

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
      
      // Generate image asynchronously
      try {
        const imageUrl = await generateMessageImage(
          validatedData.messageBody,
          message.id
        );
        await storage.updateMessageImage(message.id, imageUrl);
      } catch (imageError) {
        console.error("Error generating image:", imageError);
        // Continue even if image generation fails
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

  const httpServer = createServer(app);

  return httpServer;
}
