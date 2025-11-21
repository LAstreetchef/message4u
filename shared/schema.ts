import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, boolean, index, jsonb } from "drizzle-orm/pg-core";
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

// User storage table (magic link auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  payoutAddress: text("payout_address"),
  payoutMethod: varchar("payout_method", { length: 50 }),
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
}).extend({
  expiresAt: z.union([z.string(), z.date()]).optional(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id),
  stripeSessionId: varchar("stripe_session_id").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  senderEarnings: decimal("sender_earnings", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  messageId: true,
  stripeSessionId: true,
  amount: true,
  platformFee: true,
  senderEarnings: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Magic links table for authentication
export const magicLinks = pgTable("magic_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMagicLinkSchema = createInsertSchema(magicLinks).pick({
  email: true,
  token: true,
  expiresAt: true,
});

export type InsertMagicLink = z.infer<typeof insertMagicLinkSchema>;
export type MagicLink = typeof magicLinks.$inferSelect;
