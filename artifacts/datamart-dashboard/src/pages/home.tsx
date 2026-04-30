import { ArrowRight, Search, Zap, ShieldCheck, Clock, TrendingUp, Sparkles, MessageSquare, Send, Star, ChevronDown, ChevronUp, User, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { customFetch, useGetDataPackages } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import HeroBanner from "@/assets/home-banner.jpg";
import { Link, useLocation } from "wouter";
import { NetworkLogo } from "@/components/network-logo";
import type { NetworkId } from "./buy";

const STEPS = [
  { icon: ShieldCheck, title: "Choose Bundle", desc: "Pick your preferred data size" },
  { icon: Zap,         title: "Pay Securely", desc: "Mobile Money or Card via Paystack" },
  { icon: Clock,       title: "Get Data Instantly", desc: "Delivered in seconds, 24/7" },
];

const STATS = [
  { value: "100+", label: "Deliveries Today", icon: TrendingUp },
  { value: "1-60min", label: "Avg. Fulfillment", icon: Zap },
  { value: "100%", label: "Secure Gateway", icon: ShieldCheck },
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
        "transition-all duration-1000 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}



export default function Home() {
  const [, setLocation] = useLocation();
  const { data: packagesRes, isLoading, error } = useGetDataPackages();
  const [isSuggestionExpanded, setIsSuggestionExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const suggestionNameRef = useRef<HTMLInputElement>(null);
  const suggestionInputRef = useRef<HTMLTextAreaElement>(null);

  const handleSendSuggestion = async () => {
    const name = suggestionNameRef.current?.value;
    const text = suggestionInputRef.current?.value;

    if (!text?.trim()) {
      toast.error("Please enter a suggestion.");
      return;
    }

    setIsSending(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, text }),
      });
      
      if (!response.ok) throw new Error("Failed to send");
      
      setIsSuccess(true);
      toast.success("Suggestion received! Thank you.");
      
      if (suggestionNameRef.current) suggestionNameRef.current.value = "";
      if (suggestionInputRef.current) suggestionInputRef.current.value = "";
      
      setTimeout(() => {
        setIsSuccess(false);
        if (window.innerWidth <= 768) setIsSuggestionExpanded(false);
      }, 5000);
    } catch (error) {
      console.error("Suggestion Error:", error);
      toast.error("Failed to send suggestion. Please try again.");
    } finally {
      setIsSending(false);
    }
  };
  
  const allPackages = (packagesRes?.data as Record<string, any[]>) || {};
  
  // Helper to find a specific package or fallback
  const getPkg = (net: string, cap: string) => {
    const list = allPackages[net] || [];
    const found = list.find(p => String(p.capacity) === cap);
    return found || list[0] || { capacity: cap, price: "0.00", oldPrice: null };
  };

  const trendingBundles = [
    { ...getPkg('YELLO', '1'),   label: 'Hottest' },
    { ...getPkg('TELECEL', '10'),  label: 'Flash' },
    { ...getPkg('AT_PREMIUM', '2'), label: 'Giant' },
    { ...getPkg('YELLO', '5'),   label: 'Popular' },
    { ...getPkg('YELLO', '2'),   label: 'Steady' },
  ];

  return (
    <div className="flex flex-col gap-11 md:gap-16 pb-24">

      {/* ── Cinematic Hero ── */}
      <section className="relative min-h-[45vh] md:min-h-[65vh] flex flex-col justify-center overflow-hidden rounded-[20px] px-6 py-10 md:py-20 md:px-16 mt-4 isolate shadow-2xl">
        {/* Immersive Background Image */}
        <div className="absolute inset-0 z-[-3]">
          <img 
            src={HeroBanner} 
            alt="Data Infrastructure" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow mix-blend-overlay" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/60 to-primary/30" />
        </div>
        
        {/* Animated Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] animate-blob pointer-events-none z-[-1]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[100px] animate-blob pointer-events-none z-[-1]" style={{ animationDelay: '2s' }} />

        <div className="max-w-4xl space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
            <span className="block opacity-60">High-Speed</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary/80 animate-pulse-slow">
              Data Bundles.
            </span>
          </h1>

          <p className="text-base md:text-xl text-white/70 leading-relaxed max-w-2xl font-medium">
            The #1 fastest data shop in Ghana. Secure, automated fulfillment for all networks — delivered in under 1 second.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <Link 
              href="/buy"
              className="group relative w-full sm:w-auto h-14 px-8 rounded-xl bg-primary text-white font-black text-base items-center justify-center gap-3 overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_40px_-10px_hsl(var(--primary)_/_0.5)] active:scale-95 active:brightness-90 flex"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-20 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              Get Started Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/order"
              className="hidden sm:flex w-full sm:w-auto h-14 px-8 rounded-xl bg-white/5 border border-white/10 text-white font-black text-base items-center justify-center gap-3 hover:bg-white/10 hover:border-primary/40 transition-all duration-500 backdrop-blur-xl group hover:shadow-[0_10px_30px_hsl(var(--primary)_/_0.05)]"
            >
              <Search className="h-5 w-5 opacity-50 group-hover:scale-110 group-hover:rotate-12 group-hover:text-primary transition-all" />
              Track My Order
            </Link>
          </div>
        </div>

        {/* 24/7 Uptime Orb */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="animate-wander absolute" style={{ top: '15%', left: '65%' }}>
            <div className="relative h-44 w-44 scale-[0.6] md:scale-100">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/30 via-primary/20 to-fuchsia-600/30 border border-white/5" />
              {/* Middle ring */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500/25 via-primary/30 to-fuchsia-500/25 border border-white/10" />
              {/* Inner frosted circle */}
              <div className="absolute inset-9 rounded-full bg-slate-200/10 backdrop-blur-xl border border-white/20 shadow-inner flex flex-col items-center justify-center gap-0.5">
                <span className="text-3xl font-black text-white/90 tracking-tighter leading-none">24/7</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/50">Uptime</span>
              </div>
              {/* Orbiting dot 1 — cyan */}
              <div className="absolute h-4 w-4 rounded-full bg-cyan-400 animate-orbit" style={{ top: '-2px', left: 'calc(50% - 8px)' }} />
              {/* Orbiting dot 2 — magenta */}
              <div className="absolute h-3 w-3 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.6)] animate-orbit-reverse" style={{ bottom: '8px', right: '-2px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Real-Time Stats Bar ── */}
      <AnimatedSection>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="group relative flex flex-col md:flex-row items-center md:justify-between p-3 md:p-8 rounded-[20px] bg-slate-900/50 border border-white/5 hover:border-primary/40 hover:bg-slate-900/60 transition-all duration-500 overflow-hidden h-20 md:h-32 text-center md:text-left hover:shadow-[0_0_30px_hsl(var(--primary)_/_0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -inset-x-20 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-1000" />
              <div className="relative z-10 space-y-0.5 md:space-y-1 group-hover:translate-x-1 transition-transform duration-500">
                <p className="text-xl md:text-4xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">{value}</p>
                <p className="text-[7px] md:text-[10px] uppercase font-bold tracking-tight md:tracking-[0.2em] text-muted-foreground leading-none">{label}</p>
              </div>
              <div className="hidden md:flex relative z-10 h-12 w-12 rounded-[12px] bg-primary/10 items-center justify-center text-primary group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-inner group-hover:bg-primary/20">
                <Icon className="h-6 w-6 group-hover:animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ── Trending Section ── */}
      <AnimatedSection className="space-y-8">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Curated For You</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Trending Bundles</h2>
          </div>
          <Link href="/tracker" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
            See Live History
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex flex-nowrap overflow-x-auto pb-8 gap-3 md:gap-6 snap-x no-scrollbar">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[150px] md:min-w-[270px] h-[200px] rounded-[20px] bg-muted animate-pulse" />
            ))
          ) : error ? (
            <div className="w-full py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold">Failed to load bundles</p>
                <p className="text-sm text-muted-foreground">Please check your internet or refresh the page.</p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : (
            trendingBundles.map((btn: any, i) => (
              <div 
                key={i} 
                className="min-w-[150px] md:min-w-[270px] snap-start p-4 md:p-6 rounded-[20px] bg-card border border-border hover:border-primary/40 transition-all duration-500 group relative cursor-pointer hover:bg-muted/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] active:scale-95 active:brightness-90 overflow-hidden isolate"
                onClick={() => setLocation('/buy')}
              >
                {/* Card Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-[-1]" />
                
                <div className="absolute top-4 right-4 md:top-6 md:right-6 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-primary/20 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-primary/30 shadow-[0_0_15px_hsl(var(--primary)_/_0.2)]">
                  {btn.label}
                </div>
                <div className="mb-4 md:mb-8 text-left group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                  <NetworkLogo network={(btn.network || 'YELLO') as NetworkId} size={40} />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-5xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{btn.capacity}</span>
                    <span className="text-xs md:text-xl font-bold text-muted-foreground uppercase opacity-40">GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 opacity-50">Instant</span>
                      <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                        {btn.showOldPrice && btn.oldPrice && btn.oldPrice !== btn.price && (
                          <span className="text-[10px] md:text-xs font-bold text-muted-foreground/30 line-through">₵{btn.oldPrice}</span>
                        )}
                        <span className="text-base md:text-2xl font-black text-primary">₵{btn.price}</span>
                      </div>
                    </div>
                    <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_15px_hsl(var(--primary)_/_0.4)] transition-all shrink-0">
                      <ArrowRight className="h-3 w-3 md:h-5 md:w-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </AnimatedSection>

      {/* ── How It Works ── */}
      <AnimatedSection delay={60}>
        <h2 className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="relative flex items-start gap-4 p-5 rounded-[20px] bg-card border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-500 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/10">
                <Icon className="h-5 w-5 text-primary group-hover:animate-pulse" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors duration-500">Step {i + 1}</span>
                </div>
                <h3 className="font-bold text-sm tracking-tight">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ── Shop CTA Section ── */}
      <AnimatedSection className="py-8 md:py-20 text-center space-y-6 md:space-y-10 rounded-[20px] bg-slate-950 border border-primary/20 shadow-2xl overflow-hidden relative isolate">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2 md:space-y-4 px-4">
          <h2 className="text-2xl md:text-5xl font-black tracking-tight text-white">Ready for a refill?</h2>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-lg leading-relaxed font-medium">
            Join 12,000+ happy customers who get their data instantly with Falaa Deals.
          </p>
        </div>
        <Link 
          href="/buy"
          className="group relative inline-flex h-12 md:h-16 px-8 md:px-12 rounded-xl md:rounded-2xl bg-primary text-white font-black text-base md:text-xl items-center justify-center gap-2 md:gap-3 overflow-hidden transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_20px_40px_-10px_hsl(var(--primary)_/_0.5)] active:scale-95 active:brightness-90"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-20 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          Browse All Bundles
          <ArrowRight className="h-4 w-4 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
        </Link>
      </AnimatedSection>
      {/* ── Suggestion Box Section ── */}
      <AnimatedSection className="pt-10 pb-4">
        <div className={cn(
          "relative overflow-hidden rounded-[32px] border border-white/5 bg-card/20 backdrop-blur-3xl shadow-2xl group transition-all duration-500",
          isSuggestionExpanded ? "p-6 md:p-12" : "p-6 md:p-12"
        )}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-1000" />
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-16 items-center md:items-start relative z-10">
            {/* Header / Trigger */}
            <div 
              className="flex-1 cursor-pointer md:cursor-default w-full"
              onClick={() => setIsSuggestionExpanded(!isSuggestionExpanded)}
            >
              <div className="flex items-center gap-4 md:gap-0 md:block">
                <div className="shrink-0 h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10 text-primary md:mb-4 border border-white/5 shadow-inner flex">
                  <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                
                <h2 className="flex-1 text-lg md:text-4xl font-black tracking-tight text-white leading-tight text-left">
                  Help us <span className="text-primary">improve.</span>
                </h2>

                <div className="md:hidden">
                  {isSuggestionExpanded ? <ChevronUp className="h-5 w-5 text-white/20" /> : <ChevronDown className="h-5 w-5 text-white/20" />}
                </div>
              </div>

              <p className={cn(
                "text-white/40 font-medium text-xs md:text-base mt-2 md:mt-4 text-left transition-all duration-300",
                !isSuggestionExpanded ? "hidden md:block" : "block"
              )}>
                Have a feature request or feedback? We'd love to hear from you.
              </p>
            </div>

            {/* Collapsible Content */}
            <AnimatePresence>
              {(isSuggestionExpanded || window.innerWidth > 768) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="w-full md:w-[450px] space-y-4 overflow-hidden"
                >
                  {isSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-8 space-y-4 text-center"
                    >
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                        <Check className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-white">Message Sent!</h3>
                        <p className="text-white/40 text-sm font-medium">Thank you for your feedback.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="relative group/input pt-4 md:pt-0">
                        <div className="absolute left-4 top-[2.4rem] md:top-4 -translate-y-1/2 z-10 text-slate-500 group-focus-within/input:text-primary transition-colors">
                          <User size={16} />
                        </div>
                        <Input 
                          ref={suggestionNameRef}
                          placeholder="Your name (optional)"
                          className="h-12 rounded-2xl bg-black/40 border-white/5 focus:border-primary/50 focus:ring-primary/20 text-sm pl-11 placeholder:text-slate-600 transition-all shadow-inner mb-4"
                        />
                        <Textarea 
                          ref={suggestionInputRef}
                          placeholder="Your suggestion..."
                          className="min-h-[100px] rounded-2xl bg-black/40 border-white/5 focus:border-primary/50 focus:ring-primary/20 text-sm md:text-base p-4 placeholder:text-slate-600 transition-all resize-none shadow-inner"
                        />
                      </div>
                      <Button 
                        onClick={handleSendSuggestion}
                        disabled={isSending}
                        className="h-12 md:h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-sm md:text-base group active:scale-95 transition-all w-full"
                      >
                        {isSending ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Submit Feedback
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
