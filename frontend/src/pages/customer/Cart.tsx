import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowLeft,
  Store,
  Layers,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useCart, type CartItem } from "@/context/CartContext";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { calculatePricing, formatINR } from "@/lib/pricingService";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQty,
    removeItem,
    clearCart,
    totalCount,
    totalAmount,
    totalSavings,
    originalTotal,
    toggleWishlist,
    wishlist,
    selectedAddress,
    selectedDelivery,
  } = useCart();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateQty = (idx: number, delta: number, currentQty: number, maxStock: number) => {
    if (delta > 0 && currentQty >= maxStock) {
      showToast(`Only ${maxStock} units available for this batch`);
      return;
    }
    if (delta < 0 && currentQty <= 1) {
      const item = cartItems[idx];
      removeItem(idx);
      const name = item?.product?.name || (item as any)?.name || "Item";
      showToast(`Removed ${name} from cart`);
      return;
    }
    updateQty(idx, delta);
  };

  const handleRemove = (idx: number) => {
    const item = cartItems[idx];
    removeItem(idx);
    const name = item?.product?.name || (item as any)?.name || "Item";
    showToast(`Removed ${name} from cart`);
  };

  const handleSaveForLater = (idx: number, item: CartItem) => {
    const prod = item?.product || (item as any);
    const prodId = prod?.id || `item-${idx}`;
    const prodName = prod?.name || "Item";
    // Add to wishlist if not already there
    if (prodId && !wishlist.has(prodId)) {
      toggleWishlist(prod as any);
    }
    // Remove from cart
    removeItem(idx);
    showToast(`${prodName} moved to Saved Items`);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      showToast("Your cart is empty. Please add items to proceed.");
      return;
    }
    navigate("/customer/checkout");
  };

  const deliveryFee = selectedDelivery?.fee ?? 0;
  const grandTotal = totalAmount + deliveryFee;

  return (
    <div className="min-h-screen bg-background text-foreground py-6 px-4 sm:px-6 lg:px-8 font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-2xl text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link to="/marketplace" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="size-3.5" />
            <span>Marketplace</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-border">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <span>Your Cart</span>
              {totalCount > 0 && (
                <span className="text-sm sm:text-base font-mono font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {totalCount} {totalCount === 1 ? "item" : "items"}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">
              Review your items and verified expiry batches before checkout.
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to clear your cart?")) {
                  clearCart();
                  showToast("Cart cleared");
                }
              }}
              className="text-xs font-mono text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="size-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {cartItems.length === 0 ? (
          <div className="py-16 px-4 max-w-lg mx-auto text-center rounded-3xl bg-card border border-border space-y-5 shadow-sm">
            <div className="size-20 rounded-full bg-secondary/80 text-muted-foreground flex items-center justify-center mx-auto">
              <ShoppingCart className="size-10 text-primary/70" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                Your cart is empty
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
                Find everyday groceries, dairy essentials, and verified near-expiry rescue deals at great prices.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs font-bold">
              <Link
                to="/customer/browse"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-primary text-primary-foreground uppercase hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>BROWSE PRODUCTS</span>
                <ArrowRight className="size-3.5" />
              </Link>

              <Link
                to="/customer/saved-items"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase transition-all border border-border flex items-center justify-center gap-2"
              >
                <Heart className="size-3.5" />
                <span>SAVED ITEMS ({wishlist.size})</span>
              </Link>
            </div>
          </div>
        ) : (
          /* 2-Column E-Commerce Cart Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Savings Announcement Banner */}
              {totalSavings > 0 && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <Sparkles className="size-4 shrink-0 text-emerald-500" />
                    <span>You are saving {formatINR(totalSavings)} on this rescue order!</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                    Discounts applied automatically
                  </span>
                </div>
              )}

              {/* Items Card List */}
              <div className="space-y-3">
                {cartItems.map((item, idx) => {
                  if (!item) return null;

                  // Defensive resolution of product and offer
                  const rawProduct = item.product || (item as any);
                  const product = {
                    id: rawProduct?.id || (item as any)?.productId || `prod-${idx}`,
                    name: rawProduct?.name || (item as any)?.title || "Grocery Item",
                    brand: rawProduct?.brand || "ERN Verified",
                    unit: rawProduct?.unit || "1 unit",
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
                    type: rawOffer?.type || (item as any)?.type || "Rescue Deal",
                    availability: Number(
                      rawOffer?.availability ?? (item as any)?.availability ?? (item as any)?.stock ?? 99
                    ),
                  };

                  // Safe expiry calculation - never invent fake dates
                  const hasValidDate = Boolean(offer.expiryDate && !isNaN(new Date(offer.expiryDate).getTime()));
                  const expiryInfo = hasValidDate ? calculateExpiryStatus(offer.expiryDate) : null;

                  // Safe pricing calculation
                  const safeMrp = offer.mrp || product.mrp || offer.price || 0;
                  const safeSellingPrice = offer.price ?? product.price ?? safeMrp;
                  const pricing = calculatePricing(safeMrp, {
                    sellingPrice: safeSellingPrice,
                  });

                  const quantity = Math.max(1, item.quantity || 1);
                  const maxStock = Math.max(1, offer.availability || 99);
                  const itemTotal = pricing.sellingPrice * quantity;
                  const itemSavings = pricing.savings * quantity;

                  const isClearance = offer.type === "Clearance" || expiryInfo?.tier === "Clearance";
                  const isRescue = offer.type === "Rescue Deal" || expiryInfo?.tier === "Rescue Deal";

                  return (
                    <div
                      key={`${product.id}-${offer.id}-${idx}`}
                      className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-border/80 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-xs"
                    >
                      {/* Left: Product Image & Details */}
                      <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                        <Link
                          to={`/marketplace/product/${product.id}`}
                          className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-white border border-border p-2 shrink-0 group block"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                            }}
                          />
                        </Link>

                        <div className="space-y-1 min-w-0 flex-1">
                          {/* Brand & Package */}
                          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                            <span className="font-semibold text-foreground/90">{product.brand}</span>
                            <span>•</span>
                            <span>{product.unit}</span>
                          </div>

                          {/* Product Title */}
                          <Link
                            to={`/marketplace/product/${product.id}`}
                            className="font-sans font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-1 block"
                          >
                            {product.name}
                          </Link>

                          {/* Batch & Expiry Pill */}
                          <div className="flex items-center gap-2 flex-wrap pt-0.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold border ${
                                isClearance
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : isRescue
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                  : "bg-secondary text-secondary-foreground border-border"
                              }`}
                            >
                              {offer.type}
                            </span>

                            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3 text-primary" />
                              <span>{hasValidDate && expiryInfo ? expiryInfo.expiryText : "Expiry date unavailable"}</span>
                            </span>

                            <span className="text-[10px] font-mono text-muted-foreground">
                              (Batch #{offer.batchNumber})
                            </span>
                          </div>

                          {/* Stock Urgency Indicator */}
                          {maxStock <= 8 && (
                            <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                              Only {maxStock} available in this batch
                            </p>
                          )}

                          {/* Expiry Warning if Expired */}
                          {expiryInfo?.isExpired && (
                            <p className="text-[11px] font-mono text-destructive font-bold flex items-center gap-1 pt-0.5">
                              <AlertTriangle className="size-3" />
                              <span>This batch has expired. Please remove or select an active batch.</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Quantity Stepper, Price & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 shrink-0">
                        {/* Pricing */}
                        <div className="text-left sm:text-right space-y-0.5">
                          <div className="flex items-baseline gap-1.5 sm:justify-end">
                            <span className="text-lg font-bold font-sans text-foreground">
                              {formatINR(itemTotal)}
                            </span>
                            {pricing.hasDiscount && (
                              <span className="text-xs text-muted-foreground line-through font-mono">
                                {formatINR((safeMrp || pricing.mrp) * quantity)}
                              </span>
                            )}
                          </div>
                          {pricing.hasDiscount && (
                            <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 block">
                              Save {formatINR(itemSavings)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-background rounded-full p-1 border border-border">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, -1, quantity, maxStock)}
                              className="size-7 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-foreground transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-8 text-center font-mono text-xs font-bold text-foreground">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, 1, quantity, maxStock)}
                              disabled={quantity >= maxStock}
                              className="size-7 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                              title={quantity >= maxStock ? `Only ${maxStock} available` : "Increase quantity"}
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        </div>

                        {/* Secondary Actions: Save for Later & Remove */}
                        <div className="flex items-center gap-3 font-mono text-xs">
                          <button
                            type="button"
                            onClick={() => handleSaveForLater(idx, item)}
                            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                            title="Move to Saved Items"
                          >
                            <Heart className="size-3" />
                            <span className="text-[11px]">Save for later</span>
                          </button>
                          <span className="text-border">•</span>
                          <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer"
                            title="Remove from Cart"
                          >
                            <Trash2 className="size-3" />
                            <span className="text-[11px]">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  to="/customer/browse"
                  className="text-xs font-mono font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Continue Shopping More Essentials</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary Card (4 cols) */}
            <aside className="lg:col-span-4 space-y-4 sticky top-24">
              <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-md space-y-5">
                <h3 className="font-display font-bold text-lg text-foreground pb-3 border-b border-border">
                  Order Summary
                </h3>

                {/* Pricing Line Items */}
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Items MRP Total:</span>
                    <span>{formatINR(originalTotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Discounted Subtotal:</span>
                    <span className="text-foreground font-semibold">{formatINR(totalAmount)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="size-3" />
                        <span>Rescue Savings:</span>
                      </span>
                      <span>-{formatINR(totalSavings)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Estimated Delivery:</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                      ) : (
                        formatINR(deliveryFee)
                      )}
                    </span>
                  </div>

                  {/* Total Payable */}
                  <div className="pt-3 border-t border-border flex items-baseline justify-between">
                    <div>
                      <span className="font-sans font-bold text-base text-foreground block">
                        Total Payable:
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Inclusive of all taxes
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold font-sans text-foreground">
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Primary Checkout CTA */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full py-4 px-6 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>CONTINUE TO CHECKOUT</span>
                  <ArrowRight className="size-4" />
                </button>

                {/* Transparent Assurance Badges */}
                <div className="pt-3 border-t border-border space-y-2 text-[11px] font-sans text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                    <span>ERN Expiry & Quality Protocol</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed">
                    All items in your cart have verified shelf life timestamps. Zero expired items are ever fulfilled.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
