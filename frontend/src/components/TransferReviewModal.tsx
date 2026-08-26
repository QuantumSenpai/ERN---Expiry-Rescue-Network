import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Truck,
  ArrowRight,
  Boxes,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

interface TransferReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTransfer?: (transferData: { product: string; source: string; destination: string; qty: number }) => void;
}

export default function TransferReviewModal({
  isOpen,
  onClose,
  onConfirmTransfer,
}: TransferReviewModalProps) {
  const [transferQty, setTransferQty] = useState(50);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onConfirmTransfer?.({
        product: "Amul Taaza Whole Milk 1L",
        source: "Warehouse",
        destination: "Store A",
        qty: transferQty,
      });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
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
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] font-mono font-bold">
                    TRANSFER INTELLIGENCE
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Stock Balancing</span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mt-1">
                  Multi-Location Transfer Review
                </h2>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Balance localized stock depletion and prevent avoidable inventory expiry.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Product Info */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-bold text-primary">MILK-001 • Batch MILK-402</p>
                  <h3 className="text-base font-bold font-sans text-foreground">Amul Taaza Whole Milk 1L</h3>
                  <p className="text-xs text-muted-foreground font-sans">Expiry in 2 days · High demand location</p>
                </div>
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Boxes className="size-5" />
                </div>
              </div>

              {/* Origin vs Destination Flow */}
              <div className="grid grid-cols-2 gap-3 items-center relative">
                {/* Source */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 space-y-1">
                  <span className="text-[10.5px] font-mono uppercase text-muted-foreground font-bold flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" />
                    Source Facility
                  </span>
                  <p className="text-sm font-bold text-foreground">Warehouse</p>
                  <p className="text-xs font-mono text-emerald-400 font-semibold">120 units in stock</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Excess / Buffer stock</p>
                </div>

                {/* Destination */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-rose-500/30 space-y-1">
                  <span className="text-[10.5px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1">
                    <MapPin className="size-3 text-rose-500" />
                    Target Location
                  </span>
                  <p className="text-sm font-bold text-foreground">Store A</p>
                  <p className="text-xs font-mono text-rose-500 font-semibold">5 units remaining</p>
                  <p className="text-[10px] text-rose-400 font-mono">Stockout risk imminent</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="p-4 rounded-2xl bg-secondary/20 border border-border/80 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-foreground">Suggested Transfer Quantity:</span>
                  <span className="text-primary font-bold">{transferQty} units</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={5}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Min: 10 units</span>
                  <span>Recommended: 50 units</span>
                  <span>Max: 80 units</span>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2.5 text-xs text-foreground font-sans">
                <Truck className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Estimated Arrival: <strong>Today, 4:00 PM (Local Fleet Route #4)</strong>. No purchase order required.
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-border bg-secondary/20 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground font-mono text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={isSuccess}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-300" />
                    <span>Transfer Queued!</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Transfer Request</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
