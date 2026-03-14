import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Lock, DollarSign, Sparkles, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

export default function Paywall() {
  const [, params] = useRoute("/m/:slug");
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  const { data: message, isLoading, error } = useQuery<Message>({
    queryKey: ["/api/messages", params?.slug],
    enabled: !!params?.slug,
  });

  // Fetch creator's payment methods for NSFW content
  const { data: paymentMethods } = useQuery<{
    paymentMethods: Array<{ method: string; address: string; paymentLink: string | null; walletType?: string }>;
    price: string;
  }>({
    queryKey: ["/api/messages", params?.slug, "payment-methods"],
    enabled: !!params?.slug && !!message?.isAdultContent,
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      const response = await apiRequest("POST", `/api/messages/${params?.slug}/confirm-payment`, {
        paymentMethod,
        transactionId: "p2p-payment" // Honor system for now
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Message Unlocked!",
        description: "Your payment has been confirmed",
      });
      // Redirect to unlocked page
      window.location.href = `/m/${params?.slug}/unlocked`;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
    },
  });

  const stripePaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        messageId: message!.slug,
      });
      const data = await response.json();
      return data as { sessionId: string; url: string };
    },
    onSuccess: async (data) => {
      if (!data.url) {
        throw new Error("No checkout URL received from server");
      }
      
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handlePayment = () => {
    setIsProcessing(true);
    stripePaymentMutation.mutate();
  };

  // Check if message is already unlocked and redirect
  useEffect(() => {
    if (message?.unlocked) {
      window.location.href = `/m/${params?.slug}/unlocked`;
    }
  }, [message, params?.slug]);

  // Check if message is inactive
  if (message && !message.active) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8" data-testid="card-message-inactive">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Message Unavailable</h2>
          <p className="text-muted-foreground mb-6">
            This message has been deactivated by the sender and is no longer available.
          </p>
        </Card>
      </div>
    );
  }

  // Check if message is expired
  if (message && message.expiresAt && new Date(message.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8" data-testid="card-message-expired">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Message Expired</h2>
          <p className="text-muted-foreground mb-6">
            This message expired on {new Date(message.expiresAt).toLocaleDateString()} and can no longer be unlocked.
          </p>
        </Card>
      </div>
    );
  }

  // Age verification gate for adult content
  if (message && message.isAdultContent && !ageVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8" data-testid="card-age-gate">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Adult Content Warning</h2>
          <p className="text-muted-foreground mb-6">
            This message has been marked as containing adult content (18+). 
            By proceeding, you confirm that you are at least 18 years old.
          </p>
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full rounded-full bg-gradient-instagram hover:opacity-90"
              onClick={() => setAgeVerified(true)}
              data-testid="button-confirm-age"
            >
              I am 18 or older — Continue
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-full"
              onClick={() => window.history.back()}
              data-testid="button-exit-age-gate"
            >
              Exit
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Message Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This message doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-lg font-heading font-bold text-foreground">Secret Message</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center mx-auto border-4 border-primary/30">
              <Lock className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-heading font-bold mb-3" data-testid="text-message-title">
            {message.title}
          </h1>
          
          {/* NSFW badge */}
          {message.isAdultContent && (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 mb-3 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 border border-pink-500/40 rounded-full backdrop-blur">
              <span className="text-base font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                NSFW
              </span>
            </div>
          )}
          
          <p className="text-lg text-muted-foreground">
            Someone sent you a secret message 👀
          </p>
        </div>

        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-secondary/30 text-center pb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-2/5 blur-3xl" />
              <div className="relative backdrop-blur-3xl bg-card/50 rounded-2xl p-8 border-2 border-dashed border-primary/30">
                <div className="flex items-center justify-center mb-4">
                  <Lock className="w-16 h-16 text-muted-foreground/30" />
                </div>
                <p className="text-lg font-heading font-semibold text-muted-foreground">
                  Message Locked
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Pay to reveal the secret message
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-center gap-3 text-center">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Unlock Price</div>
                <div className="text-4xl font-heading font-bold text-primary" data-testid="text-price">
                  ${message.price}
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient-phone" className="text-sm font-medium">
                  Get notified via SMS (optional)
                </Label>
                <Input
                  id="recipient-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  data-testid="input-recipient-phone"
                />
                <p className="text-xs text-muted-foreground">
                  Receive an SMS when the message is unlocked
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-md bg-secondary/20">
                <Checkbox
                  id="sms-consent-paywall"
                  checked={smsConsent}
                  onCheckedChange={(checked) => setSmsConsent(checked === true)}
                  disabled={!phoneNumber}
                  data-testid="checkbox-sms-consent"
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="sms-consent-paywall"
                    className="text-xs font-normal cursor-pointer"
                  >
                    I agree to receive SMS notifications from <strong>Secret Message</strong> when 
                    this message is unlocked. Message and data rates may apply. Reply STOP to opt-out. 
                    Reply HELP for support.
                  </Label>
                  <p className="text-xs text-muted-foreground pt-1">
                    Read our{" "}
                    <Link href="/privacy">
                      <a className="text-primary hover:underline" data-testid="link-privacy-inline">
                        Privacy Policy
                      </a>
                    </Link>
                    {" | "}
                    <Link href="/sms-consent">
                      <a className="text-primary hover:underline" data-testid="link-sms-consent-info">
                        SMS Consent Info
                      </a>
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-center text-muted-foreground">
                By clicking "Pay to Unlock", you agree that <strong>all payments are final and non-refundable</strong>. 
                Please review our{" "}
                <Link href="/legal-disclaimer">
                  <a className="text-primary hover:underline" target="_blank" data-testid="link-disclaimer-payment">
                    Legal Disclaimer
                  </a>
                </Link>
                {" "}before proceeding.
              </p>
            </div>

            {message.isAdultContent ? (
              // NSFW content - show P2P payment options from creator
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 border border-pink-500/30">
                  <p className="text-sm font-semibold text-center mb-2">
                    💰 Pay the Creator Directly (3% fee)
                  </p>
                  <p className="text-xs text-center text-muted-foreground">
                    Lower fees than card payments. Choose your preferred method:
                  </p>
                </div>

                {paymentMethods && paymentMethods.paymentMethods.length > 0 ? (
                  <div className="grid gap-3">
                    {paymentMethods.paymentMethods.map((pm) => {
                      const methodNames: Record<string, string> = {
                        paypal: '💳 PayPal',
                        venmo: '📱 Venmo', 
                        cashapp: '💵 Cash App',
                        zelle: '💰 Zelle',
                        crypto: '💎 Crypto'
                      };
                      
                      return (
                        <Button
                          key={pm.method}
                          size="lg"
                          variant="outline"
                          className="w-full rounded-full text-lg hover:bg-primary/10"
                          onClick={() => {
                            if (pm.paymentLink) {
                              // Open payment link in new window
                              window.open(pm.paymentLink, '_blank');
                              // Show confirmation dialog after a delay
                              setTimeout(() => {
                                if (confirm('Have you completed the payment? Click OK to unlock your message.')) {
                                  confirmPaymentMutation.mutate(pm.method);
                                }
                              }, 2000);
                            } else if (pm.method === 'crypto') {
                              // Show wallet address for crypto
                              toast({
                                title: "Send Crypto to:",
                                description: pm.address,
                                duration: 10000,
                              });
                              setTimeout(() => {
                                if (confirm('Have you sent the crypto payment? Click OK to unlock your message.')) {
                                  confirmPaymentMutation.mutate(pm.method);
                                }
                              }, 2000);
                            } else {
                              // Fallback for methods without links (like Zelle)
                              toast({
                                title: `Pay via ${methodNames[pm.method]}`,
                                description: `Send $${message.price} to: ${pm.address}`,
                                duration: 10000,
                              });
                              setTimeout(() => {
                                if (confirm('Have you completed the payment? Click OK to unlock your message.')) {
                                  confirmPaymentMutation.mutate(pm.method);
                                }
                              }, 2000);
                            }
                          }}
                          disabled={isProcessing}
                          data-testid={`button-pay-${pm.method}`}
                        >
                          <span className="flex items-center gap-2">
                            {methodNames[pm.method] || pm.method} (3% fee)
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Creator hasn't set up payment methods yet. Contact them directly.
                  </div>
                )}
              </div>
            ) : (
              // Standard content - show Stripe button
              <>
                <Button
                  size="lg"
                  className="w-full rounded-full text-lg bg-gradient-instagram hover:opacity-90 shadow-lg shadow-primary/30 relative overflow-hidden group border-0"
                  onClick={handlePayment}
                  disabled={isProcessing}
                  data-testid="button-pay-unlock"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isProcessing ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Pay to Unlock
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Stripe
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Secret Message – pay-to-open messages
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/privacy">
              <a className="text-muted-foreground hover:text-foreground" data-testid="link-footer-privacy">
                Privacy Policy
              </a>
            </Link>
            <Link href="/legal-disclaimer">
              <a className="text-muted-foreground hover:text-foreground" data-testid="link-footer-legal">
                Legal Disclaimer
              </a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
