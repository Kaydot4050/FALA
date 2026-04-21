import { useGetDeliveryTracker } from "@workspace/api-client-react";
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



  const tracker = trackerRes?.data;
  const stats = tracker?.stats;
  const scanner = tracker?.scanner;

  return (
    <div className="w-full space-y-8 pb-12">
      {/* ── Glassmorphic Status Card ── */}
      <section className="flex items-center justify-center pt-6 md:pt-10 pb-4 animate-fade-in">
        <div className="w-full max-w-4xl h-auto md:h-64 relative rounded-[24px] md:rounded-[40px] bg-black/60 backdrop-blur-3xl border border-white/5 shadow-2xl flex flex-row items-center justify-between p-5 md:px-16 overflow-hidden group">
          
          {/* Info Side */}
          <div className="flex flex-col items-start text-left space-y-1 md:space-y-4">
             <div className="space-y-0.5 md:space-y-1">
               <h2 className="text-sm md:text-3xl font-bold tracking-tight text-white line-clamp-2 md:line-clamp-none max-w-[120px] md:max-w-none leading-tight">Live Delivery Tracker</h2>
               <div className="h-0.5 md:h-1 w-8 md:w-12 bg-primary/40 rounded-full" />
             </div>
             <p className="text-[9px] md:text-sm text-white/40 font-medium max-w-[100px] md:max-w-[280px] leading-relaxed line-clamp-2 md:line-clamp-none">
               Real-time monitoring of all active bundle dispatches.
             </p>
          </div>

          {/* Status Side */}
          <div className="flex flex-row-reverse items-center gap-3 md:gap-12">
            {/* Status Label */}
            <div className="text-right">
              <p className={cn(
                "text-sm md:text-3xl font-black tracking-[0.1em] md:tracking-[0.2em] uppercase",
                scanner?.active ? "text-green-500" : scanner?.waiting ? "text-amber-500" : "text-white"
              )}>
                {scanner?.active ? "Active" : scanner?.waiting ? "Waiting" : "Idle"}
              </p>
              {scanner?.waiting && (
                <p className="text-[7px] md:text-[10px] text-amber-500/60 font-bold uppercase tracking-tighter md:tracking-widest mt-0.5 md:mt-1">
                  {scanner.waitSeconds}s
                </p>
              )}
            </div>

            {/* Central Ring */}
            <div className="relative flex items-center justify-center">
              <div className={cn(
                "h-16 w-16 md:h-40 md:w-40 rounded-full border-[3px] md:border-[5px] flex flex-col items-center justify-center transition-colors duration-500",
                scanner?.active ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]" : scanner?.waiting ? "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "border-white/10"
              )}>
                <span className="text-[6px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/90">Status</span>
              </div>
            </div>
          </div>
        </div>
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



      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 pt-4">
        {/* Processing Now */}
        <div className="border border-border rounded-[20px] bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-xs md:text-sm font-semibold flex items-center gap-2">
              <RefreshIcon active={scanner?.active} />
              Processing Now
            </h3>
          </div>
          <div className="p-3 md:p-6 flex-1 flex flex-col justify-center items-center text-center min-h-[120px] md:min-h-[200px]">
            {tracker?.checkingNow?.summary ? (
              <div className="space-y-4 w-full">
                <div className="bg-primary/5 border border-primary/20 p-2 md:p-6 rounded-lg">
                  <p className="text-sm md:text-lg font-bold tracking-tight text-primary leading-tight">
                    {tracker.checkingNow.summary}
                  </p>
                </div>
                {tracker.message && (
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-2 md:mt-4">{tracker.message}</p>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 opacity-50" />
                <p className="text-[10px] md:text-xs">Waiting for next batch...</p>
              </div>
            )}
          </div>
        </div>

        {/* Recently Delivered */}
        <div className="border border-border rounded-[20px] bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-xs md:text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Recently Delivered
            </h3>
          </div>
          <div className="p-3 md:p-6 flex-1 flex flex-col justify-center items-center text-center min-h-[120px] md:min-h-[200px]">
            {tracker?.lastDelivered?.summary ? (
              <div className="w-full bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 p-2 md:p-6 rounded-lg">
                <p className="text-sm md:text-lg font-bold tracking-tight text-green-700 dark:text-green-400 leading-tight">
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
                <p className="text-[10px] md:text-xs">No recent deliveries in this session</p>
              </div>
            )}
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
