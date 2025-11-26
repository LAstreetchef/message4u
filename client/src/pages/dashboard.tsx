import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, Plus, Copy, Lock, Unlock, DollarSign, Power, TrendingUp, Check, FileIcon, FileText, Wallet, Mail, Save } from "lucide-react";
import { SiPaypal, SiVenmo, SiCashapp } from "react-icons/si";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Message, Payment, User } from "@shared/schema";

const PAYOUT_METHODS = [
  { value: 'paypal', label: 'PayPal', icon: SiPaypal, placeholder: 'PayPal email address' },
  { value: 'venmo', label: 'Venmo', icon: SiVenmo, placeholder: 'Venmo username (e.g., @username)' },
  { value: 'cashapp', label: 'Cash App', icon: SiCashapp, placeholder: 'Cash App $cashtag (e.g., $username)' },
  { value: 'zelle', label: 'Zelle', icon: Mail, placeholder: 'Zelle email or phone number' },
];

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messageToToggle, setMessageToToggle] = useState<Message | null>(null);
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<string>('');
  const [payoutAddress, setPayoutAddress] = useState<string>('');

  // Fetch current payout method
  const { data: payoutMethodData } = useQuery<{ payoutMethod: string | null; payoutAddress: string | null }>({
    queryKey: ["/api/auth/payout-method"],
    enabled: isAuthenticated,
  });

  // Set form values when data loads
  useEffect(() => {
    if (payoutMethodData) {
      if (payoutMethodData.payoutMethod) {
        setSelectedPayoutMethod(payoutMethodData.payoutMethod);
      }
      if (payoutMethodData.payoutAddress) {
        setPayoutAddress(payoutMethodData.payoutAddress);
      }
    }
  }, [payoutMethodData]);

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
  });

  const { data: allPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated && !!messages && messages.length > 0,
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!messages || !allPayments) return { totalEarnings: 0, totalPlatformFees: 0, unlockCount: 0, messageCount: 0, conversionRate: 0 };
    
    const totalEarnings = allPayments.reduce((sum, payment) => sum + parseFloat(payment.senderEarnings || '0'), 0);
    const totalPlatformFees = allPayments.reduce((sum, payment) => sum + parseFloat(payment.platformFee || '0'), 0);
    const unlockCount = allPayments.length;
    const messageCount = messages.length;
    const conversionRate = messageCount > 0 ? (unlockCount / messageCount) * 100 : 0;

    return { totalEarnings, totalPlatformFees, unlockCount, messageCount, conversionRate };
  }, [messages, allPayments]);

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ messageId, active }: { messageId: string; active: boolean }) => {
      return await apiRequest("PATCH", `/api/messages/${messageId}/toggle-active`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: messageToToggle?.active ? "Message Deactivated" : "Message Activated",
        description: messageToToggle?.active 
          ? "Your message is now hidden from recipients" 
          : "Your message is now visible to recipients",
      });
      setMessageToToggle(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
      setMessageToToggle(null);
    },
  });

  const resendNotificationMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/resend`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Notification Sent",
        description: "Email notification has been resent to the recipient",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend notification",
        variant: "destructive",
      });
    },
  });

  const savePayoutMethodMutation = useMutation({
    mutationFn: async ({ payoutMethod, payoutAddress }: { payoutMethod: string; payoutAddress: string }) => {
      return await apiRequest("PATCH", "/api/auth/payout-method", { payoutMethod, payoutAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/payout-method"] });
      toast({
        title: "Payout Method Saved",
        description: "Your payout information has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save payout method",
        variant: "destructive",
      });
    },
  });

  const handleSavePayoutMethod = () => {
    if (!selectedPayoutMethod || !payoutAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a payout method and enter your account info",
        variant: "destructive",
      });
      return;
    }
    savePayoutMethodMutation.mutate({ payoutMethod: selectedPayoutMethod, payoutAddress: payoutAddress.trim() });
  };

  const selectedMethodInfo = PAYOUT_METHODS.find(m => m.value === selectedPayoutMethod);

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

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
            <Link href="/" className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2 -ml-3">
              <div className="w-8 h-8 rounded-full bg-gradient-instagram flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-lg font-heading font-bold text-foreground">Secret Message</span>
            </Link>
            <div className="flex items-center gap-4">
              {user?.email === "message4u@secretmessage4u.com" && (
                <Button variant="outline" className="rounded-full" data-testid="button-admin" asChild>
                  <Link href="/admin">
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              <Button className="rounded-full" data-testid="button-create-new" asChild>
                <Link href="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full" 
                data-testid="button-logout"
                onClick={async () => {
                  await apiRequest("POST", "/api/auth/logout", {});
                  window.location.href = "/";
                }}
              >
                Log Out
              </Button>
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

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <h2 className="text-xl font-heading font-semibold">Payout Information</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Set up how you'd like to receive your earnings. We support PayPal, Venmo, Cash App, and Zelle.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {payoutMethodData?.payoutMethod && payoutMethodData?.payoutAddress ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="font-semibold text-green-500">Payout Method Configured</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll receive payouts via <span className="font-medium">{PAYOUT_METHODS.find(m => m.value === payoutMethodData.payoutMethod)?.label}</span> to <span className="font-medium">{payoutMethodData.payoutAddress}</span>
                </p>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Please set up your payout method to receive earnings from your messages.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payout-method">Payout Method</Label>
                <Select value={selectedPayoutMethod} onValueChange={setSelectedPayoutMethod}>
                  <SelectTrigger id="payout-method" data-testid="select-payout-method">
                    <SelectValue placeholder="Select how you'd like to be paid" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYOUT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value} data-testid={`option-${method.value}`}>
                        <div className="flex items-center gap-2">
                          <method.icon className="w-4 h-4" />
                          <span>{method.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPayoutMethod && (
                <div className="space-y-2">
                  <Label htmlFor="payout-address">
                    {selectedMethodInfo?.label} Account
                  </Label>
                  <Input
                    id="payout-address"
                    type="text"
                    placeholder={selectedMethodInfo?.placeholder}
                    value={payoutAddress}
                    onChange={(e) => setPayoutAddress(e.target.value)}
                    data-testid="input-payout-address"
                  />
                </div>
              )}

              <Button
                onClick={handleSavePayoutMethod}
                disabled={savePayoutMethodMutation.isPending || !selectedPayoutMethod || !payoutAddress.trim()}
                data-testid="button-save-payout"
                className="rounded-full w-full"
              >
                {savePayoutMethodMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Payout Method
                  </>
                )}
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-muted-foreground">
                When you earn money from unlocked messages, the admin will send your payout directly to your selected payment method. 
                Payouts are typically processed within 1-3 business days.
              </p>
            </div>
          </CardContent>
        </Card>

        {messages && messages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Your Earnings</p>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold" data-testid="text-total-earnings">
                  ${analytics.totalEarnings.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  After platform fees (${analytics.totalPlatformFees.toFixed(2)})
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Unlocks</p>
                  <Unlock className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold" data-testid="text-unlock-count">
                  {analytics.unlockCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total messages unlocked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold" data-testid="text-conversion-rate">
                  {analytics.conversionRate.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Messages unlocked vs created
                </p>
              </CardContent>
            </Card>
          </div>
        )}

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
            <Button size="lg" className="rounded-full" data-testid="button-create-first" asChild>
              <Link href="/create">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Message
              </Link>
            </Button>
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {message.fileUrl ? (
                      <>
                        <FileIcon className="w-4 h-4" />
                        <span>File Upload</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Text Message</span>
                      </>
                    )}
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
                  
                  {allPayments && allPayments.some(p => p.messageId === message.id) && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Unlock History</p>
                      {allPayments
                        .filter(p => p.messageId === message.id)
                        .map((payment, idx) => (
                          <div key={payment.id} className="flex items-center gap-2 text-xs text-muted-foreground" data-testid={`payment-history-${payment.id}`}>
                            <Check className="w-3 h-3 text-primary" />
                            <span>Unlocked on {new Date(payment.createdAt!).toLocaleDateString()} at {new Date(payment.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full"
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
                  {!message.unlocked && isValidEmail(message.recipientIdentifier) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendNotificationMutation.mutate(message.id)}
                      disabled={resendNotificationMutation.isPending}
                      data-testid={`button-resend-${message.id}`}
                      className="rounded-full"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant={message.active ? "outline" : "default"}
                    size="sm"
                    onClick={() => setMessageToToggle(message)}
                    data-testid={`button-toggle-active-${message.id}`}
                    className="rounded-full"
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t mt-20">
        <div className="max-w-7xl mx-auto text-center space-y-2">
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

      <AlertDialog open={!!messageToToggle} onOpenChange={() => setMessageToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {messageToToggle?.active ? "Deactivate Message?" : "Activate Message?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {messageToToggle?.active 
                ? "Recipients will no longer be able to view or unlock this message. You can reactivate it later."
                : "This message will become available for recipients to view and unlock again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-toggle">Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-toggle"
              onClick={() => {
                if (messageToToggle) {
                  toggleActiveMutation.mutate({ 
                    messageId: messageToToggle.id, 
                    active: !messageToToggle.active 
                  });
                }
              }}
            >
              {messageToToggle?.active ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
