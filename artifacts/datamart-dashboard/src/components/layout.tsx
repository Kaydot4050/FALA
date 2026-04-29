import { useLocation, Link } from "wouter";
import { Radio, Search, Sun, Moon, Info, Wallet, Menu, X, CreditCard, Home as HomeIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useGetBalance } from "@workspace/api-client-react";
import { useState } from "react";
import { useDeliveryStatus } from "@/hooks/use-delivery-status";
import { PopupManager } from "./popup-manager";

function StatusIndicator() {
  const { status } = useDeliveryStatus();
  
  if (!status) return null;

  const isFast = status.status === 'fast';
  
  return (
    <div className="relative flex h-4 w-4 items-center justify-center">
      <div className={cn(
        "absolute inline-flex h-full w-full rounded-full opacity-75",
        isFast ? "animate-[ping_0.8s_cubic-bezier(0,0,0.2,1)_infinite] bg-yellow-400" : "animate-ping " + status.dotColor
      )} />
      <div className={cn(
        "relative inline-flex h-2.5 w-2.5 rounded-full transition-all duration-500",
        status.dotColor,
        isFast && "scale-110"
      )} />
    </div>
  );
}

function WalletBalance() {
  const { data: balanceData, isLoading, error } = useGetBalance({
    query: {
      refetchInterval: 30000, 
    }
  });

  if (isLoading) return <div className="h-4 w-12 animate-pulse bg-muted rounded" />;
  if (error || !balanceData?.data) return null;

  const balance = balanceData.data.balance;
  const isLow = balance < 10;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
      isLow 
        ? "bg-red-500/10 text-red-500 border-red-500/20" 
        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    )}>
      <Wallet className="h-3.5 w-3.5" />
      <span>GHS {balance.toFixed(2)}</span>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/60 hover:bg-muted border border-border/40 transition-colors"
    >
      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
    </button>
  );
}

function ColorCircle({ color, name }: { color: string, name: string }) {
  const { brandColor, setBrandColor } = useTheme();
  const isActive = brandColor === color;

  return (
    <button
      onClick={() => setBrandColor(color)}
      title={name}
      className={cn(
        "h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center text-white",
        isActive ? "border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.3)]" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
      )}
      style={{ backgroundColor: `hsl(${color})` }}
    >
      {isActive && <Check className="h-3 w-3" />}
    </button>
  );
}

const NAV_LINKS = [
  { href: "/",        label: "Home",        exact: true },
  { href: "/buy",    label: "Buy Data",    exact: true },
  { href: "/order",   label: "Track Order", exact: false },
  { href: "/tracker", label: "Delivery", exact: true },
  { href: "/about",   label: "About",       exact: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isActive = (href: string, exact: boolean) =>
    exact ? location === href : location.startsWith(href);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <PopupManager />
      
      {/* Top promo strip */}
      <div className="bg-gradient-to-r from-primary via-primary/80 to-primary/40 text-white text-center text-[11px] font-semibold py-2 px-4 tracking-wide shadow-lg">
        No signup required to buy data
      </div>

      <header className="sticky top-0 z-50 w-full md:px-4 md:pt-6 pointer-events-none">
        <div className="md:container md:max-w-6xl md:mx-auto pointer-events-auto">
          <div className="flex h-16 items-center justify-between px-6 md:px-8 rounded-none md:rounded-[20px] bg-background/40 backdrop-blur-3xl border-b md:border border-white/10 shadow-2xl transition-all duration-500">
            
            {/* ── Brand Section ── */}
            <Link href="/" className="flex items-center transition-transform hover:scale-105 active:scale-95 group">
              <img 
                src="/logo.png" 
                alt="Falaa Deals" 
                className="h-7 md:h-8 w-auto invert dark:invert-0 transition-all duration-300" 
              />
            </Link>

            {/* ── Central Navigation ── */}
            <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/40 border border-border/40 backdrop-blur-md">
              {NAV_LINKS.map(({ href, label, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 relative group overflow-hidden",
                    isActive(href, exact) 
                      ? "bg-primary text-white shadow-xl" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span className="relative z-10">{label}</span>
                  {isActive(href, exact) && (
                    <div className="absolute inset-0 bg-primary/10 blur-sm pointer-events-none" />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Action Section ── */}
            <div className="flex items-center gap-4">
               <StatusIndicator />
               <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col container max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto pt-20 pb-24 md:pb-12 px-6 border-t border-white/5 bg-black">
        <div className="container max-w-6xl mx-auto">
          {/* Top Row: Brand, Nav, Socials */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center group">
              <img 
                src="/logo.png" 
                alt="FalaaDeals" 
                className="h-6 md:h-8 w-auto brightness-200 transition-all group-hover:scale-105" 
              />
            </Link>

            {/* Navigation */}
            <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {[
                { href: "/", label: "About" },
                { href: "/buy", label: "Buy" },
                { href: "/tracker", label: "Delivery" },
                { href: "/order", label: "Track" },
                { href: "/about", label: "Privacy" },
                { href: "/about", label: "Terms" },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm font-bold text-slate-500 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Socials */}
            <div className="flex items-center gap-4">
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, label: "WhatsApp", href: "https://wa.me/233593829640" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>, label: "Telegram", href: "#" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>, label: "GitHub", href: "#" },
              ].map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 transition-all hover:bg-white/5"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Brand Color Selection */}
          <div className="flex flex-col items-center gap-4 pb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Custom Theme</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: 'Indigo',  value: '230 100% 65%' },
                { name: 'Cyan',    value: '190 100% 50%' },
                { name: 'Emerald', value: '150 100% 50%' },
                { name: 'Amber',   value: '40 100% 60%' },
                { name: 'Crimson', value: '350 100% 60%' },
                { name: 'Rose',    value: '330 100% 65%' },
                { name: 'Violet',  value: '270 100% 65%' },
                { name: 'Lime',    value: '80 100% 50%' },
                { name: 'Orange',  value: '25 100% 55%' },
                { name: 'Sky',     value: '200 100% 60%' }
              ].map((color) => (
                <ColorCircle 
                  key={color.name} 
                  color={color.value} 
                  name={color.name}
                />
              ))}
            </div>
          </div>

          {/* Bottom Row: Copyright */}
          <div className="pt-12 border-t border-white/5 text-center">
            <p className="text-sm font-bold text-slate-600 tracking-tight">
              &copy; {new Date().getFullYear()} FalaaDeals. Ghana's premier data service, built for speed and reliability.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/98 backdrop-blur-xl z-50">
        <div className="flex justify-around items-center h-14 px-2">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
              location === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <HomeIcon className="h-[18px] w-[18px]" />
            <span className="text-[9px] font-semibold">Home</span>
          </Link>
          <Link
            href="/buy"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
              location === "/buy" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <CreditCard className="h-[18px] w-[18px]" />
            <span className="text-[9px] font-semibold">Buy Data</span>
          </Link>
          <Link
            href="/order"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
              location.startsWith("/order") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Search className="h-[18px] w-[18px]" />
            <span className="text-[9px] font-semibold">Track</span>
          </Link>
          <Link
            href="/tracker"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
              location === "/tracker" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Radio className="h-[18px] w-[18px]" />
            <span className="text-[9px] font-semibold">Status</span>
          </Link>
          <Link
            href="/about"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
              location === "/about" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Info className="h-[18px] w-[18px]" />
            <span className="text-[9px] font-semibold">About</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
