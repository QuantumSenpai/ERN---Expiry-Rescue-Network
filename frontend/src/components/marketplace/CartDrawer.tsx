import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Clock,
  Layers,
} from "lucide-react";
import type { CartItem } from "@/context/CartContext";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { calculatePricing, formatINR } from "@/lib/pricingService";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (idx: number, delta: number) => void;
  onRemoveItem: (idx: number) => void;
  totalAmount: number;
  totalSavings: number;
  onCheckout: () => void;
  onViewCart?: () => void;
  onBrowseDeals?: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  totalAmount,
  totalSavings,
  onCheckout,
  onViewCart,
  onBrowseDeals,
}: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleBrowseDealsClick = () => {
    onClose();
    if (onBrowseDeals) {
      onBrowseDeals();
    } else {
      const el = document.getElementById("products") || document.getElementById("hero");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 font-sans cursor-pointer"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-card border-l border-border text-foreground h-full flex flex-col justify-between p-5 sm:p-6 shadow-2xl transition-colors duration-200 cursor-default"
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3.5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <ShoppingCart className="size-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                  Your Cart ({totalItemCount})
                </h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {totalItemCount === 1 ? "1 item ready for checkout" : `${totalItemCount} items ready for checkout`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Savings Callout */}
          {totalSavings > 0 && (
            <div className="my-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-xs font-mono font-bold">
              <Sparkles className="size-4 shrink-0 text-emerald-500" />
              <span>You save {formatINR(totalSavings)} on this rescue order!</span>
            </div>
          )}

          {/* Cart Item List */}
          <div className="space-y-2.5 mt-3 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="size-14 rounded-full bg-secondary mx-auto flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="size-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-foreground">
                    Your cart is empty
                  </h4>
                  <p className="text-xs text-muted-foreground font-sans mt-1">
                    Find great rescue deals before they expire.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBrowseDealsClick}
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase cursor-pointer hover:bg-primary/90 transition-colors shadow-xs"
                >
                  Browse Rescue Deals
                </button>
              </div>
            ) : (
              items.map((item, idx) => {
                if (!item) return null;
                const rawProduct = item.product || (item as any);
                const product = {
                  id: rawProduct?.id || (item as any)?.productId || `prod-${idx}`,
                  name: rawProduct?.name || (item as any)?.title || "Grocery Item",
                  imageUrl:
                    rawProduct?.imageUrl ||
                    (item as any)?.imageUrl ||
                    (rawProduct as any)?.image ||
                    (item as any)?.image ||
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
                  mrp: Number(rawProduct?.mrp ?? (item as any)?.mrp ?? 0),
                  price: Number((rawProduct as any)?.price ?? (item as any)?.price ?? 0),
                };

                const rawOffer = item.selectedOffer || (item as any)?.offer || {};
                const offer = {
                  id: rawOffer?.id || `offer-${product.id}-${idx}`,
                  batchNumber: rawOffer?.batchNumber || (item as any)?.batchNumber || `BAT-${idx + 1}`,
                  expiryDate: rawOffer?.expiryDate || (item as any)?.expiryDate || "",
                  price: Number(rawOffer?.price ?? product.price ?? 0),
                  mrp: Number(rawOffer?.mrp ?? product.mrp ?? rawOffer?.price ?? product.price ?? 0),
                  availability: Number(
                    rawOffer?.availability ?? (item as any)?.availability ?? (item as any)?.stock ?? 99
                  ),
                };

                const hasValidDate = Boolean(offer.expiryDate && !isNaN(new Date(offer.expiryDate).getTime()));
                const expiryInfo = hasValidDate ? calculateExpiryStatus(offer.expiryDate) : null;

                const safeMrp = offer.mrp || product.mrp || offer.price || 0;
                const safeSellingPrice = offer.price ?? product.price ?? safeMrp;
                const pricing = calculatePricing(safeMrp, { sellingPrice: safeSellingPrice });
                const maxStock = Math.max(1, offer.availability || 99);
                const quantity = Math.max(1, item.quantity || 1);

                return (
                  <div
                    key={`${product.id}-${offer.id || idx}`}
                    className="p-3 rounded-xl bg-secondary/40 flex items-center justify-between gap-3 text-xs font-mono border border-border"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="size-11 rounded-lg overflow-hidden bg-white border border-border shrink-0 p-0.5">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1 font-sans">
                        <p className="font-bold text-xs text-foreground truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground font-mono mt-0.5">
                          <span className="font-bold text-foreground">
                            {formatINR(pricing.sellingPrice * quantity)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                            <Clock className="size-2.5" />
                            {hasValidDate && expiryInfo ? expiryInfo.expiryText : "Expiry date unavailable"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-background rounded-full p-1 border border-border">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(idx, -1)}
                          className="size-6 rounded-full flex items-center justify-center hover:bg-secondary text-foreground cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-xs font-bold px-1 min-w-4 text-center text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(idx, 1)}
                          disabled={item.quantity >= maxStock}
                          className="size-6 rounded-full flex items-center justify-center hover:bg-secondary text-foreground cursor-pointer disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        className="size-7 rounded-full bg-secondary hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center cursor-pointer transition-colors"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Checkout Summary */}
        <div className="pt-3.5 border-t border-border space-y-2.5 font-mono">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Items MRP Total:</span>
              <span>{formatINR(totalAmount + totalSavings)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Rescue Discounts:</span>
                <span>-{formatINR(totalSavings)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border">
              <span>Total Payable:</span>
              <span className="text-base font-bold text-foreground">{formatINR(totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onCheckout}
              disabled={items.length === 0}
              className="w-full py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>CONTINUE TO CHECKOUT</span>
              <ArrowRight className="size-4" />
            </button>

            {onViewCart && (
              <button
                type="button"
                onClick={onViewCart}
                className="w-full py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono font-bold uppercase transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer border border-border"
              >
                <span>VIEW FULL CART</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
