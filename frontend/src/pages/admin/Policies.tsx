import { useState, useMemo } from "react";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Boxes,
  Sliders,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export interface InventoryPolicyState {
  negativeStockAllowed: "Blocked" | "Allowed";
  manualAdjustmentEnabled: boolean;
  adjustmentApproval: "No Approval" | "Manager Approval" | "Admin Approval";
  approvalThresholdQty: number;
  adjustmentReasonRequired: boolean;

  lowStockEnabled: boolean;
  lowStockRuleBasis: "Reorder Level" | "Minimum Quantity" | "Days of Supply";
  defaultReorderLevel: number;
  overstockEnabled: boolean;
  overstockDetectionMethod: "Maximum Stock Level" | "Days of Supply";
  defaultMaximumStock: number;

  batchTrackingEnabled: boolean;
  lotNumberRequirement: "Optional" | "Required for selected categories" | "Required for all tracked products";
  skuRequired: boolean;
  barcodeRequired: boolean;
  duplicateSkuAllowed: boolean;
  duplicateBarcodeAllowed: boolean;

  productLevelExpiryAllowed: boolean;
  defaultExpiryEnabled: boolean;

  transferRequestsEnabled: boolean;
  transferApproval: "No Approval" | "Manager Approval" | "Admin Approval";
  requireSourceLocation: boolean;
  requireDestinationLocation: boolean;
  requireTransferReason: boolean;
  reservationEnabled: boolean;

  cycleCountingEnabled: boolean;
  countFrequency: "Weekly" | "Monthly" | "Quarterly" | "Custom";
  defaultUnit: string;
  quantityPrecision: "Whole numbers (1)" | "1 Decimal (0.1)" | "2 Decimals (0.01)";

  policyHierarchyMode: "Use organization defaults" | "Allow location-level overrides";

  rejectDuplicateSkuOnImport: boolean;
  rejectDuplicateBarcodeOnImport: boolean;
  validateRequiredFields: boolean;
  validateNumericQuantities: boolean;
  validateLocationOnImport: boolean;
  validateExpiryDateWhenTracked: boolean;
}

const DEFAULT_POLICIES: InventoryPolicyState = {
  negativeStockAllowed: "Blocked",
  manualAdjustmentEnabled: true,
  adjustmentApproval: "Manager Approval",
  approvalThresholdQty: 100,
  adjustmentReasonRequired: true,

  lowStockEnabled: true,
  lowStockRuleBasis: "Reorder Level",
  defaultReorderLevel: 20,
  overstockEnabled: true,
  overstockDetectionMethod: "Maximum Stock Level",
  defaultMaximumStock: 100,

  batchTrackingEnabled: true,
  lotNumberRequirement: "Optional",
  skuRequired: true,
  barcodeRequired: true,
  duplicateSkuAllowed: false,
  duplicateBarcodeAllowed: false,

  productLevelExpiryAllowed: true,
  defaultExpiryEnabled: true,

  transferRequestsEnabled: true,
  transferApproval: "Manager Approval",
  requireSourceLocation: true,
  requireDestinationLocation: true,
  requireTransferReason: true,
  reservationEnabled: false,

  cycleCountingEnabled: true,
  countFrequency: "Monthly",
  defaultUnit: "Units",
  quantityPrecision: "Whole numbers (1)",

  policyHierarchyMode: "Use organization defaults",

  rejectDuplicateSkuOnImport: true,
  rejectDuplicateBarcodeOnImport: true,
  validateRequiredFields: true,
  validateNumericQuantities: true,
  validateLocationOnImport: true,
  validateExpiryDateWhenTracked: true,
};

const ADJUSTMENT_REASONS = [
  "Damaged Goods",
  "Expired Stock",
  "Stock Count Correction",
  "Theft / Loss",
  "Supplier Return",
  "Donation Transfer",
  "Customer Return Restock",
  "Data Entry Mistake",
];

export default function Policies() {
  const [savedPolicies, setSavedPolicies] = useState<InventoryPolicyState>(DEFAULT_POLICIES);
  const [policies, setPolicies] = useState<InventoryPolicyState>(DEFAULT_POLICIES);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(savedPolicies) !== JSON.stringify(policies);
  }, [savedPolicies, policies]);

  const validationError = useMemo(() => {
    if (policies.defaultMaximumStock <= policies.defaultReorderLevel) {
      return "Please fix: Maximum stock must be higher than the reorder level.";
    }
    if (policies.defaultReorderLevel < 0) {
      return "Please fix: Reorder level cannot be a negative number.";
    }
    return null;
  }, [policies]);

  const handleSave = () => {
    if (validationError) return;
    setSavedPolicies(policies);
    showToast("Saved! Your inventory rules are now live.");
  };

  const handleDiscard = () => {
    setPolicies(savedPolicies);
    showToast("Changes undone.");
  };

  const handleConfirmReset = () => {
    setPolicies(DEFAULT_POLICIES);
    setSavedPolicies(DEFAULT_POLICIES);
    setIsResetModalOpen(false);
    showToast("Back to default settings.");
  };

  const [simQty, setSimQty] = useState(15);
  const [simReorderLevel, setSimReorderLevel] = useState(20);
  const [simExpiryDays, setSimExpiryDays] = useState<number | null>(12);
  const [simIsExpiryTracked, setSimIsExpiryTracked] = useState(true);

  const simStockStatus = useMemo(() => {
    if (simQty === 0) return { label: "OUT OF STOCK", badgeClass: "bg-primary text-primary-foreground" };
    if (simQty <= 5) return { label: "CRITICAL", badgeClass: "bg-primary text-primary-foreground" };
    if (simQty <= simReorderLevel) return { label: "LOW STOCK", badgeClass: "bg-destructive text-destructive-foreground" };
    if (simQty > policies.defaultMaximumStock) return { label: "TOO MUCH STOCK", badgeClass: "bg-secondary text-foreground" };
    return { label: "NORMAL", badgeClass: "bg-accent text-accent-foreground" };
  }, [simQty, simReorderLevel, policies.defaultMaximumStock]);

  const simExpiryStatus = useMemo(() => {
    if (!simIsExpiryTracked || simExpiryDays === null) return { label: "DOESN'T EXPIRE", badgeClass: "bg-secondary text-foreground" };
    if (simExpiryDays <= 0) return { label: "EXPIRED", badgeClass: "bg-primary text-primary-foreground" };
    if (simExpiryDays <= 7) return { label: "EXPIRING VERY SOON (0–7d)", badgeClass: "bg-primary text-primary-foreground" };
    if (simExpiryDays <= 14) return { label: "EXPIRING SOON (8–14d)", badgeClass: "bg-destructive text-destructive-foreground" };
    if (simExpiryDays <= 30) return { label: "WATCH (15–30d)", badgeClass: "bg-secondary text-foreground" };
    return { label: "SAFE (30+d)", badgeClass: "bg-accent text-accent-foreground" };
  }, [simExpiryDays, simIsExpiryTracked]);

  const simEvaluation = useMemo(() => {
    const isLow = simStockStatus.label.includes("LOW") || simStockStatus.label.includes("CRITICAL") || simStockStatus.label.includes("OUT");
    const isOver = simStockStatus.label.includes("TOO MUCH");
    const isExpUrgent = simExpiryStatus.label.includes("VERY SOON") || simExpiryStatus.label.includes("EXPIRING SOON") || simExpiryStatus.label.includes("EXPIRED");

    if (isLow && isExpUrgent) {
      return {
        overall: "REORDER + CLEAR STOCK",
        badgeClass: "bg-primary text-primary-foreground",
        reason: "Stock is low, and what's left is expiring soon. Order more, and try to sell/move the old stock fast.",
      };
    }
    if (isLow) {
      return {
        overall: "TIME TO REORDER",
        badgeClass: "bg-destructive text-destructive-foreground",
        reason: "Quantity has dropped below the reorder point. It's time to restock.",
      };
    }
    if (isOver && isExpUrgent) {
      return {
        overall: "CLEAR STOCK + STOP ORDERING",
        badgeClass: "bg-primary text-primary-foreground",
        reason: "There's too much stock and it's expiring soon. Stop new orders and clear this out.",
      };
    }
    if (isOver) {
      return {
        overall: "REVIEW STOCK LEVEL",
        badgeClass: "bg-secondary text-foreground",
        reason: "Quantity is higher than the maximum limit set for this item.",
      };
    }
    if (isExpUrgent) {
      return {
        overall: "TAKE EXPIRY ACTION",
        badgeClass: "bg-destructive text-destructive-foreground",
        reason: "Stock quantity is fine, but this batch is expiring soon — take action before it goes to waste.",
      };
    }
    return {
      overall: "ALL GOOD",
      badgeClass: "bg-accent text-accent-foreground",
      reason: "Stock level and expiry are both within normal, healthy limits.",
    };
  }, [simStockStatus, simExpiryStatus]);

  return (
    <div className="space-y-6 max-w-[1400px] pb-24 text-foreground font-body">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase mb-2">
            <span>Rules & Settings</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            INVENTORY RULES
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Set simple rules for how stock is tracked, changed, and flagged — no technical knowledge needed.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap font-mono">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs uppercase font-bold cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset to Default</span>
          </button>

          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              className="px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs uppercase font-bold cursor-pointer"
            >
              <span>Undo Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || !!validationError}
            className={`flex items-center gap-2 text-xs uppercase font-bold px-5 py-2.5 rounded-full transition-all shadow-none ${
              hasUnsavedChanges && !validationError
                ? "bg-primary text-primary-foreground hover:bg-[#567C8D] cursor-pointer active:scale-95"
                : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Save className="size-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Validation Warning */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-destructive border border-[#2F4156] text-primary-foreground text-xs font-mono font-bold flex items-center gap-3">
          <AlertCircle className="size-4 text-primary-foreground shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Stock Control */}
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <Boxes className="size-5 text-foreground" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Stock Changes</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Control who can change stock numbers and how.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Can stock go below zero?
                </label>
                <select
                  value={policies.negativeStockAllowed}
                  onChange={(e) => setPolicies({ ...policies, negativeStockAllowed: e.target.value as "Blocked" | "Allowed" })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                >
                  <option value="Blocked">No — stop it (Recommended)</option>
                  <option value="Allowed">Yes — allow negative stock</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Who approves a stock change?
                </label>
                <select
                  value={policies.adjustmentApproval}
                  onChange={(e) => setPolicies({ ...policies, adjustmentApproval: e.target.value as any })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                >
                  <option value="Manager Approval">Manager must approve</option>
                  <option value="Admin Approval">Admin must approve</option>
                  <option value="No Approval">No approval needed (auto)</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2 font-mono text-xs">
              <span className="text-muted-foreground uppercase font-bold block">
                When changing stock, staff must pick a reason like:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ADJUSTMENT_REASONS.map((r) => (
                  <span key={r} className="px-2.5 py-1 rounded-full bg-muted border border-border text-foreground text-[11px] font-bold">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Thresholds */}
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <Sliders className="size-5 text-foreground" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Stock Limits</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Set when stock is too low and when it's too much.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Reorder when stock drops to ({policies.defaultUnit})
                </label>
                <input
                  type="number"
                  min="0"
                  value={policies.defaultReorderLevel}
                  onChange={(e) => setPolicies({ ...policies, defaultReorderLevel: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Maximum stock allowed ({policies.defaultUnit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={policies.defaultMaximumStock}
                  onChange={(e) => setPolicies({ ...policies, defaultMaximumStock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2 font-mono text-xs">
              <span className="text-muted-foreground uppercase font-bold block">What each stock level means:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2.5 rounded-xl bg-popover border border-border">
                  <p className="font-bold text-foreground uppercase">Low</p>
                  <p className="text-muted-foreground mt-0.5 font-bold">≤ {policies.defaultReorderLevel}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-accent text-accent-foreground">
                  <p className="font-bold uppercase">Normal</p>
                  <p className="text-foreground/80 mt-0.5 font-bold">{policies.defaultReorderLevel + 1}–{policies.defaultMaximumStock}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-popover border border-border">
                  <p className="font-bold text-foreground uppercase">Too Much</p>
                  <p className="text-muted-foreground mt-0.5 font-bold">&gt; {policies.defaultMaximumStock}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
                  <p className="font-bold uppercase">Critical</p>
                  <p className="text-primary-foreground/80 mt-0.5 font-bold">≤ 5 units</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulation */}
        <div className="lg:col-span-5 space-y-6 font-mono text-xs">
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4" />
                  <span>Try It Out</span>
                </span>
                <p className="text-[10.5px] text-muted-foreground font-bold mt-1">
                  Move the sliders below to see how your rules react to a real item.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold font-display uppercase text-foreground text-sm block">Amul Milk 1L</span>
                  <p className="text-[10.5px] text-muted-foreground font-bold">SKU: MILK-WHL-1L</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSimIsExpiryTracked(!simIsExpiryTracked)}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-bold uppercase cursor-pointer ${
                    simIsExpiryTracked
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {simIsExpiryTracked ? "Has Expiry" : "No Expiry"}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground uppercase">How much stock:</span>
                  <span className="font-bold text-foreground">{simQty} units</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="140"
                  value={simQty}
                  onChange={(e) => setSimQty(parseInt(e.target.value) || 0)}
                  className="w-full accent-primary cursor-pointer h-1.5 bg-secondary rounded-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-secondary/50 border border-border space-y-1">
                  <span className="text-muted-foreground uppercase text-[10.5px] font-bold block">Reorder At:</span>
                  <input
                    type="number"
                    min="0"
                    value={simReorderLevel}
                    onChange={(e) => setSimReorderLevel(parseInt(e.target.value) || 0)}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-bold text-foreground outline-none"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-secondary/50 border border-border space-y-1">
                  <span className="text-muted-foreground uppercase text-[10.5px] font-bold block">Days Left to Expire:</span>
                  {simIsExpiryTracked ? (
                    <input
                      type="number"
                      min="0"
                      value={simExpiryDays ?? 14}
                      onChange={(e) => setSimExpiryDays(parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-bold text-foreground outline-none"
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground pt-1 font-bold">N/A</p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase font-bold">Stock:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase ${simStockStatus.badgeClass}`}>
                    {simStockStatus.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase font-bold">Expiry:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase ${simExpiryStatus.badgeClass}`}>
                    {simExpiryStatus.label}
                  </span>
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px] font-bold block">What should you do:</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${simEvaluation.badgeClass}`}>
                    {simEvaluation.overall}
                  </span>
                  <p className="text-[11px] text-muted-foreground font-body pt-1 leading-normal">
                    {simEvaluation.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none space-y-4 text-foreground">
            <h3 className="font-display text-xl font-bold uppercase text-foreground">Reset everything?</h3>
            <p className="text-xs text-muted-foreground font-body">
              This will undo all your changes and bring back ERN's original default settings.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-full bg-secondary text-foreground uppercase font-bold cursor-pointer hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-bold cursor-pointer hover:bg-[#567C8D]"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}