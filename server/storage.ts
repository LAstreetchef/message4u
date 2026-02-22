import {
  users,
  messages,
  payments,
  payoutHistory,
  pendingCryptoPayouts,
  type User,
  type UpsertUser,
  type Message,
  type InsertMessage,
  type Payment,
  type InsertPayment,
  type PayoutHistory,
  type InsertPayoutHistory,
  type PendingCryptoPayout,
  type InsertPendingCryptoPayout,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, lt } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByStripeAccountId(stripeAccountId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserCryptoWallet(userId: string, cryptoWalletAddress: string, cryptoWalletType: string): Promise<void>;
  updateUserStripeAccount(userId: string, stripeAccountId: string, onboardingComplete: boolean): Promise<void>;
  updateUserPayoutMethod(userId: string, payoutMethod: string, payoutAddress: string): Promise<void>;

  // Message operations
  createMessage(userId: string, message: InsertMessage): Promise<Message>;
  getMessageById(id: string): Promise<Message | undefined>;
  getMessageBySlug(slug: string): Promise<Message | undefined>;
  getMessagesByUserId(userId: string): Promise<Message[]>;
  updateMessageImage(messageId: string, imageUrl: string): Promise<void>;
  updateMessageFile(messageId: string, fileUrl: string, fileType: string): Promise<void>;
  markMessageUnlocked(messageId: string): Promise<void>;
  toggleMessageActive(messageId: string, active: boolean): Promise<void>;
  incrementViewCount(messageId: string): Promise<Message | undefined>;
  markMessageDisappeared(messageId: string): Promise<void>;
  checkAndMarkDisappeared(message: Message): Promise<boolean>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentBySessionId(sessionId: string): Promise<Payment | undefined>;
  getPaymentByChargeId(chargeId: string): Promise<Payment | undefined>;
  getPaymentByNowPaymentsId(paymentId: string): Promise<Payment | undefined>;
  getPaymentsByMessageId(messageId: string): Promise<Payment[]>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllPayments(): Promise<Payment[]>;
  getAdminAnalytics(): Promise<{
    totalRevenue: number;
    totalPlatformFees: number;
    totalPayouts: number;
    totalUsers: number;
    totalMessages: number;
    totalUnlocks: number;
  }>;
  getPendingPayouts(): Promise<Array<{
    userId: string;
    email: string;
    stripeAccountId: string | null;
    stripeOnboardingComplete: boolean;
    cryptoWalletType: string | null;
    cryptoWalletAddress: string | null;
    payoutMethod: string | null;
    payoutAddress: string | null;
    totalEarnings: number;
    totalPaidOut: number;
    pendingAmount: number;
  }>>;
  createPayout(payout: InsertPayoutHistory): Promise<PayoutHistory>;
  getPayoutHistory(): Promise<PayoutHistory[]>;
  
  // Pending crypto payout operations
  createPendingCryptoPayout(payout: InsertPendingCryptoPayout): Promise<PendingCryptoPayout>;
  getPendingCryptoPayout(payoutId: string): Promise<PendingCryptoPayout | undefined>;
  deletePendingCryptoPayout(payoutId: string): Promise<void>;
  cleanupExpiredPendingPayouts(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByStripeAccountId(stripeAccountId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeAccountId, stripeAccountId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserCryptoWallet(userId: string, cryptoWalletAddress: string, cryptoWalletType: string): Promise<void> {
    await db
      .update(users)
      .set({
        cryptoWalletAddress,
        cryptoWalletType,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserStripeAccount(userId: string, stripeAccountId: string, onboardingComplete: boolean): Promise<void> {
    await db
      .update(users)
      .set({
        stripeAccountId,
        stripeOnboardingComplete: onboardingComplete,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserPayoutMethod(userId: string, payoutMethod: string, payoutAddress: string): Promise<void> {
    await db
      .update(users)
      .set({
        payoutMethod,
        payoutAddress,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Message operations
  async createMessage(userId: string, messageData: InsertMessage): Promise<Message> {
    const slug = randomUUID();
    
    // Convert date strings to Date objects
    const processedData = {
      ...messageData,
      expiresAt: messageData.expiresAt 
        ? (typeof messageData.expiresAt === 'string' ? new Date(messageData.expiresAt) : messageData.expiresAt)
        : undefined,
      deleteAt: messageData.deleteAt
        ? (typeof messageData.deleteAt === 'string' ? new Date(messageData.deleteAt) : messageData.deleteAt)
        : undefined,
    };
    
    const [message] = await db
      .insert(messages)
      .values({
        userId,
        slug,
        ...processedData,
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

  async incrementViewCount(messageId: string): Promise<Message | undefined> {
    // Get current message state
    const message = await this.getMessageById(messageId);
    if (!message) return undefined;

    // Build update object
    const updateData: Partial<Message> = {
      viewCount: (message.viewCount || 0) + 1,
    };

    // Set firstViewedAt if this is the first view
    if (!message.firstViewedAt) {
      updateData.firstViewedAt = new Date();
    }

    await db
      .update(messages)
      .set(updateData)
      .where(eq(messages.id, messageId));

    return await this.getMessageById(messageId);
  }

  async markMessageDisappeared(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ disappeared: true })
      .where(eq(messages.id, messageId));
  }

  async checkAndMarkDisappeared(message: Message): Promise<boolean> {
    // Already disappeared
    if (message.disappeared) return true;

    const now = new Date();

    // Check bomb mode - absolute deletion time
    if (message.deleteAt && new Date(message.deleteAt) <= now) {
      await this.markMessageDisappeared(message.id);
      return true;
    }

    // Check max views
    if (message.maxViews && message.viewCount >= message.maxViews) {
      await this.markMessageDisappeared(message.id);
      return true;
    }

    // Check delete after first view timer
    if (message.deleteAfterMinutes && message.firstViewedAt) {
      const deleteTime = new Date(message.firstViewedAt);
      deleteTime.setMinutes(deleteTime.getMinutes() + message.deleteAfterMinutes);
      if (now >= deleteTime) {
        await this.markMessageDisappeared(message.id);
        return true;
      }
    }

    return false;
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

  async getPaymentByChargeId(chargeId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.coinbaseChargeId, chargeId));
    return payment;
  }

  async getPaymentByNowPaymentsId(paymentId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.nowpaymentsPaymentId, paymentId));
    return payment;
  }

  async getPaymentsByMessageId(messageId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.messageId, messageId))
      .orderBy(desc(payments.createdAt));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));
  }

  async getAdminAnalytics(): Promise<{
    totalRevenue: number;
    totalPlatformFees: number;
    totalPayouts: number;
    totalUsers: number;
    totalMessages: number;
    totalUnlocks: number;
  }> {
    const allPayments = await this.getAllPayments();
    const allUsers = await this.getAllUsers();
    const allMessages = await db.select().from(messages);
    const allPayoutHistory = await this.getPayoutHistory();

    const totalRevenue = allPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
    const totalPlatformFees = allPayments.reduce((sum, p) => sum + parseFloat(p.platformFee || '0'), 0);
    const totalPayouts = allPayoutHistory.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

    return {
      totalRevenue,
      totalPlatformFees,
      totalPayouts,
      totalUsers: allUsers.length,
      totalMessages: allMessages.length,
      totalUnlocks: allPayments.length,
    };
  }

  async getPendingPayouts(): Promise<Array<{
    userId: string;
    email: string;
    stripeAccountId: string | null;
    stripeOnboardingComplete: boolean;
    cryptoWalletType: string | null;
    cryptoWalletAddress: string | null;
    payoutMethod: string | null;
    payoutAddress: string | null;
    totalEarnings: number;
    totalPaidOut: number;
    pendingAmount: number;
  }>> {
    const allUsers = await this.getAllUsers();
    const result = [];

    for (const user of allUsers) {
      // Get all messages for this user
      const userMessages = await this.getMessagesByUserId(user.id);
      const messageIds = userMessages.map(m => m.id);

      // Get all payments for these messages
      let totalEarnings = 0;
      for (const messageId of messageIds) {
        const messagePayments = await this.getPaymentsByMessageId(messageId);
        totalEarnings += messagePayments.reduce((sum, p) => sum + parseFloat(p.senderEarnings || '0'), 0);
      }

      // Get total paid out
      const userPayouts = await db
        .select()
        .from(payoutHistory)
        .where(eq(payoutHistory.userId, user.id));
      
      const totalPaidOut = userPayouts.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
      const pendingAmount = totalEarnings - totalPaidOut;

      // Only include users with pending payouts or earnings
      if (totalEarnings > 0) {
        result.push({
          userId: user.id,
          email: user.email,
          stripeAccountId: user.stripeAccountId,
          stripeOnboardingComplete: user.stripeOnboardingComplete || false,
          cryptoWalletType: user.cryptoWalletType,
          cryptoWalletAddress: user.cryptoWalletAddress,
          payoutMethod: user.payoutMethod,
          payoutAddress: user.payoutAddress,
          totalEarnings,
          totalPaidOut,
          pendingAmount,
        });
      }
    }

    return result;
  }

  async createPayout(payoutData: InsertPayoutHistory): Promise<PayoutHistory> {
    const [payout] = await db
      .insert(payoutHistory)
      .values(payoutData)
      .returning();
    return payout;
  }

  async getPayoutHistory(): Promise<PayoutHistory[]> {
    return await db
      .select()
      .from(payoutHistory)
      .orderBy(desc(payoutHistory.completedAt));
  }

  // Pending crypto payout operations
  async createPendingCryptoPayout(payoutData: InsertPendingCryptoPayout): Promise<PendingCryptoPayout> {
    const [payout] = await db
      .insert(pendingCryptoPayouts)
      .values(payoutData)
      .returning();
    return payout;
  }

  async getPendingCryptoPayout(payoutId: string): Promise<PendingCryptoPayout | undefined> {
    const [payout] = await db
      .select()
      .from(pendingCryptoPayouts)
      .where(eq(pendingCryptoPayouts.payoutId, payoutId));
    return payout;
  }

  async deletePendingCryptoPayout(payoutId: string): Promise<void> {
    await db
      .delete(pendingCryptoPayouts)
      .where(eq(pendingCryptoPayouts.payoutId, payoutId));
  }

  async cleanupExpiredPendingPayouts(): Promise<void> {
    const now = new Date();
    await db
      .delete(pendingCryptoPayouts)
      .where(lt(pendingCryptoPayouts.expiresAt, now));
  }
}

export const storage = new DatabaseStorage();
