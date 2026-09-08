import { ChevronRight, Layers, Clock } from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";
import { calculatePricing } from "@/lib/pricingService";
import { calculateExpiryStatus } from "@/lib/expiryService";

interface RecommendationsProps {
  products: MarketplaceProduct[];
  wishlist?: Set<string>;
  onToggleWishlist?: (product: MarketplaceProduct) => void;
  onAddToCart?: (product: MarketplaceProduct, offer?: ProductOffer) => void;
  onOpenMultiBatchModal: (product: MarketplaceProduct) => void;
  onViewAll?: () => void;
}

export default function Recommendations({
  products,
  onOpenMultiBatchModal,
  onViewAll,
}: RecommendationsProps) {
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      const el = document.getElementById("products") || document.getElementById("main-deals-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-3 flex flex-col justify-between h-full text-foreground font-body">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-foreground uppercase tracking-tight">
            FEATURED RESCUE DEALS
          </h4>
          <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
            Top discounts across grocery categories
          </p>
        </div>

        <button
          type="button"
          onClick={handleViewAll}
          className="text-xs font-mono font-bold uppercase text-foreground hover:underline inline-flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 3 items in vertical list */}
      <div className="space-y-2 flex-1">
        {products.slice(0, 3).map((product) => {
          const offer = product.defaultOffer;
          const pricing = calculatePricing(offer.mrp || product.mrp, {
            sellingPrice: offer.price,
          });
          const expiryInfo = calculateExpiryStatus(offer.expiryDate);

          return (
            <div
              key={product.id}
              onClick={() => onOpenMultiBatchModal(product)}
              className="p-3 rounded-2xl bg-card border border-border hover:border-primary/50 flex items-center justify-between gap-3 transition-colors cursor-pointer shadow-none group"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-xl overflow-hidden bg-white shrink-0 p-0.5 border border-border">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <div className="min-w-0 font-mono">
                  <h5 className="text-xs font-bold text-foreground truncate font-sans">
                    {product.name}
                  </h5>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground mt-0.5">
                    <span className="text-foreground font-bold">{pricing.formattedSellingPrice}</span>
                    {pricing.hasDiscount && (
                      <span className="px-1.5 py-0.2 rounded-full bg-primary/15 text-primary font-bold text-[9.5px]">
                        {pricing.discountBadge}
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                      <Clock className="size-2.5" />
                      {expiryInfo.expiryText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Batches indicator */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                <Layers className="size-3" />
                <span className="font-semibold">{product.allOffers.length} Batches</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
