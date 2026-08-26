import { motion } from "framer-motion";
import { ArrowRight, Tag, Clock, ShieldCheck, Wallet, Leaf, Users } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

interface HeroSectionProps {
  onExploreProducts: () => void;
  onExploreDeals: () => void;
}

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const textItemVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

const badgeEntranceVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 220,
      damping: 24,
      mass: 0.8,
      delay,
    },
  }),
};

export default function HeroSection({
  onExploreProducts,
  onExploreDeals,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative pt-6 pb-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-background text-foreground overflow-hidden font-body"
    >
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column */}
        <motion.div
          variants={textContainerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-4 space-y-4 relative z-10"
        >
          <motion.div
            variants={textItemVariants}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase"
          >
            <span>Good morning, Alex 👋</span>
          </motion.div>

          <motion.h1
            variants={textItemVariants}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-[350] text-foreground tracking-[-0.025em] leading-[1.08]"
          >
            Shop smart.<br />
            Save more.<br />
            Rescue value.
          </motion.h1>

          <motion.p
            variants={textItemVariants}
            className="text-xs sm:text-sm text-muted-foreground font-body max-w-sm leading-relaxed"
          >
            Choose from fresh catalog items, smart markdown lots, and verified clearance deals before they go to waste.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            variants={textItemVariants}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <button
              type="button"
              onClick={onExploreProducts}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-xs uppercase font-mono hover:bg-[#567C8D] transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-none group/heroBtn"
            >
              <span>Shop Catalog</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/heroBtn:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onExploreDeals}
              className="px-6 py-3 rounded-full bg-card text-foreground font-medium text-xs uppercase font-mono hover:bg-[#c4c7c4]/40 transition-all duration-150 active:scale-95 cursor-pointer shadow-none"
            >
              <span>Deals Radar</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Center / Right Showcase: Featured Hero Visual */}
        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-card border border-transparent flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-medium uppercase">
                SPOTLIGHT DEAL
              </span>
              <span className="text-xs font-mono text-muted-foreground">Batch #DL-904</span>
            </div>

            <div>
              <h3 className="font-display text-2xl font-[350] text-foreground leading-tight">
                Organic Dairy & Farm Produce
              </h3>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Fresh lot with 4 days shelf-life remaining. 40% automatic clearance pricing.
              </p>
            </div>

            <div className="pt-2 border-t border-[#c4c7c4]/40 flex items-center justify-between font-mono text-xs">
              <span className="font-medium text-foreground text-base">₹42 / 1L</span>
              <span className="text-muted-foreground line-through">₹70</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl surface-forest border border-transparent flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-snow-white/15 text-snow-white font-mono text-[10px] font-medium uppercase">
                IMPACT SUMMARY
              </span>
              <span className="text-xs font-mono text-snow-white/70">Enterprise ESG</span>
            </div>

            <div>
              <h3 className="font-display text-2xl font-[350] text-snow-white leading-tight">
                Zero Waste Certified
              </h3>
              <p className="text-xs text-snow-white/70 font-body mt-1">
                Over 12,000 perishable units safely rescued from disposal this cycle.
              </p>
            </div>

            <div className="pt-2 border-t border-snow-white/20 flex items-center justify-between font-mono text-xs">
              <span className="text-snow-white">94.8% Rescue Rate</span>
              <span className="text-snow-white/70">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
