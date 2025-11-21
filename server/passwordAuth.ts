import { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export function getSession() {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required for session management');
  }

  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
      });

      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const [newUser] = await db
        .insert(users)
        .values({ email: normalizedEmail, passwordHash })
        .returning();

      (req.session as any).userId = newUser.id;
      (req.session as any).email = newUser.email;

      res.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          payoutAddress: newUser.payoutAddress,
          payoutMethod: newUser.payoutMethod,
        },
      });
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
      });

      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      (req.session as any).userId = user.id;
      (req.session as any).email = user.email;

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          payoutAddress: user.payoutAddress,
          payoutMethod: user.payoutMethod,
        },
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

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

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
