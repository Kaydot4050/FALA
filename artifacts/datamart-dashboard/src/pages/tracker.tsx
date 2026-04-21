import { useGetDeliveryTracker } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Radio, CheckCircle2, Clock, AlertTriangle, ArrowRight, Search, RefreshCw, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Tracker() {
  // Poll every 15 seconds for our local summaries
  const { data: trackerRes, isLoading } = useGetDeliveryTracker({
    query: { refetchInterval: 15000 }
  });

  const [location, setLocation] = useLocation();
  const [searchMode, setSearchMode] = useState<'id' | 'phone'>('phone');
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Official Widget Integration
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://api.datamartgh.shop/share/widget.js";
    script.async = true;
    script.setAttribute('data-api-key', '6914cd63913675d19ef6de56b2b35162577a4dc568f9ecf70b4830cabb8f903e');
    script.setAttribute('data-container', 'datamart-live-tracker');
    script.setAttribute('data-theme', 'dark');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    if (searchMode === 'id') {
      setLocation(`/order/${searchInput.trim()}`);
      return;
    }

    // Phone search
    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/order/phone/${encodeURIComponent(searchInput.trim())}`);
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        // Filter out pending results for history
        setSearchResults(data.data.filter((o: any) => o.status !== 'pending'));
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const tracker = trackerRes?.data;
  const stats = tracker?.stats;
  const scanner = tracker?.scanner;

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Animated Banner Header */}
      <section className="relative overflow-hidden rounded-[20px] bg-slate-950 text-white px-4 py-5 md:px-10 md:py-12 mt-2 md:mt-6 shadow-2xl isolate flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-shimmer">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-slate-900 to-[#120524] z-[-2]" />
        
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] rounded-full bg-primary/20 blur-[80px] mix-blend-screen animate-blob pointer-events-none" />
        <div className="absolute bottom-[0%] right-[10%] w-[40%] h-[80%] rounded-full bg-fuchsia-600/20 blur-[100px] mix-blend-screen animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,black,transparent)] z-[-1]" />
        
        <div className="relative z-10 w-full animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2 shadow-[0_0_10px_rgba(34,197,94,0.5)] rounded-full">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="inline-block bg-white/5 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
              Fulfillment Network
            </span>
          </div>
          
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight mb-1 drop-shadow-lg">
            <span className="text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">Live Delivery</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/60 to-primary/40 animate-pulse-slow">Tracker</span>
          </h1>
          <p className="text-primary-foreground/60 leading-relaxed font-medium text-[11px] md:text-base">
            Real-time monitoring of all active bundle dispatches.
          </p>
        </div>
        
        {scanner && (
          <div className="relative z-10 shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-colors px-4 py-3 rounded-[12px] flex flex-col items-center md:items-end gap-1.5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] w-full md:w-auto animate-fade-in-up-delay-2">
            <div className="flex items-center gap-2 font-bold text-[10px] md:text-sm text-white/90 uppercase tracking-widest">
              <Radio className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              Gateway Engine
            </div>
            <div className="bg-slate-950/60 px-4 py-1.5 flex items-center justify-center rounded-xl text-sm md:text-lg font-black tracking-widest border border-white/5 w-full md:w-auto min-w-[120px] md:min-w-[140px]">
              {scanner.active ? (
                <span className="text-green-400 shadow-green-500/50 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">ACTIVE</span>
              ) : scanner.waiting ? (
                <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-pulse">WAITING {scanner.waitSeconds}s</span>
              ) : (
                <span className="text-white/40">IDLE</span>
              )}
            </div>
          </div>
        )}
      </section>

      {isLoading && !tracker ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-border rounded-xl p-6 bg-card h-32">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-10 w-16" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard 
            title="Delivered" 
            value={stats.delivered} 
            icon={CheckCircle2} 
            color="text-green-500" 
            bg="bg-green-500/10" 
          />
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            icon={Clock} 
            color="text-yellow-500" 
            bg="bg-yellow-500/10" 
          />
          <StatCard 
            title="Checked" 
            value={stats.checked} 
            icon={Activity} 
            color="text-primary" 
            bg="bg-primary/20" 
          />
          <StatCard 
            title="Failed" 
            value={stats.failed || 0} 
            icon={AlertTriangle} 
            color="text-red-500" 
            bg="bg-red-500/10" 
          />
        </div>
      ) : null}

      {/* ── Find My Order ── */}
      <section className="animate-scale-in">
        <div className="bg-card border border-border rounded-[20px] overflow-hidden shadow-sm">
          <div className="p-5 md:p-8 bg-muted/30 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Find My Order</h2>
                <p className="text-sm text-muted-foreground">Search by phone number or reference ID to track your delivery.</p>
              </div>
              
              <div className="flex p-1 bg-muted rounded-xl w-fit">
                <button 
                  onClick={() => setSearchMode('phone')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    searchMode === 'phone' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  By Phone
                </button>
                <button 
                  onClick={() => setSearchMode('id')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    searchMode === 'id' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  By Order ID
                </button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="mt-8 relative flex w-full max-w-2xl group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-indigo-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <Input
                type="text"
                placeholder={searchMode === 'phone' ? "Enter your phone number (e.g. 0548169191)" : "Enter Order Reference (e.g. MN-YR6767ON)"}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="relative w-full pr-14 h-14 bg-card border-border text-lg rounded-xl focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isSearching}
                className="absolute right-2 top-2 bottom-2 h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all active:scale-95"
              >
                {isSearching ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </form>
          </div>

          <div className="p-5 md:p-8">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Search Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((order) => (
                      <Link
                        key={order.id}
                        href={`/order/${order.orderReference || order.id}`}
                      className="group flex items-center justify-between p-4 md:p-6 rounded-2xl border border-border bg-muted/20 hover:bg-card hover:border-primary/20 hover:shadow-md transition-all animate-scale-in active:scale-95 active:brightness-95"
                      >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner",
                          order.network === 'YELLO' ? "bg-[#ffcc00]/10 text-[#ffcc00]" : 
                          order.network === 'at' ? "bg-[#0033a0]/10 text-[#0033a0]" : "bg-[#e60000]/10 text-[#e60000]"
                        )}>
                          {order.network === 'YELLO' ? 'MTN' : order.network.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{order.capacity}GB Data Bundle</p>
                          <p className="text-[10px] uppercase font-mono text-muted-foreground">{order.orderReference || 'Pending Reference'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border",
                          order.status === 'fulfilled' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                          order.status === 'failed' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                          "bg-primary/10 text-primary border-primary/20 animate-pulse"
                        )}>
                          {order.status}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : searchInput && isSearching === false ? (
               <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                  <Package className="h-12 w-12 mb-4 text-muted-foreground/30" />
                  <p className="text-sm font-medium">Use the form above to search for your orders.</p>
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <Activity className="h-12 w-12 mb-4 text-muted-foreground/30" />
                <p className="text-sm font-medium">Real-time order retrieval system ready.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 pt-4">
        {/* Processing Now */}
        <div className="border border-border rounded-[20px] bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <RefreshIcon active={scanner?.active} />
              Processing Now
            </h3>
          </div>
          <div className="p-3 md:p-6 flex-1 flex flex-col justify-center items-center text-center min-h-[120px] md:min-h-[200px]">
            {tracker?.checkingNow?.summary ? (
              <div className="space-y-4 w-full">
                <div className="bg-primary/5 border border-primary/20 p-2 md:p-6 rounded-lg">
                  <p className="text-sm md:text-2xl font-bold tracking-tight text-primary leading-tight">
                    {tracker.checkingNow.summary}
                  </p>
                </div>
                {tracker.message && (
                  <p className="text-[10px] md:text-sm text-muted-foreground mt-2 md:mt-4">{tracker.message}</p>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 opacity-50" />
                <p>Waiting for next batch...</p>
              </div>
            )}
          </div>
        </div>

        {/* Recently Delivered */}
        <div className="border border-border rounded-[20px] bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Recently Delivered
            </h3>
          </div>
          <div className="p-3 md:p-6 flex-1 flex flex-col justify-center items-center text-center min-h-[120px] md:min-h-[200px]">
            {tracker?.lastDelivered?.summary ? (
              <div className="w-full bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 p-2 md:p-6 rounded-lg">
                <p className="text-sm md:text-xl font-bold tracking-tight text-green-700 dark:text-green-400 leading-tight">
                  {tracker.lastDelivered.summary}
                </p>
                {tracker.lastDelivered.trackingId && (
                  <p className="text-[9px] md:text-xs font-mono text-green-600/70 dark:text-green-500/50 mt-2 md:mt-4 uppercase tracking-wider">
                    Ref: {tracker.lastDelivered.trackingId}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2">
                <Activity className="h-8 w-8 opacity-50" />
                <p>No recent deliveries in this session</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Official DataMart Live Stream */}
      <div className="border border-border rounded-[20px] p-5 md:p-8 bg-[#0a0a0a] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-60" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-[12px] bg-primary/20 flex items-center justify-center border border-primary/30">
              <Radio className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight text-white uppercase">Live Delivery Stream</h3>
              <p className="text-xs text-primary/50 font-bold tracking-widest uppercase">Direct Network Feed</p>
            </div>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary flex items-center gap-2 uppercase tracking-tighter">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-ping" />
            Live Processing
          </div>
        </div>
        
        <div 
          id="datamart-live-tracker" 
          className="relative z-10 min-h-[300px] w-full rounded-xl md:rounded-2xl overflow-hidden [&_.dtw-container]:!bg-transparent [&_.dtw-card]:!bg-white/5 [&_.dtw-card]:!border-white/10 [&_.dtw-text-primary]:!text-primary [&_.dtw-text-muted]:!text-white/40 [&_.dtw-badge]:!bg-primary/20 [&_.dtw-badge]:!text-primary"
        >
          {/* Widget loads here */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
            <RefreshCw className="h-10 w-10 text-white/10 animate-spin" />
            <p className="text-white/20 text-sm font-bold uppercase tracking-widest">Connecting to network stream...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: number, icon: any, color: string, bg: string }) {
  let shadowGlow = "";
  if (color.includes("green")) shadowGlow = "hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:border-green-500/30";
  if (color.includes("yellow")) shadowGlow = "hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:border-yellow-500/30";
  if (color.includes("primary")) shadowGlow = "hover:shadow-[0_0_20px_hsl(var(--primary)_/_0.15)] hover:border-primary/30";
  if (color.includes("red")) shadowGlow = "hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-500/30";

  return (
    <div className={cn("group relative overflow-hidden rounded-[20px] border border-border bg-card p-3.5 md:p-5 transition-all duration-300 hover:-translate-y-2 shadow-sm animate-scale-in active:scale-95 active:brightness-95", shadowGlow)}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] dark:to-white/[0.02] pointer-events-none" />
      <div className="relative flex items-center gap-3 md:gap-4 z-10">
        <div className={cn("p-2.5 md:p-3.5 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 border border-transparent group-hover:border-current/10 shrink-0", bg, color)}>
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{title}</p>
          <p className="text-xl md:text-3xl font-extrabold tracking-tight group-hover:text-primary transition-colors">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function RefreshIcon({ active }: { active?: boolean }) {
  return (
    <div className={cn("relative flex h-5 w-5 items-center justify-center rounded-full border", active ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground")}>
      <Activity className={cn("h-3 w-3", active && "animate-pulse")} />
    </div>
  );
}
