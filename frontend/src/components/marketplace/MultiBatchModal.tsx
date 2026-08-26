import { motion } from "framer-motion";
import { X, Clock, Plus } from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";

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
  if (!product) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/50 backdrop-blur-xs transition-opacity font-body"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 sm:p-7 shadow-none space-y-5 text-foreground"
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-border">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="size-14 rounded-xl object-cover bg-card shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {product.brand} &bull; {product.unit}
              </span>
              <h3 className="font-display text-lg font-[350] text-foreground truncate leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Select your preferred batch & shelf life tier:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-card text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Batch List Options */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 font-mono">
          {product.allOffers.map((offer) => {
            return (
              <div
                key={offer.id}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary transition-all duration-150 flex items-center justify-between gap-3 group shadow-none"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-[350] text-sm uppercase text-foreground">
                      {offer.type}
                    </span>
                    {offer.discountPercent > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary text-primary-foreground">
                        {offer.discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-background text-foreground text-[10px] font-medium">
                        FRESH
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-foreground" />
                      {offer.expiryText}
                    </span>
                    <span>&bull;</span>
                    <span>{offer.availability} units</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-medium text-foreground text-sm sm:text-base">
                      ₹{offer.price}
                    </span>
                    {offer.originalPrice > offer.price && (
                      <span className="text-[10px] text-muted-foreground line-through block">
                        ₹{offer.originalPrice}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectBatch(product, offer);
                      onClose();
                    }}
                    className="p-2.5 rounded-full bg-primary hover:opacity-90 text-primary-foreground transition-colors cursor-pointer shadow-none active:scale-95"
                    title="Add this batch"
                  >
                    <Plus className="size-4" />
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
            className="px-5 py-2.5 rounded-full bg-card hover:bg-[#c4c7c4]/40 text-foreground text-xs font-mono font-medium uppercase transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
