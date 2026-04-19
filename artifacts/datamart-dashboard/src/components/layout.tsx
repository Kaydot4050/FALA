import { Link, useLocation } from "wouter";
import { Radio, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function FalaaDealsMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

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

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-primary",
                location === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Buy Data
            </Link>
            <Link
              href="/order"
              className={cn(
                "transition-colors hover:text-primary",
                location.startsWith("/order") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Track Order
            </Link>
            <Link
              href="/tracker"
              className={cn(
                "transition-colors hover:text-primary",
                location === "/tracker" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Live Status
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col container max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-border/40 py-6 mt-auto pb-24 md:pb-6 bg-background">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FalaaDealsMark />
            <span className="font-semibold text-foreground">Falaa Deals</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-5">
            <a href="tel:+233596922026" className="hover:text-primary transition-colors">Support</a>
            <Link href="/" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/98 backdrop-blur z-50">
        <div className="flex justify-around items-center h-16 px-4">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
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
              "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
              location.startsWith("/order") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-semibold">Track Order</span>
          </Link>
          <Link
            href="/tracker"
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
              location === "/tracker" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Radio className="h-5 w-5" />
            <span className="text-[10px] font-semibold">Live Status</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
