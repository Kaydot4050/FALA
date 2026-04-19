import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import {
  Building2, Mail, Phone, CalendarDays, MapPin, Zap,
  ShieldCheck, Clock, Target, CheckCircle2, MessageCircle, PhoneCall,
} from "lucide-react";

function FadeSection({
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
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

const INFO_ROWS = [
  { icon: Building2, label: "Business Name", value: "Falaa Deals" },
  { icon: Mail,      label: "Email",         value: "falaadeal@gmail.com" },
  { icon: Phone,     label: "Phone",         value: "0593829640" },
  { icon: CalendarDays, label: "Established", value: "January 15, 2026" },
  { icon: Clock,     label: "In Business",   value: "Active since 2026" },
  { icon: MapPin,    label: "Location",      value: "Kasoa, Central Region" },
];

const WHY_CHOOSE = [
  {
    icon: Zap,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    title: "Fast Delivery",
    desc: "Get your data bundles delivered within 10–60 minutes on any network.",
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    title: "Secure Payments",
    desc: "100% secure payment processing with multiple options. Your money is safe.",
  },
  {
    icon: Clock,
    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    title: "24 / 7 Support",
    desc: "Always here to help via WhatsApp or phone whenever you need us.",
  },
];

const MISSION_POINTS = [
  "Quality service with fast delivery",
  "Affordable pricing for all budgets",
  "Dedicated customer support",
  "All major networks supported",
];

export default function About() {
  return (
    <div className="flex flex-col gap-8 pb-28 md:pb-12 max-w-2xl mx-auto w-full">

      {/* ── Hero ── */}
      <FadeSection className="relative overflow-hidden rounded-3xl bg-slate-950 text-white px-8 py-14 shadow-2xl isolate border border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-slate-900 to-[#1e1b4b] z-[-2]" />
        
        <div className="absolute -top-1/2 -left-1/4 w-[80%] h-[150%] rounded-full bg-emerald-600/10 blur-[100px] mix-blend-screen animate-blob pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-indigo-600/20 blur-[100px] mix-blend-screen animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,black,transparent)] z-[-1]" />

        <div className="relative z-10 text-center max-w-xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <Building2 className="w-4 h-4 text-emerald-400" />
            About us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-lg">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-indigo-300 animate-pulse-slow">Story</span>
          </h1>
          <p className="text-indigo-100/80 leading-relaxed font-medium text-lg">
            Providing affordable, reliable data bundles to everyone in Ghana — making internet connectivity accessible for work, education, and entertainment.
          </p>
        </div>
      </FadeSection>

      {/* ── Store information ── */}
      <FadeSection delay={80}>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-base">Store Information</h2>
          </div>
          <ul className="divide-y divide-border">
            {INFO_ROWS.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-4 px-5 py-3.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </span>
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </FadeSection>

      {/* ── Why Choose Us ── */}
      <FadeSection delay={120}>
        <div className="space-y-4">
          <h2 className="font-bold text-lg">Why Choose Us?</h2>
          <div className="flex flex-col gap-3">
            {WHY_CHOOSE.map(({ icon: Icon, color, title, desc }, i) => (
              <div
                key={title}
                className="group relative flex items-start gap-4 bg-card border border-border rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                <span className={cn("flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110", color)}>
                  <Icon className="w-5 h-5" />
                </span>
                <div className="relative z-10">
                  <p className="font-bold text-base mb-1 group-hover:text-primary transition-colors">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ── Mission ── */}
      <FadeSection delay={160}>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </span>
            <h2 className="font-bold text-base">Our Mission</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To provide affordable and reliable data bundles to everyone, making internet connectivity accessible for work, education, and entertainment.
          </p>
          <ul className="flex flex-col gap-2">
            {MISSION_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </FadeSection>

      {/* ── Contact CTA ── */}
      <FadeSection delay={200}>
        <div className="bg-gradient-to-br from-muted/80 to-muted rounded-2xl border border-border p-6 text-center space-y-4">
          <h2 className="font-bold text-lg">Have Questions?</h2>
          <p className="text-sm text-muted-foreground">We&apos;re here to contact us anytime.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/233593829640"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
            <a
              href="tel:+233593829640"
              className="flex items-center justify-center gap-2 bg-card hover:bg-muted border border-border font-bold text-sm px-5 py-3 rounded-xl transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Call Us
            </a>
          </div>
        </div>
      </FadeSection>

    </div>
  );
}
