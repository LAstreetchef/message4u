import { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { users, magicLinks } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { sendMagicLinkEmail } from "./emailService";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function setupMagicLinkAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Request a magic link
  app.post("/api/auth/request-magic-link", async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Find or create user
      let user = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
      });

      if (!user) {
        const [newUser] = await db
          .insert(users)
          .values({ email: normalizedEmail })
          .returning();
        user = newUser;
      }

      // Generate magic link token
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store the magic link
      await db.insert(magicLinks).values({
        email: normalizedEmail,
        token,
        expiresAt,
      });

      // Send magic link email
      const emailResult = await sendMagicLinkEmail(normalizedEmail, token);

      if (!emailResult.success) {
        console.warn('Failed to send magic link email:', emailResult.error);
        // Still return success to prevent email enumeration
      }

      res.json({ 
        success: true, 
        message: "If that email exists, we've sent you a magic link to sign in."
      });
    } catch (error) {
      console.error("Error creating magic link:", error);
      res.status(500).json({ error: "Failed to create magic link" });
    }
  });

  // Verify magic link
  app.get("/api/auth/verify-magic-link", async (req, res) => {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.redirect("/?error=invalid-token");
    }

    try {
      // Find the magic link
      const magicLink = await db.query.magicLinks.findFirst({
        where: and(
          eq(magicLinks.token, token),
          eq(magicLinks.used, false)
        ),
      });

      if (!magicLink) {
        return res.redirect("/?error=invalid-token");
      }

      // Check if expired
      if (new Date() > magicLink.expiresAt) {
        return res.redirect("/?error=expired-token");
      }

      // Mark as used
      await db
        .update(magicLinks)
        .set({ used: true })
        .where(eq(magicLinks.token, token));

      // Find the user
      const user = await db.query.users.findFirst({
        where: eq(users.email, magicLink.email),
      });

      if (!user) {
        return res.redirect("/?error=user-not-found");
      }

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).email = user.email;

      // Redirect to dashboard
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error verifying magic link:", error);
      res.redirect("/?error=verification-failed");
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    const userId = (req.session as any)?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify user still exists
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request for convenience
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
