import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Plus, Copy, Lock, Unlock, DollarSign } from "lucide-react";
import { Link } from "wouter";
import type { Message } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/m/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(slug);
    toast({
      title: "Link Copied!",
      description: "Share this link with your recipient",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Skeleton className="h-8 w-32" />
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <a className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2 -ml-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
                </div>
                <span className="text-lg font-heading font-bold text-foreground">Booty Call</span>
              </a>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/create">
                <Button className="rounded-full" data-testid="button-create-message">
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </Link>
              <a href="/api/logout">
                <Button variant="outline" className="rounded-full" data-testid="button-logout">
                  Log Out
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">
            Your Messages
          </h1>
          <p className="text-muted-foreground">
            Manage your paywalled messages and track unlocks
          </p>
        </div>

        {!messages || messages.length === 0 ? (
          <Card className="max-w-2xl mx-auto text-center p-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📱</span>
            </div>
            <h2 className="text-2xl font-heading font-semibold mb-3">
              No Messages Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first paywalled message and start earning!
            </p>
            <Link href="/create">
              <Button size="lg" className="rounded-full" data-testid="button-create-first">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Message
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.map((message) => (
              <Card 
                key={message.id} 
                className="hover-elevate overflow-hidden"
                data-testid={`card-message-${message.id}`}
              >
                <CardHeader className="space-y-2 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-semibold text-lg line-clamp-2" data-testid={`text-title-${message.id}`}>
                      {message.title}
                    </h3>
                    <Badge 
                      variant={message.unlocked ? "default" : "secondary"}
                      className="flex-shrink-0"
                      data-testid={`badge-status-${message.id}`}
                    >
                      {message.unlocked ? (
                        <>
                          <Unlock className="w-3 h-3 mr-1" />
                          Unlocked
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span data-testid={`text-price-${message.id}`}>${message.price}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">To: </span>
                    <span className="font-medium" data-testid={`text-recipient-${message.id}`}>
                      {message.recipientIdentifier}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(message.createdAt!).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={() => copyLink(message.slug)}
                    data-testid={`button-copy-${message.id}`}
                  >
                    {copiedId === message.slug ? (
                      <>Copied!</>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Booty Call – pay-to-open messages with cute cartoon flavor 💕
          </p>
        </div>
      </footer>
    </div>
  );
}
