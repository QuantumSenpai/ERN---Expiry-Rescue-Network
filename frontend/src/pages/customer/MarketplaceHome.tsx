import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, X, ArrowRight, Sparkles, Flame } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRescueDeals } from "@/context/RescueDealsContext";
import { useStoreCatalog } from "@/lib/inventoryStore";

import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";

import HeroSection from "@/components/marketplace/HeroSection";
import TrustStrip from "@/components/marketplace/TrustStrip";
import ShopByCategory from "@/components/marketplace/ShopByCategory";
import SmartPriceProduct from "@/components/marketplace/SmartPriceProduct";
import DealSection from "@/components/marketplace/DealSection";
import ExpiryDealBanner from "@/components/marketplace/ExpiryDealBanner";
import ClearanceSection from "@/components/marketplace/ClearanceSection";
import RescueImpact from "@/components/marketplace/RescueImpact";
import BuyAgain from "@/components/marketplace/BuyAgain";
import Recommendations from "@/components/marketplace/Recommendations";
import CategoryChips from "@/components/marketplace/CategoryChips";
import ServiceBenefits from "@/components/marketplace/ServiceBenefits";
import MultiBatchModal from "@/components/marketplace/MultiBatchModal";
import ProductCard from "@/components/marketplace/ProductCard";

export default function MarketplaceHome() {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { getMarketplaceDeals } = useRescueDeals();
  const { catalog, storeId, storeName } = useStoreCatalog();

  const [selectedProductForMultiBatch, setSelectedProductForMultiBatch] =
    useState<MarketplaceProduct | null>(null);

  const staffPublishedProducts = useMemo((): MarketplaceProduct[] => {
    const liveDeals = getMarketplaceDeals();
    return liveDeals.map((deal) => {
      const baseProduct = catalog.find(
        (p) => p.productId === deal.productId || p.id === `prod-${deal.productId}`
      );

      const rescueOffer: ProductOffer = {
        id: `deal-${deal.batchNo}`,
        batchNumber: deal.batchNo,
        type: "Rescue Deal",
        mrp: deal.originalPrice,
        price: deal.rescuePrice,
        discountPercent: deal.discountPercent,
        savings: deal.savings,
        expiryDate: deal.expiryDate,
        expiryText: `${deal.daysRemaining} day${deal.daysRemaining !== 1 ? "s" : ""} left`,
        daysRemaining: deal.daysRemaining,
        availability: deal.quantity,
        tagline: `Rescue Deal • Batch ${deal.batchNo}`,
        storeId,
        storeName,
      };

      return {
        id: deal.id,
        productId: deal.productId,
        name: deal.name,
        subtitle: baseProduct?.subtitle || `${deal.brand} • Rescue Batch ${deal.batchNo}`,
        brand: deal.brand,
        category: deal.category,
        categorySlug: baseProduct?.categorySlug || "staples",
        imageUrl: deal.imageUrl,
        unit: deal.unit,
        mrp: deal.originalPrice,
        rating: baseProduct?.rating || 4.7,
        reviewsCount: baseProduct?.reviewsCount || 80,
        defaultOffer: rescueOffer,
        allOffers: [rescueOffer],
        isRescueDeal: true,
        isPopular: false,
        isRecommended: true,
        isClearance: false,
        isBuyAgain: false,
      } satisfies MarketplaceProduct;
    });
  }, [getMarketplaceDeals, catalog, storeId, storeName]);

  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (
    product: MarketplaceProduct,
    offer?: ProductOffer
  ) => {
    const targetOffer = offer || product.defaultOffer;
    addToCart(product, targetOffer, 1, storeId, storeName);
    showToast(`${product.name} (${targetOffer.type}) added to cart`);
  };

  const handleToggleWishlist = (product: MarketplaceProduct) => {
    const isNowSaved = toggleWishlist(product);
    showToast(
      isNowSaved
        ? `${product.name} saved to Saved Items`
        : `${product.name} removed from Saved Items`
    );
  };

  // Filter products by activeChip if clicked
  const filteredProducts = useMemo(() => {
    let result = catalog;
    if (activeChip) {
      const chipLower = activeChip.toLowerCase();
      result = result.filter(
        (p) =>
          p.category.toLowerCase().includes(chipLower) ||
          p.name.toLowerCase().includes(chipLower) ||
          p.brand.toLowerCase().includes(chipLower)
      );
    }
    return result;
  }, [activeChip, catalog]);

  const signatureProduct =
    filteredProducts.find((p) => p.allOffers.length >= 2) ||
    catalog[0];

  const clearanceDeals = useMemo(
    () => catalog.filter((p) => p.isClearance || p.allOffers.some((o) => o.type === "Clearance")).slice(0, 4),
    [catalog]
  );

  const popularProducts = useMemo(
    () => catalog.filter((p) => p.isPopular).slice(0, 4),
    [catalog]
  );

  const buyAgainProducts = useMemo(
    () => catalog.filter((p) => p.isBuyAgain).slice(0, 3),
    [catalog]
  );

  const recommendedProducts = useMemo(
    () => catalog.filter((p) => p.isRecommended).slice(0, 3),
    [catalog]
  );

  return (
    <div className="space-y-0 text-foreground font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-2xl text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <HeroSection
        onExploreProducts={() => {
          const el = document.getElementById("products");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onExploreDeals={() => {
          const el = document.getElementById("deals");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onAddToCart={handleAddToCart}
      />

      {/* 2. TRUST / VALUE PROPS STRIP */}
      <TrustStrip />

      {/* 3. SHOP BY CATEGORY */}
      <ShopByCategory />

      {/* 4. FLASH CLEARANCE DEALS (Expiring in ≤ 2 Days) */}
      {clearanceDeals.length > 0 && (
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-gradient-to-r from-red-500/5 via-primary/5 to-amber-500/5">
          <div className="max-w-[1440px] mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10.5px] font-mono font-bold uppercase mb-1">
                  <Flame className="size-3 text-accent" />
                  <span>FLASH CLEARANCE</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  Last-Chance Grocery Clearance (Up to 60% Off)
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
                  Items expiring in 1-2 days. Buy today, consume promptly, and save big.
                </p>
              </div>

              <Link
                to="/customer/browse?tier=clearance"
                className="text-xs font-mono font-bold uppercase text-foreground hover:text-primary transition-colors flex items-center gap-1 group py-1.5 px-3 rounded-full hover:bg-secondary border border-transparent hover:border-border"
              >
                <span>View All Clearance</span>
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {clearanceDeals.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard
                    product={product}
                    isWishlisted={wishlist.has(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                    onOpenMultiBatchModal={(p) => setSelectedProductForMultiBatch(p)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. SIDE-BY-SIDE: SMART PRICE + TODAY'S BEST DEALS */}
      <section
        id="products"
        className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-background scroll-mt-24"
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: SMART PRICING SELECTION */}
          <div className="lg:col-span-4 xl:col-span-4">
            <SmartPriceProduct
              product={signatureProduct}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Right: TODAY'S RESCUE DEALS */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-3">
            <DealSection
              products={[...staffPublishedProducts, ...filteredProducts]}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onOpenMultiBatchModal={(p) => setSelectedProductForMultiBatch(p)}
            />
          </div>
        </div>
      </section>

      {/* 6. 2-BANNER PROMO ROW */}
      <section
        id="deals"
        className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-card/60"
      >
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 gap-6">
          <ExpiryDealBanner
            onExplore={() => {
              const el = document.getElementById("products");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <ClearanceSection
            onExplore={() => {
              const el = document.getElementById("products");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {/* 7. POPULAR & EVERYDAY ESSENTIALS (Fresh Stock + Verified Deals) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-background">
        <div className="max-w-[1440px] mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-[10.5px] font-mono font-bold uppercase mb-1">
                <Sparkles className="size-3 text-primary" />
                <span>POPULAR ESSENTIALS</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                Everyday Kitchen & Household Staples
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
                Top brands trusted across Indian households with multi-tier batch availability.
              </p>
            </div>

            <Link
              to="/customer/browse"
              className="text-xs font-mono font-bold uppercase text-foreground hover:text-primary transition-colors flex items-center gap-1 group py-1.5 px-3 rounded-full hover:bg-secondary border border-transparent hover:border-border"
            >
              <span>Explore All</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularProducts.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard
                  product={product}
                  isWishlisted={wishlist.has(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onOpenMultiBatchModal={(p) => setSelectedProductForMultiBatch(p)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. RESCUE IMPACT METRICS */}
      <RescueImpact />

      {/* 9. 3-COLUMN ESSENTIALS (Buy Again / Recommendations / Chips) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-card/30">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <BuyAgain
            products={buyAgainProducts.length > 0 ? buyAgainProducts : popularProducts}
            onAddToCart={handleAddToCart}
          />
          <Recommendations
            products={recommendedProducts}
            onOpenMultiBatchModal={(p) => setSelectedProductForMultiBatch(p)}
            onViewAll={() => {
              const el = document.getElementById("products");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <CategoryChips
            activeChip={activeChip}
            onSelectChip={(chip) => {
              setActiveChip(chip);
              const el = document.getElementById("products");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {/* 10. SERVICE BENEFITS */}
      <ServiceBenefits />

      {/* MULTI-BATCH MODAL */}
      <MultiBatchModal
        product={selectedProductForMultiBatch}
        onClose={() => setSelectedProductForMultiBatch(null)}
        onSelectBatch={handleAddToCart}
      />
    </div>
  );
}
