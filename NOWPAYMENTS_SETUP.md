# NOWPayments Mass Payout Integration Setup Guide

## Current Status

### ✅ Completed Features
- **Database Schema**: Tables and fields for tracking crypto payouts (payout_history, pending_crypto_payouts)
- **Security**: Server-side pending payout storage prevents amount/currency tampering
- **Admin Dashboard**: UI for crypto payout creation, currency selection, and 2FA verification
- **API Routes**: Backend endpoints for create, verify, balance, and status checking
- **User Settings**: Crypto wallet address management (/api/auth/crypto-wallet)
- **Expiry Mechanism**: Pending payouts expire after 10 minutes

### ⚠️ Known Limitations

The current NOWPayments service implementation does NOT match the official Mass Payout API contract and will fail when called. Here's what needs to be fixed:

## NOWPayments Mass Payout API Requirements

### 1. Authentication Flow
The NOWPayments Mass Payout API requires email/password authentication, not just an API key.

**Required Environment Variables:**
```bash
NOWPAYMENTS_EMAIL=your-nowpayments-email
NOWPAYMENTS_PASSWORD=your-nowpayments-password
NOWPAYMENTS_API_KEY=your-api-key  # Already configured
```

### 2. API Flow

#### Step 1: Authenticate
```javascript
POST https://api.nowpayments.io/v1/auth
Body: {
  "email": "your-nowpayments-email",
  "password": "your-nowpayments-password"
}
Response: {
  "token": "bearer-token-for-subsequent-requests"
}
```

#### Step 2: Create Payout
```javascript
POST https://api.nowpayments.io/v1/payout
Headers: {
  "Authorization": "Bearer {token}"
}
Body: {
  "withdrawals": [  // MUST be an array
    {
      "address": "recipient-wallet-address",
      "currency": "btc",  // lowercase
      "amount": 0.001,
      "ipn_callback_url": "https://your-callback-url.com" // optional
    }
  ]
}
Response: {
  "id": "payout-id-for-verification",
  // ... other fields
}
```

#### Step 3: Verify with 2FA
```javascript
POST https://api.nowpayments.io/v1/payout/verify
Headers: {
  "Authorization": "Bearer {token}"
}
Body: {
  "id": "payout-id",  // from Step 2
  "code": "123456"    // 2FA code from authenticator app
}
Response: {
  "verified": true,
  // ... payout status
}
```

### 3. Prerequisites in NOWPayments Dashboard

Before the integration will work, you MUST complete these steps in your NOWPayments dashboard:

1. **Enable Custody**: Dashboard → Custody → Enable
2. **Whitelist IP Addresses**: Dashboard → Settings → Payments → IP addresses → Add your server IPs
3. **Whitelist Wallet Addresses**: Dashboard → Mass Payouts → Whitelist addresses
4. **Enable 2FA**: Required for all custody withdrawals
5. **Top Up Custody Balance**: Fund your custody wallet with crypto

### 4. What Needs to Be Fixed

**File: `server/nowpaymentsPayoutService.ts`**

Current implementation issues:
- ❌ No email/password authentication to get bearer token
- ❌ `createPayout()` sends single object instead of `withdrawals` array
- ❌ API calls don't include `Authorization: Bearer {token}` header
- ❌ Verify endpoint payload structure may not match API

**Required Changes:**
1. Add `auth()` method to get bearer token using email/password
2. Update `createPayout()` to:
   - Call `auth()` first to get token
   - Wrap payout in `withdrawals` array
   - Include Authorization header
3. Update `verifyPayout()` to:
   - Include Authorization header with token
   - Use correct payload structure `{ id, code }`
4. Cache the bearer token (it expires after some time)

### 5. Testing

**Sandbox Mode:**
Enable sandbox mode in your NOWPayments dashboard to test without real funds.

**Test Flow:**
1. Set up test crypto wallets
2. Add test wallet addresses to whitelist
3. Create a small test payout (0.001 BTC or equivalent)
4. Verify with 2FA code
5. Check payout status
6. Confirm funds arrive at test wallet

### 6. Alternative: Use NOWPayments JavaScript Library

Instead of building the service from scratch, you could use their official library:

```bash
npm install @nowpaymentsio/nowpayments-mass-payments-api-js
```

```javascript
const NOWPaymentsMPApiJS = require('@nowpaymentsio/nowpayments-mass-payments-api-js');

const api = new NOWPaymentsMPApiJS({
  apiKey: process.env.NOWPAYMENTS_API_KEY
});

// Authenticate
const { token } = await api.auth({
  email: process.env.NOWPAYMENTS_EMAIL,
  password: process.env.NOWPAYMENTS_PASSWORD
});

// Create payout
const payout = await api.createPayout({
  token,
  withdrawals: [{
    address: walletAddress,
    currency: 'btc',
    amount: 0.001
  }]
});

// Verify
await api.verifyPayout({
  token,
  id: payout.id,
  code: twoFACode
});
```

## Environment Variables Summary

Add these to your `.env` file or Replit Secrets:

```bash
# Existing
NOWPAYMENTS_API_KEY=your-api-key

# Required for Mass Payouts
NOWPAYMENTS_EMAIL=your-nowpayments-account-email
NOWPAYMENTS_PASSWORD=your-nowpayments-account-password
```

## Documentation References

- **Mass Payout API Docs**: https://documenter.getpostman.com/view/7907941/T1DtdF9a
- **Full API Reference**: https://documenter.getpostman.com/view/7907941/2s93JusNJt
- **JavaScript Library**: https://github.com/NowPaymentsIO/nowpayments-mass-payments-api-js
- **Help Center**: https://nowpayments.zendesk.com/hc/en-us/articles/18313666110493-Custody-and-Mass-Payouts

## Next Steps

1. Add email and password to environment variables
2. Update `server/nowpaymentsPayoutService.ts` with correct API implementation
3. Test in sandbox mode
4. Enable production mode once testing is successful
