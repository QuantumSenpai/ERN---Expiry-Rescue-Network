import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Download,
  Check,
} from "lucide-react";
import { useState } from "react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (count: number) => void;
}

export default function BulkImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: BulkImportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName] = useState("enterprise_inventory_q2.csv");
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleSimulateUpload = () => {
    setStep(2);
  };

  const handleExecuteImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setStep(3);
      onImportComplete?.(248);
    }, 1500);
  };

  const handleReset = () => {
    setStep(1);
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
            className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/80 flex items-start justify-between bg-secondary/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] font-mono font-bold">
                    BULK INGESTION
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Step {step} of 3</span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mt-1">
                  Import Inventory
                </h2>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Bulk upload products, initial stock, and optional expiry tracking metadata.
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
            <div className="p-6">
              {/* STEP 1: Upload */}
              {step === 1 && (
                <div className="space-y-5">
                  <div
                    onClick={handleSimulateUpload}
                    className="p-8 border-2 border-dashed border-border hover:border-primary/60 rounded-2xl bg-secondary/20 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                  >
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="size-7" />
                    </div>
                    <p className="font-display font-bold text-sm text-foreground">
                      Click to upload CSV or Excel spreadsheet
                    </p>
                    <p className="text-xs text-muted-foreground font-sans mt-1">
                      Supports .csv, .xlsx, and .xls formats up to 25MB
                    </p>
                    <span className="mt-4 px-3 py-1 rounded-lg bg-card border border-border text-xs font-mono font-semibold text-primary">
                      Browse Files
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground font-mono">Standard Catalog Template</p>
                      <p className="text-[11px] text-muted-foreground">Pre-formatted columns for non-expiry & expiry stock</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs text-primary font-mono font-bold hover:underline cursor-pointer">
                      <Download className="size-3.5" />
                      <span>Download Sample</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Preview & Validation */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="size-5 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-foreground font-mono">{fileName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">248 rows detected</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10.5px] font-mono font-bold">
                      Validation Passed
                    </span>
                  </div>

                  {/* Validation Summary */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/80">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Valid Records</span>
                      <p className="text-base font-bold text-foreground mt-0.5">248</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/80">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Expiry-Tracked</span>
                      <p className="text-base font-bold text-amber-500 mt-0.5">64</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/80">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Non-Expiry</span>
                      <p className="text-base font-bold text-blue-400 mt-0.5">184</p>
                    </div>
                  </div>

                  {/* Validation Rules Preview Table */}
                  <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/80 space-y-2 text-xs">
                    <p className="font-mono font-bold text-[11px] text-muted-foreground uppercase">
                      Automated Pre-Flight Check:
                    </p>
                    <div className="space-y-1.5 text-muted-foreground font-mono text-[11px]">
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="size-3.5 text-emerald-500 shrink-0" />
                        <span>All 248 SKUs are unique within organization scope</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="size-3.5 text-emerald-500 shrink-0" />
                        <span>Expiry Date mapped only for Perishable / Pharma items</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="size-3.5 text-emerald-500 shrink-0" />
                        <span>Non-expiry inventory correctly assigned to N/A shelf life</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Complete */}
              {step === 3 && (
                <div className="py-6 text-center space-y-3">
                  <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    248 Products Ingested Successfully
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans max-w-sm mx-auto">
                    Your complete catalog is now live in the inventory system with expiry monitoring active where applicable.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border bg-secondary/20 flex items-center justify-between">
              {step === 1 && (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground font-mono text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSimulateUpload}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Proceed to Preview</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground font-mono text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleExecuteImport}
                    disabled={isImporting}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isImporting ? "Ingesting Catalog..." : "Commit 248 Products"}
                    {!isImporting && <ArrowRight className="size-3.5" />}
                  </button>
                </>
              )}

              {step === 3 && (
                <div className="w-full flex justify-end">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                  >
                    Done & View Inventory
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
