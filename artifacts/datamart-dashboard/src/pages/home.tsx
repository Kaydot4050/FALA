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

      {/* ── Hero — animates in on mount ── */}
      <section className="animate-fade-in-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-violet-700 text-primary-foreground px-6 py-10 md:px-12 md:py-14 mt-2">
        {/* decorative blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-0 left-8 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <span className="animate-fade-in inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Ghana&apos;s best data prices
          </span>
          <h1 className="animate-fade-in-up-delay-1 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3">
            Instant data bundles,<br />zero hassle.
          </h1>
          <p className="animate-fade-in-up-delay-2 text-base md:text-lg text-white/80 leading-relaxed">
            Pick your network, choose a bundle, enter your number &mdash; data lands in seconds.
            No account needed.
          </p>
        </div>

        {/* trust badges */}
        <div className="animate-fade-in-up-delay-3 relative z-10 flex flex-wrap gap-3 mt-8">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold">
              <Icon className="h-4 w-4" />
              {label}
            </div>
          ))}
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
