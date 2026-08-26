import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus } from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";

interface SmartPriceProductProps {
  product: MarketplaceProduct;
  onAddToCart: (product: MarketplaceProduct, offer: ProductOffer) => void;
}

export default function SmartPriceProduct({
  product,
  onAddToCart,
}: SmartPriceProductProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string>(
    product.allOffers[0]?.id || product.defaultOffer.id
  );
  const [isAdded, setIsAdded] = useState(false);

  const currentOffer =
    product.allOffers.find((o) => o.id === selectedOfferId) ||
    product.defaultOffer;

  const handleAdd = () => {
    onAddToCart(product, currentOffer);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="space-y-3 flex flex-col justify-between h-full text-foreground font-body">
      {/* Header */}
      <div>
        <h3 className="font-display font-bold text-base sm:text-lg text-foreground uppercase tracking-tight">
          MULTI-TIER DYNAMIC PRICING
        </h3>
        <p className="text-xs text-muted-foreground font-body mt-0.5">
          Select optimal batch expiry for your consumption timeline.
        </p>
      </div>

      {/* Main Card */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-[32px] bg-card border border-border shadow-none space-y-4 flex-1 flex flex-col justify-between">
        {/* Product Identity Row */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-border">
          <div className="size-16 rounded-xl overflow-hidden bg-white shrink-0 p-1 flex items-center justify-center border border-border">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-foreground leading-tight">
              {product.name}
            </h4>
            <span className="text-xs text-muted-foreground font-mono">
              {product.unit} &bull; Verified Freshness
            </span>
          </div>
        </div>

        {/* 3 Selectable Tiers */}
        <div className="space-y-2.5 flex-1 font-mono">
          {product.allOffers.map((offer) => {
            const isSelected = offer.id === selectedOfferId;
            const isFresh = offer.type === "Fresh Stock";
            const isRescue = offer.type === "Rescue Deal";
            const isClearance = offer.type === "Clearance";

            let tierTitle = "FRESH STOCK";
            let shelfSubtitle = "Standard Expiry";
            let daysLabel = `${offer.daysRemaining} days left`;
            let priceNote = "Standard MRP";
            let cardBorder = "border-border";
            let cardBg = "bg-secondary/50";
            let badgeBg = "bg-primary text-primary-foreground";

            if (isFresh) {
              tierTitle = "FRESH STOCK";
              shelfSubtitle = "Standard Expiry";
              daysLabel = `${offer.daysRemaining} days left`;
              priceNote = "Full Value";
              badgeBg = "bg-primary text-primary-foreground";
              if (isSelected) {
                cardBorder = "border-[#2F4156] dark:border-[#2F4156]";
                cardBg = "bg-background ";
              }
            } else if (isRescue) {
              tierTitle = "RESCUE LOT";
              shelfSubtitle = "Fast Moving";
              daysLabel = `${offer.daysRemaining} days left`;
              priceNote = `-${offer.discountPercent}%`;
              badgeBg = "bg-destructive text-destructive-foreground dark:bg-accent ";
              if (isSelected) {
                cardBorder = "border-[#2F4156] dark:border-[#2F4156]";
                cardBg = "bg-background ";
              }
            } else if (isClearance) {
              tierTitle = "CLEARANCE";
              shelfSubtitle = "Rapid Markdown";
              daysLabel = `${offer.daysRemaining} days left`;
              priceNote = `-${offer.discountPercent}%`;
              badgeBg = "bg-primary text-primary-foreground";
              if (isSelected) {
                cardBorder = "border-[#2F4156] dark:border-[#2F4156]";
                cardBg = "bg-background ";
              }
            }

            return (
              <div
                key={offer.id}
                onClick={() => setSelectedOfferId(offer.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs select-none ${cardBg} ${cardBorder}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-[#2F4156] bg-[#2F4156] dark:border-[#2F4156] dark:bg-accent"
                        : "border-[#757C5D] dark:border-[#E2D9BE]"
                    }`}
                  >
                    {isSelected && <div className="size-1.5 rounded-full bg-card" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{tierTitle}</span>
                      {offer.discountPercent > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${badgeBg}`}>
                          {priceNote}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{shelfSubtitle} � {daysLabel}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-foreground text-sm">?{offer.price}</span>
                  {offer.originalPrice > offer.price && (
                    <span className="text-[10px] text-muted-foreground line-through block">?{offer.originalPrice}</span>
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
          className={`w-full py-3 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-none ${
            isAdded
              ? "bg-accent text-accent-foreground"
              : "bg-primary text-primary-foreground hover:bg-[#567C8D] dark:bg-accent  dark:hover:bg-[#567c8d] active:scale-95"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="size-3.5" />
              <span>ADDED TIER TO CART</span>
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              <span>ADD SELECTED BATCH (?{currentOffer.price})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

