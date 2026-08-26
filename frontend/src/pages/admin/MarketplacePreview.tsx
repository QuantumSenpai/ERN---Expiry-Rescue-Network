import { useState, useMemo } from "react";
import {
  Eye,
  ShieldCheck,
  Search,
  Zap,
  Clock,
} from "lucide-react";
import { MASTER_PRODUCTS, CATEGORIES } from "@/data/marketplaceData";
import { useRescueDeals } from "@/context/RescueDealsContext";

export default function MarketplacePreview() {
  const { getMarketplaceDeals } = useRescueDeals();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const liveStaffDeals = getMarketplaceDeals();

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MASTER_PRODUCTS.filter((p) => {
      const matchCat = selectedCategory === "all" || p.categorySlug === selectedCategory;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [search, selectedCategory]);

  return (
    <div className="space-y-6 pb-20 font-sans text-foreground">
      {/* Read-Only Admin Audit Mode Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <Eye className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm sm:text-base text-foreground uppercase tracking-wide">
                READ-ONLY MARKETPLACE CATALOG AUDIT
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-mono font-bold">
                Admin Preview Mode
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Live customer pricing, rescue lots, and clearance deals rendered in read-only inspection mode.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-primary font-bold shrink-0">
          <ShieldCheck className="size-4" />
          <span>{liveStaffDeals.length} Live Rescue Lots Published</span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Audit product name, brand, or SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {CATEGORIES.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat.slug
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-none"
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{cat.icon} {cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Staff Deals Strip */}
      {liveStaffDeals.length > 0 && (
        <div className="p-4 rounded-2xl bg-status-high-bg border border-status-high-text/30 space-y-3 font-mono">
          <div className="flex items-center gap-2 text-status-high-text font-bold text-xs">
            <Zap className="size-4 animate-pulse" />
            <span>STAFF-PUBLISHED RESCUE DEALS CURRENTLY ACTIVE IN MARKETPLACE:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveStaffDeals.map((deal) => (
              <div key={deal.id} className="p-3 rounded-xl bg-card border border-border space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-foreground truncate">{deal.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-status-high-text text-primary-foreground text-[10px] font-black">
                    -{deal.discountPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Batch: <strong className="text-foreground">{deal.batchNo}</strong></span>
                  <span>Qty: {deal.quantity} {deal.unit}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/80">
                  <span className="text-muted-foreground line-through">₹{deal.originalPrice}</span>
                  <span className="font-bold text-status-approved-text font-mono text-sm">₹{deal.rescuePrice}</span>
                  <span className="text-[10px] text-muted-foreground">{deal.daysRemaining}d left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const offer = product.defaultOffer;
          return (
            <div
              key={product.id}
              className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-3 shadow-none group"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  offer.type === "Clearance"
                    ? "bg-status-critical-bg text-status-critical-text border border-status-critical-text/30"
                    : offer.type === "Rescue Deal"
                    ? "bg-status-high-bg text-status-high-text border border-status-high-text/30"
                    : "bg-status-approved-bg text-status-approved-text border border-status-approved-text/30"
                }`}>
                  {offer.badge || offer.type}
                </span>

                <span className="text-[10px] font-mono text-muted-foreground">
                  ⭐ {product.rating} ({product.reviewsCount})
                </span>
              </div>

              <div className="aspect-square rounded-xl overflow-hidden bg-secondary border border-border flex items-center justify-center p-2">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-xs sm:text-sm text-foreground truncate font-sans">
                  {product.name}
                </h3>
                <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground shrink-0" />
                  <span>{offer.expiryText}</span>
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-secondary border border-border/80 flex items-baseline justify-between font-mono text-xs">
                <div>
                  <span className="font-bold text-sm text-foreground">₹{offer.price}</span>
                  {offer.savings > 0 && (
                    <span className="text-[10px] text-muted-foreground line-through ml-1.5">
                      ₹{offer.originalPrice}
                    </span>
                  )}
                </div>
                {offer.savings > 0 && (
                  <span className="text-[10px] font-bold text-status-approved-text">
                    Save ₹{offer.savings}
                  </span>
                )}
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>Avail: <strong>{offer.availability} units</strong></span>
                <span>Category: {product.categorySlug}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}