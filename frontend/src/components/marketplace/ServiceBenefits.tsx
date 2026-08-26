import { motion } from "framer-motion";
import { Truck, Headphones, RotateCcw, ShieldCheck } from "lucide-react";

const benefitsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const benefitItemVariants = {
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

export default function ServiceBenefits() {
  const benefits = [
    {
      icon: Truck,
      title: "FREE RAPID DELIVERY",
      subtitle: "On rescue orders above ₹500",
    },
    {
      icon: Headphones,
      title: "24/7 SUPPORT DESK",
      subtitle: "Live operator assistance",
    },
    {
      icon: RotateCcw,
      title: "FRESHNESS GUARANTEE",
      subtitle: "Full refund if condition fails",
    },
    {
      icon: ShieldCheck,
      title: "VERIFIED CHECKOUT",
      subtitle: "100% encrypted and audited",
    },
  ];

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border bg-card text-foreground font-body">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          variants={benefitsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
        >
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                variants={benefitItemVariants}
                className="p-4 rounded-2xl bg-background border border-border flex items-center gap-3.5 shadow-none"
              >
                <div className="size-10 rounded-full bg-card flex items-center justify-center text-foreground shrink-0">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 font-mono">
                  <h4 className="text-xs uppercase font-medium text-foreground tracking-tight truncate">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-body truncate">
                    {b.subtitle}
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
