import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Layers,
  MapPin,
  Barcode,
  Store,
  TrendingDown,
  Plus,
} from "lucide-react";
import { useLiveInventory } from "@/lib/inventoryStore";
import { formatINR } from "@/lib/pricingService";

const EXPIRY_BADGE: Record<string, string> = {
  Safe: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  Warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  "High Risk": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  Critical: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
  Expired: "bg-muted text-muted-foreground border border-border",
  "Not Applicable": "bg-secondary text-muted-foreground border border-border",
};

const STOCK_BADGE: Record<string, string> = {
  "In Stock": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  "Low Stock": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  "Out of Stock": "bg-rose-500/10 text-rose-500 border border-rose-500/20",
};

export default function RetailerInventoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inventory } = useLiveInventory();

  const item = useMemo(
    () => inventory.find((i) => String(i.id) === id),
    [inventory, id]
  );

  if (!item) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Inventory Item Not Found</h2>
        <p className="text-sm text-muted-foreground">Inventory ID {id} was not found.</p>
        <Link
          to="/retailer/inventory"
          className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold font-mono hover:opacity-90"
        >
          Back to Inventory
        </Link>
      </div>
    );
  }

  const reserved = Math.round(item.quantity * 0.15);
  const distributed = Math.round(item.quantity * 0.1);
  const available = Math.max(0, item.quantity - reserved - distributed);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/retailer/inventory")}
          className="p-2 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground cursor-pointer"
          aria-label="Back to Inventory"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="font-display text-xl font-black text-foreground">{item.name}</h1>
          <p className="text-xs text-muted-foreground font-mono">
            {item.brand} · {item.store} · SKU: {item.sku}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Stock", value: `${item.quantity} ${item.unit}`, icon: Layers },
          { label: "Available", value: `${available} ${item.unit}`, icon: CheckCircle2 },
          { label: "Reserved", value: `${reserved} ${item.unit}`, icon: Clock },
          { label: "Stock Value", value: formatINR(item.stockValue), icon: TrendingDown },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <s.icon className="size-3" />
              {s.label}
            </p>
            <p className="font-black text-lg text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Item Details */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Package className="size-4 text-primary" />
            Inventory Item Details
          </h2>
          <dl className="space-y-2 text-xs">
            {[
              { term: "Category", value: item.category },
              { term: "Brand", value: item.brand },
              { term: "SKU", value: item.sku },
              { term: "Barcode", value: item.barcode },
              { term: "Unit", value: item.unit },
              { term: "Unit Price", value: formatINR(item.unitPrice) },
              { term: "Stock Status", value: item.stockStatus, badge: STOCK_BADGE[item.stockStatus] },
              { term: "Expiry Tracking", value: item.expiryTrackingEnabled ? "Enabled" : "Disabled" },
              { term: "Min. Stock Level", value: `${item.minStockLevel} ${item.unit}` },
            ].map((row) => (
              <div key={row.term} className="flex items-center justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                <dt className="text-muted-foreground font-mono">{row.term}</dt>
                {row.badge ? (
                  <dd className={`px-2.5 py-0.5 rounded-full font-mono font-bold whitespace-nowrap inline-flex items-center justify-center ${row.badge}`}>{row.value}</dd>
                ) : (
                  <dd className="font-bold text-foreground text-right">{row.value}</dd>
                )}
              </div>
            ))}
          </dl>
        </div>

        {/* Batch & Expiry Details */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Batch & Expiry
          </h2>

          {!item.expiryTrackingEnabled ? (
            <div className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Expiry tracking is not enabled for this item.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-border bg-background">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Barcode className="size-4 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground font-mono">{item.batchNo || "—"}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    EXPIRY_BADGE[item.expiryStatus] || EXPIRY_BADGE["Safe"]
                  }`}>
                    {item.expiryStatus}
                  </span>
                </div>
                <dl className="space-y-1 text-xs">
                  {[
                    { term: "Mfg Date", value: item.mfgDate || "—" },
                    { term: "Expiry Date", value: item.expiryDate || "—" },
                    { term: "Days Remaining", value: item.daysRemaining != null ? `${item.daysRemaining} days` : "—" },
                    { term: "Aisle Location", value: item.aisleLocation || "—" },
                  ].map((row) => (
                    <div key={row.term} className="flex justify-between gap-2">
                      <dt className="text-muted-foreground font-mono">{row.term}</dt>
                      <dd className={`font-bold text-right ${
                        row.term === "Days Remaining" && typeof item.daysRemaining === "number"
                          ? item.daysRemaining <= 3 ? "text-rose-500" : item.daysRemaining <= 7 ? "text-amber-500" : "text-foreground"
                          : "text-foreground"
                      }`}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Stock Distribution */}
              <div className="p-3 rounded-xl border border-border bg-background">
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                  <Store className="size-3" /> Stock Distribution
                </p>
                {[
                  { label: "Available", value: available, color: "bg-emerald-500" },
                  { label: "Reserved", value: reserved, color: "bg-amber-500" },
                  { label: "In Transit", value: distributed, color: "bg-sky-500" },
                ].map((s) => (
                  <div key={s.label} className="mb-1.5">
                    <div className="flex justify-between text-[11px] font-mono mb-0.5">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-bold text-foreground">{s.value} {item.unit}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full`}
                        style={{ width: `${item.quantity > 0 ? (s.value / item.quantity) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      {item.locationDistribution && item.locationDistribution.length > 0 && (
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            Location Distribution
          </h2>
          <div className="flex flex-wrap gap-2">
            {item.locationDistribution.map((loc) => (
              <div
                key={loc.location}
                className="px-3 py-2 rounded-xl border border-border bg-background text-xs"
              >
                <p className="font-bold text-foreground">{loc.location}</p>
                <p className="text-muted-foreground font-mono">{loc.quantity} {item.unit}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Link
          to="/retailer/add-product"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Add Stock
        </Link>
        <Link
          to="/retailer/inventory"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-mono font-bold hover:bg-muted cursor-pointer"
        >
          <Layers className="size-3.5" />
          All Inventory
        </Link>
      </div>
    </div>
  );
}
