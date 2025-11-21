import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Lock, DollarSign, Send, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const requestMagicLinkMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/request-magic-link", { email });
    },
    onSuccess: () => {
      toast({
        title: "Magic Link Sent!",
        description: "Check your email for a link to sign in.",
      });
      setEmail("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-xl font-heading font-bold text-foreground">Secret Message</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-48 hidden sm:block"
                data-testid="input-email"
              />
              <Button
                variant="default"
                className="rounded-full"
                data-testid="button-login"
                onClick={() => requestMagicLinkMutation.mutate()}
                disabled={!email || requestMagicLinkMutation.isPending}
              >
                {requestMagicLinkMutation.isPending ? "Sending..." : "Get Magic Link"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Heart className="w-4 h-4" fill="currentColor" />
                    Playful Pay-to-Open Messages
                  </span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-foreground leading-tight">
                  Welcome to <br />
                  <span className="bg-gradient-to-r from-primary via-chart-2 to-accent bg-clip-text text-transparent">
                    Secret Message
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Send playful, paywalled messages that unlock with a payment. Set your price, share the link, and have some fun!
                </p>
                <Card className="p-6 space-y-4 max-w-md">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-semibold text-lg">Get Started</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a magic link to sign in
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                      data-testid="input-email-hero"
                    />
                    <Button
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                      data-testid="button-get-started"
                      onClick={() => requestMagicLinkMutation.mutate()}
                      disabled={!email || requestMagicLinkMutation.isPending}
                    >
                      {requestMagicLinkMutation.isPending ? "Sending..." : "Send Link"}
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-chart-2/20 rounded-3xl blur-3xl" />
                <Card className="relative p-8 space-y-6 border-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Send className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-lg">Create Your Message</h3>
                        <p className="text-sm text-muted-foreground">Write something special and set your price</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6 text-chart-2" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-lg">Share the Link</h3>
                        <p className="text-sm text-muted-foreground">Send your paywalled message to anyone</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-lg">Get Paid to Unlock</h3>
                        <p className="text-sm text-muted-foreground">They pay, message reveals as an image</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card className="p-6 space-y-4 text-center hover-elevate">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="font-heading font-semibold text-lg">1. Create</h3>
                <p className="text-sm text-muted-foreground">
                  Write your message and set how much it costs to unlock
                </p>
              </Card>
              
              <Card className="p-6 space-y-4 text-center hover-elevate">
                <div className="w-16 h-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="font-heading font-semibold text-lg">2. Share</h3>
                <p className="text-sm text-muted-foreground">
                  Get a unique link to send to your special someone
                </p>
              </Card>
              
              <Card className="p-6 space-y-4 text-center hover-elevate">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <span className="text-3xl">💖</span>
                </div>
                <h3 className="font-heading font-semibold text-lg">3. Unlock</h3>
                <p className="text-sm text-muted-foreground">
                  They pay to unlock and see your message as a beautiful image
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Secret Message – pay-to-open messages with cute cartoon flavor
          </p>
        </div>
      </footer>
    </div>
  );
}
