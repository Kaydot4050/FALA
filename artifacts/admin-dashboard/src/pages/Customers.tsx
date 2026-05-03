import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Search, 
  Phone, 
  User, 
  Calendar, 
  ShoppingBag, 
  CreditCard,
  TrendingUp,
  Award,
  ArrowUpRight,
  RefreshCw,
  Mail,
  Filter,
  ArrowRightLeft,
  Download,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { customFetch } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface Customer {
  phoneNumber: string;
  customerName: string | null;
  totalOrders: number;
  totalSpent: string;
  lastOrderAt: string;
}

interface SmsLog {
  id: string;
  direction: string;
  phoneNumber: string;
  message: string;
  status: string;
  gatewayReference: string | null;
  createdAt: string;
}

export default function Customers() {
  const [activeTab, setActiveTab] = useState<'customers' | 'insights' | 'suggestions' | 'logs'>('customers');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [smsTarget, setSmsTarget] = useState<Customer | null>(null);
  const [smsMessage, setSmsMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendSms = async () => {
    if (!smsTarget || !smsMessage.trim()) return;
    
    setIsSending(true);
    try {
      await customFetch("/api/admin/sms/send", {
        method: "POST",
        body: JSON.stringify({
          phoneNumber: smsTarget.phoneNumber,
          message: smsMessage
        })
      });
      toast.success(`SMS sent to ${smsTarget.phoneNumber}`);
      setSmsTarget(null);
      setSmsMessage("");
    } catch (error) {
      toast.error("Failed to send SMS");
    } finally {
      setIsSending(false);
    }
  };

  // Fetch Suggestions
  const { data: suggestions = [], isLoading: isLoadingSuggestions, refetch: refetchSuggestions } = useQuery({
    queryKey: ["admin-suggestions"],
    queryFn: async () => {
      const res = await customFetch<any>(`/api/admin/suggestions?t=${Date.now()}`);
      return res.data || [];
    },
    staleTime: 0
  });

  // Fetch Customers
  const { data: customersResponse, isLoading, refetch } = useQuery({
    queryKey: ["admin-customers", currentPage],
    queryFn: async () => {
      const data = await customFetch<any>(`/api/admin/customers?page=${currentPage}&limit=20&t=${Date.now()}`);
      return data;
    },
    staleTime: 0
  });

  const customersData = customersResponse?.data as Customer[] || [];
  const pagination = customersResponse?.pagination;

  // Fetch SMS Logs
  const { data: smsLogs = [], isLoading: isLoadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ["admin-sms-logs"],
    queryFn: async () => {
      const res = await customFetch<any>(`/api/admin/sms/logs?t=${Date.now()}`);
      return res.data || [];
    },
    enabled: activeTab === 'logs',
    staleTime: 0
  });

  // Filter logic
  const filteredCustomers = useMemo(() => {
    if (!customersData) return [];
    return customersData.filter(c => 
      c.phoneNumber.includes(searchTerm) || 
      (c.customerName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [customersData, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    if (!customersData) return { total: 0, topSpender: 0, activeToday: 0 };
    const total = customersData.length;
    const topSpender = Math.max(...customersData.map(c => Number(c.totalSpent)));
    
    const today = new Date().toISOString().split('T')[0];
    const activeToday = customersData.filter(c => c.lastOrderAt.split('T')[0] === today).length;
    
    const returning = customersData.filter(c => c.totalOrders > 1).length;
    const retention = total > 0 ? Math.round((returning / total) * 100) : 0;

    return { total, topSpender, activeToday, retention };
  }, [customersData]);

  const handleExport = () => {
    if (!customersData) return;
    const headers = ["Phone Number", "Customer Name", "Total Orders", "Total Spent", "Last Order"];
    const rows = customersData.map(c => [
      c.phoneNumber,
      c.customerName || "Anonymous",
      c.totalOrders,
      c.totalSpent,
      format(new Date(c.lastOrderAt), 'yyyy-MM-dd HH:mm')
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTier = (orders: number) => {
    if (orders >= 10) return { label: 'GOLD', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', icon: Award };
    if (orders >= 5) return { label: 'SILVER', color: 'text-slate-300 bg-slate-300/10 border-slate-300/20', icon: Award };
    return { label: 'BRONZE', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', icon: Award };
  };

  const handleDeleteSuggestion = async (id: number) => {
    try {
      await customFetch(`/api/admin/suggestions/${id}`, { method: 'DELETE' });
      toast.success("Suggestion deleted");
      refetchSuggestions();
    } catch (error) {
      toast.error("Failed to delete suggestion");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await customFetch(`/api/admin/suggestions/${id}`, { 
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      toast.success(`Marked as ${status}`);
      refetchSuggestions();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) return <CustomersSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ── Tabs Header ── */}
      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('customers')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'customers' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card border border-border text-muted-foreground hover:bg-muted"
          )}
        >
          <Users size={16} />
          Customers View
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'insights' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card border border-border text-muted-foreground hover:bg-muted"
          )}
        >
          <ArrowRightLeft size={16} />
          Audience Insights
        </button>
        <button 
          onClick={() => setActiveTab('suggestions')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'suggestions' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card border border-border text-muted-foreground hover:bg-muted"
          )}
        >
          <MessageSquare size={16} />
          Customer Suggestions
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'logs' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card border border-border text-muted-foreground hover:bg-muted"
          )}
        >
          <Clock size={16} />
          SMS Logs
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatsCard label="Total Customers" value={stats.total} color="text-white" />
        <StatsCard label="Active Today" value={stats.activeToday} color="text-primary" />
        <StatsCard label="Top Spender" value={formatCurrency(stats.topSpender)} color="text-emerald-500" />
        <StatsCard label="Retention" value={`${stats.retention}%`} />
      </div>

      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* ── Filter Controls ── */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {['All', 'Gold', 'Silver', 'Bronze'].map((f) => (
                <button 
                  key={f}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap border bg-background/50 text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-[11px] font-medium placeholder:text-slate-600 focus:outline-none focus:border-primary/30 transition-all" 
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button onClick={handleExport} variant="outline" className="flex-1 md:flex-none h-10 rounded-xl font-bold gap-2 border-primary/20 hover:bg-primary/5 text-primary text-[10px]">
                <Download size={14} /> EXPORT
              </Button>
              <Button onClick={() => refetch()} variant="ghost" className="flex-1 md:flex-none h-10 rounded-xl font-bold gap-2 text-[10px]">
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> REFRESH
              </Button>
            </div>
          </div>

          {/* ── Table Container ── */}
          <div className="overflow-hidden rounded-xl border border-border/30">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer Alias</TableHead>
                    <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</TableHead>
                    <TableHead className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tier</TableHead>
                    <TableHead className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Count</TableHead>
                    <TableHead className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Value</TableHead>
                    <TableHead className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Seen</TableHead>
                    <TableHead className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                          <Users size={48} />
                          <p className="font-black text-sm uppercase tracking-tighter">No customers matching your search</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const tier = getTier(customer.totalOrders);
                      const TierIcon = tier.icon;
                      return (
                        <TableRow key={customer.phoneNumber} className="group border-border/20 hover:bg-white/[0.02] transition-colors">
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <User size={14} />
                              </div>
                              <div>
                                <div className="font-black text-[13px] tracking-tight text-foreground capitalize">{customer.customerName || 'Anonymous User'}</div>
                                <div className="text-[10px] font-bold text-muted-foreground capitalize opacity-50">Verified User</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-mono text-xs tracking-wider text-slate-300 font-bold">
                            {customer.phoneNumber}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black border tracking-wider", tier.color)}>
                              <TierIcon size={10} />
                              {tier.label}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center text-sm font-black text-foreground">
                            {customer.totalOrders}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right text-sm font-black text-emerald-500">
                            ₵{customer.totalSpent}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right text-xs font-bold text-muted-foreground whitespace-nowrap">
                            {formatDate(customer.lastOrderAt)}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <Button 
                              onClick={() => setSmsTarget(customer)}
                              variant="ghost" 
                              size="sm" 
                              className="h-8 rounded-lg text-[9px] font-black uppercase hover:bg-primary/10 hover:text-primary transition-all gap-1.5"
                            >
                              <MessageSquare size={12} />
                              Send SMS
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isLoadingSuggestions ? (
            <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 opacity-30">
              <RefreshCw className="h-12 w-12 animate-spin" />
              <p className="font-black text-sm uppercase tracking-tighter">Loading suggestions...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 opacity-30">
              <MessageSquare size={48} />
              <p className="font-black text-sm uppercase tracking-tighter">No suggestions yet</p>
            </div>
          ) : (
            suggestions.map((s: any) => (
              <Card key={s.id} className="bg-card/40 border-border/50 backdrop-blur-xl group hover:border-primary/30 transition-all overflow-hidden relative">
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  s.status === 'New' ? "bg-primary" : s.status === 'Reviewed' ? "bg-emerald-500" : "bg-amber-500"
                )} />
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-black text-sm text-white">{s.name}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatDate(s.createdAt)}</div>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                      s.status === 'New' ? "bg-primary/10 text-primary border-primary/20" : 
                      s.status === 'Reviewed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                    "{s.text}"
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button onClick={() => handleDeleteSuggestion(s.id)} variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase hover:bg-white/5">Delete</Button>
                    {s.status !== 'Reviewed' && (
                      <Button onClick={() => handleUpdateStatus(s.id, 'Reviewed')} variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase border-primary/20 text-primary hover:bg-primary/5">Mark Reviewed</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Recent Activity</h3>
            <Button onClick={() => refetchLogs()} variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase">
              <RefreshCw size={12} className={isLoadingLogs ? "animate-spin" : "mr-1.5"} /> Refresh Logs
            </Button>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-border/30">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</TableHead>
                    <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</TableHead>
                    <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message</TableHead>
                    <TableHead className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                    <TableHead className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLogs ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase text-muted-foreground animate-pulse">Loading logs...</p>
                      </TableCell>
                    </TableRow>
                  ) : smsLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                          <Clock size={32} />
                          <p className="font-black text-[10px] uppercase tracking-tighter">No SMS activity recorded yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    smsLogs.map((log: SmsLog) => (
                      <TableRow key={log.id} className="group border-border/20 hover:bg-white/[0.02] transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                            log.direction === 'inbound' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          )}>
                            {log.direction}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 font-mono text-[11px] font-bold text-slate-300">
                          {log.phoneNumber}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-xs font-medium text-slate-400 max-w-md truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                            {log.message}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {log.status === 'sent' || log.status === 'received' ? (
                              <CheckCircle2 size={12} className="text-emerald-500" />
                            ) : (
                              <XCircle size={12} className="text-rose-500" />
                            )}
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-tighter",
                              log.status === 'sent' || log.status === 'received' ? "text-emerald-500" : "text-rose-500"
                            )}>
                              {log.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="bg-card/30 border border-border/30 rounded-3xl p-12 text-center space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <TrendingUp size={32} />
          </div>
          <h2 className="text-2xl font-black text-white">Audience Insights coming soon</h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">We're building advanced analytics to help you understand your customers' buying patterns better.</p>
        </div>
      )}

      {/* ── Send SMS Modal ── */}
      <Dialog open={!!smsTarget} onOpenChange={(open) => !open && setSmsTarget(null)}>
        <DialogContent className="bg-card/95 border-border/50 backdrop-blur-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <MessageSquare className="text-primary" />
              Send SMS to {smsTarget?.customerName || smsTarget?.phoneNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message</label>
              <Textarea 
                placeholder="Type your message here..." 
                className="min-h-[120px] bg-white/5 border-white/10 rounded-xl focus:border-primary/50 transition-all text-sm"
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground italic">Message will be sent via Arkesel.</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setSmsTarget(null)}
              className="font-bold text-[10px] uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendSms}
              disabled={isSending || !smsMessage.trim()}
              className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider px-8 rounded-xl h-11"
            >
              {isSending ? <RefreshCw size={14} className="animate-spin" /> : "Send Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({ label, value, color = "text-foreground" }: { label: string, value: string | number, color?: string }) {
  return (
    <Card className="bg-card/40 border-border/50 backdrop-blur-xl group hover:border-primary/30 transition-all cursor-default">
      <CardContent className="p-4 md:p-6">
        <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-2 md:mb-4">{label}</p>
        <p className={cn("text-lg md:text-2xl font-black tracking-tight transition-transform group-hover:translate-x-1 truncate", color)}>
          <span className={cn(color.includes("emerald") ? "" : "text-foreground")}>
            {typeof value === 'string' && value.includes('GH') ? value.split('₵')[0] + '₵' : ''}
          </span>
          {typeof value === 'string' && value.includes('GH') ? value.split('₵')[1] : value}
        </p>
      </CardContent>
    </Card>
  );
}
function CustomersSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-10">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-40 rounded-xl shrink-0" />)}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="flex justify-between items-center gap-6">
        <div className="flex gap-2">
          {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-20 rounded-lg opacity-40" />)}
        </div>
        <Skeleton className="h-10 w-80 rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
      <div className="border border-border/30 rounded-xl overflow-hidden">
        <div className="p-8 space-y-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
               <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/5 rounded-lg opacity-40" />
                  </div>
               </div>
               <Skeleton className="h-4 w-32 rounded-lg" />
               <Skeleton className="h-6 w-16 rounded-full opacity-20" />
               <Skeleton className="h-4 w-20 rounded-lg" />
               <Skeleton className="h-8 w-24 rounded-lg opacity-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
