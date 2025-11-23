import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Users, DollarSign, TrendingUp, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Payment, PayoutHistory } from "@shared/schema";

interface PendingPayout {
  userId: string;
  email: string;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
  cryptoWalletType: string | null;
  cryptoWalletAddress: string | null;
  totalEarnings: number;
  totalPaidOut: number;
  pendingAmount: number;
}

interface Analytics {
  totalRevenue: number;
  totalPlatformFees: number;
  totalPayouts: number;
  totalUsers: number;
  totalMessages: number;
  totalUnlocks: number;
}

const ADMIN_EMAIL = "message4u@secretmessage4u.com";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedPayout, setSelectedPayout] = useState<PendingPayout | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");

  // Check if user is admin - only specific email allowed
  if (!isAuthenticated || user?.email !== ADMIN_EMAIL) {
    navigate("/");
    return null;
  }

  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: allPayments } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: pendingPayouts } = useQuery<PendingPayout[]>({
    queryKey: ["/api/admin/payouts/pending"],
  });

  const { data: payoutHistory } = useQuery<PayoutHistory[]>({
    queryKey: ["/api/admin/payouts/history"],
  });

  const completePayoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPayout) return;
      return await apiRequest("POST", "/api/admin/payouts", {
        userId: selectedPayout.userId,
        amount: parseFloat(payoutAmount),
        adminNotes: payoutNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({
        title: "Payout Completed",
        description: `Successfully sent $${payoutAmount} to ${selectedPayout?.email}`,
      });
      setSelectedPayout(null);
      setPayoutAmount("");
      setPayoutNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete payout",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2 -ml-3">
              <div className="w-8 h-8 rounded-full bg-gradient-instagram flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-lg font-heading font-bold text-foreground">Secret Message Admin</span>
            </Link>
            <Button 
              variant="outline" 
              className="rounded-full" 
              onClick={() => navigate("/")}
              data-testid="button-back-to-dashboard"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, payments, and payouts
          </p>
        </div>

        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold" data-testid="text-total-revenue">
                  ${analytics.totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Platform fees: ${analytics.totalPlatformFees.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Total Payouts</p>
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold" data-testid="text-total-payouts">
                  ${analytics.totalPayouts.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed payouts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Platform Stats</p>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold" data-testid="text-total-users">
                  {analytics.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users • {analytics.totalMessages} Messages • {analytics.totalUnlocks} Unlocks
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="payouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payouts" data-testid="tab-payouts">Pending Payouts</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">Payout History</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Payouts</CardTitle>
                <CardDescription>
                  Users with pending earnings that need to be paid out
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Paid Out</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Stripe Connect</TableHead>
                      <TableHead>Crypto Wallet</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayouts?.map((payout) => (
                      <TableRow key={payout.userId} data-testid={`row-payout-${payout.userId}`}>
                        <TableCell className="font-medium">{payout.email}</TableCell>
                        <TableCell>${payout.totalEarnings.toFixed(2)}</TableCell>
                        <TableCell>${payout.totalPaidOut.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">
                            ${payout.pendingAmount.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payout.stripeOnboardingComplete ? (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" />
                              Connected
                            </Badge>
                          ) : payout.stripeAccountId ? (
                            <Badge variant="outline">Pending Setup</Badge>
                          ) : (
                            <Badge variant="outline">Not Connected</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {payout.cryptoWalletType ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary">{payout.cryptoWalletType}</Badge>
                              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {payout.cryptoWalletAddress}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="outline">Not Set</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              setSelectedPayout(payout);
                              setPayoutAmount(payout.pendingAmount.toFixed(2));
                            }}
                            disabled={
                              payout.pendingAmount <= 0 ||
                              (!payout.stripeOnboardingComplete && (!payout.cryptoWalletType || !payout.cryptoWalletAddress))
                            }
                            data-testid={`button-complete-payout-${payout.userId}`}
                          >
                            Complete Payout
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!pendingPayouts || pendingPayouts.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No pending payouts
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  All completed payouts to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutHistory?.map((payout) => (
                      <TableRow key={payout.id} data-testid={`row-history-${payout.id}`}>
                        <TableCell>
                          {new Date(payout.completedAt!).toLocaleDateString()} {new Date(payout.completedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>{allUsers?.find(u => u.id === payout.userId)?.email}</TableCell>
                        <TableCell className="font-semibold">${parseFloat(payout.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{payout.payoutMethod}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{payout.payoutAddress}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{payout.adminNotes || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {(!payoutHistory || payoutHistory.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No payout history
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Platform user accounts and their information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Payout Method</TableHead>
                      <TableHead>Payout Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers?.map((user) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{new Date(user.createdAt!).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          {user.payoutMethod ? (
                            <Badge variant="secondary">{user.payoutMethod}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {user.payoutAddress || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Payments</CardTitle>
                <CardDescription>
                  All payment transactions across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Platform Fee</TableHead>
                      <TableHead>Sender Earnings</TableHead>
                      <TableHead>Stripe Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPayments?.map((payment) => (
                      <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                        <TableCell>
                          {new Date(payment.createdAt!).toLocaleDateString()} {new Date(payment.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="font-semibold">${parseFloat(payment.amount).toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">${parseFloat(payment.platformFee || '0').toFixed(2)}</TableCell>
                        <TableCell className="text-primary font-medium">${parseFloat(payment.senderEarnings || '0').toFixed(2)}</TableCell>
                        <TableCell className="font-mono text-xs max-w-[150px] truncate">
                          {payment.stripeSessionId}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payout</DialogTitle>
            <DialogDescription>
              Confirm payout details for {selectedPayout?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payout Method</Label>
              <div className="text-sm">
                {selectedPayout?.stripeOnboardingComplete ? (
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <CheckCircle className="h-3 w-3" />
                    Stripe Connect (Automated)
                  </Badge>
                ) : (
                  <Badge variant="outline">Manual Crypto Payout</Badge>
                )}
              </div>
            </div>
            {selectedPayout?.stripeOnboardingComplete && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="text-muted-foreground">
                  Funds will be automatically transferred to the sender's connected bank account via Stripe Connect.
                </p>
              </div>
            )}
            {!selectedPayout?.stripeOnboardingComplete && selectedPayout?.cryptoWalletType && (
              <div className="space-y-2">
                <Label>Crypto Wallet</Label>
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary">{selectedPayout.cryptoWalletType}</Badge>
                  <span className="text-xs text-muted-foreground font-mono truncate">
                    {selectedPayout.cryptoWalletAddress}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="payout-amount">Amount</Label>
              <Input
                id="payout-amount"
                type="number"
                step="0.01"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                data-testid="input-payout-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="payout-notes"
                placeholder="Add any notes about this payout..."
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                data-testid="input-payout-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedPayout(null)}
              data-testid="button-cancel-payout"
            >
              Cancel
            </Button>
            <Button
              onClick={() => completePayoutMutation.mutate()}
              disabled={completePayoutMutation.isPending || !payoutAmount}
              data-testid="button-confirm-payout"
            >
              {completePayoutMutation.isPending ? "Processing..." : "Complete Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
