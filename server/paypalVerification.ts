/**
 * PayPal Payment Verification
 * Auto-detects PayPal payments and unlocks messages
 */

interface PayPalTransaction {
  transaction_info: {
    transaction_id: string;
    transaction_amount: {
      value: string;
      currency_code: string;
    };
    transaction_status: string;
  };
  payer_info?: {
    email_address?: string;
  };
}

/**
 * Get PayPal access token using client credentials
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  
  if (!clientId || !secret) {
    throw new Error('PayPal credentials not configured');
  }
  
  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const url = process.env.PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com/v1/oauth2/token'
    : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Get recent transactions for a PayPal account
 * Note: This requires the PayPal account email/merchant ID
 */
async function getRecentPayPalTransactions(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<PayPalTransaction[]> {
  const url = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com/v1/reporting/transactions'
    : 'https://api-m.sandbox.paypal.com/v1/reporting/transactions';
  
  const response = await fetch(
    `${url}?start_date=${startDate}&end_date=${endDate}&fields=all`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  return data.transaction_details || [];
}

/**
 * Verify a PayPal transaction by ID
 */
export async function verifyPayPalTransaction(
  transactionId: string,
  expectedAmount: string
): Promise<{ verified: boolean; details?: any }> {
  try {
    const accessToken = await getPayPalAccessToken();
    
    // Get transactions from the last 24 hours
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const transactions = await getRecentPayPalTransactions(accessToken, startDate, endDate);
    
    // Find matching transaction
    const match = transactions.find(tx => 
      tx.transaction_info.transaction_id === transactionId &&
      tx.transaction_info.transaction_status === 'S' && // Success
      parseFloat(tx.transaction_info.transaction_amount.value) >= parseFloat(expectedAmount)
    );
    
    if (match) {
      return {
        verified: true,
        details: match
      };
    }
    
    return { verified: false };
  } catch (error) {
    console.error('PayPal verification error:', error);
    return { verified: false };
  }
}

/**
 * Check for PayPal payments to a specific email address
 * This can auto-detect payments even without transaction ID
 */
export async function checkPayPalPaymentsToEmail(
  paypalEmail: string,
  expectedAmount: string,
  since: Date
): Promise<{ found: boolean; transactionId?: string }> {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const endDate = new Date().toISOString();
    const startDate = since.toISOString();
    
    const transactions = await getRecentPayPalTransactions(accessToken, startDate, endDate);
    
    // Find matching payment to this email for this amount
    const match = transactions.find(tx => 
      tx.transaction_info.transaction_status === 'S' &&
      parseFloat(tx.transaction_info.transaction_amount.value) === parseFloat(expectedAmount)
      // Note: Would need to check receiver email here, but that requires different API endpoint
    );
    
    if (match) {
      return {
        found: true,
        transactionId: match.transaction_info.transaction_id
      };
    }
    
    return { found: false };
  } catch (error) {
    console.error('PayPal payment check error:', error);
    return { found: false };
  }
}
