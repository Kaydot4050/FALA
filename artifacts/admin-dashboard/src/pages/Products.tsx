import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Package, 
  Search, 
  Edit2, 
  Eye, 
  EyeOff, 
  Zap, 
  CloudOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Monitor,
  Phone,
  ArrowUpRight
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { customFetch } from "@workspace/api-client-react";

// Types
interface DataPackage {
  id: string;
  capacity: string;
  mb?: string;
  price: string;
  oldPrice?: string;
  showOldPrice?: boolean;
  network: string;
  inStock: boolean;
  isHidden?: boolean;
}

export default function Products() {
  const [activeTab, setActiveTab] = useState<string>("YELLO");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editOldPrice, setEditOldPrice] = useState("");

  const queryClient = useQueryClient();

  // Fetch Packages
  const { data: packagesData, isLoading, refetch } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const data = await customFetch<any>("/api/packages?admin=true");
      return data.data as Record<string, DataPackage[]>;
    }
  });

  // Mutation to update package
  const updateMutation = useMutation({
    mutationFn: async (updated: Partial<DataPackage> & { id: string }) => {
      const parts = updated.id.split("_");
      const network = parts[0];
      const capacity = parts[1]?.replace("GB", "").replace("MB", "");

      return await customFetch("/api/admin/packages/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          network,
          capacity,
          customPrice: updated.price,
          customOldPrice: updated.oldPrice,
          showOldPrice: updated.showOldPrice,
          inStock: updated.inStock,
          isHidden: updated.isHidden
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("Changes Saved Live!");
    },
    onError: (err) => {
      toast.error("Save Failed: Try again");
      console.error("DEBUG SAVE ERROR:", err);
    }
  });

  const networks = useMemo(() => ["YELLO", "at", "TELECEL"], []);
  
  const filteredPackages = useMemo(() => {
    if (!packagesData) return [];
    const pkgs = packagesData[activeTab] || [];
    if (!searchTerm) return pkgs;
    const s = searchTerm.toLowerCase();
    return pkgs.filter(p => 
      p.capacity.toLowerCase().includes(s) ||
      p.price.toString().includes(s)
    );
  }, [packagesData, activeTab, searchTerm]);

  const stats = useMemo(() => {
    if (!packagesData) return { total: 0, active: 0, oos: 0 };
    const all = Object.values(packagesData).flat();
    return {
      total: all.length,
      active: all.filter(p => !p.isHidden).length,
      oos: all.filter(p => !p.inStock).length
    };
  }, [packagesData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Package className="text-primary" size={32} />
          Catalog
        </h1>
        <p className="text-muted-foreground font-medium mt-1 text-sm">Manage your website bundles and pricing</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Total Packages" value={stats.total} icon={<Package size={16} />} />
        <StatsCard label="Live Website" value={stats.active} icon={<CheckCircle2 size={16} />} color="text-emerald-500" />
        <StatsCard label="Out of Stock" value={stats.oos} icon={<AlertCircle size={16} />} color="text-amber-500" />
        <StatsCard label="Sync Health" value="100%" icon={<RefreshCw size={16} />} color="text-blue-500" />
      </div>

      <div className="space-y-6">
        {/* ── Filter & Search Controls ── */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             {networks.map((net) => (
              <button 
                key={net}
                onClick={() => setActiveTab(net)}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border uppercase",
                  activeTab === net
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-background/50 text-muted-foreground border-border/50 hover:bg-muted"
                )}
              >
                {net === "YELLO" ? "MTN" : net === "at" ? "AirtelTigo" : net}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search packages..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-10 rounded-full bg-background/50 border-border focus:ring-primary text-sm" 
            />
          </div>
        </div>

        {/* ── Products Table ── */}
        <div className="overflow-hidden rounded-xl border border-border/30">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-6">Network</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-10">Package</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-5 text-center">Cost (₵)</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 px-5 text-center">Reference</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 text-center px-10">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black py-2.5 text-center px-10">Visibility</TableHead>
                <TableHead className="text-right py-4 px-6 uppercase text-xs font-black tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.map((pkg) => {
                const pkgId = `${pkg.network}_${pkg.capacity}${pkg.mb ? 'MB' : 'GB'}`;
                const isEditing = editingId === pkgId;

                return (
                  <TableRow key={pkgId} className={cn(
                    "group border-border/20 hover:bg-white/[0.02] transition-all",
                    isEditing && "bg-primary/5 border-primary/20 shadow-inner"
                  )}>
                    {/* Network */}
                    <TableCell className="px-6 py-3">
                       <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black leading-none",
                          pkg.network === "YELLO" ? "bg-[#facc15] text-black" : pkg.network === "at" ? "bg-[#003399] text-white" : "bg-[#e21b22] text-white"
                        )}>
                          {pkg.network === "YELLO" ? "MTN" : pkg.network === "at" ? "AT" : "T"}
                        </div>
                    </TableCell>

                    {/* Package Name */}
                    <TableCell className="px-10 py-3">
                      <div className="font-bold text-sm tracking-tight">{pkg.capacity}GB</div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="px-5 text-center">
                      {isEditing ? (
                        <div className="relative inline-block">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary">₵</span>
                          <Input 
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-8 w-24 pl-5 bg-background/50 text-center font-black border-primary/50 focus:border-primary shadow-inner"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateMutation.mutate({ id: pkgId, price: editPrice });
                                setEditingId(null);
                              }
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="font-black text-base">₵{pkg.price}</div>
                      )}
                    </TableCell>

                    {/* Reference (Old Price) */}
                    <TableCell className="text-center px-10">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={pkg.showOldPrice} 
                            onCheckedChange={(val) => updateMutation.mutate({ ...pkg, showOldPrice: val, id: pkgId })}
                            className="scale-50 data-[state=checked]:bg-blue-500"
                          />
                          {editingId === `${pkgId}_old` ? (
                            <div className="flex items-center gap-1">
                               <Input 
                                 value={editOldPrice} 
                                 onChange={(e) => setEditOldPrice(e.target.value)}
                                 className="h-7 w-16 text-[10px] bg-slate-900 border-slate-700 font-bold px-1"
                               />
                               <Button 
                                 size="icon" 
                                 variant="ghost" 
                                 className="h-6 w-6 text-emerald-500"
                                 onClick={() => {
                                   updateMutation.mutate({ ...pkg, oldPrice: editOldPrice, id: pkgId });
                                   setEditingId(null);
                                 }}
                               >
                                 <CheckCircle2 size={12} />
                               </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[10px] font-bold transition-opacity",
                                pkg.showOldPrice ? "text-slate-400 line-through" : "text-slate-600 opacity-50"
                              )}>
                                ₵{pkg.oldPrice || '0.00'}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 text-slate-500 hover:text-white"
                                onClick={() => {
                                  setEditingId(`${pkgId}_old`);
                                  setEditOldPrice(pkg.oldPrice || "");
                                }}
                              >
                                <Edit2 size={10} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center px-10">
                       <div className="flex items-center justify-center gap-3">
                         <span className={cn(
                           "text-[10px] font-black uppercase",
                           pkg.inStock ? "text-emerald-500" : "text-amber-500"
                         )}>{pkg.inStock ? 'Active' : 'OOS'}</span>
                         <Switch 
                            checked={pkg.inStock} 
                            onCheckedChange={(val) => updateMutation.mutate({ ...pkg, inStock: val, id: pkgId })}
                            className="scale-75 data-[state=checked]:bg-emerald-500"
                          />
                       </div>
                    </TableCell>

                    {/* Visibility */}
                    <TableCell className="text-center px-10">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => updateMutation.mutate({ ...pkg, isHidden: !pkg.isHidden, id: pkgId })}
                          className="h-8 w-8 rounded-full hover:bg-slate-800"
                        >
                          {pkg.isHidden ? <EyeOff size={16} className="text-amber-500" /> : <Eye size={16} className="text-emerald-500" />}
                        </Button>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="text-right px-6">
                       {isEditing ? (
                         <div className="flex items-center justify-end gap-1">
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700 h-8 px-4 rounded-lg font-black text-xs shadow-lg shadow-emerald-600/20"
                              onClick={() => {
                                updateMutation.mutate({ ...pkg, price: editPrice, id: pkgId });
                                setEditingId(null);
                              }}
                            >
                              SAVE
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-muted-foreground"
                              onClick={() => setEditingId(null)}
                            >
                              <CloudOff size={14} />
                            </Button>
                         </div>
                       ) : (
                         <Button 
                           variant="ghost" 
                           className="h-8 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                           onClick={() => { setEditingId(pkgId); setEditPrice(pkg.price); }}
                         >
                           Edit Price
                         </Button>
                       )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-xl group hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className="h-8 w-8 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          {icon}
        </div>
      </div>
      <p className={cn("text-3xl font-black tracking-tighter", color || "text-white")}>{value}</p>
    </div>
  );
}
