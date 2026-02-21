import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { HelpWidget } from "@/components/HelpWidget";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Promo from "@/pages/promo";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin";
import CreateMessage from "@/pages/create-message";
import Paywall from "@/pages/paywall";
import Unlocked from "@/pages/unlocked";
import SmsConsent from "@/pages/sms-consent";
import Privacy from "@/pages/privacy";
import LegalDisclaimer from "@/pages/legal-disclaimer";
import Partners from "@/pages/partners";
import PartnerLink from "@/pages/partner-link";
import InstaLink from "@/pages/insta-link";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Public routes accessible to everyone */}
      <Route path="/promo" component={Promo} />
      <Route path="/sms-consent" component={SmsConsent} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/legal-disclaimer" component={LegalDisclaimer} />
      <Route path="/partners" component={Partners} />
      <Route path="/p/:partnerId" component={PartnerLink} />
      <Route path="/i/:username" component={InstaLink} />
      <Route path="/m/:slug" component={Paywall} />
      <Route path="/m/:slug/unlocked" component={Unlocked} />
      
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/create" component={CreateMessage} />
          <Route path="/" component={Dashboard} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <HelpWidget />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
