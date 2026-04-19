import { Link, useLocation } from "wouter";
import { Activity, Home as HomeIcon, Search, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">DataMart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
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

      <main className="flex-1 flex flex-col container max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border/40 py-6 mt-auto pb-24 md:pb-6">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>DataMart &copy; {new Date().getFullYear()}</p>
          <div className="flex gap-4">
            <a href="tel:+233596922026" className="hover:text-foreground transition-colors">Support</a>
            <Link href="/" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/95 backdrop-blur z-50 pb-safe">
        <div className="flex justify-around items-center h-16 px-4">
          <Link href="/" className={cn("flex flex-col items-center gap-1 min-w-[64px]", location === "/" ? "text-primary" : "text-muted-foreground")}>
            <HomeIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">Buy Data</span>
          </Link>
          <Link href="/order" className={cn("flex flex-col items-center gap-1 min-w-[64px]", location.startsWith("/order") ? "text-primary" : "text-muted-foreground")}>
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">Track Order</span>
          </Link>
          <Link href="/tracker" className={cn("flex flex-col items-center gap-1 min-w-[64px]", location === "/tracker" ? "text-primary" : "text-muted-foreground")}>
            <Radio className="h-5 w-5" />
            <span className="text-[10px] font-medium">Live Status</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
