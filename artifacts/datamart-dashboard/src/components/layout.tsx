import { Link, useLocation } from "wouter";
import { Radio, Search, Sun, Moon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

function FalaaDealsMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="url(#falaa-grad)" />
      <text x="16" y="22" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="white">F</text>
      <defs>
        <linearGradient id="falaa-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0",
        isDark ? "bg-primary" : "bg-muted border border-border"
      )}
    >
      <span
        className={cn(
          "absolute flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300",
          isDark ? "left-8" : "left-1"
        )}
      >
        {isDark
          ? <Moon className="w-3 h-3 text-primary" />
          : <Sun className="w-3 h-3 text-amber-500" />
        }
      </span>
    </button>
  );
}

const NAV_LINKS = [
  { href: "/",        label: "Buy Data",    exact: true },
  { href: "/order",   label: "Track Order", exact: false },
  { href: "/tracker", label: "Live Status", exact: true },
  { href: "/about",   label: "About",       exact: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isActive = (href: string, exact: boolean) =>
    exact ? location === href : location.startsWith(href);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Top promo strip */}
      <div className="bg-primary text-primary-foreground text-center text-xs font-semibold py-2 px-4 tracking-wide">
        Instant delivery on all networks &mdash; No signup required
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <FalaaDealsMark />
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-base tracking-tight">Falaa Deals</span>
              <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Best data prices in GH</span>
            </div>
          </Link>

          <div className="flex items-center gap-5">
            <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
              {NAV_LINKS.map(({ href, label, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "transition-colors hover:text-primary",
                    isActive(href, exact) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col container max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-background mt-auto pb-24 md:pb-0">
        <div className="container max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <FalaaDealsMark />
                <span className="font-extrabold text-base">Falaa Deals</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Reliable data at unbeatable prices. Instant delivery across all major networks in Ghana.
              </p>
              <a
                href="https://wa.me/233593829640"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Join Our WhatsApp Group
              </a>
            </div>

            {/* Quick links */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { href: "/",        label: "Home" },
                  { href: "/",        label: "Buy Data" },
                  { href: "/order",   label: "Track Order" },
                  { href: "/about",   label: "About" },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sell with us */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Sell With Us</h3>
              <ul className="space-y-2">
                {[
                  { href: "https://wa.me/233593829640", label: "Become a Reseller", external: true },
                  { href: "https://wa.me/233593829640", label: "Reseller Login", external: true },
                  { href: "https://wa.me/233593829640", label: "Start with GHS 50", external: true },
                ].map(({ href, label, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="pt-1">
                <p className="text-xs text-muted-foreground">
                  &copy; {new Date().getFullYear()} Falaa Deals. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/98 backdrop-blur z-50">
        <div className="flex justify-around items-center h-16 px-2">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
              location === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
            </svg>
            <span className="text-[10px] font-semibold">Buy Data</span>
          </Link>
          <Link
            href="/order"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
              location.startsWith("/order") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-semibold">Track</span>
          </Link>
          <Link
            href="/tracker"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
              location === "/tracker" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Radio className="h-5 w-5" />
            <span className="text-[10px] font-semibold">Status</span>
          </Link>
          <Link
            href="/about"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
              location === "/about" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Info className="h-5 w-5" />
            <span className="text-[10px] font-semibold">About</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
