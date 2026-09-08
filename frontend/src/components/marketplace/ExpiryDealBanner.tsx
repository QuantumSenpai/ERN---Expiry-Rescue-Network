import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface ExpiryDealBannerProps {
  onExplore?: () => void;
}

export default function ExpiryDealBanner({ onExplore }: ExpiryDealBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15,
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
    <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-background border border-border relative overflow-hidden shadow-none flex flex-col justify-between h-full text-foreground group font-sans">
      {/* Top Copy */}
      <div className="space-y-2 z-10 max-w-[300px]">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10.5px] font-mono font-bold uppercase">
          <span>DAILY RESCUE BATCHES</span>
        </div>
        <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-[-0.02em] leading-tight">
          Save before expiry.
        </h3>
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          Near-expiry grocery batches refreshed every morning. Claim your favorites before inventory expires.
        </p>
      </div>

      {/* Countdown Timer Strip */}
      <div className="flex items-center gap-2 py-3 z-10 font-mono text-xs">
        <div className="px-3 py-1.5 rounded-xl bg-card border border-border text-center">
          <span className="font-bold text-foreground text-sm block">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="text-[9px] text-muted-foreground uppercase">HRS</span>
        </div>
        <span className="text-muted-foreground font-bold">:</span>
        <div className="px-3 py-1.5 rounded-xl bg-card border border-border text-center">
          <span className="font-bold text-foreground text-sm block">{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span className="text-[9px] text-muted-foreground uppercase">MIN</span>
        </div>
        <span className="text-muted-foreground font-bold">:</span>
        <div className="px-3 py-1.5 rounded-xl bg-card border border-border text-center">
          <span className="font-bold text-foreground text-sm block">{String(timeLeft.seconds).padStart(2, "0")}</span>
          <span className="text-[9px] text-muted-foreground uppercase">SEC</span>
        </div>
      </div>

      {/* Center & Actions */}
      <div className="pt-2 flex flex-wrap items-center gap-3 z-10">
        <button
          type="button"
          onClick={onExplore}
          className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs font-mono uppercase cursor-pointer flex items-center gap-1.5 transition-all duration-150 active:scale-95 group/btn shadow-none"
        >
          <span>SHOP RESCUE DEALS</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </button>
      </div>

      {/* Right Graphic */}
      <div className="absolute -bottom-2 -right-2 w-36 sm:w-44 h-36 sm:h-44 pointer-events-none opacity-80 flex items-center justify-center">
        <img
          src="/assets/marketplace/hero_basket.jpg"
          alt="Expiry Deals Graphic"
          className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
          }}
        />
      </div>
    </div>
  );
}
