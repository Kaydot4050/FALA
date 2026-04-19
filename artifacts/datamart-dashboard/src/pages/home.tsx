import { useState } from "react";
import { useGetDataPackages } from "@workspace/api-client-react";
import type { DataPackage } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, WifiHigh, Radio } from "lucide-react";
import { PurchaseDialog } from "@/components/purchase-dialog";

export type NetworkId = "YELLO" | "TELECEL" | "AT_PREMIUM" | "at";

const NETWORKS: { id: NetworkId; name: string; icon: React.ElementType; colorClass: string; bgClass: string }[] = [
  {
    id: "YELLO",
    name: "MTN",
    icon: Zap,
    colorClass: "text-[#ffcc00]",
    bgClass: "bg-[#ffcc00]/10 hover:bg-[#ffcc00]/20 border-[#ffcc00]/20 hover:border-[#ffcc00]/50",
  },
  {
    id: "TELECEL",
    name: "Telecel",
    icon: WifiHigh,
    colorClass: "text-[#e60000]",
    bgClass: "bg-[#e60000]/10 hover:bg-[#e60000]/20 border-[#e60000]/20 hover:border-[#e60000]/50",
  },
  {
    id: "AT_PREMIUM",
    name: "AT Premium",
    icon: Radio,
    colorClass: "text-[#0033a0]",
    bgClass: "bg-[#0033a0]/10 hover:bg-[#0033a0]/20 border-[#0033a0]/20 hover:border-[#0033a0]/50",
  },
  {
    id: "at",
    name: "AirtelTigo",
    icon: Radio,
    colorClass: "text-[#ef3d42]",
    bgClass: "bg-[#ef3d42]/10 hover:bg-[#ef3d42]/20 border-[#ef3d42]/20 hover:border-[#ef3d42]/50",
  },
];

export default function Home() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>("YELLO");
  const [selectedPackage, setSelectedPackage] = useState<DataPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: packagesRes, isLoading, isError } = useGetDataPackages();

  const packages: DataPackage[] = (packagesRes?.data as Record<string, DataPackage[]>)?.[selectedNetwork] ?? [];

  const handlePackageSelect = (pkg: DataPackage) => {
    setSelectedPackage(pkg);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col space-y-8 pb-24 md:pb-12">
      <section className="py-8 md:py-12 space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Instant data bundles.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Select your network, pick a package, and get connected instantly. No signup needed.
        </p>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            1. Select Network
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NETWORKS.map((net) => {
              const Icon = net.icon;
              const isSelected = selectedNetwork === net.id;
              return (
                <button
                  key={net.id}
                  onClick={() => setSelectedNetwork(net.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border-2 transition-all duration-200 overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted"
                  )}
                >
                  {!isSelected && (
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300", net.bgClass)} />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-full",
                      isSelected ? "bg-primary-foreground/20 text-primary-foreground" : net.colorClass
                    )}>
                      <Icon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <span className="font-bold text-xs md:text-sm tracking-tight text-center leading-tight">{net.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              2. Choose Package
            </h2>
            {isLoading && (
              <span className="text-xs font-medium text-muted-foreground animate-pulse">
                Loading...
              </span>
            )}
          </div>

          {isError ? (
            <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 text-center">
              <p className="font-medium">Failed to load packages.</p>
              <p className="text-sm mt-1 opacity-80">Please try again shortly.</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-xl border border-border p-4 bg-card shadow-sm h-32">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-6 w-20 mt-auto" />
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="bg-muted p-8 text-center rounded-xl border border-border border-dashed">
              <p className="text-muted-foreground">No packages available for this network currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <button
                  key={`${pkg.network}-${pkg.capacity}`}
                  onClick={() => handlePackageSelect(pkg)}
                  className="group relative flex flex-col items-start text-left p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="w-full flex justify-between items-start mb-4">
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-extrabold tracking-tight leading-none group-hover:text-primary transition-colors">
                        {pkg.capacity}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground mb-1">GB</span>
                    </div>
                  </div>

                  <div className="mt-auto w-full pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{pkg.mb} MB</span>
                    <span className="font-bold text-lg">
                      <span className="text-xs font-semibold mr-1 opacity-70">GHS</span>
                      {Number(pkg.price).toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <PurchaseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedPackage={selectedPackage}
        network={selectedNetwork}
      />
    </div>
  );
}
