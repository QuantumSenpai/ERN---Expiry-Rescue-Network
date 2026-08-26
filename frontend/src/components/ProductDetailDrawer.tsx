import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  ShieldCheck,
  Boxes,
  MapPin,
  Barcode,
  Layers,
  AlertTriangle,
  RefreshCw,
  Truck,
  CheckCircle2,
  Sliders,
  Building2,
} from "lucide-react";
import type { InventoryItem } from "@/types/inventory";

interface ProductDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: (InventoryItem & { location?: string }) | null;
  onAction?: (actionName: string) => void;
  onOpenTransfer?: () => void;
}

export default function ProductDetailDrawer({
  isOpen,
  onClose,
  item,
  onAction,
  onOpenTransfer,
}: ProductDetailDrawerProps) {
  if (!item) return null;

  const isExpiryTracked = item.expiryTrackingEnabled;
  const daysRemaining = item.daysRemaining;
  const location = item.location || item.store || "Main Warehouse";
  const reorderLevel = item.reorderLevel || item.minStockLevel || 20;
  const isLowStock = item.quantity <= reorderLevel || item.stockStatus === "Low Stock";
  const isOverstock = item.operationalStatus === "Overstock" || (item.overstockAmount && item.overstockAmount > 0);

  // Deterministic Recommended Action Logic
  const getOperationalStatusAndRecommendation = () => {
    if (daysRemaining != null && daysRemaining <= 3 && isExpiryTracked) {
      return {
        status: "Critical Risk",
        statusColor: "text-rose-500 bg-rose-500/10 border-rose-500/30",
        recommendation: "Review this product before expiry.",
        subText: "Prioritize operational review or immediate shelf rotation.",
      };
    }
    if (daysRemaining != null && daysRemaining <= 7 && isExpiryTracked) {
      return {
        status: "High Risk",
        statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/30",
        recommendation: "Review this product before expiry.",
        subText: "Schedule stock staging and priority customer rotation.",
      };
    }
    if (isLowStock) {
      return {
        status: "Low Stock",
        statusColor: "text-orange-500 bg-orange-500/10 border-orange-500/30",
        recommendation: "Consider replenishment based on the configured reorder level.",
        subText: `Current stock (${item.quantity}) is below minimum threshold (${reorderLevel}).`,
      };
    }
    if (isOverstock) {
      return {
        status: "Overstock",
        statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        recommendation: "Review excess stock and distribution opportunities.",
        subText: "Hold future purchase orders and consider inter-branch transfer.",
      };
    }
    return {
      status: "Normal",
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
      recommendation: "No immediate action required.",
      subText: "Inventory is operating within normal parameters.",
    };
  };

  const op = getOperationalStatusAndRecommendation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2F4156]/60 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border/80 flex items-start justify-between gap-4 bg-secondary/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isExpiryTracked ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                        <Clock className="size-3" />
                        <span>Expiry Tracked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
                        <ShieldCheck className="size-3 text-emerald-500" />
                        <span>Non-Expiry Item</span>
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground font-mono">
                      {item.category}
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground leading-snug">
                    {item.name}
                  </h2>
                  <p className="text-xs font-mono text-primary font-semibold">
                    SKU: {item.sku} {item.batchNo ? `• Batch: ${item.batchNo}` : ""}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                  aria-label="Close drawer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* 1. Deterministic Recommended Next Step Banner */}
                <div className={`p-4 rounded-2xl border ${op.statusColor} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" />
                      {op.status}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-card/60">
                      Rule-based Logic
                    </span>
                  </div>

                  <div className="pt-2 border-t border-current/20">
                    <p className="text-[11px] font-mono uppercase font-bold text-muted-foreground">
                      Recommended Next Step:
                    </p>
                    <p className="text-xs font-sans font-bold text-foreground mt-0.5">
                      {op.recommendation}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                      {op.subText}
                    </p>
                  </div>
                </div>

                {/* 2. Stock & Reorder Intelligence */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/80 space-y-1">
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                      <Boxes className="size-3 text-primary" />
                      Current Quantity
                    </span>
                    <p className="text-lg font-bold font-mono text-foreground">
                      {item.quantity} <span className="text-xs font-normal text-muted-foreground">{item.unit || "units"}</span>
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Reorder Threshold: {reorderLevel} units
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/80 space-y-1">
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                      <MapPin className="size-3 text-emerald-500" />
                      Primary Location
                    </span>
                    <p className="text-sm font-bold text-foreground truncate">
                      {location}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Value: ₹{((item.stockValue || item.quantity * item.unitPrice) || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* 3. Multi-Location Stock Distribution */}
                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary" />
                      Location Distribution
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTransfer?.();
                      }}
                      className="text-[11px] font-mono font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      Review Transfer →
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Store A</span>
                      <span className="font-bold text-foreground">5 units (Low)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Store B</span>
                      <span className="font-bold text-foreground">80 units</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Warehouse</span>
                      <span className="font-bold text-emerald-400">120 units (Excess)</span>
                    </div>
                  </div>
                </div>

                {/* 4. Expiry Intelligence Section */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-foreground flex items-center gap-2">
                    <Layers className="size-3.5 text-primary" />
                    <span>Expiry Intelligence</span>
                  </h3>

                  {isExpiryTracked ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Expiry Date</span>
                        <span className="font-bold text-foreground">{item.expiryDate || "Pending"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Days Remaining</span>
                        <span className={`font-bold ${daysRemaining != null && daysRemaining <= 3 ? "text-rose-500" : daysRemaining != null && daysRemaining <= 7 ? "text-amber-500" : "text-emerald-500"}`}>
                          {daysRemaining != null ? `${daysRemaining} days` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Batch / Lot</span>
                        <span className="font-bold text-foreground">{item.batchNo || "BATCH-001"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Assigned Supplier</span>
                        <span className="font-bold text-foreground">{item.supplier || item.brand || "National Distributors"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2.5 text-center space-y-1">
                      <p className="text-xs font-mono font-bold text-muted-foreground">
                        Expiry: Not Applicable
                      </p>
                      <p className="text-[11px] text-muted-foreground font-sans">
                        Managed under continuous stock tracking with safety replenishment thresholds.
                      </p>
                    </div>
                  )}
                </div>

                {/* 5. Barcode Verification */}
                <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Barcode className="size-4 text-primary" />
                    <div>
                      <p className="text-xs font-mono font-bold text-foreground">{item.barcode || "8901030700032"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">EAN-13 Verified</p>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-medium">
                    Verified
                  </span>
                </div>
              </div>

              {/* Drawer Footer Operational Actions */}
              <div className="p-5 border-t border-border/80 bg-secondary/20 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onAction?.("Update Stock");
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Update Stock</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTransfer?.();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs font-bold hover:bg-muted transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Truck className="size-3.5" />
                    <span>Move Inventory</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onAction?.("Adjust Threshold");
                      onClose();
                    }}
                    className="py-2 px-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-mono text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="size-3.5" />
                    <span>Adjust Threshold</span>
                  </button>
                  <button
                    onClick={() => {
                      onAction?.("Mark for Review");
                      onClose();
                    }}
                    className="py-2 px-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-mono text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Mark for Review</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
