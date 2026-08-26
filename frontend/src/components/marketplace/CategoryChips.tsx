import { motion } from "framer-motion";
import { SEARCH_CHIPS } from "@/data/marketplaceData";

interface CategoryChipsProps {
  activeChip: string | null;
  onSelectChip: (chip: string | null) => void;
}

const chipsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const chipItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export default function CategoryChips({
  activeChip,
  onSelectChip,
}: CategoryChipsProps) {
  return (
    <div className="space-y-3 flex flex-col justify-between h-full text-foreground font-body">
      <div>
        <h4 className="font-display font-[350] text-xs sm:text-sm text-foreground uppercase tracking-tight">
          POPULAR ESSENTIALS
        </h4>
        <p className="text-[11px] text-muted-foreground font-body mt-0.5">
          Quickly filter inventory categories
        </p>
      </div>

      {/* 2-Column Grid of Pills */}
      <motion.div
        variants={chipsContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-2 gap-2 flex-1"
      >
        {SEARCH_CHIPS.map((chip) => {
          const isSelected = activeChip === chip.label;

          return (
            <motion.button
              key={chip.label}
              variants={chipItemVariants}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectChip(isSelected ? null : chip.label)}
              className={`p-2.5 rounded-full flex items-center justify-between gap-1.5 transition-all duration-150 cursor-pointer shadow-none ${
                isSelected
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-card hover:bg-[#c4c7c4]/40 text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0">{chip.icon}</span>
                <span className="text-xs font-mono truncate">{chip.label}</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
