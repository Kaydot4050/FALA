import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  Activity, 
  Settings, 
  Sun, 
  Moon,
  ChevronRight,
  Database,
  Users,
  ArrowUpRight,
  MessageSquare,
  BarChart3,
  Mail,
  Store,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

const MAIN_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Database },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

const TOOLS_LINKS = [
  { href: "/promo", label: "Promo Codes", icon: ArrowUpRight, badge: "NEW" },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/bot", label: "WhatsApp Bot", icon: MessageSquare, badge: "BETA" },
  { href: "/email", label: "Email Marketing", icon: Mail },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Don't show sidebar on login page
  if (location === "/login") {
    return <main className="min-h-screen bg-[#0B0F1A]">{children}</main>;
  }

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b]/50 border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Store size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight block leading-none">Agent Store</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Falaa deals</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
          {/* Main Section */}
          <div className="space-y-1">
             <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Main</p>
             {MAIN_LINKS.map((link) => (
                <SidebarLink key={link.href} {...link} isActive={location === link.href} />
             ))}
          </div>

          {/* Tools Section */}
          <div className="space-y-1">
             <div className="flex items-center justify-between px-4 mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tools</p>
                <Settings size={12} className="text-slate-500" />
             </div>
             {TOOLS_LINKS.map((link) => (
                <SidebarLink key={link.href} {...link} isActive={location === link.href} />
             ))}
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-amber-500 text-black font-black text-sm shadow-xl shadow-amber-500/10 hover:brightness-110 active:scale-[0.98] transition-all">
            <Store size={18} />
            <span>View My Store</span>
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem("admin_auth");
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="w-full py-10 px-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, label, icon: Icon, isActive, badge }: { href: string, label: string, icon: any, isActive: boolean, badge?: string }) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group relative",
        isActive 
          ? "bg-amber-500/10 text-amber-500" 
          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
      )}
    >
      <Icon size={20} className={cn(
        "transition-transform",
        !isActive && "group-hover:scale-110"
      )} />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={cn(
          "text-[8px] font-black px-1.5 py-0.5 rounded-md",
          badge === "NEW" ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/20 text-primary"
        )}>
          {badge}
        </span>
      )}
      {isActive && <div className="absolute right-0 w-1.5 h-6 bg-amber-500 rounded-l-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />}
    </Link>
  );
}
