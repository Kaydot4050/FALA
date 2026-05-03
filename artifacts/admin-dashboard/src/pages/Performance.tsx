// @ts-nocheck
import { useGetUsageStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  ShoppingBag, 
  RefreshCcw,
  Network,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Performance() {
  const { data: statsData, isLoading, refetch, isFetching } = useGetUsageStats(undefined, { 
    query: { 
      refetchOnWindowFocus: true,
      staleTime: 0
    } 
  });
  const queryClient = useQueryClient();

  if (isLoading) return <PerformanceSkeleton />;

  const d = statsData?.data;
  const statsError = !statsData || !d;

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="p-6 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]">
          <AlertCircle size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Analytics Sync Failed</h2>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">The performance data is currently unavailable. Please try again later.</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <RefreshCcw size={14} />
          Retry Sync
        </button>
      </div>
    );
  }

  const growth = d.growth || { revenue: 0, profit: 0, orders: 0 };
  
  // Calculate average order value
  const aov = d.allTimeOrders > 0 ? (d.allTimeSpent / d.allTimeOrders) : 0;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter glow-text flex flex-wrap items-center gap-2 md:gap-3">
            <Activity className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Performance
          </h1>
          <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mt-1">
            Global Analytics & Growth Metrics
          </p>
        </div>
        
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-10 px-6 flex items-center justify-center gap-2 glass rounded-xl text-slate-400 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
        >
          <RefreshCcw size={14} className={cn(isFetching && "animate-spin")} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* ── Core Metrics (Pulse) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={formatCurrency(d.allTimeSpent)} 
          growth={growth.revenue} 
          icon={<DollarSign size={18} />} 
        />
        <MetricCard 
          title="Total Profit" 
          value={formatCurrency(d.allTimeProfit)} 
          growth={growth.profit} 
          icon={<DollarSign size={18} />}
          highlight
        />
        <MetricCard 
          title="Total Orders" 
          value={d.allTimeOrders.toString()} 
          growth={growth.orders} 
          icon={<ShoppingBag size={18} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Network Distribution ── */}
        <div className="glass rounded-2xl md:rounded-[35px] p-6 md:p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Network className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Network Performance</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revenue by Carrier</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {d.networkBreakdown?.map((network: any, idx: number) => {
              const percentage = d.allTimeSpent > 0 ? (network.totalSpent / d.allTimeSpent) * 100 : 0;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-white">{network.network}</span>
                    <span className="text-sm font-black text-primary">{formatCurrency(network.totalSpent)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>{network.totalOrders} Orders</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Secondary Stats ── */}
        <div className="grid grid-cols-1 gap-6">
          <div className="glass rounded-2xl md:rounded-[35px] p-6 md:p-8 border border-white/5 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <Activity className="h-32 w-32" />
             </div>
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Average Order Value (AOV)</h3>
             <p className="text-3xl md:text-4xl font-black tracking-tighter glow-text">{formatCurrency(aov)}</p>
             <p className="text-xs font-medium text-slate-400 mt-2">Across {d.allTimeOrders} total transactions</p>
          </div>
          
          <div className="glass rounded-2xl md:rounded-[35px] p-6 md:p-8 border border-white/5 flex flex-col justify-center">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Fulfillment Health</h3>
             <div className="flex items-center gap-6">
               <div className="flex-1">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-black flex items-center gap-2"><CheckCircle2 size={14} className="text-primary"/> Success</span>
                   <span className="text-xs font-black">{d.globalSuccess?.count || 0}</span>
                 </div>
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-black text-slate-400 flex items-center gap-2"><Activity size={14}/> Pending</span>
                   <span className="text-xs font-black text-slate-400">{d.globalPending?.count || 0}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-xs font-black text-red-500/80 flex items-center gap-2"><AlertCircle size={14}/> Failed</span>
                   <span className="text-xs font-black text-red-500/80">{d.globalFailed?.count || 0}</span>
                 </div>
               </div>
               
               <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-[6px] border-slate-800 flex items-center justify-center relative">
                 <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent border-l-transparent transform -rotate-45" />
                 <div className="text-center">
                   <span className="block text-lg md:text-xl font-black">{((d.globalSuccess?.count / d.allTimeOrders) * 100 || 0).toFixed(0)}%</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, growth, icon, highlight = false }: { title: string, value: string, growth: number, icon: React.ReactNode, highlight?: boolean }) {
  const isPositive = growth >= 0;
  
  return (
    <div className={cn(
      "glass rounded-2xl md:rounded-[35px] p-4 md:p-8 border relative overflow-hidden transition-all duration-300",
      highlight ? "border-primary/30 shadow-[0_0_30px_-10px_rgba(249,115,22,0.2)]" : "border-white/5"
    )} style={{
      animation: 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      {/* Decorative gradient blob */}
      {highlight && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      )}
      
      <div className="flex justify-between items-start mb-4 md:mb-8 relative z-10">
        <div className={cn(
          "h-8 w-8 md:h-12 md:w-12 rounded-xl flex items-center justify-center backdrop-blur-md",
          highlight ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-400"
        )}>
          {icon}
        </div>
        
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[11px] font-black tracking-wider",
          isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {isPositive ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
          {Math.abs(growth).toFixed(0)}%
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-[8px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.2em] mb-1 md:mb-2">{title}</h3>
        <p className={cn(
          "text-xl md:text-4xl font-black tracking-tighter truncate",
          highlight ? "text-primary glow-text" : "text-white"
        )}>{value}</p>
        <p className="text-[8px] md:text-[10px] font-medium text-slate-500 mt-1 md:mt-2 uppercase tracking-widest hidden md:block">vs Last Month</p>
      </div>
    </div>
  );
}

function PerformanceSkeleton() {
  return (
    <div className="space-y-10 animate-pulse pb-20">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg opacity-50" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-[32px]" />)}
      </div>
      <div className="grid grid-cols-2 gap-8">
        <Skeleton className="h-80 rounded-[32px]" />
        <Skeleton className="h-80 rounded-[32px]" />
      </div>
    </div>
  );
}
