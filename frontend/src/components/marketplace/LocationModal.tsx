import { motion } from "framer-motion";
import { MapPin, X, Check } from "lucide-react";
import { LOCATIONS_LIST } from "@/data/marketplaceData";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (loc: string) => void;
}

export default function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}: LocationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs transition-opacity"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
      >
        <div className="flex justify-between items-start pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Delivery Location
              </h3>
              <p className="text-xs text-muted-foreground font-sans">
                Select your preferred branch or delivery warehouse:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-105 active:scale-95"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2">
          {LOCATIONS_LIST.map((loc) => {
            const isSelected = currentLocation === loc;

            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all duration-150 cursor-pointer ern-btn-tactile hover:-translate-y-0.5 active:translate-y-0 active:scale-98 ${
                  isSelected
                    ? "bg-primary/10 border-primary text-primary font-bold shadow-xs ring-1 ring-primary/40"
                    : "bg-secondary/40 border-border hover:bg-secondary text-foreground"
                }`}
              >
                <span>{loc}</span>
                {isSelected && <Check className="size-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
