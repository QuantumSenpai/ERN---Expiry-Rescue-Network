import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  Clock,
  Boxes,
  Database,
  ArrowRight,
  Info,
} from "lucide-react";

interface InventoryHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterSelect?: (filter: "all" | "at-risk" | "expiry" | "non-expiry" | "low-stock" | "overstock") => void;
}

export default function InventoryHealthModal({
  isOpen,
  onClose,
  onFilterSelect,
}: InventoryHealthModalProps) {
  if (!isOpen) return null;

  const handleSelect = (filter: "all" | "at-risk" | "expiry" | "non-expiry" | "low-stock" | "overstock") => {
    onFilterSelect?.(filter);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2F4156]/60 backdrop-blur-xs"
        />

        <div className="min-h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/80 flex items-start justify-between bg-secondary/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
                    HEALTH SCORE: 86 / 100
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Deterministic Index</span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mt-1">
                  Inventory Health Analysis
                </h2>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Calculated from expiry risk exposure, stock availability, and data completeness.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Overall Banner */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-bold uppercase text-muted-foreground">Overall Condition</p>
                  <p className="text-lg font-bold font-sans text-foreground">Good Overall Condition</p>
                  <p className="text-xs text-muted-foreground font-mono">21 items currently require operational attention</p>
                </div>
                <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold font-mono text-emerald-400">86</span>
                </div>
              </div>

              {/* Breakdown Factors (Clickable) */}
              <div className="space-y-2.5">
                <p className="text-xs font-mono font-bold uppercase text-muted-foreground">
                  Core Factors Breakdown (Click to filter inventory):
                </p>

                {/* Factor 1: Expiry Exposure */}
                <div
                  onClick={() => handleSelect("at-risk")}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 hover:border-primary/50 hover:bg-secondary/60 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <Clock className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        Expiry Exposure
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        2 Critical & 3 High-risk expiry batches identified
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Good (82%)
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Factor 2: Stock Availability */}
                <div
                  onClick={() => handleSelect("low-stock")}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 hover:border-primary/50 hover:bg-secondary/60 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Boxes className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        Stock Availability & Reorder
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        98.2% in-stock rate · 14 products below reorder threshold
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Good (88%)
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Factor 3: Overstock */}
                <div
                  onClick={() => handleSelect("overstock")}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 hover:border-primary/50 hover:bg-secondary/60 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <AlertTriangle className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        Overstock Level
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        6 product lines exceeding maximum warehouse capacity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                      Moderate (76%)
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Factor 4: Data Completeness */}
                <div
                  onClick={() => handleSelect("all")}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 hover:border-primary/50 hover:bg-secondary/60 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Database className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        Inventory Data Completeness
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        94% required catalog attributes mapped (SKU, supplier, batch)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Excellent (94%)
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>

              {/* Explanatory Note */}
              <div className="p-3 rounded-xl bg-secondary/20 border border-border/60 flex items-start gap-2.5 text-[11px] text-muted-foreground font-sans">
                <Info className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  The Inventory Health score is a deterministic composite calculated directly from operational catalog signals and threshold evaluations.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                Close Analysis
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
