/**
 * PAL Client - Payment Abstraction Layer Client
 * Routes payment operations through SM4U PAL service
 */

const PAL_URL = process.env.PAL_URL || 'https://sm4u-pal.onrender.com';
const PAL_API_KEY = process.env.PAL_API_KEY;

interface CreateTransactionParams {
  messageId: string;
  partnerId: string;
  baseCost: number;
  partnerPrice: number;
  contentFlag?: 'standard' | 'adult';
  currency?: string;
}

interface PayTransactionParams {
  txnId: string;
  paymentMethod: 'card' | 'crypto' | 'paypal' | 'venmo' | 'cashapp' | 'apple_pay' | 'google_pay';
  paymentDetails?: {
    token?: string;
    paymentMethodId?: string;
    coin?: string;
  };
}

interface PALTransaction {
  txn_id: string;
  message_id: string;
  partner_id: string;
  status: string;
  content_flag: string;
  payment_method: string | null;
  processor: string | null;
  processor_txn_id: string | null;
  amounts: {
    transaction_total: number;
    base_cost: number;
    partner_markup: number;
    platform_fee_pct: number | null;
    platform_fee: number | null;
    sm4u_revenue: number | null;
    partner_payout: number;
    currency: string;
  };
  available_methods: string[];
  timestamps: {
    created_at: string;
    payment_submitted_at: string | null;
    completed_at: string | null;
  };
}

interface PALPaymentResult {
  status: 'completed' | 'redirect_required' | 'processing' | 'blocked' | 'failed';
  transaction?: PALTransaction;
  // For redirect-based payments (PayPal, crypto, CCBill)
  payment_url?: string;
  approve_url?: string;
  invoice_url?: string;
  address?: string;
  amount_crypto?: number;
  coin?: string;
  // For failures
  error?: string;
  reason?: string;
  available_methods?: string[];
}

class PALClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = PAL_URL;
    this.apiKey = PAL_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('PAL_API_KEY not set - PAL integration disabled');
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-PAL-API-Key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `PAL request failed: ${response.status}`);
    }

    return data as T;
  }

  /**
   * Check if PAL is configured and available
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request('GET', '/pal/health');
  }

  /**
   * Create a new transaction in PAL
   */
  async createTransaction(params: CreateTransactionParams): Promise<PALTransaction> {
    return this.request('POST', '/pal/transactions', {
      message_id: params.messageId,
      partner_id: params.partnerId,
      content_flag: params.contentFlag || 'standard',
      amounts: {
        base_cost: params.baseCost,
        partner_price: params.partnerPrice,
        currency: params.currency || 'USD',
      },
    });
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(txnId: string): Promise<PALTransaction> {
    return this.request('GET', `/pal/transactions/${txnId}`);
  }

  /**
   * Get available payment methods for a transaction
   */
  async getPaymentMethods(txnId: string): Promise<{ available_methods: string[] }> {
    return this.request('GET', `/pal/transactions/${txnId}/methods`);
  }

  /**
   * Submit payment for a transaction
   */
  async submitPayment(params: PayTransactionParams): Promise<PALPaymentResult> {
    return this.request('POST', `/pal/transactions/${params.txnId}/pay`, {
      payment_method: params.paymentMethod,
      payment_details: params.paymentDetails || {},
    });
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(txnId: string, reason: string): Promise<PALTransaction> {
    return this.request('POST', `/pal/refund/${txnId}`, { reason });
  }

  /**
   * List transactions for a partner
   */
  async listTransactions(partnerId: string, filters?: {
    status?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<{ transactions: PALTransaction[]; total: number }> {
    const params = new URLSearchParams({ partner_id: partnerId });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    return this.request('GET', `/pal/transactions?${params}`);
  }

  /**
   * Get payout summary for a partner
   */
  async getPayoutSummary(partnerId: string, from?: string, to?: string): Promise<any> {
    const params = new URLSearchParams({ partner_id: partnerId });
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    return this.request('GET', `/pal/payouts/summary?${params}`);
  }

  /**
   * Get pending payout amount
   */
  async getPendingPayout(partnerId: string): Promise<{
    pending_amount: number;
    threshold: number;
    ready_for_payout: boolean;
  }> {
    return this.request('GET', `/pal/payouts/pending?partner_id=${partnerId}`);
  }
}

// Export singleton instance
export const palClient = new PALClient();

// Export types
export type {
  CreateTransactionParams,
  PayTransactionParams,
  PALTransaction,
  PALPaymentResult,
};
