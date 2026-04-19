import { useState } from "react";
import { useGetDataPackages } from "@workspace/api-client-react";
import type { DataPackage } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { NetworkLogo } from "@/components/network-logo";
import { PurchaseDialog } from "@/components/purchase-dialog";
import { ShieldCheck, Zap, Clock } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

export type NetworkId = "YELLO" | "TELECEL" | "AT_PREMIUM" | "at";

const NETWORKS: {
  id: NetworkId;
  name: string;
  sub: string;
  ringColor: string;
  badgeBg: string;
}[] = [
  { id: "YELLO",      name: "MTN",        sub: "Non-Expiry", ringColor: "ring-[#FFCC00]", badgeBg: "bg-[#FFCC00]/15 text-[#6b5200]" },
  { id: "TELECEL",    name: "Telecel",     sub: "Instant",    ringColor: "ring-[#E60000]", badgeBg: "bg-[#E60000]/10 text-[#8b0000]" },
  { id: "AT_PREMIUM", name: "AT Premium",  sub: "Premium",    ringColor: "ring-[#0033A0]", badgeBg: "bg-[#0033A0]/10 text-[#002266]" },
  { id: "at",         name: "AirtelTigo",  sub: "Standard",   ringColor: "ring-[#EF3D42]", badgeBg: "bg-[#EF3D42]/10 text-[#8b0000]" },
];

const TRUST_BADGES = [
  { icon: Zap,         label: "Instant delivery" },
  { icon: ShieldCheck, label: "Secure payment" },
  { icon: Clock,       label: "24 / 7 service" },
];

function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export default function Home() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>("YELLO");
  const [selectedPackage, setSelectedPackage] = useState<DataPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: packagesRes, isLoading, isError } = useGetDataPackages();

  const packages: DataPackage[] =
    (packagesRes?.data as Record<string, DataPackage[]>)?.[selectedNetwork] ?? [];

  const handlePackageSelect = (pkg: DataPackage) => {
    setSelectedPackage(pkg);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-10 pb-28 md:pb-12">

      {/* ── Hero — high-impact animated banner ── */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white px-6 py-12 md:px-14 md:py-24 mt-2 shadow-2xl isolate">
        {/* Dynamic Abstract Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-slate-900 to-[#120524] z-[-2]" />
        
        {/* Animated Blobs & Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[70%] rounded-full bg-fuchsia-600/30 blur-[100px] mix-blend-screen animate-blob pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-violet-600/30 blur-[120px] mix-blend-screen animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-blue-500/20 blur-[100px] mix-blend-screen animate-blob pointer-events-none" style={{ animationDelay: '4s' }}/>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,black,transparent)] z-[-1]" />

        <div className="relative z-10 max-w-2xl">
          <div className="animate-fade-in-up flex items-center gap-3 mb-8">
            <span className="relative flex h-3.5 w-3.5 shadow-[0_0_10px_rgba(34,197,94,0.5)] rounded-full">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
            </span>
            <span className="inline-block bg-white/5 backdrop-blur-md border border-white/10 text-white/90 text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-sm">
              Live Delivery Network
            </span>
          </div>

          <h1 className="animate-fade-in-up-delay-1 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 drop-shadow-xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-indigo-100 animate-pulse-slow">
              Unstoppable Data.
            </span>
            <br />
            <span className="text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.2)]">Zero Hassle.</span>
          </h1>
          
          <p className="animate-fade-in-up-delay-2 text-lg md:text-xl text-indigo-100/80 leading-relaxed font-medium max-w-xl mb-10">
            Experience lightning-fast bundle delivery. Pick your network, verify your number, and enjoy high-speed internet <span className="text-white relative"><span className="relative z-10 font-bold">instantly</span><span className="absolute bottom-1 left-0 w-full h-2 bg-fuchsia-500/50 -rotate-2 z-0 scale-110"></span></span>.
          </p>
          
          {/* Action badges */}
          <div className="animate-fade-in-up-delay-3 relative z-10 flex flex-wrap gap-4 mt-8">
            {TRUST_BADGES.map(({ icon: Icon, label }, idx) => (
              <div 
                key={label} 
                className="group relative overflow-hidden flex items-center gap-2.5 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/30 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] cursor-default"
                style={{ animationDelay: `${400 + idx * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="bg-white/10 p-1.5 rounded-full ring-1 ring-white/10 group-hover:ring-fuchsia-500/50 transition-colors">
                  <Icon className="h-4 w-4 text-fuchsia-300 group-hover:text-fuchsia-200" />
                </div>
                <span className="text-white/90">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Floating Elements (Visible on Mobile) */}
        <div className="absolute -right-32 -top-16 lg:right-10 lg:top-1/2 lg:-translate-y-1/2 w-96 h-96 animate-fade-in-up-delay-2 pointer-events-none perspective-[1000px] opacity-40 lg:opacity-100 scale-[0.6] lg:scale-100 origin-top-right lg:origin-center z-0">
           <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/80 to-fuchsia-500/80 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-blob opacity-60 mix-blend-screen" />
           <div className="absolute inset-4 bg-gradient-to-br from-blue-500/80 to-indigo-600/80 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] animate-blob opacity-80 mix-blend-screen" style={{ animationDelay: '2s' }} />
           
           <div className="absolute inset-0 flex items-center justify-center animate-float">
             <div className="relative w-48 h-48 backdrop-blur-2xl bg-white/10 rounded-full border border-white/20 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent z-0" />
               <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/20 blur-xl rounded-full" />
               <span className="relative z-10 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-md">24/7</span>
               <span className="relative z-10 text-xs font-bold uppercase tracking-[0.3em] text-indigo-200 mt-1">Uptime</span>
             </div>
           </div>

           {/* Floating secondary orbs */}
           <div className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-br from-fuchsia-400 to-purple-600 rounded-full blur-[2px] animate-float-reverse shadow-lg shadow-purple-500/50" />
           <div className="absolute bottom-12 left-10 w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-[1px] animate-float shadow-lg shadow-blue-500/50" style={{ animationDelay: '1s' }} />
        </div>
      </section>

      {/* ── Network selector ── */}
      <AnimatedSection className="space-y-4" delay={0}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          1. Select network
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NETWORKS.map((net, i) => {
            const isSelected = selectedNetwork === net.id;
            return (
              <button
                key={net.id}
                onClick={() => setSelectedNetwork(net.id)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={cn(
                  "relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in-up",
                  isSelected
                    ? `border-transparent bg-primary/10 ring-2 ${net.ringColor} shadow-md scale-[1.02]`
                    : "border-border bg-card hover:border-border/0 hover:shadow-sm hover:bg-muted/60 hover:scale-[1.01]"
                )}
              >
                <NetworkLogo network={net.id} size={52} />
                <div className="text-center">
                  <p className="font-bold text-sm">{net.name}</p>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", net.badgeBg)}>
                    {net.sub}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-primary animate-ping-once" />
                )}
              </button>
            );
          })}
        </div>
      </AnimatedSection>

      {/* ── Package grid ── */}
      <AnimatedSection className="space-y-4" delay={60}>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            2. Choose package
          </h2>
          {isLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">Loading…</span>
          )}
          {!isLoading && packages.length > 0 && (
            <span className="text-xs font-semibold text-muted-foreground">
              {packages.length} bundles available
            </span>
          )}
        </div>

        {isError ? (
          <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 text-center">
            <p className="font-semibold">Failed to load packages.</p>
            <p className="text-sm mt-1 opacity-80">Please refresh and try again.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border p-5 bg-card h-36">
                <Skeleton className="h-8 w-16 mb-3" />
                <Skeleton className="h-3 w-20 mb-4" />
                <Skeleton className="h-5 w-24 mt-auto" />
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-muted p-10 text-center rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground font-medium">No packages available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {packages.map((pkg, i) => (
              <button
                key={`${pkg.network}-${pkg.capacity}`}
                onClick={() => handlePackageSelect(pkg)}
                style={{ animationDelay: `${i * 40}ms` }}
                className="group animate-fade-in-up flex flex-col items-start text-left p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-extrabold tracking-tight leading-none group-hover:text-primary transition-colors">
                    {pkg.capacity}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground mb-0.5">GB</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{Number(pkg.mb).toLocaleString()} MB</p>

                <div className="mt-auto pt-4 w-full border-t border-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Price</p>
                    <p className="font-extrabold text-lg leading-tight">
                      <span className="text-xs font-bold mr-0.5 text-muted-foreground">GHS</span>
                      {Number(pkg.price).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Buy
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </AnimatedSection>

      <PurchaseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedPackage={selectedPackage}
        network={selectedNetwork}
      />
    </div>
  );
}
