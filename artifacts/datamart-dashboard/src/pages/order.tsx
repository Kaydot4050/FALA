import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useGetOrderStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Clock, CheckCircle2, XCircle, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function OrderStatus() {
  const [location, setLocation] = useLocation();
  const params = useParams<{ reference?: string }>();
  const reference = params?.reference || "";
  
  const [searchInput, setSearchInput] = useState(reference);

  const { data: orderRes, isLoading, isError, refetch } = useGetOrderStatus(reference, {
    query: {
      enabled: !!reference,
      retry: 1
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(`/order/${searchInput.trim()}`);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800' };
      case 'failed':
      case 'refunded':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800' };
      case 'processing':
        return { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', spin: true };
      case 'pending':
      case 'waiting':
      default:
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800' };
    }
  };

  const order = orderRes?.data;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 pb-12">
      {/* Animated Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white px-6 py-12 md:py-16 mt-4 md:mt-6 shadow-2xl isolate flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#120524] via-slate-900 to-[#1a0b2e] z-[-2]" />
        
        <div className="absolute top-[-20%] left-[10%] w-[40%] h-[70%] rounded-full bg-indigo-600/20 blur-[80px] mix-blend-screen animate-blob pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[60%] rounded-full bg-violet-600/20 blur-[100px] mix-blend-screen animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,black,transparent)] z-[-1]" />
        
        <div className="relative z-10 w-full max-w-xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 mb-6 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full shadow-sm">
            <Search className="h-4 w-4 text-indigo-400" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-widest">
              Live Order Lookup
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
            Track your <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-indigo-200 animate-pulse-slow">delivery</span> status
          </h1>
          <p className="text-indigo-100/80 leading-relaxed font-medium mb-8">
            Enter your unique order reference below to check the real-time fulfillment progress.
          </p>

          <form onSubmit={handleSearch} className="relative flex w-full group animate-fade-in-up-delay-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl blur opacity-25 group-focus-within:opacity-60 transition duration-500"></div>
            <Input
              type="text"
              placeholder="e.g. REF-123456"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="relative w-full pr-14 h-14 text-lg bg-slate-900 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all shadow-inner"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 top-2 bottom-2 h-10 w-10 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </section>

      {reference && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isLoading ? (
            <div className="border border-border rounded-xl p-6 bg-card shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="space-y-4 pt-4 border-t border-border">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </div>
          ) : isError || !order ? (
            <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-8 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto opacity-80" />
              <h3 className="text-lg font-semibold">Order not found</h3>
              <p className="text-muted-foreground">
                We couldn't find an order with reference "{reference}". Please check the reference and try again.
              </p>
            </div>
          ) : (
            <div className="relative border border-border rounded-2xl bg-card backdrop-blur-xl shadow-lg overflow-hidden transition-all group hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="p-6 border-b border-border bg-muted/30 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Reference</p>
                    <p className="text-2xl font-mono font-bold">{order.reference}</p>
                  </div>
                  
                  {(() => {
                    const statusConfig = getStatusConfig(order.orderStatus);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold capitalize",
                        statusConfig.bg,
                        statusConfig.color,
                        statusConfig.border
                      )}>
                        <StatusIcon className={cn("h-4 w-4", statusConfig.spin && "animate-spin")} />
                        {order.orderStatus}
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" /> Data Package
                    </p>
                    <p className="text-lg font-bold">
                      {order.capacity} GB <span className="text-sm font-normal text-muted-foreground ml-1">({order.network})</span>
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Recipient Number</p>
                    <p className="text-lg font-medium font-mono">{order.phoneNumber}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                    <p className="text-lg font-bold text-primary">GHS {order.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                    <p className="text-base font-medium">
                      {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy • h:mm a") : "Just now"}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => refetch()}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
