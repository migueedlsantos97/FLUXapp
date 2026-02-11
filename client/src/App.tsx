import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Dashboard from "@/pages/dashboard";
import SetupPage from "@/pages/setup";
import HistoryPage from "@/pages/history";
import AuthLanding from "@/pages/auth-landing";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={AuthLanding} />
        <Route component={AuthLanding} />
      </Switch>
    );
  }

  // Authenticated Routes
  return (
    <Switch>
      <Route path="/setup" component={SetupPage} />
      
      {/* Routes wrapped in Main Layout */}
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      
      <Route path="/history">
        <Layout>
          <HistoryPage />
        </Layout>
      </Route>

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
