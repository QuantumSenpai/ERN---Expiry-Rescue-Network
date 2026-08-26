import { motion } from "framer-motion";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";

export interface CartItem {
  product: MarketplaceProduct;
  selectedOffer: ProductOffer;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (idx: number, delta: number) => void;
  onRemoveItem: (idx: number) => void;
  totalAmount: number;
  totalSavings: number;
  onCheckout: () => void;
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
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 font-sans">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-card border-l border-border text-foreground h-full flex flex-col justify-between p-6 sm:p-7 shadow-none transition-colors duration-200"
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <ShoppingCart className="size-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-lg text-foreground">
                  Your Cart ({totalItemCount})
                </h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Certified surplus rescue lot items
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Savings Callout */}
          {totalSavings > 0 && (
            <div className="my-4 p-3 rounded-xl bg-accent text-accent-foreground flex items-center gap-2 text-xs font-mono font-bold shadow-none">
              <Sparkles className="size-4 shrink-0" />
              <span>You are rescuing surplus goods & saving ₹{totalSavings}!</span>
            </div>
          )}

          {/* Cart Item List */}
          <div className="space-y-3 mt-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <ShoppingCart className="size-10 mx-auto text-muted-foreground opacity-40" />
                <p className="font-sans font-bold text-base text-foreground">
                  Your basket is empty
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Explore nearing expiry deals to rescue items.
                </p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedOffer.id || idx}`}
                  className="p-3.5 rounded-xl bg-secondary/50 flex items-center justify-between gap-3 text-xs font-mono border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="size-12 rounded-lg object-cover bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans font-bold text-sm text-foreground truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {item.selectedOffer.expiryText} · ₹{item.selectedOffer.price}
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-background rounded-full p-1 border border-border">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(idx, -1)}
                        className="size-6 rounded-full flex items-center justify-center hover:bg-secondary text-foreground cursor-pointer"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="text-xs font-bold px-1 min-w-4 text-center text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(idx, 1)}
                        className="size-6 rounded-full flex items-center justify-center hover:bg-secondary text-foreground cursor-pointer"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(idx)}
                      className="size-7 rounded-full bg-secondary hover:bg-rose-100 text-muted-foreground hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Checkout Summary */}
        <div className="pt-4 border-t border-border space-y-3 font-mono">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Items Total:</span>
              <span>₹{totalAmount + totalSavings}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-accent font-bold">
                <span>Rescue Discounts:</span>
                <span>-₹{totalSavings}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
              <span>Total Payable:</span>
              <span className="text-base font-bold text-foreground">₹{totalAmount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full py-3.5 rounded-full bg-primary hover:opacity-90 text-primary-foreground text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-none disabled:opacity-50"
          >
            <span>PROCEED TO CHECKOUT</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

