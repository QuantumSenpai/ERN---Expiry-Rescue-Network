import { X, Download, RefreshCw, FileSpreadsheet, Layers, ShieldCheck, Check } from "lucide-react";
import { useState } from "react";

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkActionsModal({ isOpen, onClose }: BulkActionsModalProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (name: string, msg: string) => {
    setActiveAction(name);
    setTimeout(() => {
      setActiveAction(null);
      setSuccessMessage(msg);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-card border border-primary/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Layers className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">
                Bulk Inventory Operations
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Execute enterprise-wide batch actions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2 animate-in fade-in">
            <div className="size-10 rounded-full bg-emerald-500 text-snow-white flex items-center justify-center mx-auto">
              <Check className="size-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">{successMessage}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() =>
                handleAction("export", "Inventory CSV dataset compiled and exported.")
              }
              disabled={!!activeAction}
              className="w-full p-3 rounded-xl bg-secondary/40 border border-border hover:bg-secondary hover:border-primary/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="size-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Export Inventory Master (CSV)</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Download full product catalog with expiry & lot logs
                  </p>
                </div>
              </div>
              <Download className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            <button
              onClick={() =>
                handleAction("audit", "Automated system audit completed for all 9 SKUs.")
              }
              disabled={!!activeAction}
              className="w-full p-3 rounded-xl bg-secondary/40 border border-border hover:bg-secondary hover:border-primary/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <RefreshCw
                  className={`size-4 text-primary ${
                    activeAction === "audit" ? "animate-spin" : ""
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-foreground">Run Expiry Intelligence Audit</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Recalculate shelf risk scores across all active locations
                  </p>
                </div>
              </div>
              <ShieldCheck className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
