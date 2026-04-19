import { useGetDeliveryTracker } from "@workspace/api-client-react";
import { Activity, Radio, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Tracker() {
  // Poll every 15 seconds as requested
  const { data: trackerRes, isLoading } = useGetDeliveryTracker({
    query: { refetchInterval: 15000 }
  });

  const tracker = trackerRes?.data;
  const stats = tracker?.stats;
  const scanner = tracker?.scanner;

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">
      {/* Animated Banner Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white px-6 py-8 md:px-10 md:py-12 mt-4 md:mt-6 shadow-2xl isolate flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-slate-900 to-[#120524] z-[-2]" />
        
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] rounded-full bg-blue-600/20 blur-[80px] mix-blend-screen animate-blob pointer-events-none" />
        <div className="absolute bottom-[0%] right-[10%] w-[40%] h-[80%] rounded-full bg-fuchsia-600/20 blur-[100px] mix-blend-screen animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,black,transparent)] z-[-1]" />
        
        <div className="relative z-10 w-full animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3 shadow-[0_0_10px_rgba(34,197,94,0.5)] rounded-full">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="inline-block bg-white/5 backdrop-blur-md border border-white/10 text-white/90 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
              Fulfillment Network
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
            <span className="text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">Live Delivery</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-200 animate-pulse-slow">Tracker</span>
          </h1>
          <p className="text-indigo-100/80 leading-relaxed font-medium">
            Real-time monitoring of all active bundle dispatches.
          </p>
        </div>
        
        {scanner && (
          <div className="relative z-10 shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-colors px-6 py-4 rounded-2xl flex flex-col items-center md:items-end gap-2 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] w-full md:w-auto animate-fade-in-up-delay-2">
            <div className="flex items-center gap-2 font-bold text-sm text-white/90 uppercase tracking-widest">
              <Radio className="h-4 w-4 text-indigo-400 animate-pulse" />
              Gateway Engine
            </div>
            <div className="bg-slate-950/60 px-4 py-2 flex items-center justify-center rounded-xl text-lg font-black tracking-widest border border-white/5 w-full md:w-auto min-w-[140px]">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            color="text-blue-500" 
            bg="bg-blue-500/10" 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Processing Now */}
        <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <RefreshIcon active={scanner?.active} />
              Processing Now
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center items-center text-center min-h-[200px]">
            {tracker?.checkingNow?.summary ? (
              <div className="space-y-4 w-full">
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                  <p className="text-xl md:text-2xl font-medium tracking-tight text-primary leading-snug">
                    {tracker.checkingNow.summary}
                  </p>
                </div>
                {tracker.message && (
                  <p className="text-sm text-muted-foreground mt-4">{tracker.message}</p>
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
        <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Recently Delivered
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center items-center text-center min-h-[200px]">
            {tracker?.lastDelivered?.summary ? (
              <div className="w-full bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 p-6 rounded-lg">
                <p className="text-lg md:text-xl font-medium tracking-tight text-green-700 dark:text-green-400">
                  {tracker.lastDelivered.summary}
                </p>
                {tracker.lastDelivered.trackingId && (
                  <p className="text-xs font-mono text-green-600/70 dark:text-green-500/50 mt-4 uppercase tracking-wider">
                    Batch Ref: {tracker.lastDelivered.trackingId}
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
      
      {/* Live Activity Feed visualization (aesthetic) */}
      <div className="border border-border rounded-xl p-4 bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Network Activity Feed</h3>
        </div>
        
        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className={cn("relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active", i > 0 && "opacity-50 blur-[1px]")}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <ArrowRight className={cn("h-4 w-4", i === 0 && "text-primary animate-pulse")} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">System Check</span>
                  <span className="text-xs text-muted-foreground">T-{i * 15}s</span>
                </div>
                <p className="text-sm text-muted-foreground">Polling network gateways for delivery confirmations...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: number, icon: any, color: string, bg: string }) {
  let shadowGlow = "";
  if (color.includes("green")) shadowGlow = "hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:border-green-500/30";
  if (color.includes("yellow")) shadowGlow = "hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:border-yellow-500/30";
  if (color.includes("blue")) shadowGlow = "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/30";
  if (color.includes("red")) shadowGlow = "hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-500/30";

  return (
    <div className={cn("group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 shadow-sm", shadowGlow)}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] dark:to-white/[0.02] pointer-events-none" />
      <div className="relative flex items-center gap-4 z-10">
        <div className={cn("p-3.5 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 border border-transparent group-hover:border-current/10", bg, color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{title}</p>
          <p className="text-3xl font-extrabold tracking-tight group-hover:text-primary transition-colors">{value.toLocaleString()}</p>
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
