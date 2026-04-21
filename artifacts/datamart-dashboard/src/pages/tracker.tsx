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
