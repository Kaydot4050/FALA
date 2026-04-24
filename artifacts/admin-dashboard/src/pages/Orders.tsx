import { useGetPurchaseHistory } from "@workspace/api-client-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  Monitor, 
  Phone,
  Filter,
  ArrowRightLeft,
  ShoppingCart,
  Usb
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

export default function Orders() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  
  const { data: historyData, isLoading } = useGetPurchaseHistory({
    page, 
    limit: 50
  });

  const rawOrders = historyData?.data?.purchases || [];

  // Filter logic
  const filteredOrders = useMemo(() => {
    return rawOrders.filter(o => {
      const s = search.toLowerCase();
      const matchesSearch = !search || 
        o.phoneNumber?.includes(search) || 
        o.orderReference?.toLowerCase().includes(s) ||
        o.customerName?.toLowerCase().includes(s) ||
        o.network?.toLowerCase().includes(s) ||
        o.price?.toString().includes(s) ||
        o.orderStatus?.toLowerCase().includes(s) ||
        o.capacity?.toString().includes(s) ||
        formatDate(o.createdAt).toLowerCase().includes(s);
      
      const st = o.orderStatus?.toLowerCase() || '';
      let matchesFilter = filter === 'all';
      if (filter === 'completed') matchesFilter = st.includes('fulfil') || st.includes('success');
      else if (filter === 'failed') matchesFilter = st.includes('fail') || st.includes('cancel');
      else if (filter === 'pending') matchesFilter = st.includes('pending');
      else if (filter === 'processing') matchesFilter = st.includes('processing');
      
      return matchesSearch && matchesFilter;
    });
  }, [rawOrders, search, filter]);

  // Derived stats for the header
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((acc, o) => acc + (o.price || 0), 0);
    const totalProfit = filteredOrders.reduce((acc, o) => {
      let cost = o.costPrice ? Number(o.costPrice) : null;
      if (cost === null) {
        if (o.network?.toLowerCase().includes('mtn') || o.network?.toLowerCase().includes('yello')) {
          cost = (o.capacity || 1) * 4;
        } else {
          cost = (o.price || 0) * 0.88;
        }
      }
      return acc + ((o.price || 0) - cost);
    }, 0);
    const completed = filteredOrders.filter(o => o.orderStatus?.toLowerCase().includes('success') || o.orderStatus?.toLowerCase().includes('fulfill')).length;
    const pending = filteredOrders.filter(o => o.orderStatus?.toLowerCase().includes('pending')).length;
    return { totalRevenue, totalProfit, completed, pending };
  }, [filteredOrders]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ── Tabs Header ── */}
      <div className="flex items-center gap-4">
        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2">
          <Filter size={16} />
          Orders View
        </button>
        <button className="bg-card border border-border px-6 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2">
          <ArrowRightLeft size={16} />
          Transaction Log
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} color="text-white" />
        <StatsCard label="Total Profit" value={formatCurrency(stats.totalProfit)} color="text-emerald-500" />
        <StatsCard label="Completed" value={stats.completed} />
        <StatsCard label="Pending" value={stats.pending} />
      </div>

      <div className="space-y-6">
        {/* ── Filter Controls ── */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['All', 'Completed', 'Pending', 'Processing', 'Failed'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f.toLowerCase())}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                  filter === f.toLowerCase() 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background/50 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search anything..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-full bg-background/50 border-border focus:ring-primary text-sm shadow-inner" 
            />
          </div>
        </div>

        {/* ── Orders Table ── */}
        <div className="overflow-hidden rounded-xl border border-border/30">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-4">Order</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-5 text-center">Customer</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-5">Product</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-4 text-center">Amount</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-4 text-center">Profit</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 text-center px-5">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-4 text-center">Date/Source</TableHead>
                <TableHead className="text-right py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-border/30">
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-6 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ShoppingCart className="h-10 w-10 opacity-20 mb-2" />
                      <p className="font-bold">No orders found.</p>
                      <p className="text-xs">Adjust your search or filter to see results.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group border-border/20 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground uppercase px-4">{order.orderReference?.substring(0, 8)}</TableCell>
                    <TableCell className="py-3 px-5">
                      <div className="flex items-center justify-center gap-3 text-center">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <Phone size={14} />
                        </div>
                          <div className="text-left">
                            <div className="font-black text-[13px] tracking-tight text-foreground uppercase mb-0.5">
                              {order.customerName || "Valued Customer"}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground opacity-60">
                              <span>{order.phoneNumber}</span>
                              <span className="opacity-30">·</span>
                              <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="opacity-30">·</span>
                              {order.source === "api" ? (
                                <Usb size={9} strokeWidth={3} />
                              ) : (
                                <Monitor size={9} strokeWidth={3} />
                              )}
                            </div>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black leading-none",
                          (order.network?.toLowerCase().includes("mtn") || order.network?.toLowerCase().includes("ye")) ? "bg-[#facc15] text-black" : 
                          order.network?.toLowerCase().includes("at") ? "bg-[#003399] text-white" :
                          order.network?.toLowerCase().includes("telecel") ? "bg-[#e21b22] text-white" :
                          order.network?.toLowerCase().includes("voda") ? "bg-[#e21b22] text-white" :
                          "bg-slate-700 text-white"
                        )}>
                          {order.network?.toLowerCase().includes("mtn") ? "MTN" : 
                           order.network?.toLowerCase().includes("telecel") ? "T" :
                           order.network?.toLowerCase().includes("voda") ? "V" :
                           order.network?.toLowerCase().includes("at") ? "AT" :
                           order.network?.toUpperCase().substring(0, 2)}
                        </div>
                        <span className="text-sm font-bold">{order.capacity}GB</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-base px-4 text-center">₵{order.price}</TableCell>
                    <TableCell className="text-emerald-500 font-bold text-sm uppercase px-4 text-center">
                      +{formatCurrency((order.price || 0) - (() => {
                        if (order.costPrice) return Number(order.costPrice);
                        if (order.network?.toLowerCase().includes('mtn') || order.network?.toLowerCase().includes('yello')) {
                          return (order.capacity || 1) * 4;
                        }
                        return (order.price || 0) * 0.88;
                      })())}
                    </TableCell>
                    <TableCell className="py-3 text-center px-5">
                      <StatusBadge status={order.orderStatus} />
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground whitespace-nowrap px-4 text-center">
                       {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground group-hover:text-primary">
                        <Eye size={14} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, color = "text-foreground" }: { label: string, value: string | number, color?: string }) {
  return (
    <Card className="bg-card/40 border-border/50 backdrop-blur-xl group hover:border-primary/30 transition-all cursor-default">
      <CardContent className="p-6">
        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-4">{label}</p>
        <p className={cn("text-2xl font-black tracking-tight transition-transform group-hover:translate-x-1", color)}>
          <span className={cn(color.includes("emerald") ? "" : "text-foreground")}>
            {typeof value === 'string' && value.includes('GH') ? value.split('₵')[0] + '₵' : ''}
          </span>
          {typeof value === 'string' && value.includes('GH') ? value.split('₵')[1] : value}
        </p>
      </CardContent>
    </Card>
  );
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
