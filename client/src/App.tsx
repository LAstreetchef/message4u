import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { HelpWidget } from "@/components/HelpWidget";
import { AccessGate } from "@/components/AccessGate";
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
import InstaLinkLanding from "@/pages/instalink-landing";
import InstaLinkCreate from "@/pages/instalink-create";
import InstaLinkView from "@/pages/instalink-view";

// Routes that don't require access gate (public payment/view routes)
const PUBLIC_ROUTES = [
  '/l/',      // InstaLink view
  '/m/',      // Message paywall
  '/p/',      // Partner links
  '/i/',      // InstaLink username
  '/promo',
  '/privacy',
  '/legal-disclaimer',
  '/sms-consent',
];

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
}

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
      <Route path="/instalink" component={InstaLinkLanding} />
      <Route path="/instalink/create" component={InstaLinkCreate} />
      <Route path="/l/:slug" component={InstaLinkView} />
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
  const [hasAccess, setHasAccess] = useState(() => {
    return localStorage.getItem("sm4u_access") === "granted";
  });

  // Check if current route is public (no gate needed) using window.location
  const isPublic = isPublicRoute(window.location.pathname);

  // Show access gate for protected routes
  if (!isPublic && !hasAccess) {
    return (
      <AccessGate onAccessGranted={() => setHasAccess(true)} />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <ConditionalHelpWidget />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Hide help widget on InstaLink creation page to avoid blocking the form
function ConditionalHelpWidget() {
  const [location] = useLocation();
  // Hide on InstaLink creation page
  if (location === '/instalink') return null;
  return <HelpWidget />;
}

export default App;
