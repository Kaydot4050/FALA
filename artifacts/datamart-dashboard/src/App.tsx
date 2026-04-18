import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import OrderStatus from "@/pages/order";
import Tracker from "@/pages/tracker";
import Transactions from "@/pages/transactions";
import BulkPurchase from "@/pages/bulk-purchase";
import PurchaseHistory from "@/pages/purchase-history";
import Stats from "@/pages/stats";
import Withdrawals from "@/pages/withdrawals";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/order" component={OrderStatus} />
      <Route path="/order/:reference" component={OrderStatus} />
      <Route path="/tracker" component={Tracker} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/bulk" component={BulkPurchase} />
      <Route path="/history" component={PurchaseHistory} />
      <Route path="/stats" component={Stats} />
      <Route path="/withdrawals" component={Withdrawals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
