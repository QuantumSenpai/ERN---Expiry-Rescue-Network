import { motion } from "framer-motion";
import { Leaf, Wallet, RefreshCcw } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

const impactContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const impactCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export default function RescueImpact() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-background text-foreground relative overflow-hidden font-body">
      <div className="max-w-[1440px] mx-auto space-y-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10.5px] font-mono font-medium uppercase mb-1">
              <span>METRICS</span>
            </div>
            <h3 className="font-display font-[350] text-2xl text-foreground tracking-[-0.015em]">
              Rescue impact
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Measurable waste reduction across our verified retail network.
            </p>
          </div>
        </div>

        {/* 3 Large Stat Cards */}
        <motion.div
          variants={impactContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {/* Stat 1 */}
          <motion.div
            variants={impactCardVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            className="p-6 rounded-2xl sm:rounded-[32px] bg-background border border-border flex items-center gap-4 shadow-none hover:border-primary transition-all duration-200"
          >
            <div className="size-12 rounded-full bg-card flex items-center justify-center text-foreground shrink-0">
              <Leaf className="size-6" />
            </div>
            <div>
              <p className="text-3xl font-[350] font-display text-foreground leading-none">
                <AnimatedNumber value={12480} />+
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1 uppercase">
                Meals / Units Rescued
              </p>
            </div>
          </motion.div>

          {/* Stat 2 */}
          <motion.div
            variants={impactCardVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            className="p-6 rounded-2xl sm:rounded-[32px] bg-background border border-border flex items-center gap-4 shadow-none hover:border-primary transition-all duration-200"
          >
            <div className="size-12 rounded-full bg-card flex items-center justify-center text-foreground shrink-0">
              <Wallet className="size-6" />
            </div>
            <div>
              <p className="text-3xl font-[350] font-display text-foreground leading-none">
                ₹<AnimatedNumber value={840000} />
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1 uppercase">
                Consumer Savings Realized
              </p>
            </div>
          </motion.div>

          {/* Stat 3 */}
          <motion.div
            variants={impactCardVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            className="p-6 rounded-2xl sm:rounded-[32px] bg-background border border-border flex items-center gap-4 shadow-none hover:border-primary transition-all duration-200"
          >
            <div className="size-12 rounded-full bg-card flex items-center justify-center text-foreground shrink-0">
              <RefreshCcw className="size-6" />
            </div>
            <div>
              <p className="text-3xl font-[350] font-display text-foreground leading-none">
                <AnimatedNumber value={94.8} decimals={1} />%
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1 uppercase">
                Inventory Liquidation Rate
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
