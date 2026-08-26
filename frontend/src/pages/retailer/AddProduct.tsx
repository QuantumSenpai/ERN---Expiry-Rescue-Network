import { useState, type FormEvent } from "react";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import {
  Plus,
  Barcode,
  Layers,
  Sparkles,
  Package,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STORES_DATA } from "@/data/storesData";

const CATEGORIES = [
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Healthcare",
  "Electronics",
  "Furniture",
  "Stationery",
  "Packaged Goods",
  "General Merchandise",
];

export default function AddProduct() {
  const navigate = useNavigate();

  // Core Product Info
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("Dairy");
  const [store, setStore] = useState("Main Branch");
  const [quantity, setQuantity] = useState("50");
  const [minStockLevel, setMinStockLevel] = useState("15");
  const [unit, setUnit] = useState("Pcs");
  const [price, setPrice] = useState("120");

  // Expiry Intelligence Switch
  const [expiryTrackingEnabled, setExpiryTrackingEnabled] = useState(true);

  // Expiry & Batch Fields (Active ONLY when expiryTrackingEnabled is true)
  const [batchNo, setBatchNo] = useState("");
  const [mfgDate, setMfgDate] = useState(() =>
    new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState(() =>
    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [warningDiscount, setWarningDiscount] = useState("20");
  const [urgentDiscount, setUrgentDiscount] = useState("40");
  const [criticalDiscount, setCriticalDiscount] = useState("60");

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate("/retailer/inventory");
    }, 1200);
  };

  // Simulate scanning perishable vs non-perishable product
  const handleSimulateScanPerishable = () => {
    setExpiryTrackingEnabled(true);
    setName("Amul Taaza Homogenized Milk 1L");
    setBrand("Amul");
    setSku("MILK-" + Math.floor(100 + Math.random() * 900));
    setBarcode("890" + Math.floor(1000000000 + Math.random() * 9000000000));
    setCategory("Dairy");
    setPrice("60");
    setUnit("Pcs");
    setQuantity("60");
    setMinStockLevel("20");
    setBatchNo("M-" + Math.floor(100 + Math.random() * 900));
    setMfgDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setExpiryDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  };

  const handleSimulateScanNonExpiry = () => {
    setExpiryTrackingEnabled(false);
    setName("Ergonomic Office Mesh Chair Pro");
    setBrand("Featherlite");
    setSku("CHR-" + Math.floor(100 + Math.random() * 900));
    setBarcode("890" + Math.floor(1000000000 + Math.random() * 9000000000));
    setCategory("Furniture");
    setPrice("6500");
    setUnit("Units");
    setQuantity("25");
    setMinStockLevel("5");
    setBatchNo("");
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Product Ingestion & Stock Entry
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Register new general inventory items or configure smart expiry & batch tracking
          </p>
        </div>

        {/* Quick Simulations */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateScanPerishable}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground text-xs font-mono font-semibold hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>Scan Perishable Item</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateScanNonExpiry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground text-xs font-mono font-semibold hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs"
          >
            <Package className="size-3.5 text-primary" />
            <span>Scan Non-Expiry Item</span>
          </button>
        </div>
      </div>

      {submitted && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>
            Product "{name}" successfully added to inventory! Redirecting to All Inventory...
          </span>
        </div>
      )}

      <LiquidGlassCard className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Product Identification */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase font-bold text-foreground tracking-wider pb-1 border-b border-border">
              1. Product Master Details
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Product Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-mono text-foreground font-semibold">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ergonomic Office Chair or Amul Taaza Milk 1L"
                  required
                  className="w-full bg-card/80 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Brand */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-foreground font-semibold">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Dell, Amul, Featherlite"
                  className="w-full bg-card/80 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* SKU */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-foreground font-semibold">
                  SKU Code *
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. CHR-001 or MILK-001"
                  required
                  className="w-full bg-card/80 border border-border rounded-xl px-3.5 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Barcode */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-foreground font-semibold">
                  Barcode / EAN *
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-2.5 size-4 text-primary" />
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 8901234567890"
                    required
                    className="w-full bg-card/80 border border-border rounded-xl pl-9 pr-3.5 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-foreground font-semibold">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-card/80 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-card text-foreground">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Stock, Pricing & Outlet Location */}
          <div className="space-y-4 pt-2">
            <h2 className="text-xs font-mono uppercase font-bold text-foreground tracking-wider pb-1 border-b border-border">
              2. Inventory, Pricing & Store Branch
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Unit Price */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-foreground font-semibold">
                  Unit Price (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full bg-card/80 border border-border rounded-xl px-3.5 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Initial Quantity & Unit */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-foreground font-semibold">
                  Initial Stock Quantity *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-2/3 bg-card/80 border border-border rounded-xl px-3.5 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-1/3 bg-card/80 border border-border rounded-xl px-2 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Units">Units</option>
                    <option value="Strips">Strips</option>
                    <option value="Kg">Kg</option>
                    <option value="Litres">Litres</option>
                  </select>
                </div>
              </div>

              {/* Min Stock Alert Level */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-foreground font-semibold">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={minStockLevel}
                  onChange={(e) => setMinStockLevel(e.target.value)}
                  className="w-full bg-card/80 border border-border rounded-xl px-3.5 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Store Location */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-foreground font-semibold">
                  Store Location *
                </label>
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="w-full bg-card/80 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {STORES_DATA.map((s) => (
                    <option key={s.id} value={s.name} className="bg-card text-foreground">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: EXPIRY TRACKING TOGGLE (CORE CONCEPT) */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Expiry Intelligence & Batch Tracking
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Enable this option for perishables, medicines, cosmetics, or date-sensitive goods.
                  </p>
                </div>
              </div>

              {/* ON / OFF Switch */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setExpiryTrackingEnabled(false)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                    !expiryTrackingEnabled
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  OFF (Non-Expiry)
                </button>
                <button
                  type="button"
                  onClick={() => setExpiryTrackingEnabled(true)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                    expiryTrackingEnabled
                      ? "bg-purple-600 text-snow-white shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ON (Track Expiry)
                </button>
              </div>
            </div>

            {/* EXPIRY-SPECIFIC FIELDS (Shown ONLY when Expiry Tracking is ON) */}
            {expiryTrackingEnabled ? (
              <div className="pt-3 border-t border-border/80 space-y-4 animate-in fade-in duration-200">
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Batch Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-foreground font-semibold">
                      Initial Batch Number *
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-2.5 size-4 text-primary" />
                      <input
                        type="text"
                        value={batchNo}
                        onChange={(e) => setBatchNo(e.target.value)}
                        placeholder="e.g. B-1092"
                        required={expiryTrackingEnabled}
                        className="w-full bg-card/80 border border-border rounded-xl pl-9 pr-3.5 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Manufacturing Date */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-foreground font-semibold">
                      Manufacturing Date
                    </label>
                    <input
                      type="date"
                      value={mfgDate}
                      onChange={(e) => setMfgDate(e.target.value)}
                      className="w-full bg-card/80 border border-border rounded-xl px-3.5 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-foreground font-semibold">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required={expiryTrackingEnabled}
                      className="w-full bg-card/80 border border-border rounded-xl px-3.5 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Automated Clearance Tier Configuration */}
                <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
                  <span className="text-xs font-mono font-bold text-foreground block">
                    Automated Clearance Discount Rules:
                  </span>
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-primary font-bold">
                        🟡 30-Day Warning:
                      </span>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={warningDiscount}
                        onChange={(e) => setWarningDiscount(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-2.5 py-1 text-xs font-mono"
                      />
                      <span className="text-[9px] text-muted-foreground">% Dynamic Markdown</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-amber-600 font-bold">
                        🟠 14-Day Urgent:
                      </span>
                      <input
                        type="number"
                        min="10"
                        max="70"
                        value={urgentDiscount}
                        onChange={(e) => setUrgentDiscount(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-2.5 py-1 text-xs font-mono"
                      />
                      <span className="text-[9px] text-muted-foreground">% Dynamic Markdown</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-destructive font-bold">
                        🔴 7-Day Critical Flash:
                      </span>
                      <input
                        type="number"
                        min="20"
                        max="90"
                        value={criticalDiscount}
                        onChange={(e) => setCriticalDiscount(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-2.5 py-1 text-xs font-mono"
                      />
                      <span className="text-[9px] text-muted-foreground">% Clearance Flash</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-secondary/20 border border-border text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span>
                  Non-expiry item selected. This product will be tracked as standard inventory
                  without expiry risk alerts or markdown countdowns.
                </span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => navigate("/retailer/products")}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="size-4" />
              Save Product & Ingest Stock
            </button>
          </div>
        </form>
      </LiquidGlassCard>
    </div>
  );
}
