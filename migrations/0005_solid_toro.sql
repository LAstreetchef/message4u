ALTER TABLE "payments" DROP CONSTRAINT "payments_stripe_session_id_unique";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "stripe_session_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_provider" varchar(50) DEFAULT 'stripe' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "coinbase_charge_id" varchar;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "coinbase_charge_code" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "crypto_wallet_address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "crypto_wallet_type" varchar(50);