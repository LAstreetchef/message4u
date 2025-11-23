-- Add crypto payout tracking fields to payout_history table
ALTER TABLE "payout_history" ADD COLUMN "nowpayments_payout_id" varchar;
ALTER TABLE "payout_history" ADD COLUMN "nowpayments_withdrawal_id" varchar;
ALTER TABLE "payout_history" ADD COLUMN "crypto_currency" varchar(20);
