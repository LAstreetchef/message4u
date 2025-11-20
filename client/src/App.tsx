import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CreateMessage from "@/pages/create-message";
import Paywall from "@/pages/paywall";
import Unlocked from "@/pages/unlocked";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/m/:slug" component={Paywall} />
          <Route path="/m/:slug/unlocked" component={Unlocked} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/create" component={CreateMessage} />
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
