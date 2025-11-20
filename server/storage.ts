import {
  users,
  messages,
  payments,
  type User,
  type UpsertUser,
  type Message,
  type InsertMessage,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Message operations
  createMessage(userId: string, message: InsertMessage): Promise<Message>;
  getMessageById(id: string): Promise<Message | undefined>;
  getMessageBySlug(slug: string): Promise<Message | undefined>;
  getMessagesByUserId(userId: string): Promise<Message[]>;
  updateMessageImage(messageId: string, imageUrl: string): Promise<void>;
  updateMessageFile(messageId: string, fileUrl: string, fileType: string): Promise<void>;
  markMessageUnlocked(messageId: string): Promise<void>;
  toggleMessageActive(messageId: string, active: boolean): Promise<void>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentBySessionId(sessionId: string): Promise<Payment | undefined>;
  getPaymentsByMessageId(messageId: string): Promise<Payment[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Message operations
  async createMessage(userId: string, messageData: InsertMessage): Promise<Message> {
    const slug = randomUUID();
    const [message] = await db
      .insert(messages)
      .values({
        userId,
        slug,
        ...messageData,
      })
      .returning();
    return message;
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }

  async getMessageBySlug(slug: string): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.slug, slug));
    return message;
  }

  async getMessagesByUserId(userId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(desc(messages.createdAt));
  }

  async updateMessageImage(messageId: string, imageUrl: string): Promise<void> {
    await db
      .update(messages)
      .set({ imageUrl })
      .where(eq(messages.id, messageId));
  }

  async updateMessageFile(messageId: string, fileUrl: string, fileType: string): Promise<void> {
    await db
      .update(messages)
      .set({ fileUrl, fileType })
      .where(eq(messages.id, messageId));
  }

  async markMessageUnlocked(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ unlocked: true })
      .where(eq(messages.id, messageId));
  }

  async toggleMessageActive(messageId: string, active: boolean): Promise<void> {
    await db
      .update(messages)
      .set({ active })
      .where(eq(messages.id, messageId));
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async getPaymentBySessionId(sessionId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripeSessionId, sessionId));
    return payment;
  }

  async getPaymentsByMessageId(messageId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.messageId, messageId))
      .orderBy(desc(payments.createdAt));
  }
}

export const storage = new DatabaseStorage();
