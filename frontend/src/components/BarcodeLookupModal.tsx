import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Barcode,
  CheckCircle2,
  ArrowRight,
  Boxes,
} from "lucide-react";
import { useState } from "react";
import type { InventoryItem } from "@/types/inventory";

interface BarcodeLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (item: InventoryItem) => void;
  inventoryItems: (InventoryItem & { location: string })[];
}

export default function BarcodeLookupModal({
  isOpen,
  onClose,
  onSelectProduct,
  inventoryItems,
}: BarcodeLookupModalProps) {
  const [code, setCode] = useState("");
  const [matchedItem, setMatchedItem] = useState<(InventoryItem & { location: string }) | null>(null);

  if (!isOpen) return null;

  const handleLookup = (inputCode: string) => {
    setCode(inputCode);
    if (!inputCode.trim()) {
      setMatchedItem(null);
      return;
    }
    const found = inventoryItems.find(
      (item) =>
        item.barcode.toLowerCase().includes(inputCode.toLowerCase()) ||
        item.sku.toLowerCase().includes(inputCode.toLowerCase())
    );
    setMatchedItem(found || null);
  };

  const handleSelect = (item: InventoryItem) => {
    onSelectProduct?.(item);
    onClose();
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
            className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/80 flex items-start justify-between bg-secondary/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] font-mono font-bold">
                    PRODUCT IDENTIFIER
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">EAN / UPC / SKU</span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mt-1">
                  Barcode Scanner & Lookup
                </h2>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Scan via hardware reader or enter an EAN-13 barcode manually.
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
            <div className="p-6 space-y-4">
              {/* Manual Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-muted-foreground">
                  Barcode / SKU Input:
                </label>
                <div className="relative flex items-center">
                  <Barcode className="absolute left-3.5 size-4 text-primary" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => handleLookup(e.target.value)}
                    placeholder="e.g. 8901030700032 or MILK-001"
                    autoFocus
                    className="w-full bg-secondary/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Sample Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
                <span className="text-muted-foreground">Quick test:</span>
                <button
                  onClick={() => handleLookup("8901030700032")}
                  className="px-2 py-0.5 rounded-md bg-secondary hover:bg-muted text-foreground border border-border cursor-pointer"
                >
                  Amul Milk (8901030700032)
                </button>
                <button
                  onClick={() => handleLookup("8904567890123")}
                  className="px-2 py-0.5 rounded-md bg-secondary hover:bg-muted text-foreground border border-border cursor-pointer"
                >
                  Office Chair (8904567890123)
                </button>
              </div>

              {/* Matched Product Preview */}
              {matchedItem ? (
                <div className="p-4 rounded-2xl bg-secondary/40 border border-emerald-500/30 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 w-max mb-1">
                        <CheckCircle2 className="size-3" /> Matched In Catalog
                      </span>
                      <h4 className="text-sm font-bold font-sans text-foreground">{matchedItem.name}</h4>
                      <p className="text-xs font-mono text-primary font-semibold">
                        SKU: {matchedItem.sku} • {matchedItem.location}
                      </p>
                    </div>
                    <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Boxes className="size-4" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-border/60">
                    <span className="text-muted-foreground">Stock: {matchedItem.quantity} units</span>
                    <button
                      onClick={() => handleSelect(matchedItem)}
                      className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                    >
                      <span>Open Product Record</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              ) : code.trim() ? (
                <div className="p-4 rounded-2xl bg-secondary/20 border border-border text-center text-xs font-mono text-muted-foreground">
                  No matching item found for barcode "{code}".
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground font-mono text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
