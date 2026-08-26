import { useState } from "react";
import {
  X,
  Clock,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRightLeft,
  Plus,
} from "lucide-react";
import type { Product, InventoryItem, StockStatus, ExpiryStatus } from "@/types/inventory";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Product | InventoryItem | null;
}

interface LocationStock {
  location: string;
  quantity: number;
  stockValue: number;
  reorderLevel: number;
  status: StockStatus;
}

interface ProductBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  location: string;
  receivedDate: string;
  mfgDate?: string;
  expiryDate?: string;
  daysRemaining?: number;
  status: ExpiryStatus;
  supplier: string;
  poNumber?: string;
  clearanceEligible?: boolean;
}

interface StockMovement {
  id: string;
  date: string;
  timestamp: string;
  movementType: "Stock Received" | "Stock Transferred" | "Stock Adjusted" | "Stock Returned" | "Damaged" | "Removed";
  quantityChange: number;
  fromLocation: string;
  toLocation: string;
  referenceId: string;
  performedBy: string;
  reason: string;
  previousQty: number;
  newQty: number;
}

interface PurchaseOrderRecord {
  poNumber: string;
  supplierName: string;
  orderDate: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  status: "Draft" | "Submitted" | "Confirmed" | "Partially Received" | "Received";
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  item,
}: ProductDetailModalProps) {
  if (!isOpen || !item) return null;

  const isPerishable = item.expiryTrackingEnabled;
  const initialQty = 45;
  const unitPrice = 60;

  // Local state for stock adjustment and transfers
  const [currentTotalStock, setCurrentTotalStock] = useState<number>(initialQty);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "batches" | "locations" | "movements" | "procurement">("overview");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-modals & drawers
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isTransferStockOpen, setIsTransferStockOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);
  const [selectedPoRecord, setSelectedPoRecord] = useState<PurchaseOrderRecord | null>(null);

  // Form states
  const [adjustType, setAdjustType] = useState<"Increase" | "Decrease" | "Correction" | "Damage" | "Return">("Correction");
  const [adjustLocation, setAdjustLocation] = useState("Central Warehouse");
  const [adjustAmount, setAdjustAmount] = useState(5);
  const [adjustReason, setAdjustReason] = useState("Audit Cycle Count");

  const [transferFrom, setTransferFrom] = useState("Central Warehouse");
  const [transferTo, setTransferTo] = useState("Store A");
  const [transferAmount, setTransferAmount] = useState(5);
  const [transferReason, setTransferReason] = useState("Inventory Rebalancing");

  const [newBatchNumber, setNewBatchNumber] = useState("MLK-044");
  const [newBatchQty, setNewBatchQty] = useState(20);
  const [newBatchExpiry, setNewBatchExpiry] = useState("2026-08-30");
  const [newBatchLocation, setNewBatchLocation] = useState("Central Warehouse");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to dynamically derive location status from threshold
  const deriveLocationStatus = (qty: number, threshold: number): StockStatus => {
    if (qty === 0) return "Out of Stock";
    if (qty < threshold) return "Low Stock";
    return "In Stock";
  };

  // Location breakdown: Central Warehouse: 25, Store A: 11, Store B: 9 (Low Stock < 10), DC: 0 = 45 units total
  const [locationDistribution, setLocationDistribution] = useState<LocationStock[]>([
    {
      location: "Central Warehouse",
      quantity: 25,
      stockValue: 25 * unitPrice, // ₹1,500
      reorderLevel: 20,
      status: "In Stock",
    },
    {
      location: "Store A",
      quantity: 11,
      stockValue: 11 * unitPrice, // ₹660
      reorderLevel: 10,
      status: "In Stock",
    },
    {
      location: "Store B",
      quantity: 9,
      stockValue: 9 * unitPrice, // ₹540
      reorderLevel: 10,
      status: "Low Stock", // 9 < 10 threshold!
    },
    {
      location: "Distribution Center",
      quantity: 0,
      stockValue: 0,
      reorderLevel: 15,
      status: "Out of Stock",
    },
  ]);

  // Batches: MLK-042 (25 units, Critical) + MLK-043 (20 units, Warning) = 45 units exact
  const [batches, setBatches] = useState<ProductBatch[]>(
    isPerishable
      ? [
          {
            id: "b-1",
            batchNumber: "MLK-042",
            quantity: 25,
            location: "Central Warehouse",
            receivedDate: "15 Aug 2026",
            mfgDate: "10 Aug 2026",
            expiryDate: "17 Aug 2026",
            daysRemaining: 2,
            status: "Critical",
            supplier: "GreenLeaf Foods Pvt. Ltd.",
            poNumber: "PO-1042",
            clearanceEligible: true,
          },
          {
            id: "b-2",
            batchNumber: "MLK-043",
            quantity: 20,
            location: "Store A",
            receivedDate: "15 Aug 2026",
            mfgDate: "12 Aug 2026",
            expiryDate: "24 Aug 2026",
            daysRemaining: 9,
            status: "Warning",
            supplier: "GreenLeaf Foods Pvt. Ltd.",
            poNumber: "PO-1042",
            clearanceEligible: false,
          },
        ]
      : [
          {
            id: "b-non-1",
            batchNumber: "LOT-2026-IND",
            quantity: initialQty,
            location: "Central Warehouse",
            receivedDate: "12 Aug 2026",
            status: "Not Applicable",
            supplier: "GreenLeaf Foods Pvt. Ltd.",
            poNumber: "PO-1040",
            clearanceEligible: false,
          },
        ]
  );

  // Movements history
  const [movements, setMovements] = useState<StockMovement[]>([
    {
      id: "mov-1",
      date: "15 Aug 2026",
      timestamp: "14:32 IST",
      movementType: "Stock Received",
      quantityChange: 50,
      fromLocation: "GreenLeaf Foods Pvt. Ltd. (Supplier)",
      toLocation: "Central Warehouse",
      referenceId: "PO-1042",
      performedBy: "Enterprise Admin",
      reason: "Goods Inbound Delivery",
      previousQty: 0,
      newQty: 50,
    },
    {
      id: "mov-2",
      date: "15 Aug 2026",
      timestamp: "16:15 IST",
      movementType: "Stock Transferred",
      quantityChange: -5,
      fromLocation: "Central Warehouse",
      toLocation: "Store A",
      referenceId: "TR-2026-081",
      performedBy: "Logistics Manager",
      reason: "Store Shelf Restocking",
      previousQty: 50,
      newQty: 45,
    },
    {
      id: "mov-3",
      date: "14 Aug 2026",
      timestamp: "11:20 IST",
      movementType: "Stock Adjusted",
      quantityChange: 2,
      fromLocation: "Store B",
      toLocation: "Store B",
      referenceId: "ADJ-2026-012",
      performedBy: "Store Manager",
      reason: "Physical Cycle Count Audit",
      previousQty: 43,
      newQty: 45,
    },
  ]);

  // Purchase History strictly matching PO module
  const purchaseHistory: PurchaseOrderRecord[] = [
    {
      poNumber: "PO-1042",
      supplierName: "GreenLeaf Foods Pvt. Ltd.",
      orderDate: "15 Aug 2026",
      quantityOrdered: 100,
      quantityReceived: 80,
      unitCost: 58,
      status: "Partially Received",
    },
    {
      poNumber: "PO-1040",
      supplierName: "GreenLeaf Foods Pvt. Ltd.",
      orderDate: "10 Aug 2026",
      quantityOrdered: 120,
      quantityReceived: 120,
      unitCost: 58,
      status: "Received",
    },
  ];

  // Stock status styling helper
  const getStockStatusBadge = (status: StockStatus) => {
    switch (status) {
      case "In Stock":
        return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
      case "Low Stock":
        return "text-amber-400 bg-amber-500/15 border-amber-500/30";
      case "Out of Stock":
        return "text-rose-400 bg-rose-500/15 border-rose-500/30";
    }
  };

  const getExpiryStatusBadge = (status: ExpiryStatus) => {
    switch (status) {
      case "Critical":
        return "text-rose-400 bg-rose-500/15 border-rose-500/30 animate-pulse";
      case "High Risk":
      case "Warning":
        return "text-amber-400 bg-amber-500/15 border-amber-500/30";
      case "Safe":
        return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
      default:
        return "text-muted-foreground bg-secondary border-border";
    }
  };

  // Handle stock adjustment
  const handleApplyAdjustment = () => {
    const change = adjustType === "Decrease" || adjustType === "Damage" ? -Math.abs(adjustAmount) : Math.abs(adjustAmount);
    const newTotal = Math.max(0, currentTotalStock + change);
    setCurrentTotalStock(newTotal);

    setLocationDistribution((prev) =>
      prev.map((loc) => {
        if (loc.location === adjustLocation) {
          const newLocQty = Math.max(0, loc.quantity + change);
          return {
            ...loc,
            quantity: newLocQty,
            stockValue: Math.round(newLocQty * unitPrice),
            status: deriveLocationStatus(newLocQty, loc.reorderLevel),
          };
        }
        return loc;
      })
    );

    const newMov: StockMovement = {
      id: `mov-${Date.now()}`,
      date: "15 Aug 2026",
      timestamp: "18:45 IST",
      movementType: adjustType === "Damage" ? "Damaged" : "Stock Adjusted",
      quantityChange: change,
      fromLocation: adjustLocation,
      toLocation: adjustLocation,
      referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
      performedBy: "Enterprise Admin",
      reason: `${adjustType}: ${adjustReason}`,
      previousQty: currentTotalStock,
      newQty: newTotal,
    };

    setMovements([newMov, ...movements]);
    setIsAdjustStockOpen(false);
    showToast(`Adjusted stock by ${change > 0 ? `+${change}` : change} units at ${adjustLocation}.`);
  };

  // Handle stock transfer
  const handleApplyTransfer = () => {
    if (transferFrom === transferTo) {
      showToast("Source and destination facilities must be different.");
      return;
    }

    setLocationDistribution((prev) =>
      prev.map((loc) => {
        if (loc.location === transferFrom) {
          const newLocQty = Math.max(0, loc.quantity - transferAmount);
          return {
            ...loc,
            quantity: newLocQty,
            stockValue: Math.round(newLocQty * unitPrice),
            status: deriveLocationStatus(newLocQty, loc.reorderLevel),
          };
        }
        if (loc.location === transferTo) {
          const newLocQty = loc.quantity + transferAmount;
          return {
            ...loc,
            quantity: newLocQty,
            stockValue: Math.round(newLocQty * unitPrice),
            status: deriveLocationStatus(newLocQty, loc.reorderLevel),
          };
        }
        return loc;
      })
    );

    const newMov: StockMovement = {
      id: `mov-${Date.now()}`,
      date: "15 Aug 2026",
      timestamp: "18:50 IST",
      movementType: "Stock Transferred",
      quantityChange: -transferAmount,
      fromLocation: transferFrom,
      toLocation: transferTo,
      referenceId: `TR-${Date.now().toString().slice(-4)}`,
      performedBy: "Enterprise Admin",
      reason: transferReason,
      previousQty: currentTotalStock,
      newQty: currentTotalStock,
    };

    setMovements([newMov, ...movements]);
    setIsTransferStockOpen(false);
    showToast(`Transferred ${transferAmount} units from ${transferFrom} to ${transferTo}.`);
  };

  // Handle add batch
  const handleAddBatch = () => {
    const newB: ProductBatch = {
      id: `b-${Date.now()}`,
      batchNumber: newBatchNumber,
      quantity: newBatchQty,
      location: newBatchLocation,
      receivedDate: "15 Aug 2026",
      expiryDate: isPerishable ? newBatchExpiry : undefined,
      daysRemaining: isPerishable ? 15 : undefined,
      status: isPerishable ? "Safe" : "Not Applicable",
      supplier: "GreenLeaf Foods Pvt. Ltd.",
      poNumber: "PO-1042",
      clearanceEligible: false,
    };

    setBatches([newB, ...batches]);
    setCurrentTotalStock(currentTotalStock + newBatchQty);
    setIsAddBatchOpen(false);
    showToast(`Added batch ${newBatchNumber} (+${newBatchQty} units).`);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-primary/40 shadow-xl text-foreground text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
      >
        {/* ─── 1. BREADCRUMB & HEADER ─── */}
        <div className="space-y-3 pb-4 border-b border-border/80">
          <div className="flex items-center justify-between">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <button
                type="button"
                onClick={onClose}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Inventory
              </button>
              <span>/</span>
              <span className="text-foreground font-medium">{item.category}</span>
              <span>/</span>
              <span className="text-primary font-bold truncate max-w-[200px]">{item.name}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {item.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-xs font-mono text-foreground font-bold">
                  SKU: {item.sku}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getStockStatusBadge(item.stockStatus)}`}>
                  {item.stockStatus}
                </span>
                {isPerishable ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-mono text-purple-400 font-bold flex items-center gap-1">
                    <Clock className="size-3" />
                    Expiry Tracked
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-xs font-mono text-muted-foreground font-semibold flex items-center gap-1">
                    <ShieldCheck className="size-3 text-emerald-500" />
                    Non-Expiry Good
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-sans">
                {item.brand} &bull; Barcode: <strong className="font-mono text-foreground">{item.barcode}</strong> &bull; Primary Location: {item.store || "Central Warehouse"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAdjustStockOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary border border-border text-xs font-mono font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5 text-amber-400" />
                <span>Adjust Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTransferStockOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary border border-border text-xs font-mono font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <ArrowRightLeft className="size-3.5 text-blue-400" />
                <span>Transfer</span>
              </button>

              {isPerishable && (
                <button
                  type="button"
                  onClick={() => setIsAddBatchOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary border border-border text-xs font-mono font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  <Plus className="size-3.5 text-primary" />
                  <span>Add Batch</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── 2. OPERATIONAL SUMMARY METRICS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
            <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block">Current Stock</span>
            <p className="text-xl font-bold font-mono text-foreground">{currentTotalStock} units</p>
            <p className="text-[10px] text-muted-foreground font-mono">Across 4 facilities</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
            <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block">Stock Value</span>
            <p className="text-xl font-bold font-mono text-foreground">₹{(currentTotalStock * unitPrice).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-mono">Current valuation: ₹{unitPrice}/unit</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
            <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block">Available</span>
            <p className="text-xl font-bold font-mono text-emerald-400">{currentTotalStock} units</p>
            <p className="text-[10px] text-emerald-400 font-mono">Ready for dispatch</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
            <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block">Reserved</span>
            <p className="text-xl font-bold font-mono text-foreground">0 units</p>
            <p className="text-[10px] text-muted-foreground font-mono">Customer allocations</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
            <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block">Damaged / Hold</span>
            <p className="text-xl font-bold font-mono text-rose-400">0 units</p>
            <p className="text-[10px] text-muted-foreground font-mono">Quarantine hold</p>
          </div>
        </div>

        {/* ─── 3. SUB-TABS NAVIGATION ─── */}
        <div className="flex items-center gap-1.5 border-b border-border/80 pb-2 overflow-x-auto">
          {[
            { key: "overview", label: "Overview & Attributes" },
            { key: "locations", label: "Inventory by Location" },
            ...(isPerishable ? [{ key: "batches", label: "Batches & Expiry Intelligence" }] : []),
            { key: "movements", label: "Stock Movement History" },
            { key: "procurement", label: "Purchase History" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveSubTab(t.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === t.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── TAB CONTENT 1: OVERVIEW & ATTRIBUTES ─── */}
        {activeSubTab === "overview" && (
          <div className="space-y-5">
            {/* Expiry Status & Clearance OR Non-Expiry Summary Block */}
            {isPerishable ? (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-rose-500 animate-pulse" />
                    <span className="font-mono font-bold text-rose-400 uppercase tracking-wider text-xs">
                      EXPIRY STATUS & CLEARANCE
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-snow-white font-mono font-bold text-xs">
                    CRITICAL — 2 DAYS LEFT
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground text-[11px]">Earliest Expiry</span>
                    <p className="font-bold text-rose-400 text-sm mt-0.5">17 Aug 2026</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground text-[11px]">Affected Lot</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">MLK-042</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground text-[11px]">Quantity at Risk</span>
                    <p className="font-bold text-rose-400 text-sm mt-0.5">25 units</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground text-[11px]">Facility</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">Central Warehouse</p>
                  </div>
                </div>

                {/* Clearance Eligibility Action */}
                <div className="p-3.5 rounded-xl bg-card border border-border/80 flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">Clearance Eligibility: ELIGIBLE</span>
                    <p className="text-[11px] text-muted-foreground font-sans">
                      Expiry countdown within configured 72-hour clearance markdown window.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      showToast("Initiated clearance markdown workflow.");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
                  >
                    Create Clearance Listing
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span className="font-mono font-bold text-foreground uppercase tracking-wider text-xs">
                    EXPIRY TRACKING: NOT APPLICABLE
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  This product is classified as a non-perishable general inventory good. Governed under standard reorder point and minimum safety stock controls without shelf-life degradation.
                </p>
              </div>
            )}

            {/* Product Master Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4.5 rounded-2xl bg-secondary/20 border border-border space-y-3">
                <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider block">
                  Product Identity
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="font-bold text-foreground">{item.brand}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-bold text-foreground">{item.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Unit of Measure:</span>
                    <span className="font-bold text-foreground">{item.unit || "Pcs"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Master Status:</span>
                    <span className="font-bold text-emerald-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Safety Level:</span>
                    <span className="font-bold text-foreground">{item.minStockLevel || 15} units</span>
                  </div>
                </div>
              </div>

              {/* Primary Supplier Info */}
              <div className="p-4.5 rounded-2xl bg-secondary/20 border border-border space-y-3">
                <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider block">
                  Primary Sourcing Supplier
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="font-bold text-foreground">GreenLeaf Foods Pvt. Ltd.</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-bold text-foreground">SUP-001</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Lead Contact:</span>
                    <span className="font-bold text-foreground">Anita Sharma (+91 98201 44521)</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Last Inbound Receipt:</span>
                    <span className="font-bold text-foreground">15 Aug 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purchase Unit Cost:</span>
                    <span className="font-bold text-foreground">₹58.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Traceability Flow Lineage */}
            <div className="p-4.5 rounded-2xl bg-secondary/20 border border-border space-y-3">
              <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider block">
                ERN Supply & Inventory Traceability
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">1. Supplier</span>
                  <span className="font-bold text-foreground truncate block mt-0.5">GreenLeaf (SUP-001)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">2. Purchase Order</span>
                  <span className="font-bold text-foreground truncate block mt-0.5">PO-1042</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">3. Batch Lot</span>
                  <span className="font-bold text-foreground truncate block mt-0.5">{isPerishable ? "MLK-042" : "LOT-IND"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">4. Facility</span>
                  <span className="font-bold text-foreground truncate block mt-0.5">Central Warehouse</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase">5. Inventory</span>
                  <span className="font-bold text-emerald-400 truncate block mt-0.5">Active Inventory</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB CONTENT 2: INVENTORY BY LOCATION ─── */}
        {activeSubTab === "locations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                Facility Stock Breakdown
              </span>
              <button
                type="button"
                onClick={() => setIsTransferStockOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
              >
                <ArrowRightLeft className="size-3.5" />
                <span>Inter-Facility Transfer</span>
              </button>
            </div>

            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground uppercase">
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Available Quantity</th>
                    <th className="py-3 px-4">Stock Value</th>
                    <th className="py-3 px-4">Safety Threshold</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {locationDistribution.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20">
                      <td className="py-3.5 px-4 font-bold text-foreground font-sans flex items-center gap-2">
                        <MapPin className="size-3.5 text-primary" />
                        <span>{loc.location}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{loc.quantity} units</td>
                      <td className="py-3.5 px-4 font-bold">₹{loc.stockValue.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{loc.reorderLevel} units</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStockStatusBadge(loc.status)}`}>
                          {loc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/30 font-bold border-t border-border">
                    <td className="py-3.5 px-4 text-foreground font-sans">Total Inventory</td>
                    <td className="py-3.5 px-4 font-bold text-foreground">{locationDistribution.reduce((acc, l) => acc + l.quantity, 0)} units</td>
                    <td className="py-3.5 px-4 font-bold text-foreground">₹{locationDistribution.reduce((acc, l) => acc + l.stockValue, 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">—</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">4 Facilities</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-muted-foreground font-sans pt-0.5">
              Stock value is based on current inventory valuation (₹60 per unit).
            </p>
          </div>
        )}

        {/* ─── TAB CONTENT 3: BATCHES & EXPIRY INTELLIGENCE (Perishable only) ─── */}
        {activeSubTab === "batches" && isPerishable && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider block">
                  ACTIVE BATCHES & EXPIRY STATUS
                </span>
                <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                  Click any batch row to inspect lot traceability, purchase lineage, and clearance parameters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBatchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:bg-primary/90 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="size-3.5" />
                <span>Register Batch</span>
              </button>
            </div>

            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground uppercase">
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Received Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Days Left</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {batches.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBatch(b)}
                      className="hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-primary flex items-center gap-1.5">
                        <span>{b.batchNumber}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{b.quantity} units</td>
                      <td className="py-3.5 px-4 font-sans text-muted-foreground">{b.location}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{b.receivedDate}</td>
                      <td className="py-3.5 px-4 font-bold text-foreground">{b.expiryDate || "—"}</td>
                      <td className="py-3.5 px-4 font-bold text-rose-400">
                        {b.daysRemaining !== undefined ? `${b.daysRemaining} days` : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getExpiryStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Batch Detail Drawer / Sub-panel */}
            {selectedBatch && (
              <div className="p-4.5 rounded-2xl bg-secondary/30 border border-primary/40 text-xs font-mono space-y-3 animate-in fade-in duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">BATCH {selectedBatch.batchNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getExpiryStatusBadge(selectedBatch.status)}`}>
                      {selectedBatch.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBatch(null)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Quantity:</span>
                    <strong className="text-foreground">{selectedBatch.quantity} units</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Location:</span>
                    <strong className="text-foreground">{selectedBatch.location}</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Received Date:</span>
                    <strong className="text-foreground">{selectedBatch.receivedDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Expiry Date:</span>
                    <strong className="text-rose-400">{selectedBatch.expiryDate}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 border-t border-border/50">
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Supplier:</span>
                    <strong className="text-foreground">{selectedBatch.supplier}</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Purchase Order:</span>
                    <strong className="text-primary">{selectedBatch.poNumber || "PO-1042"}</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Clearance Eligibility:</span>
                    <strong className={selectedBatch.clearanceEligible ? "text-emerald-400" : "text-muted-foreground"}>
                      {selectedBatch.clearanceEligible ? "Eligible" : "Not Eligible"}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB CONTENT 4: STOCK MOVEMENT HISTORY ─── */}
        {activeSubTab === "movements" && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider block">
                RECENT STOCK MOVEMENTS
              </span>
              <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                Latest inventory movements for this product.
              </p>
            </div>

            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground uppercase">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Movement Type</th>
                    <th className="py-3 px-4">Quantity Change</th>
                    <th className="py-3 px-4">Source / Location</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {movements.map((mov) => (
                    <tr
                      key={mov.id}
                      onClick={() => setSelectedMovement(mov)}
                      className="hover:bg-secondary/20 cursor-pointer"
                    >
                      <td className="py-3.5 px-4 text-muted-foreground">{mov.date} ({mov.timestamp})</td>
                      <td className="py-3.5 px-4 font-bold text-foreground font-sans">{mov.movementType}</td>
                      <td className={`py-3.5 px-4 font-bold ${mov.quantityChange > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange} units
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {mov.movementType === "Stock Adjusted" ? `Location: ${mov.fromLocation}` : mov.fromLocation}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {mov.movementType === "Stock Adjusted" ? "—" : mov.toLocation}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-primary">{mov.referenceId}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{mov.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedMovement && (
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border text-xs font-mono space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Movement Audit Detail: {selectedMovement.referenceId}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedMovement(null)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <p className="text-muted-foreground font-sans">
                  <strong>Reason:</strong> {selectedMovement.reason} &bull; <strong>Balance:</strong> {selectedMovement.previousQty} units &rarr; {selectedMovement.newQty} units.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB CONTENT 5: PURCHASE HISTORY ─── */}
        {activeSubTab === "procurement" && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider block">
                Inbound Procurement Sourcing Records
              </span>
              <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                Click any purchase order to inspect receiving lineage, quantities, and batch allocations.
              </p>
            </div>

            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground uppercase">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Ordered</th>
                    <th className="py-3 px-4">Received</th>
                    <th className="py-3 px-4">Pending</th>
                    <th className="py-3 px-4">Purchase Unit Cost</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {purchaseHistory.map((po, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedPoRecord(selectedPoRecord?.poNumber === po.poNumber ? null : po)}
                      className="hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-primary flex items-center gap-1.5">
                        <span>{po.poNumber}</span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-foreground">{po.supplierName}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{po.orderDate}</td>
                      <td className="py-3.5 px-4 font-bold">{po.quantityOrdered} units</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{po.quantityReceived} units</td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">{po.quantityOrdered - po.quantityReceived} units</td>
                      <td className="py-3.5 px-4 text-muted-foreground">₹{po.unitCost}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-primary/10 border border-primary/30 text-primary">
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PO Lineage & Traceability Sub-panel */}
            {selectedPoRecord && (
              <div className="p-4.5 rounded-2xl bg-secondary/30 border border-primary/40 text-xs font-mono space-y-3 animate-in fade-in duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">PURCHASE ORDER • {selectedPoRecord.poNumber}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 border border-primary/30 text-primary">
                      {selectedPoRecord.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPoRecord(null)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Close purchase order detail"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Ordered:</span>
                    <strong className="text-foreground">{selectedPoRecord.quantityOrdered} units</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Received:</span>
                    <strong className="text-emerald-400">{selectedPoRecord.quantityReceived} units</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Pending:</span>
                    <strong className="text-amber-400">{selectedPoRecord.quantityOrdered - selectedPoRecord.quantityReceived} units</strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-muted-foreground block">Purchase Unit Cost:</span>
                    <strong className="text-foreground">₹{selectedPoRecord.unitCost}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1.5">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    Supply Lineage & Traceability
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-foreground flex-wrap">
                    <span className="font-bold text-primary">{selectedPoRecord.poNumber}</span>
                    <span>&rarr;</span>
                    <span>Received ({selectedPoRecord.quantityReceived} units)</span>
                    <span>&rarr;</span>
                    <span>Batches (MLK-042 / MLK-043)</span>
                    <span>&rarr;</span>
                    <span className="text-emerald-400 font-bold">Active Inventory</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── FOOTER ACTIONS ─── */}
        <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-mono font-semibold hover:bg-muted transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast("Product master details exported to JSON format.")}
              className="px-3.5 py-2 rounded-xl bg-secondary border border-border text-xs font-mono font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              Export
            </button>
            <button
              type="button"
              onClick={() => setIsAdjustStockOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Adjust Stock
            </button>
          </div>
        </div>
      </div>

      {/* ─── ADJUST STOCK MODAL ─── */}
      {isAdjustStockOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Adjust Physical Stock</h3>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Record cycle count correction or shrinkage for {item.name}.
                </p>
              </div>
              <button
                onClick={() => setIsAdjustStockOpen(false)}
                className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="font-mono font-bold text-muted-foreground block mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                >
                  <option value="Correction">Count Correction (+/-)</option>
                  <option value="Increase">Manual Stock Increase (+)</option>
                  <option value="Decrease">Manual Stock Decrease (-)</option>
                  <option value="Damage">Damaged Goods (-)</option>
                  <option value="Return">Customer Restock Return (+)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-muted-foreground block mb-1">Location</label>
                  <select
                    value={adjustLocation}
                    onChange={(e) => setAdjustLocation(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                  >
                    <option value="Central Warehouse">Central Warehouse</option>
                    <option value="Store A">Store A</option>
                    <option value="Store B">Store B</option>
                    <option value="Distribution Center">Distribution Center</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono font-bold text-muted-foreground block mb-1">Adjustment Units</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 1)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-muted-foreground block mb-1">Reason Code</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Audit discrepancy, damaged carton..."
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-sans text-foreground outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-secondary/40 border border-border text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Stock:</span>
                  <strong>{currentTotalStock} units</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Calculated Stock:</span>
                  <strong className="text-primary">
                    {Math.max(0, currentTotalStock + (adjustType === "Decrease" || adjustType === "Damage" ? -adjustAmount : adjustAmount))} units
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAdjustStockOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-mono font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustment}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TRANSFER STOCK MODAL ─── */}
      {isTransferStockOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Transfer Inventory Stock</h3>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Inter-facility rebalancing for {item.name}.
                </p>
              </div>
              <button
                onClick={() => setIsTransferStockOpen(false)}
                className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-muted-foreground block mb-1">Source Facility</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                  >
                    <option value="Central Warehouse">Central Warehouse</option>
                    <option value="Store A">Store A</option>
                    <option value="Store B">Store B</option>
                    <option value="Distribution Center">Distribution Center</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono font-bold text-muted-foreground block mb-1">Destination</label>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                  >
                    <option value="Store A">Store A</option>
                    <option value="Store B">Store B</option>
                    <option value="Distribution Center">Distribution Center</option>
                    <option value="Central Warehouse">Central Warehouse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-muted-foreground block mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={currentTotalStock}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(parseInt(e.target.value) || 1)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-muted-foreground block mb-1">Transfer Reason</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Store demand rebalancing, promotional staging..."
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-sans text-foreground outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-secondary/40 border border-border text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{transferFrom}:</span>
                  <strong className="text-rose-400">-{transferAmount} units</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{transferTo}:</span>
                  <strong className="text-emerald-400">+{transferAmount} units</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsTransferStockOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-mono font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyTransfer}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD BATCH MODAL ─── */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Register Inbound Batch Lot</h3>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Track batch identifier and expiry date for {item.name}.
                </p>
              </div>
              <button
                onClick={() => setIsAddBatchOpen(false)}
                className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-muted-foreground block mb-1">Batch / Lot Number</label>
                  <input
                    type="text"
                    value={newBatchNumber}
                    onChange={(e) => setNewBatchNumber(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-muted-foreground block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newBatchQty}
                    onChange={(e) => setNewBatchQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-muted-foreground block mb-1">Location</label>
                  <select
                    value={newBatchLocation}
                    onChange={(e) => setNewBatchLocation(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                  >
                    <option value="Central Warehouse">Central Warehouse</option>
                    <option value="Store A">Store A</option>
                    <option value="Store B">Store B</option>
                    <option value="Distribution Center">Distribution Center</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono font-bold text-primary block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newBatchExpiry}
                    onChange={(e) => setNewBatchExpiry(e.target.value)}
                    className="w-full bg-secondary border border-primary/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAddBatchOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-mono font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBatch}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Add Lot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
