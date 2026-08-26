import { useState } from "react";
import {
  FaBoxesStacked,
  FaWaveSquare,
  FaShieldHalved,
  FaArrowRight,
} from "react-icons/fa6";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

interface StepItem {
  step: string;
  title: string;
  description: string;
  icon: typeof FaBoxesStacked;
  badge: string;
  actionLabel: string;
  href?: string;
}

const steps: StepItem[] = [
  {
    step: "01",
    title: "Add Inventory",
    description:
      "Add products, quantities, locations, batches, and relevant expiry data. ERN supports both expiry-tracked and durable catalog items.",
    icon: FaBoxesStacked,
    badge: "INVENTORY ENTRY",
    actionLabel: "Unified Catalog Ingestion",
    href: "/retailer/add-product",
  },
  {
    step: "02",
    title: "Monitor & Detect",
    description:
      "ERN continuously monitors batches, flagging products approaching critical expiry stages with predictive staging.",
    icon: FaWaveSquare,
    badge: "INTELLIGENT MONITORING",
    actionLabel: "Automated Risk Staging",
    href: "/retailer/inventory",
  },
  {
    step: "03",
    title: "Take Action",
    description:
      "Review prioritized inventory and trigger markdown campaigns or rescue liquidation before stock converts to waste.",
    icon: FaShieldHalved,
    badge: "OPERATIONAL ACTION",
    actionLabel: "Structured Recovery Workflows",
    href: "/retailer/clearance",
  },
];

export default function HowItWorks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 px-6 sm:px-10 max-w-6xl mx-auto overflow-visible scroll-mt-20"
    >
      {/* Section Header */}
      <ScrollReveal direction="up">
        <div className="text-center max-w-xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary text-foreground text-xs font-mono mb-3 font-semibold uppercase shadow-none border border-[#2F4156]/15">
            HOW ERN WORKS
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground font-medium tracking-[-0.02em] leading-[1.15] font-display">
            <span className="font-sans block">From inventory</span>
            <span className="font-script text-4xl sm:text-5xl md:text-6xl text-foreground dark:text-accent block font-bold mt-1">
              to automated action.
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base font-sans font-normal leading-relaxed">
            Manage your full inventory in one place, with intelligent expiry protection applied where it matters.
          </p>
        </div>
      </ScrollReveal>

      {/* 3-Column Editorial Grid */}
      <div
        className="grid md:grid-cols-3 gap-6 sm:gap-8 relative z-10"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isHovered = hoveredIndex === idx;

          return (
            <ScrollReveal
              key={item.step}
              direction="up"
              delay={idx * 80}
              className="h-full"
            >
              <div
                onMouseEnter={() => setHoveredIndex(idx)}
                onFocus={() => setHoveredIndex(idx)}
                onBlur={() => setHoveredIndex(null)}
                tabIndex={0}
                className={cn(
                  "relative group flex flex-col justify-between h-full bg-card border border-[#2F4156]/15 rounded-2xl p-6 sm:p-8 outline-none select-none transition-all duration-200 ease-out shadow-none hover:-translate-y-1 hover:border-primary/35 dark:hover:border-[#2F4156]/30 ern-card-glow",
                  isHovered && "border-[#2F4156]/35 dark:border-[#2F4156]/30"
                )}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#2F4156]/12 dark:border-[#F0E9D3]/10">
                    <span className="font-mono text-xs text-muted-foreground font-bold tracking-wider">
                      STEP {item.step}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-mono text-[10px] uppercase font-bold">
                      {item.badge}
                    </span>
                  </div>

                  <div className="size-11 rounded-full bg-secondary flex items-center justify-center text-foreground dark:text-accent my-6 transition-transform duration-200 group-hover:scale-105">
                    <Icon className="size-5" />
                  </div>

                  <h3 className="font-display text-xl font-medium text-foreground tracking-[-0.015em]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#2F4156]/12 dark:border-[#F0E9D3]/10 mt-6">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-foreground dark:text-accent hover:underline"
                    >
                      <span>{item.actionLabel}</span>
                      <FaArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </a>
                  ) : (
                    <span className="text-xs font-mono text-muted-foreground">
                      {item.actionLabel}
                    </span>
                  )}
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
