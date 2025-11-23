import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin";
import CreateMessage from "@/pages/create-message";
import Paywall from "@/pages/paywall";
import Unlocked from "@/pages/unlocked";
import SmsConsent from "@/pages/sms-consent";
import Privacy from "@/pages/privacy";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const wasAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    if (!isLoading) {
      const wasAuthenticated = wasAuthenticatedRef.current;
      const isNowAuthenticated = isAuthenticated;

      if (!wasAuthenticated && isNowAuthenticated && location === "/") {
        setLocation("/");
      }

      wasAuthenticatedRef.current = isAuthenticated;
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  return (
    <Switch>
      {/* Public routes accessible to everyone */}
      <Route path="/sms-consent" component={SmsConsent} />
      <Route path="/privacy" component={Privacy} />
      
      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/create" component={CreateMessage} />
          <Route path="/m/:slug" component={Paywall} />
          <Route path="/m/:slug/unlocked" component={Unlocked} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/m/:slug" component={Paywall} />
          <Route path="/m/:slug/unlocked" component={Unlocked} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
