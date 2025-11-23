import fetch from 'node-fetch';

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

export interface CreatePayoutRequest {
  address: string;
  currency: string;
  amount: number;
  ipn_callback_url?: string;
  extra_id?: string;
}

export interface CreatePayoutResponse {
  id: string;
  withdrawal_id?: string;
  status: string;
  amount: string;
  currency: string;
  address: string;
}

export interface VerifyPayoutRequest {
  id: string;
  verification_code: string;
}

export interface GetPayoutStatusResponse {
  id: string;
  withdrawal_id?: string;
  status: string;
  amount: string;
  currency: string;
  address: string;
  error?: string;
  hash?: string;
  fee?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GetBalanceResponse {
  balances: Array<{
    currency: string;
    balance: string;
  }>;
}

interface AuthResponse {
  token: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

export class NOWPaymentsPayoutService {
  private apiKey: string;
  private email: string;
  private password: string;
  private tokenCache: TokenCache | null = null;

  constructor(apiKey: string, email?: string, password?: string) {
    if (!apiKey) {
      throw new Error('NOWPayments API key is required');
    }
    this.apiKey = apiKey;
    this.email = email || process.env.NOWPAYMENTS_EMAIL || '';
    this.password = password || process.env.NOWPAYMENTS_PASSWORD || '';

    if (!this.email || !this.password) {
      throw new Error('NOWPayments email and password are required for Mass Payouts');
    }
  }

  private async authenticate(): Promise<string> {
    // Return cached token if still valid (with 5-minute buffer)
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
      return this.tokenCache.token;
    }

    try {
      console.log('Authenticating with NOWPayments...');
      
      const response = await fetch(`${NOWPAYMENTS_API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NOWPayments authentication error:', errorData);
        throw new Error(`NOWPayments auth failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const authData = await response.json() as AuthResponse;
      
      // Cache token for 1 hour (NOWPayments tokens typically expire after 1-2 hours)
      this.tokenCache = {
        token: authData.token,
        expiresAt: Date.now() + 60 * 60 * 1000,
      };

      console.log('NOWPayments authentication successful');
      return authData.token;
    } catch (error: any) {
      console.error('Error authenticating with NOWPayments:', error);
      throw error;
    }
  }

  async createPayout(request: CreatePayoutRequest): Promise<CreatePayoutResponse> {
    try {
      console.log('Creating NOWPayments payout:', JSON.stringify(request, null, 2));
      
      const token = await this.authenticate();
      
      // Wrap single payout in withdrawals array as required by API
      const payload = {
        withdrawals: [request],
      };

      const response = await fetch(`${NOWPAYMENTS_API_URL}/payout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NOWPayments create payout error:', errorData);
        throw new Error(`NOWPayments API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('NOWPayments payout created successfully:', JSON.stringify(result, null, 2));
      
      // The API returns the payout object directly
      return result as CreatePayoutResponse;
    } catch (error: any) {
      console.error('Error creating NOWPayments payout:', error);
      throw error;
    }
  }

  async verifyPayout(request: VerifyPayoutRequest): Promise<void> {
    try {
      console.log('Verifying NOWPayments payout:', request.id);
      
      const token = await this.authenticate();
      
      // Use correct payload structure: { id, code }
      const payload = {
        id: request.id,
        code: request.verification_code,
      };

      const response = await fetch(`${NOWPAYMENTS_API_URL}/payout/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NOWPayments verify payout error:', errorData);
        throw new Error(`NOWPayments API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      console.log('NOWPayments payout verified successfully');
    } catch (error: any) {
      console.error('Error verifying NOWPayments payout:', error);
      throw error;
    }
  }

  async getPayoutStatus(payoutId: string): Promise<GetPayoutStatusResponse> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${NOWPAYMENTS_API_URL}/payout/${payoutId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NOWPayments get payout status error:', errorData);
        throw new Error(`NOWPayments API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const status = await response.json() as GetPayoutStatusResponse;
      return status;
    } catch (error: any) {
      console.error('Error getting NOWPayments payout status:', error);
      throw error;
    }
  }

  async getCustodyBalance(): Promise<GetBalanceResponse> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${NOWPAYMENTS_API_URL}/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NOWPayments get balance error:', errorData);
        throw new Error(`NOWPayments API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const balance = await response.json() as GetBalanceResponse;
      return balance;
    } catch (error: any) {
      console.error('Error getting NOWPayments custody balance:', error);
      throw error;
    }
  }
}
