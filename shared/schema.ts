import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, boolean, index, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (password auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  payoutAddress: text("payout_address"),
  payoutMethod: varchar("payout_method", { length: 50 }),
  cryptoWalletAddress: text("crypto_wallet_address"),
  cryptoWalletType: varchar("crypto_wallet_type", { length: 50 }),
  stripeAccountId: varchar("stripe_account_id"),
  stripeOnboardingComplete: boolean("stripe_onboarding_complete").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  disclaimerAgreedAt: timestamp("disclaimer_agreed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const upsertUserSchema = createInsertSchema(users);
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 36 }).notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  recipientIdentifier: text("recipient_identifier").notNull(),
  messageBody: text("message_body"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  fileType: varchar("file_type", { length: 100 }),
  unlocked: boolean("unlocked").notNull().default(false),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  // Disappearing message fields
  viewCount: integer("view_count").notNull().default(0),
  maxViews: integer("max_views"), // null = unlimited
  firstViewedAt: timestamp("first_viewed_at"),
  deleteAfterMinutes: integer("delete_after_minutes"), // delete X min after first view
  deleteAt: timestamp("delete_at"), // absolute deletion time (bomb mode)
  disappeared: boolean("disappeared").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  title: true,
  recipientIdentifier: true,
  messageBody: true,
  price: true,
  expiresAt: true,
  fileUrl: true,
  fileType: true,
  maxViews: true,
  deleteAfterMinutes: true,
  deleteAt: true,
}).extend({
  expiresAt: z.union([z.string(), z.date()]).optional(),
  maxViews: z.number().min(1).max(100).optional().nullable(),
  deleteAfterMinutes: z.number().min(1).max(43200).optional().nullable(), // max 30 days
  deleteAt: z.union([z.string(), z.date()]).optional().nullable(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id),
  paymentProvider: varchar("payment_provider", { length: 50 }).notNull().default("stripe"),
  stripeSessionId: varchar("stripe_session_id"),
  coinbaseChargeId: varchar("coinbase_charge_id"),
  coinbaseChargeCode: varchar("coinbase_charge_code"),
  nowpaymentsPaymentId: varchar("nowpayments_payment_id"),
  nowpaymentsOrderId: varchar("nowpayments_order_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }),
  senderEarnings: decimal("sender_earnings", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  messageId: true,
  paymentProvider: true,
  stripeSessionId: true,
  coinbaseChargeId: true,
  coinbaseChargeCode: true,
  nowpaymentsPaymentId: true,
  nowpaymentsOrderId: true,
  amount: true,
  platformFee: true,
  senderEarnings: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Payout history table (tracks completed payouts to users)
export const payoutHistory = pgTable("payout_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payoutMethod: varchar("payout_method", { length: 50 }).notNull(),
  payoutAddress: text("payout_address").notNull(),
  stripePayoutId: varchar("stripe_payout_id"),
  stripeTransferId: varchar("stripe_transfer_id"),
  nowpaymentsPayoutId: varchar("nowpayments_payout_id"),
  nowpaymentsWithdrawalId: varchar("nowpayments_withdrawal_id"),
  cryptoCurrency: varchar("crypto_currency", { length: 20 }),
  payoutStatus: varchar("payout_status", { length: 50 }).notNull().default("completed"),
  adminNotes: text("admin_notes"),
  completedBy: varchar("completed_by").notNull().references(() => users.id),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertPayoutHistorySchema = createInsertSchema(payoutHistory).pick({
  userId: true,
  amount: true,
  payoutMethod: true,
  payoutAddress: true,
  stripePayoutId: true,
  stripeTransferId: true,
  nowpaymentsPayoutId: true,
  nowpaymentsWithdrawalId: true,
  cryptoCurrency: true,
  payoutStatus: true,
  adminNotes: true,
  completedBy: true,
});

export type InsertPayoutHistory = z.infer<typeof insertPayoutHistorySchema>;
export type PayoutHistory = typeof payoutHistory.$inferSelect;

// Pending crypto payouts table (temporary storage before 2FA verification)
export const pendingCryptoPayouts = pgTable("pending_crypto_payouts", {
  payoutId: varchar("payout_id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 20 }).notNull(),
  adminNotes: text("admin_notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertPendingCryptoPayoutSchema = createInsertSchema(pendingCryptoPayouts).pick({
  payoutId: true,
  userId: true,
  amount: true,
  currency: true,
  adminNotes: true,
  createdBy: true,
  expiresAt: true,
});

export type InsertPendingCryptoPayout = z.infer<typeof insertPendingCryptoPayoutSchema>;
export type PendingCryptoPayout = typeof pendingCryptoPayouts.$inferSelect;

