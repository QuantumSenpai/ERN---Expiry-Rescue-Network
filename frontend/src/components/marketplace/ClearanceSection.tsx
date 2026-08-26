import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ClearanceSectionProps {
  onExplore?: () => void;
}

export default function ClearanceSection({ onExplore }: ClearanceSectionProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="p-7 rounded-2xl sm:rounded-[32px] border border-border relative overflow-hidden shadow-none flex flex-col justify-between h-full bg-card text-foreground group font-sans"
    >
      {/* Top Copy */}
      <div className="space-y-2 z-10 max-w-[280px]">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase">
          <span>UP TO 70% OFF</span>
        </div>
        <h3 className="font-sans font-bold text-2xl sm:text-3xl text-foreground tracking-[-0.02em] leading-tight">
          Clearance rescue lots.
        </h3>
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          Verified urgent rescue stock with highest tier discounts.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-5 z-10">
        <button
          type="button"
          onClick={onExplore}
          className="px-5 py-2.5 rounded-full bg-[#2F4156] hover:bg-[#567C8D] text-primary-foreground dark:bg-accent dark:hover:bg-[#567c8d] font-bold text-xs font-mono uppercase cursor-pointer flex items-center gap-1.5 transition-all duration-150 active:scale-95 group/btn shadow-none"
        >
          <span>SHOP CLEARANCE</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </button>
      </div>

      {/* Right Graphic */}
      <div className="absolute -bottom-2 -right-2 w-36 sm:w-44 h-36 sm:h-44 pointer-events-none opacity-90 flex items-center justify-center">
        <img
          src="/assets/marketplace/clearance_discount.jpg"
          alt="Clearance Deals Graphic"
          className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    </motion.div>
  );
}

