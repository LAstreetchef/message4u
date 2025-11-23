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

export class NOWPaymentsPayoutService {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('NOWPayments API key is required');
    }
    this.apiKey = apiKey;
  }

  async createPayout(request: CreatePayoutRequest): Promise<CreatePayoutResponse> {
    try {
      console.log('Creating NOWPayments payout:', JSON.stringify(request, null, 2));
      
      const response = await fetch(`${NOWPAYMENTS_API_URL}/payout`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NOWPayments create payout error:', errorData);
        throw new Error(`NOWPayments API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const payout = await response.json() as CreatePayoutResponse;
      console.log('NOWPayments payout created successfully:', JSON.stringify(payout, null, 2));
      
      return payout;
    } catch (error: any) {
      console.error('Error creating NOWPayments payout:', error);
      throw error;
    }
  }

  async verifyPayout(request: VerifyPayoutRequest): Promise<void> {
    try {
      console.log('Verifying NOWPayments payout:', request.id);
      
      const response = await fetch(`${NOWPAYMENTS_API_URL}/payout/verify`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
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
      const response = await fetch(`${NOWPAYMENTS_API_URL}/payout/${payoutId}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
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
      const response = await fetch(`${NOWPAYMENTS_API_URL}/balance`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
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
