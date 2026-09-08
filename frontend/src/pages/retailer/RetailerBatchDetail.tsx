import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Layers,
  Barcode,
  AlertTriangle,
  Store,
  TrendingDown,
  Shield,
} from "lucide-react";
import { inventoryStore } from "@/lib/inventoryStore";
import type { BatchItem } from "@/types/inventory";

const EXPIRY_BADGE: Record<string, string> = {
  Safe: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  Warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  "High Risk": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  Critical: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
  Expired: "bg-muted text-muted-foreground border border-border",
  "Not Applicable": "bg-secondary text-muted-foreground border border-border",
};

const BATCH_STATUS_BADGE: Record<BatchItem["status"], string> = {
  Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  Quarantined: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  Depleted: "bg-muted text-muted-foreground border border-border",
};

export default function RetailerBatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const batch = useMemo((): BatchItem | undefined => {
    const all = inventoryStore.getStoreBatches();
    return all.find((b) => b.id === id || b.batchNo === id);
  }, [id]);

  if (!batch) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Batch Not Found</h2>
        <p className="text-sm text-muted-foreground">Batch {id} was not found in the inventory.</p>
        <Link
          to="/retailer/batches"
          className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold font-mono hover:opacity-90"
        >
          Back to Batches
        </Link>
      </div>
    );
  }

  const pctRemaining = batch.qtyTotal > 0 ? (batch.qtyLeft / batch.qtyTotal) * 100 : 0;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/retailer/batches")}
          className="p-2 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground cursor-pointer"
          aria-label="Back to Batches"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="font-display text-xl font-black text-foreground flex items-center gap-2">
            <Barcode className="size-5 text-primary" />
            Batch #{batch.batchNo}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">{batch.productName} · {batch.store}</p>
        </div>
      </div>

      {/* Status Row */}
      <div className="flex flex-wrap gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${BATCH_STATUS_BADGE[batch.status]}`}>
          {batch.status}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${EXPIRY_BADGE[batch.expiryStatus]}`}>
          {batch.expiryStatus}
        </span>
        {batch.daysRemaining != null && (
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            batch.daysRemaining <= 3
              ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
              : batch.daysRemaining <= 7
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
              : "bg-secondary text-muted-foreground border-border"
          }`}>
            {batch.daysRemaining} days remaining
          </span>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Qty", value: batch.qtyTotal, icon: Layers },
          { label: "Remaining", value: batch.qtyLeft, icon: CheckCircle2 },
          { label: "Sold", value: batch.qtyTotal - batch.qtyLeft, icon: TrendingDown },
          { label: "% Left", value: `${Math.round(pctRemaining)}%`, icon: Shield },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <s.icon className="size-3" />
              {s.label}
            </p>
            <p className="font-black text-2xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Stock Remaining</span>
          <span className="font-bold text-foreground">{batch.qtyLeft} / {batch.qtyTotal}</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pctRemaining <= 20 ? "bg-rose-500" : pctRemaining <= 50 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${pctRemaining}%` }}
          />
        </div>
      </div>

      {/* Batch Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Package className="size-4 text-primary" />
            Batch Information
          </h2>
          <dl className="space-y-2 text-xs">
            {[
              { term: "Batch Number", value: batch.batchNo },
              { term: "Product", value: batch.productName },
              { term: "Category", value: batch.category },
              { term: "SKU", value: batch.sku },
              { term: "Barcode", value: batch.barcode },
              { term: "Store", value: batch.store },
            ].map((row) => (
              <div key={row.term} className="flex justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                <dt className="text-muted-foreground font-mono">{row.term}</dt>
                <dd className="font-bold text-foreground text-right max-w-[60%] break-all">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Dates & Expiry
          </h2>
          <dl className="space-y-2 text-xs">
            {[
              { term: "Manufactured", value: batch.mfgDate },
              { term: "Expires", value: batch.expiryDate },
              { term: "Days Remaining", value: batch.daysRemaining != null ? `${batch.daysRemaining} days` : "—" },
              { term: "Expiry Status", value: batch.expiryStatus },
              { term: "Batch Status", value: batch.status },
            ].map((row) => (
              <div key={row.term} className="flex justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                <dt className="text-muted-foreground font-mono">{row.term}</dt>
                <dd className={`font-bold text-right ${
                  row.term === "Days Remaining" && batch.daysRemaining != null
                    ? batch.daysRemaining <= 3 ? "text-rose-500" : batch.daysRemaining <= 7 ? "text-amber-500" : "text-foreground"
                    : "text-foreground"
                }`}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Warning */}
      {batch.daysRemaining != null && batch.daysRemaining <= 3 && batch.status === "Active" && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
          <AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-500">Urgent: Batch Expiring in {batch.daysRemaining} Day{batch.daysRemaining !== 1 ? "s" : ""}</p>
            <p className="text-muted-foreground mt-0.5">
              Consider applying a clearance discount or moving stock to the rescue deals section to avoid waste.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Link
          to="/retailer/clearance"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 cursor-pointer"
        >
          <Store className="size-3.5" />
          Move to Clearance
        </Link>
        <Link
          to="/retailer/batches"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-mono font-bold hover:bg-muted cursor-pointer"
        >
          <Layers className="size-3.5" />
          All Batches
        </Link>
      </div>
    </div>
  );
}
