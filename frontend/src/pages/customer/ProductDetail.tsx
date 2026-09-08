import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Star,
  Truck,
  Minus,
  Plus,
} from "lucide-react";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { calculatePricing, formatINR } from "@/lib/pricingService";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/marketplace/ProductCard";
import { useStoreCatalog } from "@/lib/inventoryStore";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist, cartItems } = useCart();
  const { catalog, storeId, storeName } = useStoreCatalog();

  // Find product by id or productId in current store catalog
  const product = useMemo(() => {
    return (
      catalog.find((p) => p.id === productId || p.productId === productId) ||
      catalog[0]
    );
  }, [catalog, productId]);

  const offers = product.allOffers && product.allOffers.length > 0 ? product.allOffers : [product.defaultOffer];
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "ingredients" | "storage" | "policy">("desc");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedOffer = offers[selectedOfferIndex] || product.defaultOffer;
  const expiryInfo = calculateExpiryStatus(selectedOffer.expiryDate);
  const pricing = calculatePricing(selectedOffer.mrp || product.mrp, {
    sellingPrice: selectedOffer.price,
  });

  const isWishlisted = wishlist.has(product.id);

  // Check if item already in cart
  const cartItem = cartItems.find(
    (item) => item.product.id === product.id && item.selectedOffer.id === selectedOffer.id
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    if (selectedOffer.availability <= 0) return;
    addToCart(product, selectedOffer, quantity, storeId, storeName);
    showToast(`${quantity}x ${product.name} (${selectedOffer.type}) added to cart`);
  };

  const handleBuyNow = () => {
    if (selectedOffer.availability <= 0) return;
    addToCart(product, selectedOffer, quantity, storeId, storeName);
    navigate("/customer/checkout");
  };

  const handleToggleWishlist = () => {
    const isSaved = toggleWishlist(product);
    showToast(
      isSaved
        ? `${product.name} saved to Saved Items`
        : `${product.name} removed from Saved Items`
    );
  };

  // Related products from same category or brand
  const relatedProducts = useMemo(() => {
    return catalog.filter(
      (p) => p.id !== product.id && (p.categorySlug === product.categorySlug || p.brand === product.brand)
    ).slice(0, 4);
  }, [catalog, product]);

  return (
    <div className="min-h-screen bg-background text-foreground py-6 px-4 sm:px-6 lg:px-8 font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-2xl text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground flex-wrap">
          <Link to="/marketplace" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="size-3.5" />
            <span>Marketplace</span>
          </Link>
          <ChevronRight className="size-3" />
          <Link
            to={`/customer/browse?category=${encodeURIComponent(product.categorySlug)}`}
            className="hover:text-foreground transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image & Highlights (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-card border border-border overflow-hidden p-6 sm:p-8 relative aspect-square flex items-center justify-center shadow-xs">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                }}
              />

              {/* Floating Wishlist Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 size-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                  isWishlisted
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/90 backdrop-blur-xs text-muted-foreground hover:text-foreground"
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-label="Wishlist"
              >
                <Heart className="size-5" fill={isWishlisted ? "currentColor" : "none"} />
              </button>

              {/* Tier Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-tight font-bold border shadow-xs ${
                    selectedOffer.type === "Clearance"
                      ? "bg-primary text-primary-foreground border-primary"
                      : selectedOffer.type === "Rescue Deal"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/30"
                      : "bg-secondary text-secondary-foreground border-border"
                  }`}
                >
                  {selectedOffer.type}
                </span>
              </div>
            </div>

            {/* Quality & Assurance Info Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-3 font-sans text-xs">
              <h4 className="font-mono font-bold uppercase tracking-tight text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>ERN Quality & Expiry Protocol</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50">
                  <span className="font-semibold text-foreground block">Verified Batch ID</span>
                  <span>#{selectedOffer.batchNumber}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50">
                  <span className="font-semibold text-foreground block">Exact Expiry Date</span>
                  <span>{new Date(selectedOffer.expiryDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                Every batch is tracked in our store warehouse with date-based auditing. Expired items are strictly delisted from inventory.
              </p>
            </div>
          </div>

          {/* Right Column: Details, Batch Selector & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header: Brand, Title, Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-semibold">
                  {product.brand}
                </span>
                <span>Unit: {product.unit}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight">
                {product.name}
              </h1>

              <p className="text-sm text-muted-foreground font-sans">
                {product.subtitle}
              </p>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 pt-1 font-mono text-xs text-muted-foreground">
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating}</span>
                </div>
                <span>•</span>
                <span>{product.reviewsCount} customer reviews</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">In Stock</span>
              </div>
            </div>

            {/* Dynamic Price Block */}
            <div className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold font-sans text-foreground">
                  {formatINR(selectedOffer.price)}
                </span>
                {pricing.hasDiscount && (
                  <>
                    <span className="text-base sm:text-lg text-muted-foreground line-through font-mono">
                      {formatINR(pricing.mrp)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                      Save {formatINR(pricing.savings)} ({pricing.discountPercent}% off)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Inclusive of all taxes • Price reflects chosen batch tier
              </p>
            </div>

            {/* Available Batches & Tiers Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-bold uppercase tracking-tight text-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" />
                  <span>Choose Batch & Expiry Tier:</span>
                </label>
                <span className="text-xs font-mono text-muted-foreground">
                  {offers.length} batch option{offers.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {offers.map((offer, idx) => {
                  const isSelected = idx === selectedOfferIndex;
                  const itemExpiry = calculateExpiryStatus(offer.expiryDate);
                  const isClearance = offer.type === "Clearance";
                  const isRescue = offer.type === "Rescue Deal";

                  return (
                    <button
                      key={offer.id || idx}
                      type="button"
                      onClick={() => setSelectedOfferIndex(idx)}
                      className={`p-3.5 rounded-2xl text-left transition-all duration-150 border cursor-pointer relative flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? "bg-card border-primary ring-2 ring-primary/20 shadow-md"
                          : "bg-card/50 border-border hover:border-primary/40 hover:bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isClearance
                              ? "bg-primary text-primary-foreground"
                              : isRescue
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {offer.type}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="size-4 text-primary shrink-0" />
                        )}
                      </div>

                      <div>
                        <div className="text-lg font-bold font-sans text-foreground">
                          {formatINR(offer.price)}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="size-3 text-primary shrink-0" />
                          <span>{itemExpiry.expiryText}</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-muted-foreground border-t border-border/50 pt-1.5 flex justify-between items-center">
                        <span>Batch #{offer.batchNumber}</span>
                        <span>{offer.availability} left</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Action CTAs */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold uppercase text-foreground">
                  Quantity:
                </span>
                <div className="flex items-center rounded-full border border-border bg-card p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="size-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors cursor-pointer"
                    title="Decrease quantity"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(selectedOffer.availability, q + 1))}
                    disabled={quantity >= selectedOffer.availability}
                    className="size-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                    title="Increase quantity"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Max available: {selectedOffer.availability} units
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs font-bold">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={selectedOffer.availability <= 0}
                  className="py-3.5 px-6 rounded-full bg-primary text-primary-foreground uppercase hover:bg-primary/90 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <ShoppingCart className="size-4" />
                  <span>Add to Cart ({formatINR(selectedOffer.price * quantity)})</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={selectedOffer.availability <= 0}
                  className="py-3.5 px-6 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase transition-all active:scale-98 cursor-pointer border border-border flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Zap className="size-4 text-accent" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Store Pickup & Fulfillment Availability */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2 font-sans text-xs">
              <div className="flex items-center gap-2 font-mono font-bold text-foreground">
                <Truck className="size-4 text-primary" />
                <span>Store Fulfillment & Pickup:</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Available at <strong className="text-foreground">Indiranagar Central Hub</strong>,{" "}
                <strong className="text-foreground">MG Road City Center</strong>, and{" "}
                <strong className="text-foreground">Koramangala Store</strong>. Standard delivery within 2-4 hours or instant store pickup.
              </p>
            </div>
          </div>
        </div>

        {/* Tabbed Product Details */}
        <div className="mt-12 rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6">
          {/* Tab Headers */}
          <div className="flex items-center gap-2 border-b border-border pb-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("desc")}
              className={`px-4 py-2 rounded-full font-mono text-xs font-bold uppercase transition-all cursor-pointer shrink-0 ${
                activeTab === "desc"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ingredients")}
              className={`px-4 py-2 rounded-full font-mono text-xs font-bold uppercase transition-all cursor-pointer shrink-0 ${
                activeTab === "ingredients"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Ingredients
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("storage")}
              className={`px-4 py-2 rounded-full font-mono text-xs font-bold uppercase transition-all cursor-pointer shrink-0 ${
                activeTab === "storage"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Storage Instructions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("policy")}
              className={`px-4 py-2 rounded-full font-mono text-xs font-bold uppercase transition-all cursor-pointer shrink-0 ${
                activeTab === "policy"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Expiry Transparency
            </button>
          </div>

          {/* Tab Contents */}
          <div className="font-sans text-sm text-muted-foreground leading-relaxed min-h-[120px]">
            {activeTab === "desc" && (
              <div className="space-y-3">
                <p className="text-foreground font-medium text-base">
                  {product.description || "Authentic grocery product verified by store staff."}
                </p>
                <p>
                  Packaged and sealed by {product.brand}. Sourced directly for store inventory with batch verification.
                </p>
              </div>
            )}

            {activeTab === "ingredients" && (
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase text-foreground">
                  Ingredients & Formulation:
                </h4>
                <p className="text-foreground font-medium">
                  {product.ingredients || "Standard grocery food ingredients as stated on the manufacturer packaging."}
                </p>
              </div>
            )}

            {activeTab === "storage" && (
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase text-foreground">
                  Recommended Storage:
                </h4>
                <p className="text-foreground font-medium">
                  {product.storage || "Store in a cool, dry place away from direct sunlight."}
                </p>
              </div>
            )}

            {activeTab === "policy" && (
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase text-foreground">
                  ERN Verified Expiry Guarantee:
                </h4>
                <p>
                  All products listed on ERN indicate the exact remaining days until expiration. Products that reach zero days remaining are strictly delisted and cannot be purchased. We encourage purchasing near-expiry items that you intend to consume promptly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related & Similar Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-5">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Similar Products in {product.category}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
                Customers also viewed these essentials
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  isWishlisted={wishlist.has(rel.id)}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
