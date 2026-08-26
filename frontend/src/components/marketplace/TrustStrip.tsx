import { motion } from "framer-motion";
import { ShieldCheck, Tag, Clock, Lock, RefreshCw } from "lucide-react";

const trustContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const trustItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export default function TrustStrip() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: "QUALITY CHECKED",
      subtitle: "Verified lot telemetry",
    },
    {
      icon: Tag,
      title: "SMART SAVINGS",
      subtitle: "Dynamic markdown curve",
    },
    {
      icon: Clock,
      title: "EXPIRY MONITOR",
      subtitle: "Full shelf-life visibility",
    },
    {
      icon: Lock,
      title: "SECURE PAYMENTS",
      subtitle: "256-bit encrypted checkout",
    },
    {
      icon: RefreshCw,
      title: "ZERO LOSS POLICY",
      subtitle: "Guaranteed satisfaction",
    },
  ];

  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border bg-card text-foreground font-body">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          variants={trustContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={trustItemVariants}
                className="flex items-center gap-3 p-2 rounded-xl"
              >
                <div className="size-9 rounded-full bg-background flex items-center justify-center text-foreground shrink-0">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 font-mono">
                  <h4 className="text-xs uppercase font-medium text-foreground tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-body truncate">
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
