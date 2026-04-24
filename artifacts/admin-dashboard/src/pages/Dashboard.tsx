import { useState, useMemo } from "react";
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
  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetUsageStats();
  const { data: balanceData, isLoading: balanceLoading } = useGetBalance();
  const { data: historyData } = useGetPurchaseHistory();
  const recentOrders = Array.isArray(historyData?.data?.purchases) ? historyData.data.purchases : [];
  const [timeFilter, setTimeFilter] = useState("today");

  const stats = useMemo(() => {
    if (!statsData?.data) return { totalRevenue: 0, totalProfit: 0, totalOrders: 0, customers: 71 };
    const { totalSpent, totalOrders, totalProfit, totalCustomers } = statsData.data;
    const rev = totalSpent || 0;
    const prof = totalProfit || rev * 0.12;
    return {
      totalRevenue: rev,
      totalProfit: prof,
      totalOrders: totalOrders || 0,
      customers: totalCustomers || 0
    };
  }, [statsData]);

  if (statsLoading || balanceLoading) {
    return <DashboardSkeleton />;
  }

  const balance = balanceData?.data?.balance || 3.21;
  const totalEarnings = stats.totalRevenue;

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground font-medium">Welcome back, Falaa deals</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCcw size={18} />
          </button>
          <button className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <Bell size={18} />
          </button>
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
            FY
          </div>
        </div>
      </div>

      {/* ── Time Filters ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Today', 'This Week', 'This Month', 'All Time'].map((f) => (
          <button 
            key={f}
            onClick={() => setTimeFilter(f.toLowerCase().replace(' ', '-'))}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
              timeFilter === f.toLowerCase().replace(' ', '-') 
                ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" 
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SmallStatsCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} />
        <SmallStatsCard label="Orders" value={stats.totalOrders} icon={ShoppingCart} />
        <SmallStatsCard label="Profit" value={formatCurrency(stats.totalProfit)} icon={TrendingUp} />
        <SmallStatsCard label="Customers" value={stats.customers} icon={Users} />
      </div>

      {/* ── Giant Wallet Card ── */}
      <div className="relative group overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-[32px] p-4 text-white shadow-2xl shadow-orange-500/20 transition-all hover:scale-[1.01]">
        <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
          <Wallet size={100} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Wallet size={20} />
              </div>
              <span className="font-black text-sm uppercase tracking-widest opacity-90">Wallet Balance</span>
            </div>
            <div className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-tighter">
              Falaa deals
            </div>
          </div>

          <div>
             <p className="text-4xl font-black tracking-tighter">₵{balance.toFixed(2)}</p>
             <p className="text-[10px] font-bold opacity-70">Available to withdraw</p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/20">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Pending</p>
              <p className="text-2xl font-black truncate">₵0.00</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Earnings</p>
              <p className="text-2xl font-black truncate">₵{totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Recent Orders ── */}
        <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-muted/30 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
             <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Orders</CardTitle>
             <a href="/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All</a>
          </CardHeader>
          <CardContent className="p-0">
             {!recentOrders || recentOrders.length === 0 ? (
               <div className="p-12 flex flex-col items-center justify-center h-64 text-center">
                 <div className="bg-muted h-12 w-12 rounded-2xl flex items-center justify-center mb-4 opacity-30">
                   <ShoppingCart size={24} />
                 </div>
                 <p className="font-black text-sm mb-1">No orders yet</p>
                 <p className="text-[10px] text-muted-foreground max-w-[200px] font-medium opacity-60">Orders will appear here once customers start buying</p>
               </div>
             ) : (
               <div className="divide-y divide-border/20">
                 {recentOrders.slice(0, 5).map((order: any) => {
                   const price = Number(order.price || 0);
                   let cost = order.costPrice ? Number(order.costPrice) : null;
                   if (cost === null) {
                     if (order.network?.toLowerCase().includes('mtn') || order.network?.toLowerCase().includes('yello')) {
                        cost = (order.capacity || 1) * 4;
                     } else {
                        cost = price * 0.88;
                     }
                   }
                   const isFulfilled = order.orderStatus?.toLowerCase().includes('fulfil') || order.orderStatus?.toLowerCase().includes('success');
                   const profit = isFulfilled ? price - cost : 0;
                   
                   return (
                    <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
                      {/* Logo Box */}
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shadow-inner shrink-0 border border-border/20",
                        (order.network?.toLowerCase().includes("mtn") || order.network?.toLowerCase().includes("ye")) ? "bg-[#facc15]/10 text-[#facc15]" : 
                        order.network?.toLowerCase().includes("at") ? "bg-[#003399]/10 text-[#003399]" :
                        order.network?.toLowerCase().includes("telecel") ? "bg-[#e21b22]/10 text-[#e21b22]" :
                        "bg-slate-800 text-slate-400"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm border",
                          (order.network?.toLowerCase().includes("mtn") || order.network?.toLowerCase().includes("ye")) ? "bg-[#facc15] text-black border-[#eab308]" : 
                          order.network?.toLowerCase().includes("at") ? "bg-[#003399] text-white border-blue-900" :
                          order.network?.toLowerCase().includes("telecel") ? "bg-[#e21b22] text-white border-red-900" :
                          "bg-slate-700 text-white border-slate-600"
                        )}>
                          {order.network?.toLowerCase().includes("mtn") ? "MTN" : 
                           order.network?.toLowerCase().includes("at") ? "at" :
                           order.network?.substring(0, 2).toUpperCase()}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-sm uppercase tracking-tight">
                            {order.network === 'YELLO' ? 'MTN' : order.network} - {order.capacity} 
                          </h4>
                          <StatusPill status={order.orderStatus} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold whitespace-nowrap overflow-hidden">
                          <Phone size={10} className="shrink-0 opacity-40" />
                          <span className="text-foreground">{order.customerName || 'Valued Customer'}</span>
                          <span className="opacity-20 font-light">·</span>
                          <span>{order.phoneNumber}</span>
                          <span className="opacity-20 font-light">·</span>
                          <span className="opacity-60">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="text-right shrink-0">
                        <p className="font-black text-sm leading-none mb-1 tracking-tighter text-foreground">₵{price.toFixed(2)}</p>
                        <p className="text-[10px] font-black text-emerald-500 tracking-tight">
                          +{formatCurrency(profit)}
                        </p>
                      </div>
                    </div>
                   );
                 })}
               </div>
             )}
          </CardContent>
        </Card>

        {/* ── Share Your Store ── */}
        <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
             <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Share your store</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
             <ShareButton icon={Copy} label="Copy Link" sub="Share store URL" />
             <ShareButton icon={MessageSquare} label="WhatsApp" sub="Contact customers" color="emerald" />
             <ShareButton icon={ExternalLink} label="View Store" sub="Browse public shop" color="amber" />
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Links ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Quick links</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
           <QuickLink icon={Package} label="Products" color="primary" />
           <QuickLink icon={ArrowUpRight} label="Withdraw" color="amber" />
           <QuickLink icon={MessageSquare} label="WhatsApp Bot" color="emerald" />
           <QuickLink icon={Mail} label="Email" color="blue" />
           <QuickLink icon={UserPlus} label="Sub-Agents" color="purple" />
           <QuickLink icon={Settings} label="Settings" color="slate" />
        </div>
      </div>
    </div>
  );
}

function SmallStatsCard({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) {
  return (
    <Card className="bg-card/40 border-border/50 rounded-2xl hover:border-primary/30 transition-all group group cursor-default shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
          <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
            <Icon size={16} />
          </div>
        </div>
        <p className="text-3xl font-black tracking-tight group-hover:translate-x-1 transition-transform">
          {value}
        </p>
      </CardContent>
    </Card>
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
  if (s.includes("fulfilled") || s.includes("success")) {
    return <div className="h-2 w-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_5px_rgba(16,185,129,0.2)]" />;
  }
  if (s.includes("fail") || s.includes("cancel")) {
    return <div className="h-2 w-4 rounded-full bg-red-500/20 border border-red-500/30" />;
  }
  return <div className="h-2 w-4 rounded-full bg-amber-500/20 border border-amber-500/30 animate-pulse" />;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  if (s.includes("fulfilled") || s.includes("success")) {
    return (
      <div className="inline-flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <span className="text-[10px] font-black uppercase tracking-tight">Completed</span>
      </div>
    );
  }
  if (s.includes("fail") || s.includes("cancel")) {
    return (
      <div className="inline-flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
        <span className="text-[10px] font-black uppercase tracking-tight">Failed</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full">
      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-tight">{status}</span>
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
