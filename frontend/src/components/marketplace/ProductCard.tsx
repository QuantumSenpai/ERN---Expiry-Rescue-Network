import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Minus, Check, Clock, Sparkles, Layers, ShieldCheck, Star } from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { calculatePricing, formatINR } from "@/lib/pricingService";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: MarketplaceProduct;
  isWishlisted: boolean;
  onToggleWishlist: (product: MarketplaceProduct) => void;
  onAddToCart: (product: MarketplaceProduct, offer?: ProductOffer) => void;
  onOpenMultiBatchModal?: (product: MarketplaceProduct) => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenMultiBatchModal,
}: ProductCardProps) {
  const { cartItems, updateQty } = useCart();
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [isJustAdded, setIsJustAdded] = useState(false);

  // Active offer for this card (defaults to product.defaultOffer or selected offer)
  const offers = product.allOffers && product.allOffers.length > 0 ? product.allOffers : [product.defaultOffer];
  const activeOffer = offers[selectedOfferIndex] || product.defaultOffer;

  const expiryInfo = calculateExpiryStatus(activeOffer.expiryDate);
  const pricing = calculatePricing(activeOffer.mrp || product.mrp, {
    sellingPrice: activeOffer.price,
  });

  // Check if this product + active offer is in the cart
  const cartItem = cartItems.find(
    (item) => item.product.id === product.id && item.selectedOffer.id === activeOffer.id
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Tier badge styling
  let badgeText = "FRESH STOCK";
  let badgeClass = "bg-secondary text-secondary-foreground font-semibold border-border";

  if (activeOffer.type === "Clearance" || expiryInfo.tier === "Clearance") {
    badgeText = `CLEARANCE${pricing.hasDiscount ? ` • ${pricing.discountBadge}` : ""}`;
    badgeClass = "bg-primary text-primary-foreground font-bold border-primary";
  } else if (activeOffer.type === "Rescue Deal" || expiryInfo.tier === "Rescue Deal") {
    badgeText = `RESCUE DEAL${pricing.hasDiscount ? ` • ${pricing.discountBadge}` : ""}`;
    badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 font-bold border border-amber-500/30";
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product, activeOffer);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1200);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const itemIndex = cartItems.findIndex(
      (item) => item.product.id === product.id && item.selectedOffer.id === activeOffer.id
    );
    if (itemIndex >= 0) {
      updateQty(itemIndex, 1);
    } else {
      onAddToCart(product, activeOffer);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const itemIndex = cartItems.findIndex(
      (item) => item.product.id === product.id && item.selectedOffer.id === activeOffer.id
    );
    if (itemIndex >= 0) {
      updateQty(itemIndex, -1);
    }
  };

  return (
    <div className="group rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between h-full font-body overflow-hidden relative">
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-[4/3] bg-secondary/30 overflow-hidden">
        <Link
          to={`/marketplace/product/${product.id}`}
          className="block w-full h-full relative"
          title={`View ${product.name}`}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
            }}
          />
        </Link>

        {/* Tier Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-tight border shadow-xs ${badgeClass}`}
          >
            {badgeText}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 size-8 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 shadow-xs ${
            isWishlisted
              ? "bg-primary text-primary-foreground"
              : "bg-card/90 backdrop-blur-xs text-muted-foreground hover:text-foreground hover:bg-card"
          }`}
          title={isWishlisted ? "Remove from Saved Items" : "Save for Later"}
          aria-label={isWishlisted ? "Remove from Saved Items" : "Save for Later"}
        >
          <Heart className="size-4" fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Multi-Batch Indicator */}
        {offers.length > 1 && (
          <div className="absolute bottom-2 left-2.5 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-xs text-foreground font-mono text-[10px] font-semibold flex items-center gap-1 border border-border/50">
              <Layers className="size-3 text-primary" />
              <span>{offers.length} batches available</span>
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Unit Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span className="font-semibold text-foreground/80">{product.brand}</span>
            <span>{product.unit}</span>
          </div>

          {/* Title */}
          <Link
            to={`/marketplace/product/${product.id}`}
            className="font-sans font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-1 leading-snug"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              <span className="font-bold text-foreground">{product.rating}</span>
            </div>
            <span>•</span>
            <span>{product.reviewsCount} reviews</span>
          </div>

          {/* Batch Selector Pills (if multiple offers exist) */}
          {offers.length > 1 && (
            <div className="mt-2.5 pt-2 border-t border-border/60">
              <span className="text-[10.5px] font-mono text-muted-foreground uppercase block mb-1">
                Select Batch Offer:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {offers.map((offer, idx) => {
                  const isSelected = idx === selectedOfferIndex;
                  return (
                    <button
                      key={offer.id || idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedOfferIndex(idx);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                          : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border"
                      }`}
                    >
                      {offer.type === "Clearance"
                        ? "Clearance"
                        : offer.type === "Rescue Deal"
                        ? "Rescue"
                        : "Fresh"}{" "}
                      • ₹{offer.price}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expiry & Stock Metadata */}
          <div className="mt-2.5 p-2 rounded-xl bg-secondary/40 border border-border/50 text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1 text-foreground/80 font-medium">
                <Clock className="size-3 text-primary" />
                <span>{expiryInfo.expiryText}</span>
              </span>
              <span className="text-[10px]">Batch #{activeOffer.batchNumber}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Stock: {activeOffer.availability} units</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ready for dispatch</span>
            </div>
          </div>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-2 border-t border-border space-y-2.5">
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold font-sans text-foreground">
                {formatINR(activeOffer.price)}
              </span>
              {pricing.hasDiscount && (
                <span className="text-xs text-muted-foreground line-through font-mono">
                  {formatINR(pricing.mrp)}
                </span>
              )}
            </div>

            {pricing.hasDiscount && (
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Save {formatINR(pricing.savings)}
              </span>
            )}
          </div>

          {/* Action Button: Quantity Selector OR Add to Cart */}
          {quantityInCart > 0 ? (
            <div className="flex items-center justify-between bg-primary text-primary-foreground rounded-xl p-1 font-mono text-xs font-bold">
              <button
                type="button"
                onClick={handleDecrement}
                className="size-8 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center transition-colors cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="px-2 text-sm">{quantityInCart} in cart</span>
              <button
                type="button"
                onClick={handleIncrement}
                className="size-8 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center transition-colors cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={activeOffer.availability <= 0}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                activeOffer.availability <= 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : isJustAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-98"
              }`}
            >
              {isJustAdded ? (
                <>
                  <Check className="size-4" />
                  <span>Added to Cart</span>
                </>
              ) : activeOffer.availability <= 0 ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}

          {/* Link to Product Detail */}
          <div className="flex items-center justify-center">
            <Link
              to={`/marketplace/product/${product.id}`}
              className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <span>View Product & Batch Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
