import { useState } from "react";
import { Plus, Check } from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";
import { calculatePricing } from "@/lib/pricingService";
import { calculateExpiryStatus } from "@/lib/expiryService";

interface BuyAgainProps {
  products: MarketplaceProduct[];
  onAddToCart: (product: MarketplaceProduct, offer?: ProductOffer) => void;
}

export default function BuyAgain({ products, onAddToCart }: BuyAgainProps) {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const handleAdd = (product: MarketplaceProduct) => {
    onAddToCart(product);
    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1400);
  };

  return (
    <div className="space-y-3 flex flex-col justify-between h-full text-foreground font-body">
      <div>
        <h4 className="font-display font-bold text-xs sm:text-sm text-foreground uppercase tracking-tight">
          POPULAR ESSENTIALS
        </h4>
        <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
          Daily staple items frequently bought
        </p>
      </div>

      {/* 3 items in vertical list */}
      <div className="space-y-2 flex-1">
        {products.map((product) => {
          const isAdded = recentlyAddedId === product.id;
          const bestOffer = product.defaultOffer;
          const pricing = calculatePricing(bestOffer.mrp || product.mrp, {
            sellingPrice: bestOffer.price,
          });
          const expiryInfo = calculateExpiryStatus(bestOffer.expiryDate);

          return (
            <div
              key={product.id}
              className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between gap-3 shadow-none hover:border-primary/50 transition-colors"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-xl overflow-hidden bg-white shrink-0 p-0.5 border border-border">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="min-w-0 font-mono">
                  <h5 className="text-xs font-bold text-foreground truncate font-sans">
                    {product.name}
                  </h5>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground mt-0.5">
                    <span>{product.unit}</span>
                    <span>•</span>
                    <span className="font-bold text-foreground">{pricing.formattedSellingPrice}</span>
                    <span>•</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">{expiryInfo.expiryText}</span>
                  </div>
                </div>
              </div>

              {/* Quick Add Button */}
              <button
                type="button"
                onClick={() => handleAdd(product)}
                disabled={isAdded}
                className={`p-2 rounded-full transition-all duration-150 cursor-pointer shadow-none active:scale-95 shrink-0 ${
                  isAdded
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                title="Add to Cart"
                aria-label="Add to Cart"
              >
                {isAdded ? (
                  <Check className="size-3.5" />
                ) : (
                  <Plus className="size-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
