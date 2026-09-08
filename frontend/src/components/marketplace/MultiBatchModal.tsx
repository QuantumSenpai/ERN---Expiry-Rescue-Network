import { motion } from "framer-motion";
import { X, Clock, Plus, Check } from "lucide-react";
import { useState } from "react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { calculatePricing } from "@/lib/pricingService";

interface MultiBatchModalProps {
  product: MarketplaceProduct | null;
  onClose: () => void;
  onSelectBatch: (product: MarketplaceProduct, offer: ProductOffer) => void;
}

export default function MultiBatchModal({
  product,
  onClose,
  onSelectBatch,
}: MultiBatchModalProps) {
  const [addedOfferId, setAddedOfferId] = useState<string | null>(null);

  if (!product) return null;

  const handleSelect = (offer: ProductOffer) => {
    onSelectBatch(product, offer);
    setAddedOfferId(offer.id);
    setTimeout(() => {
      setAddedOfferId(null);
      onClose();
    }, 900);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-foreground"
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-border">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-14 rounded-xl overflow-hidden bg-white border border-border p-1 shrink-0">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10.5px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                {product.brand} • {product.unit}
              </span>
              <h3 className="font-display text-lg font-bold text-foreground truncate leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                Select your preferred shelf-life & savings tier:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Batch List Options */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 font-mono">
          {product.allOffers.map((offer) => {
            const expiryInfo = calculateExpiryStatus(offer.expiryDate);
            const pricing = calculatePricing(offer.mrp || product.mrp, {
              sellingPrice: offer.price,
            });
            const isAdded = addedOfferId === offer.id;

            let tierName = "FRESH STOCK";
            let badgeStyle = "bg-secondary text-foreground";

            if (expiryInfo.tier === "Clearance") {
              tierName = "CLEARANCE";
              badgeStyle = "bg-primary text-primary-foreground";
            } else if (expiryInfo.tier === "Rescue Deal") {
              tierName = "RESCUE DEAL";
              badgeStyle = "bg-destructive text-destructive-foreground dark:bg-accent";
            }

            return (
              <div
                key={offer.id}
                className="p-4 rounded-xl border border-border bg-secondary/30 hover:border-primary/60 transition-all flex items-center justify-between gap-3 shadow-none"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase text-foreground">
                      {tierName}
                    </span>
                    {pricing.hasDiscount ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}>
                        {pricing.discountBadge}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-bold">
                        STANDARD
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-foreground font-bold">
                      <Clock className="size-3" />
                      {expiryInfo.expiryText}
                    </span>
                    <span>•</span>
                    <span>Batch: {offer.batchNumber}</span>
                    <span>•</span>
                    <span>{offer.availability} in stock</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-foreground text-sm sm:text-base">
                      {pricing.formattedSellingPrice}
                    </span>
                    {pricing.hasDiscount && (
                      <span className="text-[10px] text-muted-foreground line-through block">
                        {pricing.formattedMrp}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelect(offer)}
                    disabled={isAdded || expiryInfo.isExpired || offer.availability <= 0}
                    className={`p-2.5 rounded-full transition-colors cursor-pointer shadow-none active:scale-95 ${
                      isAdded
                        ? "bg-accent text-accent-foreground"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                    title="Add this batch"
                    aria-label="Add this batch"
                  >
                    {isAdded ? (
                      <Check className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
