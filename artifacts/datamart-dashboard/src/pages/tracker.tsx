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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-4 md:mt-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Live Delivery Tracker</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Real-time fulfillment network status
          </p>
        </div>
        
        {scanner && (
          <div className="bg-muted px-4 py-2 rounded-full border border-border flex items-center gap-2 text-sm font-medium">
            <Radio className="h-4 w-4 text-primary" />
            Scanner: {scanner.active ? (
              <span className="text-green-500">Active</span>
            ) : scanner.waiting ? (
              <span className="text-yellow-500">Waiting ({scanner.waitSeconds}s)</span>
            ) : (
              <span className="text-muted-foreground">Idle</span>
            )}
          </div>
        )}
      </div>

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
  return (
    <div className="border border-border rounded-xl p-5 bg-card shadow-sm flex items-center gap-4">
      <div className={cn("p-3 rounded-lg flex items-center justify-center", bg, color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
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
