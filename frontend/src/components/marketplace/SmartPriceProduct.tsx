import { useState } from "react";
import { Check, Plus, Clock } from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { calculatePricing } from "@/lib/pricingService";

interface SmartPriceProductProps {
  product: MarketplaceProduct;
  onAddToCart: (product: MarketplaceProduct, offer: ProductOffer) => void;
}

export default function SmartPriceProduct({
  product,
  onAddToCart,
}: SmartPriceProductProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string>(
    product.allOffers[1]?.id || product.defaultOffer.id
  );
  const [isAdded, setIsAdded] = useState(false);

  const currentOffer =
    product.allOffers.find((o) => o.id === selectedOfferId) ||
    product.defaultOffer;

  const currentPricing = calculatePricing(currentOffer.mrp || product.mrp, {
    sellingPrice: currentOffer.price,
  });

  const handleAdd = () => {
    onAddToCart(product, currentOffer);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <div className="space-y-3 flex flex-col justify-between h-full text-foreground font-body">
      {/* Header */}
      <div>
        <h3 className="font-display font-bold text-base sm:text-lg text-foreground uppercase tracking-tight">
          CHOOSE BY EXPIRY & SAVINGS
        </h3>
        <p className="text-xs text-muted-foreground font-sans mt-0.5">
          Select the best batch for your consumption timeline:
        </p>
      </div>

      {/* Main Card */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border shadow-none space-y-4 flex-1 flex flex-col justify-between">
        {/* Product Identity Row */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-border">
          <div className="size-16 rounded-xl overflow-hidden bg-white shrink-0 p-1 flex items-center justify-center border border-border">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[10.5px] font-mono text-muted-foreground uppercase block font-semibold">
              {product.brand} • {product.unit}
            </span>
            <h4 className="font-display font-bold text-base text-foreground leading-tight truncate">
              {product.name}
            </h4>
          </div>
        </div>

        {/* 3 Selectable Tiers */}
        <div className="space-y-2.5 flex-1 font-mono">
          {product.allOffers.map((offer) => {
            const isSelected = offer.id === selectedOfferId;
            const expiryInfo = calculateExpiryStatus(offer.expiryDate);
            const pricing = calculatePricing(offer.mrp || product.mrp, {
              sellingPrice: offer.price,
            });

            let tierName = "FRESH STOCK";
            let tierTagline = "Standard shelf life";
            let badgeBg = "bg-secondary text-foreground";

            if (expiryInfo.tier === "Clearance") {
              tierName = "CLEARANCE";
              tierTagline = "Lowest price • Expires soon";
              badgeBg = "bg-primary text-primary-foreground";
            } else if (expiryInfo.tier === "Rescue Deal") {
              tierName = "RESCUE DEAL";
              tierTagline = "Good value • Nearing expiry";
              badgeBg = "bg-destructive text-destructive-foreground dark:bg-accent";
            }

            return (
              <div
                key={offer.id}
                onClick={() => setSelectedOfferId(offer.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs select-none ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-secondary/30 hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{tierName}</span>
                      {pricing.hasDiscount && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${badgeBg}`}>
                          {pricing.discountBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground mt-0.5">
                      <Clock className="size-2.5" />
                      <span>{expiryInfo.expiryText}</span>
                      <span>•</span>
                      <span>{tierTagline}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-foreground text-sm">
                    {pricing.formattedSellingPrice}
                  </span>
                  {pricing.hasDiscount && (
                    <span className="text-[10px] text-muted-foreground line-through block">
                      {pricing.formattedMrp}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdded}
          className={`w-full py-3 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-none ${
            isAdded
              ? "bg-accent text-accent-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="size-3.5" />
              <span>ADDED TO CART</span>
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              <span>ADD TO CART ({currentPricing.formattedSellingPrice})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
