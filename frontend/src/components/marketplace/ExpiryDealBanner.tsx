import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ExpiryDealBannerProps {
  onExplore?: () => void;
}

export default function ExpiryDealBanner({ onExplore }: ExpiryDealBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="p-7 rounded-2xl sm:rounded-[32px] bg-background border border-border relative overflow-hidden shadow-none flex flex-col justify-between h-full text-foreground group font-body"
    >
      {/* Top Copy */}
      <div className="space-y-2 z-10 max-w-[280px]">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-medium uppercase">
          <span>TIMED RESCUE</span>
        </div>
        <h3 className="font-display font-[350] text-2xl sm:text-3xl text-foreground tracking-[-0.02em] leading-tight">
          Save before expiry.
        </h3>
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          High-quality products at reduced rates. Verified shelf life.
        </p>
      </div>

      {/* Countdown Timer Strip */}
      <div className="flex items-center gap-2 py-3 z-10 font-mono text-xs">
        <div className="px-3 py-1.5 rounded-xl bg-card text-center">
          <span className="font-medium text-foreground text-sm block">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="text-[9px] text-muted-foreground uppercase">HRS</span>
        </div>
        <span className="text-muted-foreground font-medium">:</span>
        <div className="px-3 py-1.5 rounded-xl bg-card text-center">
          <span className="font-medium text-foreground text-sm block">{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span className="text-[9px] text-muted-foreground uppercase">MIN</span>
        </div>
        <span className="text-muted-foreground font-medium">:</span>
        <div className="px-3 py-1.5 rounded-xl bg-card text-center">
          <span className="font-medium text-foreground text-sm block">{String(timeLeft.seconds).padStart(2, "0")}</span>
          <span className="text-[9px] text-muted-foreground uppercase">SEC</span>
        </div>
      </div>

      {/* Center & Actions */}
      <div className="pt-2 flex flex-wrap items-center gap-3 z-10">
        <button
          type="button"
          onClick={onExplore}
          className="px-5 py-2.5 rounded-full bg-primary hover:opacity-90 text-primary-foreground font-medium text-xs font-mono uppercase cursor-pointer flex items-center gap-1.5 transition-all duration-150 active:scale-95 group/btn shadow-none"
        >
          <span>SHOP NOW</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </button>
      </div>

      {/* Right Graphic */}
      <div className="absolute -bottom-2 -right-2 w-36 sm:w-44 h-36 sm:h-44 pointer-events-none opacity-90 flex items-center justify-center">
        <img
          src="/assets/marketplace/daily_discount.jpg"
          alt="Expiry Deals Graphic"
          className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    </motion.div>
  );
}
