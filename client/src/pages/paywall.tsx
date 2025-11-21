import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Lock, DollarSign, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

export default function Paywall() {
  const [, params] = useRoute("/m/:slug");
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: message, isLoading, error } = useQuery<Message>({
    queryKey: ["/api/messages", params?.slug],
    enabled: !!params?.slug,
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        messageId: message!.slug,
      });
      return response as unknown as { sessionId: string; url: string };
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
    paymentMutation.mutate();
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
              <span className="text-lg font-heading font-bold text-foreground">Booty Call</span>
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
          </CardContent>
        </Card>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Booty Call – pay-to-open messages with cute cartoon flavor 💕
          </p>
        </div>
      </footer>
    </div>
  );
}
