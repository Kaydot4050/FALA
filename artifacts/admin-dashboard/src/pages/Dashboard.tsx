import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useGetUsageStats, useGetBalance, useGetPurchaseHistory } from "@workspace/api-client-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ShoppingCart, 
  AlertCircle,
  Wallet,
  Users,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Copy,
  Bell,
  RefreshCcw,
  MessageSquare,
  Package,
  ArrowUpRight,
  Settings,
  Mail,
  UserPlus,
  Phone,
  Monitor,
  Usb
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState("today");
  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetUsageStats({ 
    period: timeFilter === 'all-time' ? 'all' : (timeFilter === 'this-week' ? 'week' : (timeFilter === 'this-month' ? 'month' : timeFilter)) 
  });
  const { data: balanceData, isLoading: balanceLoading } = useGetBalance();
  const { data: historyData } = useGetPurchaseHistory();
  const rawOrders = Array.isArray(historyData?.data?.purchases) ? historyData.data.purchases : [];
  
  // Calculate filtered orders and stats based on timeFilter
  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(now);
    
    if (timeFilter === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'yesterday') {
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeFilter === 'this-week') {
      // Start of current week (Monday)
      const day = now.getDay(); 
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'this-month') {
      // Start of current month (1st)
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(0); // All time
    }

    const filtered = rawOrders.filter(o => {
      const date = new Date(o.createdAt);
      const isWithinTime = date >= startDate && date <= endDate;
      return isWithinTime;
    });

    const completedOrders = filtered.filter(o => {
      const status = o.orderStatus?.toLowerCase() || '';
      return status.includes("fulfilled") || status.includes("success") || status.includes("complete");
    });

    // Calculate stats from the list of completed orders
    const totalRevenue = completedOrders.reduce((acc, o) => acc + Number(o.price || 0), 0);
    const totalOrders = completedOrders.length;
    const totalProfit = completedOrders.reduce((acc, o) => {
      const price = Number(o.price || 0);
      let cost = o.costPrice ? Number(o.costPrice) : null;
      if (cost === null) {
        if (o.network?.toLowerCase().includes('mtn') || o.network?.toLowerCase().includes('yello')) {
          cost = (o.capacity || 1) * 4;
        } else {
          cost = price * 0.88;
        }
      }
      return acc + (price - cost);
    }, 0);

    const customers = new Set(completedOrders.map(o => o.phoneNumber)).size;

    const pendingSpent = filtered.reduce((acc, o) => {
      const status = o.orderStatus?.toLowerCase() || '';
      if (status === 'pending' || status === 'processing' || status === 'unpaid') {
        return acc + Number(o.price || 0);
      }
      return acc;
    }, 0);

    return {
      orders: completedOrders,
      totalRevenue: timeFilter === 'all-time' ? (statsData?.data?.globalSuccess?.revenue || 0) : totalRevenue,
      totalOrders: timeFilter === 'all-time' ? (statsData?.data?.globalSuccess?.count || 0) : totalOrders,
      totalProfit: timeFilter === 'all-time' ? (statsData?.data?.globalSuccess?.profit || 0) : totalProfit,
      customers: timeFilter === 'all-time' ? (statsData?.data?.totalCustomers || 0) : customers,
      pendingSpent: timeFilter === 'all-time' ? (statsData?.data?.globalPending?.revenue || 0) : pendingSpent
    };
  }, [rawOrders, timeFilter, statsData]);

  const stats = filteredData;
  const displayOrders = filteredData.orders;

  if (statsLoading || balanceLoading) {
    return <DashboardSkeleton />;
  }

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="p-6 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]">
          <AlertCircle size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Analytics Offline</h2>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">We couldn't sync your performance metrics. This is usually temporary.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <RefreshCcw size={14} />
          Retry Connection
        </button>
      </div>
    );
  }

  const balance = balanceData?.data?.balance || 0;
  const totalEarnings = stats.totalRevenue;

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter glow-text">Overview</h1>
          <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">Live system performance</p>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <button className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center glass rounded-xl text-slate-400 hover:text-primary transition-all">
            <RefreshCcw size={16} />
          </button>
          <button className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center glass rounded-xl text-slate-400 hover:text-primary transition-all">
            <Bell size={16} />
          </button>
          <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 glass rounded-2xl border-white/10">
            <span className="text-[10px] md:text-xs font-black tracking-tight">Falaa Admin</span>
          </div>
        </div>
      </div>

      {/* ── Time Filters ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { id: 'today', label: 'Today' },
          { id: 'yesterday', label: 'Yesterday' },
          { id: 'this-week', label: 'This Week' },
          { id: 'this-month', label: 'This Month' },
          { id: 'all-time', label: 'All Time' }
        ].map((f) => (
          <button 
            key={f.id}
            onClick={() => setTimeFilter(f.id)}
            className={cn(
              "px-6 md:px-8 py-2.5 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
              timeFilter === f.id
                ? "bg-primary text-primary-foreground border-primary glow-primary scale-105" 
                : "bg-white/5 text-slate-500 border-white/5 hover:border-white/10 hover:bg-white/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Stats Grid ── */}
      <div key={timeFilter} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SmallStatsCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} />
        <SmallStatsCard label="Orders" value={stats.totalOrders} icon={ShoppingCart} />
        <SmallStatsCard label="Profit" value={formatCurrency(stats.totalProfit)} icon={TrendingUp} />
        <SmallStatsCard label="Customers" value={stats.customers} icon={Users} />
      </div>

      {/* ── Giant Wallet Card ── */}
      <div className="relative group overflow-hidden glass-card p-6 md:p-10 border-primary/20">
        <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none rotate-12">
          <Wallet size={240} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-primary/20 p-2.5 md:p-3 rounded-xl md:rounded-2xl glow-primary">
                <Wallet size={20} className="text-primary" />
              </div>
              <div>
                <span className="font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-0.5 md:mb-1">Wallet Balance</span>
                <p className="text-3xl md:text-6xl font-black tracking-tighter glow-text leading-none">₵{balance.toFixed(2)}</p>
              </div>
            </div>
            <button className="hidden md:flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
               <ArrowUpRight size={14} />
               Withdraw
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-12 pt-6 md:pt-8 border-t border-white/5">
            <div>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 md:mb-2">Pending Escrow</p>
              <p className="text-xl md:text-3xl font-black truncate text-primary/60">₵{stats.pendingSpent.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 md:mb-2">Total Earnings</p>
              <p className="text-xl md:text-3xl font-black truncate">₵{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Recent Orders ── */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-8 pb-4 flex items-center justify-between">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Stream</h3>
             <Link href="/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:glow-text transition-all">View Full Log</Link>
          </div>
          <div className="px-2">
             {!displayOrders || displayOrders.length === 0 ? (
               <div className="p-20 flex flex-col items-center justify-center text-center opacity-40">
                 <ShoppingCart size={40} className="mb-4" />
                 <p className="font-black text-sm">Waiting for transactions...</p>
               </div>
             ) : (
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto scrollbar-hide px-4">
                  {displayOrders.map((order: any) => {
                   const price = Number(order.price || 0);
                   let cost = order.costPrice ? Number(order.costPrice) : null;
                   if (cost === null) {
                     if (order.network?.toLowerCase().includes('mtn') || order.network?.toLowerCase().includes('yello')) {
                        cost = (order.capacity || 1) * 4;
                     } else {
                        cost = price * 0.88;
                     }
                   }
                   const isFulfilled = order.orderStatus?.toLowerCase().includes('fulfil') || 
                                       order.orderStatus?.toLowerCase().includes('success') ||
                                       order.orderStatus?.toLowerCase().includes('complete');
                   const profit = isFulfilled ? price - cost : 0;
                   
                   return (
                    <div key={order.id} className="py-5 flex items-center gap-4 group hover:bg-white/[0.01] transition-all border-b border-white/5 last:border-0">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border border-white/5 bg-white/5",
                        (order.network?.toLowerCase().includes("mtn") || order.network?.toLowerCase().includes("ye")) ? "text-amber-500" : 
                        order.network?.toLowerCase().includes("at") ? "text-blue-500" :
                        "text-red-500"
                      )}>
                         <div className={cn(
                           "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border border-white/10",
                           (order.network?.toLowerCase().includes("mtn") || order.network?.toLowerCase().includes("ye")) ? "bg-[#facc15] text-black" : 
                           order.network?.toLowerCase().includes("at") ? "bg-[#003399] text-white" :
                           "bg-[#e21b22] text-white"
                         )}>
                            {order.network?.toLowerCase().includes("mtn") ? "Y" : 
                             order.network?.toLowerCase().includes("at") ? "AT" :
                             order.network?.substring(0, 1).toUpperCase()}
                         </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-black text-[13px] uppercase tracking-tight">
                            {order.network === 'YELLO' ? 'MTN' : order.network} {order.capacity}GB
                          </h4>
                          <StatusBadge status={order.orderStatus} />
                        </div>
                         <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 font-bold">
                           <span className="text-slate-200 capitalize truncate max-w-[80px]">{order.customerName || 'Guest'}</span>
                           <span className="opacity-20 hidden sm:inline">·</span>
                           <span className="text-slate-300">{order.phoneNumber}</span>
                           <span className="opacity-20 hidden sm:inline">·</span>
                           <span className="text-slate-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                           <span className="opacity-20 hidden sm:inline">·</span>
                           <span className="text-primary/40 font-mono truncate max-w-[60px] sm:max-w-none">{order.orderReference}</span>
                         </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-black text-base tracking-tighter mb-0.5">₵{price.toFixed(2)}</p>
                        <p className="text-[11px] font-black text-primary tracking-widest uppercase">
                          +₵{profit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                   );
                  })}
                </div>
             )}
          </div>
        </div>

        {/* ── Share Your Store ── */}
        <div className="space-y-6">
          <div className="glass-card p-8 space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Merchant Tools</h3>
             <div className="space-y-4">
               <ShareButton icon={Copy} label="Copy Link" sub="Share store URL" />
               <ShareButton icon={MessageSquare} label="WhatsApp" sub="Contact customers" color="emerald" />
               <ShareButton icon={ExternalLink} label="View Store" sub="Browse public shop" color="amber" />
             </div>
          </div>

          <div className="glass-card p-8 bg-primary/5 border-primary/20">
             <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                   <Settings size={20} />
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight">System Settings</h4>
             </div>
             <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-6">Manage your API keys, network availability, and pricing overrides globally.</p>
             <button className="w-full py-4 glass border-white/5 hover:border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                Access Panel
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallStatsCard({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) {
  return (
    <div className="glass-card p-4 md:p-6 group cursor-default relative overflow-hidden transition-all hover:border-primary/20">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <Icon className="h-8 w-8 md:h-12 md:w-12" />
      </div>
      <div className="flex items-center justify-between mb-2 md:mb-6 relative z-10">
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <div className="text-primary/40 group-hover:text-primary transition-colors">
          <Icon size={12} className="md:size-3.5" />
        </div>
      </div>
      <p className="text-lg md:text-2xl font-black tracking-tighter glow-text relative z-10 truncate leading-tight">
        {value}
      </p>
    </div>
  );
}

function ShareButton({ icon: Icon, label, sub, color = "primary" }: { icon: any, label: string, sub: string, color?: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10",
    emerald: "bg-emerald-500/5 text-emerald-500 border-emerald-500/10 hover:bg-emerald-500/10",
    amber: "bg-amber-500/5 text-amber-500 border-amber-500/10 hover:bg-amber-500/10",
  };

  return (
    <button className={cn(
      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.99]",
      colorMap[color] || colorMap.primary
    )}>
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <Icon size={18} />
        </div>
        <div className="text-left font-sans">
          <p className="text-sm font-black text-foreground">{label}</p>
          <p className="text-[10px] font-bold text-muted-foreground tracking-tight">{sub}</p>
        </div>
      </div>
      <ArrowUpRight size={14} className="opacity-40" />
    </button>
  );
}

function QuickLink({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  const colorMap: Record<string, string> = {
    primary: "from-primary/20",
    amber: "from-amber-500/20",
    emerald: "from-emerald-500/20",
    blue: "from-blue-500/20",
    purple: "from-purple-500/20",
    slate: "from-slate-500/20"
  };

  return (
    <button className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-muted/50 transition-all active:scale-95 group">
       <div className={cn("p-4 rounded-2xl bg-gradient-to-br to-transparent group-hover:scale-110 transition-transform", colorMap[color] || colorMap.primary)}>
          <Icon size={24} className="text-foreground" />
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  if (s.includes("fulfilled") || s.includes("success") || s.includes("complete")) {
    return <div className="h-2 w-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_5px_rgba(16,185,129,0.2)]" />;
  }
  if (s.includes("fail") || s.includes("cancel")) {
    return <div className="h-2 w-4 rounded-full bg-red-500/20 border border-red-500/30" />;
  }
  return <div className="h-2 w-4 rounded-full bg-amber-500/20 border border-amber-500/30 animate-pulse" />;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  if (s.includes("fulfilled") || s.includes("success") || s.includes("complete")) {
    return (
      <div className="inline-flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
        <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
        <span className="text-[9px] font-black uppercase tracking-tight">Completed</span>
      </div>
    );
  }
  if (s.includes("fail") || s.includes("cancel")) {
    return (
      <div className="inline-flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
        <div className="h-1 w-1 rounded-full bg-red-500" />
        <span className="text-[9px] font-black uppercase tracking-tight">Failed</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
      <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
      <span className="text-[9px] font-black uppercase tracking-tight">{status}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-72 rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <Skeleton className="h-80 w-full rounded-[32px]" />
    </div>
  );
}
