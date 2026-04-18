import { Link, useLocation } from "wouter";
import { useGetBalance } from "@workspace/api-client-react";
import { Wallet, Activity, Home as HomeIcon, Search, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: balanceRes, isLoading: balanceLoading } = useGetBalance();

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
          
          <div className="flex items-center gap-6">
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
              <Link 
                href="/transactions" 
                className={cn(
                  "transition-colors hover:text-primary",
                  location === "/transactions" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Transactions
              </Link>
            </nav>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
              <Wallet className="h-4 w-4" />
              {balanceLoading ? (
                <Skeleton className="h-4 w-12" />
              ) : (
                <span className="font-medium text-foreground">
                  {balanceRes?.data?.currency || 'GHS'} {balanceRes?.data?.balance?.toFixed(2) || '0.00'}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col container max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>DataMart &copy; {new Date().getFullYear()}</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
      
      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/95 backdrop-blur z-50 pb-safe">
        <div className="flex justify-around items-center h-16 px-4">
          <Link href="/" className={cn("flex flex-col items-center gap-1", location === "/" ? "text-primary" : "text-muted-foreground")}>
            <HomeIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">Buy</span>
          </Link>
          <Link href="/order" className={cn("flex flex-col items-center gap-1", location.startsWith("/order") ? "text-primary" : "text-muted-foreground")}>
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">Order</span>
          </Link>
          <Link href="/tracker" className={cn("flex flex-col items-center gap-1", location === "/tracker" ? "text-primary" : "text-muted-foreground")}>
            <Activity className="h-5 w-5" />
            <span className="text-[10px] font-medium">Status</span>
          </Link>
          <Link href="/transactions" className={cn("flex flex-col items-center gap-1", location === "/transactions" ? "text-primary" : "text-muted-foreground")}>
            <ListOrdered className="h-5 w-5" />
            <span className="text-[10px] font-medium">History</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
