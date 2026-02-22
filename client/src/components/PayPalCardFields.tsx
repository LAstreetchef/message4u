import { useState, useEffect, useRef } from 'react';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PayPalCardFieldsProps {
  slug: string;
  price: string;
  onSuccess: (fileUrl: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalCardFields({ slug, price, onSuccess, onError }: PayPalCardFieldsProps) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cardFieldsReady, setCardFieldsReady] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [txnId, setTxnId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const cardFieldsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create order and get client ID
  useEffect(() => {
    const createOrder = async () => {
      try {
        const response = await fetch(`/api/instalink/${slug}/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        const data = await response.json();
        
        if (data.unlocked) {
          onSuccess(data.fileUrl);
          return;
        }
        
        if (data.error) {
          onError(data.error);
          return;
        }
        
        setOrderId(data.orderId);
        setTxnId(data.txnId);
        setClientId(data.clientId);
      } catch (err: any) {
        onError(err.message || 'Failed to initialize payment');
      }
    };
    
    createOrder();
  }, [slug]);

  // Load PayPal SDK and render card fields
  useEffect(() => {
    if (!clientId || !orderId) return;
    
    const loadPayPalSDK = async () => {
      // Check if SDK already loaded
      if (window.paypal) {
        initCardFields();
        return;
      }
      
      // Load the SDK
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=card-fields&currency=USD`;
      script.async = true;
      script.onload = () => initCardFields();
      script.onerror = () => onError('Failed to load PayPal SDK');
      document.body.appendChild(script);
    };
    
    const initCardFields = async () => {
      if (!window.paypal || !containerRef.current) return;
      
      try {
        const cardFields = window.paypal.CardFields({
          createOrder: async () => orderId,
          onApprove: async (data: any) => {
            setProcessing(true);
            try {
              // Capture the order
              const response = await fetch(`/api/instalink/${slug}/capture-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID, txnId }),
              });
              
              const result = await response.json();
              
              if (result.success && result.unlocked) {
                onSuccess(result.fileUrl);
              } else {
                onError(result.error || 'Payment failed');
              }
            } catch (err: any) {
              onError(err.message || 'Payment processing failed');
            } finally {
              setProcessing(false);
            }
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            onError('Payment failed. Please try again.');
          },
          style: {
            input: {
              'font-size': '16px',
              'font-family': 'system-ui, sans-serif',
              'color': '#ffffff',
              'background-color': '#18181b',
              'border-color': '#3f3f46',
              'padding': '12px',
            },
            '.invalid': {
              'color': '#ef4444',
              'border-color': '#ef4444',
            },
          },
        });
        
        // Check if card fields is eligible
        if (cardFields.isEligible()) {
          // Render card number field
          cardFields.NumberField().render('#card-number');
          // Render expiry field  
          cardFields.ExpiryField().render('#card-expiry');
          // Render CVV field
          cardFields.CVVField().render('#card-cvv');
          
          cardFieldsRef.current = cardFields;
          setCardFieldsReady(true);
        } else {
          onError('Card payments not available. Please use PayPal.');
        }
      } catch (err: any) {
        console.error('Card fields init error:', err);
        onError('Failed to initialize card form');
      } finally {
        setLoading(false);
      }
    };
    
    loadPayPalSDK();
  }, [clientId, orderId]);

  const handleSubmit = async () => {
    if (!cardFieldsRef.current || processing) return;
    
    setProcessing(true);
    try {
      await cardFieldsRef.current.submit();
    } catch (err: any) {
      console.error('Submit error:', err);
      onError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (loading && !cardFieldsReady) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
        <span className="ml-2 text-zinc-400">Loading payment form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
        <CreditCard className="w-4 h-4" />
        <span>Pay with Card</span>
        <Lock className="w-3 h-3 ml-auto" />
        <span className="text-xs">Secure</span>
      </div>
      
      {/* Card Number */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Card Number</label>
        <div 
          id="card-number" 
          className="h-12 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden"
        />
      </div>
      
      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Expiry</label>
          <div 
            id="card-expiry" 
            className="h-12 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">CVV</label>
          <div 
            id="card-cvv" 
            className="h-12 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden"
          />
        </div>
      </div>
      
      <Button
        onClick={handleSubmit}
        disabled={!cardFieldsReady || processing}
        className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold mt-4"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay ${price}</>
        )}
      </Button>
      
      <p className="text-xs text-zinc-500 text-center">
        Powered by PayPal. Your card details are secure.
      </p>
    </div>
  );
}
