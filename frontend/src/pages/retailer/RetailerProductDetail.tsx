import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Tag,
  ShieldCheck,
  Layers,
  Clock,
  Barcode,
  AlertTriangle,
  CheckCircle2,
  Store,
  Plus,
} from "lucide-react";
import { MASTER_PRODUCTS } from "@/data/mockInventory";
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

export default function RetailerProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inventory } = useLiveInventory();

  const product = useMemo(
    () => MASTER_PRODUCTS.find((p) => String(p.id) === id),
    [id]
  );

  const inventoryItems = useMemo(
    () => inventory.filter((item) => String(item.productId) === id || item.name === product?.name),
    [inventory, id, product]
  );

  if (!product) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Product Not Found</h2>
        <p className="text-sm text-muted-foreground">Product ID {id} was not found.</p>
        <Link
          to="/retailer/products"
          className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold font-mono hover:opacity-90"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const totalStock = inventoryItems.reduce((sum, i) => sum + i.quantity, 0) || product.quantity;
  const stockVal = inventoryItems.reduce((sum, i) => sum + i.stockValue, 0) || product.price * product.quantity;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/retailer/products")}
          className="p-2 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground cursor-pointer"
          aria-label="Back to Products"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="font-display text-xl font-black text-foreground">{product.name}</h1>
          <p className="text-xs text-muted-foreground font-mono">{product.brand} · SKU: {product.sku}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Stock", value: `${totalStock} ${product.unit}`, icon: Layers },
          { label: "Stock Value", value: formatINR(stockVal), icon: Tag },
          { label: "Active Batches", value: product.batchesCount || inventoryItems.length, icon: ShieldCheck },
          { label: "Min. Stock Level", value: `${product.minStockLevel} ${product.unit}`, icon: AlertTriangle },
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
        {/* Product Info */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Package className="size-4 text-primary" />
            Product Information
          </h2>
          <dl className="space-y-2 text-xs">
            {[
              { term: "Category", value: product.category },
              { term: "Brand", value: product.brand },
              { term: "Product Type", value: product.productType },
              { term: "SKU", value: product.sku },
              { term: "Barcode", value: product.barcode },
              { term: "Unit", value: product.unit },
              { term: "Price", value: formatINR(product.price) },
              { term: "Stock Status", value: product.stockStatus, badge: STOCK_BADGE[product.stockStatus] },
              { term: "Expiry Tracking", value: product.expiryTrackingEnabled ? "Enabled" : "Disabled" },
              { term: "Store", value: product.store },
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

        {/* Inventory Items (batches by store) */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Store className="size-4 text-primary" />
              Stock by Store / Batch
            </h2>
            <Link
              to="/retailer/add-product"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 cursor-pointer"
            >
              <Plus className="size-3" />
              Add Stock
            </Link>
          </div>

          {inventoryItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Layers className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No inventory batches found for this product.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {inventoryItems.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-border bg-background space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Barcode className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-mono font-bold text-foreground truncate">
                        {item.batchNo || "—"}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      EXPIRY_BADGE[item.expiryStatus] || EXPIRY_BADGE["Safe"]
                    }`}>
                      {item.expiryStatus}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3" />
                      {item.quantity} {item.unit}
                    </span>
                    {item.expiryDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        Exp: {item.expiryDate}
                      </span>
                    )}
                    {item.daysRemaining != null && (
                      <span className={`whitespace-nowrap inline-flex items-center gap-1 font-bold ${item.daysRemaining <= 3 ? "text-rose-500" : item.daysRemaining <= 7 ? "text-amber-500" : ""}`}>
                        {item.daysRemaining}D LEFT
                      </span>
                    )}
                    <span>{item.aisleLocation || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      STOCK_BADGE[item.stockStatus] || STOCK_BADGE["In Stock"]
                    }`}>
                      {item.stockStatus}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {formatINR(item.unitPrice)}/{item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Link
          to="/retailer/add-product"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Add New Stock
        </Link>
        <Link
          to="/retailer/batches"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-mono font-bold hover:bg-muted cursor-pointer"
        >
          <ShieldCheck className="size-3.5" />
          View All Batches
        </Link>
        <Link
          to="/retailer/inventory"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-mono font-bold hover:bg-muted cursor-pointer"
        >
          <CheckCircle2 className="size-3.5" />
          Inventory View
        </Link>
      </div>
    </div>
  );
}
