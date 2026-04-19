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
      <FadeSection className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-violet-700 text-primary-foreground px-6 py-10">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            About us
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Falaa Deals</h1>
          <p className="text-white/80 leading-relaxed">
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
                className="flex items-start gap-4 bg-card border border-border rounded-2xl p-5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className={cn("flex items-center justify-center w-10 h-10 rounded-xl shrink-0", color)}>
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-bold text-sm mb-1">{title}</p>
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
