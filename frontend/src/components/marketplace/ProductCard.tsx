import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Clock, Plus, Check, Info, ArrowLeft } from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";

interface ProductCardProps {
  product: MarketplaceProduct;
  isWishlisted: boolean;
  onToggleWishlist: (product: MarketplaceProduct) => void;
  onAddToCart: (product: MarketplaceProduct, offer?: ProductOffer) => void;
  onOpenMultiBatchModal: (product: MarketplaceProduct) => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenMultiBatchModal,
}: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const offer = product.defaultOffer;
  const isClearance = offer.type === "Clearance" || product.isClearance;
  const isRescue = offer.type === "Rescue Deal" || product.isRescueDeal;

  let badgeText = "FRESH";
  let badgeClass = "bg-secondary text-foreground   font-bold";

  if (isClearance) {
    badgeText = `CLEARANCE -${offer.discountPercent}%`;
    badgeClass = "bg-primary text-primary-foreground font-bold";
  } else if (isRescue && offer.discountPercent > 0) {
    badgeText = `RESCUE -${offer.discountPercent}%`;
    badgeClass = "bg-destructive text-destructive-foreground dark:bg-accent  font-bold";
  }

  const handleAdd = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onAddToCart(product, offer);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className="perspective-1200 h-full font-sans">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full h-full transform-style-3d min-h-[380px]"
      >
        {/* Front Card Face */}
        <div
          className={`w-full h-full p-5 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3 group backface-hidden shadow-none ern-card-hover ${
            isFlipped ? "pointer-events-none" : ""
          }`}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between gap-2">
            <span className={`px-3 py-0.5 rounded-full text-[10.5px] font-mono uppercase ${badgeClass}`}>
              {badgeText}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleFlip}
                className="size-7 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors cursor-pointer ern-icon-hover"
                title="View Batch Specifications"
              >
                <Info className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product);
                }}
                className={`size-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ern-icon-hover ${
                  isWishlisted
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:text-foreground"
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className="size-3.5" fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Product Image */}
          <div
            onClick={toggleFlip}
            className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-white flex items-center justify-center cursor-pointer border border-border"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {product.allOffers.length > 1 && (
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#2F4156]/90 text-primary-foreground text-[9.5px] font-mono font-bold backdrop-blur-xs">
                {product.allOffers.length} Batches
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-muted-foreground">
              <span className="truncate font-semibold">{product.brand}</span>
              <span className="shrink-0">{product.unit}</span>
            </div>

            <h3 className="font-sans font-bold text-base sm:text-lg text-foreground line-clamp-1 leading-snug">
              {product.name}
            </h3>

            {/* Expiry Pill */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-foreground dark:text-accent">
              <Clock className="size-3 shrink-0" />
              <span className="font-bold">{offer.expiryText}</span>
            </div>
          </div>

          {/* Price Strip */}
          <div className="pt-2 border-t border-border flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                ₹{offer.price}
              </span>
              {offer.originalPrice > offer.price && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{offer.originalPrice}
                </span>
              )}
            </div>

            {offer.discountPercent > 0 && (
              <span className="text-[11px] font-mono text-foreground dark:text-accent font-bold">
                Save ₹{offer.originalPrice - offer.price}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isAdded}
              className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase transition-all duration-150 cursor-pointer shadow-none ern-btn-hover ${
                isAdded
                  ? "bg-accent text-accent-foreground"
                  : "bg-[#2F4156] hover:bg-[#567C8D] text-primary-foreground dark:bg-accent dark:hover:bg-[#567c8d] "
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="size-3.5" />
                  <span>ADDED</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>ADD TO CART</span>
                </>
              )}
            </button>

            {product.allOffers.length > 1 && (
              <button
                type="button"
                onClick={() => onOpenMultiBatchModal(product)}
                className="px-3.5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground dark:hover:bg-[#b8ccdc] text-xs font-mono font-bold uppercase cursor-pointer border border-border ern-btn-hover"
                title="Select from other batches"
              >
                Batches
              </button>
            )}
          </div>
        </div>

        {/* Back Card Face: Batch Specifications */}
        <div
          className={`absolute inset-0 w-full h-full p-5 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3 backface-hidden rotate-y-180 shadow-none ${
            !isFlipped ? "pointer-events-none" : ""
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold tracking-wider">
                SPECIFICATIONS
              </span>
              <button
                type="button"
                onClick={toggleFlip}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground dark:hover:text-primary-foreground cursor-pointer ern-icon-hover"
              >
                <ArrowLeft className="size-3.5" />
              </button>
            </div>

            <div className="space-y-3 pt-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Product Code</span>
                <span className="font-bold text-foreground">{product.productId || "PRD-001"}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Rating & Reviews</span>
                <span className="text-foreground font-semibold">★ {product.rating} ({product.reviewsCount} reviews)</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Packaging Unit</span>
                <span className="text-foreground font-semibold">{product.unit}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Batch Expiry</span>
                <span className="text-foreground font-semibold">{offer.expiryText}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFlip}
            className="w-full py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground dark:hover:bg-[#b8ccdc] text-xs font-mono font-bold uppercase cursor-pointer border border-border ern-btn-hover"
          >
            Back to Item
          </button>
        </div>
      </motion.div>
    </div>
  );
}

