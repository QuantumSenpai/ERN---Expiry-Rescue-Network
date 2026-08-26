import AnimatedNumber from "@/components/AnimatedNumber";
import ScrollReveal from "@/components/ScrollReveal";
import { Boxes, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

const STATS = [
  {
    icon: Boxes,
    value: 12480,
    label: "TOTAL INVENTORY",
    description: "Products currently managed across bays",
  },
  {
    icon: Clock,
    value: 8240,
    label: "EXPIRY-TRACKED",
    description: "Perishables monitored for shelf life",
  },
  {
    icon: AlertTriangle,
    value: 186,
    label: "AT-RISK INVENTORY",
    description: "Critical lots requiring rescue clearance",
  },
  {
    icon: ShieldCheck,
    value: 4240,
    label: "NON-EXPIRY INVENTORY",
    description: "General goods with cycle-count audit",
  },
];

export default function StatsBand() {
  return (
    <section id="impact" className="py-20 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto relative scroll-mt-20">
      <ScrollReveal direction="up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary text-foreground text-xs font-mono font-semibold mb-3 uppercase shadow-none border border-[#2F4156]/15">
            LIVE TELEMETRY
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-[1.15] tracking-[-0.02em] font-display">
            <span className="font-sans block">Inventory intelligence,</span>
            <span className="font-script text-4xl sm:text-5xl md:text-6xl text-foreground dark:text-accent block -mt-1 font-bold">
              in real time.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 font-sans font-normal max-w-2xl mx-auto leading-relaxed">
            A unified view of inventory volume, perishable exposure, and algorithmic clearance recovery.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <ScrollReveal key={stat.label} direction="up" delay={index * 80} className="h-full">
              <div
                className={`bg-card border border-[#2F4156]/15 rounded-2xl p-6 h-full flex flex-col justify-between group transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/35 dark:hover:border-[#2F4156]/30 shadow-none ${
                  stat.label === "AT-RISK INVENTORY" ? "ern-card-glow" : "ern-card-glow"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase font-bold tracking-wider">
                      {stat.label}
                    </span>
                    <div className="size-9 rounded-full bg-secondary text-foreground dark:text-accent flex items-center justify-center">
                      <Icon className="size-4" />
                    </div>
                  </div>

                  <p className="text-4xl sm:text-5xl font-medium font-display text-foreground tracking-tight">
                    <AnimatedNumber value={stat.value} duration={900} />
                  </p>
                </div>

                <p className="text-xs text-muted-foreground font-sans mt-4 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
