import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  Search,
  Trash2,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { MarketplaceProduct } from "@/data/marketplaceData";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { calculatePricing } from "@/lib/pricingService";
import MultiBatchModal from "@/components/marketplace/MultiBatchModal";
import { useStoreCatalog } from "@/lib/inventoryStore";

export default function SavedItems() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const { catalog, storeId, storeName } = useStoreCatalog();

  const [selectedProductForBatch, setSelectedProductForBatch] = useState<MarketplaceProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const savedProducts: MarketplaceProduct[] = useMemo(() => {
    return catalog.filter((p) => wishlist.has(p.id));
  }, [catalog, wishlist]);

  const filteredProducts = useMemo(() => {
    let result = savedProducts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [savedProducts, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground font-body py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-2xl text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase mb-2">
              <span>SAVED ITEMS</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.08] tracking-[-0.025em]">
              Your Saved Items
            </h1>
            <p className="text-sm text-muted-foreground font-sans mt-2">
              Track expiry dates and rescue markdowns on your favorited groceries.
            </p>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase">
            <Link
              to="/marketplace"
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Search Bar (Only shown if items exist) */}
        {savedProducts.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-3.5 shadow-none flex items-center gap-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved items by product, brand, category..."
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Product Cards or Empty State */}
        {savedProducts.length === 0 ? (
          <div className="p-14 text-center rounded-3xl bg-card border border-border text-foreground space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="size-16 rounded-full bg-secondary mx-auto flex items-center justify-center text-muted-foreground">
              <Heart className="size-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">
                No saved items yet
              </h3>
              <p className="text-xs text-muted-foreground font-sans mt-1">
                Save products you want to check later or monitor for expiry discounts.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-block px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase hover:bg-primary/90 transition-colors shadow-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border text-muted-foreground font-mono text-xs">
            No saved products match '{searchQuery}'.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              const offer = p.defaultOffer;
              const expiryInfo = calculateExpiryStatus(offer.expiryDate);
              const pricing = calculatePricing(offer.mrp || p.mrp, {
                sellingPrice: offer.price,
              });

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-primary/60 flex flex-col justify-between space-y-3 transition-colors group shadow-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-[10.5px] font-mono font-bold uppercase">
                      {expiryInfo.tier}
                    </span>
                    <button
                      onClick={() => {
                        removeFromWishlist(p.id);
                        showToast(`${p.name} removed from Saved Items`);
                      }}
                      className="p-1.5 rounded-full text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                      title="Remove from Saved Items"
                      aria-label="Remove from Saved Items"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-white border border-border flex items-center justify-center p-2">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                  </div>

                  <div>
                    <span className="text-[10.5px] font-mono text-muted-foreground uppercase font-semibold">
                      {p.brand} • {p.unit}
                    </span>
                    <h3 className="font-display font-bold text-base text-foreground truncate mt-0.5">
                      {p.name}
                    </h3>
                  </div>

                  {/* Price and Expiry */}
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-foreground text-base">
                        {pricing.formattedSellingPrice}
                      </span>
                      {pricing.hasDiscount && (
                        <span className="text-[10px] text-muted-foreground line-through block">
                          {pricing.formattedMrp}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <Clock className="size-3" />
                        {expiryInfo.expiryText}
                      </span>
                      {pricing.hasDiscount && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                          {pricing.formattedSavings}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        addToCart(p, offer, 1, storeId, storeName);
                        showToast(`${p.name} added to cart`);
                      }}
                      disabled={expiryInfo.isExpired || offer.availability <= 0}
                      className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase hover:bg-primary/90 transition-colors cursor-pointer shadow-none disabled:opacity-40"
                    >
                      Add to Cart
                    </button>
                    {p.allOffers.length > 1 && (
                      <button
                        onClick={() => setSelectedProductForBatch(p)}
                        className="px-3.5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono font-bold uppercase cursor-pointer border border-border"
                        title="View other batches"
                      >
                        Batches ({p.allOffers.length})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <MultiBatchModal
          product={selectedProductForBatch}
          onClose={() => setSelectedProductForBatch(null)}
          onSelectBatch={(prod, off) => {
            addToCart(prod, off, 1, storeId, storeName);
            showToast(`${prod.name} (${off?.type || "Deal"}) added to cart`);
          }}
        />
      </div>
    </div>
  );
}
