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
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const CATEGORIES = [
  "Dairy",
  "Bakery",
  "Beverages",
  "Packaged Goods",
  "Produce",
  "Deli & Snacks",
  "Snacks",
  "General Merchandise",
];

export default function AddProduct() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("Dairy");
  const [quantity, setQuantity] = useState("50");
  const [price, setPrice] = useState("120");
  const [imageUrl, setImageUrl] = useState("");

  const [batchNo, setBatchNo] = useState("");
  const [mfgDate, setMfgDate] = useState(() =>
    new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState(() =>
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanQty = parseInt(quantity, 10);
    const cleanPrice = parseFloat(price);

    if (!cleanName || !cleanPrice || cleanPrice <= 0 || !cleanQty || cleanQty <= 0 || !expiryDate) {
      setError("Please complete all required product metrics.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.listings.create({
        item_name: cleanName,
        category,
        qty: cleanQty,
        expiry_date: expiryDate,
        orig_price: cleanPrice,
        image_url: imageUrl.trim() || undefined,
      });

      showToast(`Listing created! Rescued price set to ₹${res.discount_price.toFixed(2)} (${res.days_left}d shelf-life).`);
      navigate("/retailer/inventory");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create product listing.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateScanPerishable = () => {
    setName("Amul Taaza Homogenized Milk 1L");
    setBrand("Amul");
    setSku("MILK-" + Math.floor(100 + Math.random() * 900));
    setBarcode("890" + Math.floor(1000000000 + Math.random() * 9000000000));
    setCategory("Dairy");
    setPrice("60");
    setQuantity("60");
    setBatchNo("M-" + Math.floor(100 + Math.random() * 900));
    setImageUrl("https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80");
    setMfgDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setExpiryDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  };

  const handleSimulateScanBakery = () => {
    setName("Artisan Whole Wheat Sourdough Loaf");
    setBrand("Harvest Bakes");
    setSku("BK-" + Math.floor(100 + Math.random() * 900));
    setBarcode("890" + Math.floor(1000000000 + Math.random() * 9000000000));
    setCategory("Bakery");
    setPrice("140");
    setQuantity("35");
    setBatchNo("BK-" + Math.floor(100 + Math.random() * 900));
    setImageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80");
    setMfgDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setExpiryDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 text-foreground font-body">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>STOCK INGESTION CONSOLE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground leading-[1.08] tracking-[-0.025em]">
            Add Product & Lot
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Log incoming batches to activate automated FEFO alerts and dynamic rescue liquidation.
          </p>
        </div>

        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateScanPerishable}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase transition-all cursor-pointer min-h-[44px]"
          >
            <Barcode className="size-4" />
            <span>Simulate Scan (Dairy)</span>
          </button>
          <button
            type="button"
            onClick={handleSimulateScanBakery}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border hover:border-primary text-foreground text-xs font-mono font-bold uppercase transition-all cursor-pointer min-h-[44px]"
          >
            <Barcode className="size-4" />
            <span>Simulate Scan (Bakery)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono flex items-start gap-3">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span className="font-sans text-sm">{error}</span>
        </div>
      )}

      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <LiquidGlassCard className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <Package className="size-5 text-foreground" />
            <h2 className="font-display font-medium text-lg uppercase tracking-wider">
              Product Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-muted-foreground uppercase font-semibold block">
                Product Title / Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Pasteurized Cow Milk 1L"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-sans text-sm outline-none"
              />
            </div>

            
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase font-semibold block">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-sans text-sm outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase font-semibold block">
                Brand / Supplier
              </label>
              <input
                type="text"
                placeholder="e.g. Metro Fresh Farms"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-sans text-sm outline-none"
              />
            </div>

            
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase font-semibold block">
                SKU / Internal Code
              </label>
              <input
                type="text"
                placeholder="SKU-8842"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-mono text-sm outline-none"
              />
            </div>

            
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase font-semibold block">
                Barcode / EAN-13
              </label>
              <input
                type="text"
                placeholder="8901234567890"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-mono text-sm outline-none"
              />
            </div>

            
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase font-semibold block">
                Stock Quantity (Units) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-mono text-sm outline-none"
              />
            </div>

            
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase font-semibold block">
                Standard Retail Price (MRP in ₹) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.5"
                placeholder="120.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-mono text-sm outline-none"
              />
            </div>

            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-muted-foreground uppercase font-semibold block">
                Product Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-sans text-sm outline-none"
              />
            </div>
          </div>
        </LiquidGlassCard>

        
        <LiquidGlassCard className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-foreground" />
              <h2 className="font-display font-medium text-lg uppercase tracking-wider">
                Batch Shelf-Life & FEFO Scheduling
              </h2>
            </div>
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-secondary text-foreground font-bold uppercase">
              Auto-Markdown Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
            
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase font-semibold block">
                Batch / Lot Number
              </label>
              <input
                type="text"
                placeholder="B-9921"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-mono text-sm outline-none"
              />
            </div>

            
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase font-semibold block">
                Manufacturing Date
              </label>
              <input
                type="date"
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-mono text-sm outline-none cursor-pointer"
              />
            </div>

            
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase font-semibold block">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary text-foreground font-mono text-sm outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border text-xs font-mono text-muted-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-foreground shrink-0" />
            <span>
              Dynamic discounts will automatically trigger via your configured store markdown rules based on days remaining.
            </span>
          </div>
        </LiquidGlassCard>

        
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/retailer/inventory")}
            className="px-6 py-3 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-mono text-xs font-bold uppercase transition-all cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 rounded-full bg-primary hover:opacity-90 text-primary-foreground font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-none flex items-center gap-2 disabled:opacity-60 min-h-[44px]"
          >
            {isLoading ? (
              <>
                <div className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>COMMITTING BATCH...</span>
              </>
            ) : (
              <>
                <Plus className="size-4" />
                <span>REGISTER & PUBLISH LOT</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
