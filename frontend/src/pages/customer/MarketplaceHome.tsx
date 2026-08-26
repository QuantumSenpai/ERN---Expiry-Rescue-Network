import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRescueDeals } from "@/context/RescueDealsContext";

import {
  MASTER_PRODUCTS,
  type MarketplaceProduct,
  type ProductOffer,
} from "@/data/marketplaceData";

import HeroSection from "@/components/marketplace/HeroSection";
import TrustStrip from "@/components/marketplace/TrustStrip";
import CategorySelector from "@/components/marketplace/CategorySelector";
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

export default function MarketplaceHome() {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { getMarketplaceDeals } = useRescueDeals();

  const [selectedProductForMultiBatch, setSelectedProductForMultiBatch] =
    useState<MarketplaceProduct | null>(null);

  const staffPublishedProducts = useMemo((): MarketplaceProduct[] => {
    const liveDeals = getMarketplaceDeals();
    return liveDeals.map((deal) => {
      const baseProduct = MASTER_PRODUCTS.find(
        (p) => p.productId === deal.productId || p.id === `prod-${deal.productId}`
      );

      const rescueOffer: ProductOffer = {
        id: `deal-${deal.batchNo}`,
        type: "Rescue Deal",
        price: deal.rescuePrice,
        originalPrice: deal.originalPrice,
        discountPercent: deal.discountPercent,
        savings: deal.savings,
        expiryText: `${deal.daysRemaining} day${deal.daysRemaining !== 1 ? "s" : ""} left`,
        daysRemaining: deal.daysRemaining,
        availability: deal.quantity,
        badge: `RESCUE -${deal.discountPercent}%`,
        badgeColor: "bg-primary text-primary-foreground",
        tagline: `Staff Rescue Deal • Batch ${deal.batchNo}`,
      };

      return {
        id: deal.id,
        productId: deal.productId,
        name: deal.name,
        subtitle: baseProduct?.subtitle || `${deal.brand} • Rescue Batch ${deal.batchNo}`,
        brand: deal.brand,
        category: deal.category,
        categorySlug: baseProduct?.categorySlug || "food",
        imageUrl: deal.imageUrl,
        unit: deal.unit,
        rating: baseProduct?.rating || 4.5,
        reviewsCount: baseProduct?.reviewsCount || 0,
        defaultOffer: rescueOffer,
        allOffers: [rescueOffer],
        isRescueDeal: true,
        isPopular: false,
        isRecommended: true,
        isClearance: false,
        isBuyAgain: false,
        tag: `LIVE RESCUE -${deal.discountPercent}%`,
        recommendationReason: `Published by ${deal.publishedBy}`,
      } satisfies MarketplaceProduct;
    });
  }, [getMarketplaceDeals]);

  const [selectedCategory, setSelectedCategory] = useState("all");
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
    addToCart(product, offer);
    showToast(
      `${product.name} (${(offer || product.defaultOffer).type}) added to cart`
    );
  };

  const handleToggleWishlist = (product: MarketplaceProduct) => {
    toggleWishlist(product);
    const isNowSaved = !wishlist.has(product.id);
    showToast(
      isNowSaved
        ? `${product.name} added to saved items`
        : `${product.name} removed from saved items`
    );
  };

  // Filter products by selectedCategory + activeChip
  const filteredProducts = useMemo(() => {
    let result = MASTER_PRODUCTS;

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    if (activeChip) {
      const chipLower = activeChip.toLowerCase();
      result = result.filter(
        (p) =>
          p.category.toLowerCase().includes(chipLower) ||
          p.name.toLowerCase().includes(chipLower)
      );
    }

    return result;
  }, [selectedCategory, activeChip]);

  const signatureProduct =
    filteredProducts.find((p) => p.allOffers.length >= 3) ||
    filteredProducts[0] ||
    MASTER_PRODUCTS[0];

  const popularProducts = useMemo(
    () => MASTER_PRODUCTS.filter((p) => p.isPopular).slice(0, 3),
    []
  );

  const buyAgainProducts = useMemo(
    () => MASTER_PRODUCTS.filter((p) => p.isBuyAgain).slice(0, 3),
    []
  );

  const recommendedProducts = useMemo(
    () => MASTER_PRODUCTS.filter((p) => p.isRecommended).slice(0, 3),
    []
  );

  const sectionRevealVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <div className="space-y-0 text-foreground font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
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

      {/* 1. HERO */}
      <section id="hero">
        <HeroSection
          onExploreProducts={() => {
            const el = document.getElementById("products") || document.getElementById("main-deals-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          onExploreDeals={() => {
            const el = document.getElementById("deals") || document.getElementById("banners-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </section>

      {/* 2. TRUST STRIP */}
      <motion.div
        variants={sectionRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <TrustStrip />
      </motion.div>

      {/* 3. CATEGORY SELECTOR */}
      <motion.div
        variants={sectionRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={(catSlug) => {
            setSelectedCategory(catSlug);
            const el = document.getElementById("products") || document.getElementById("main-deals-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </motion.div>

      {/* 4. SIDE-BY-SIDE: SMART PRICE + TODAY'S BEST DEALS */}
      <motion.section
        id="products"
        variants={sectionRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-background scroll-mt-24"
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: SMART PRICING */}
          <div className="lg:col-span-4 xl:col-span-4">
            <SmartPriceProduct
              product={signatureProduct}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Right: TODAY'S BEST DEALS */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-3">
            {staffPublishedProducts.length > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium">
                <Zap className="size-3.5 shrink-0" />
                <span>
                  {staffPublishedProducts.length} LIVE RESCUE LOT{staffPublishedProducts.length > 1 ? "S" : ""} ACTIVE
                </span>
                <span className="text-muted-foreground font-normal">
                  — Published by ERN Operations Desk
                </span>
              </div>
            )}
            <DealSection
              products={[...staffPublishedProducts, ...filteredProducts]}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onOpenMultiBatchModal={(p) => setSelectedProductForMultiBatch(p)}
            />
          </div>
        </div>
      </motion.section>

      {/* 5. MIDDLE 2-BANNER ROW */}
      <motion.section
        id="deals"
        variants={sectionRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-card"
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
      </motion.section>

      {/* 6. RESCUE IMPACT METRICS */}
      <motion.div
        variants={sectionRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <RescueImpact />
      </motion.div>

      {/* 7. 3-COLUMN ESSENTIALS */}
      <motion.section
        variants={sectionRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-background"
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <BuyAgain
            products={buyAgainProducts}
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
      </motion.section>

      {/* 8. SERVICE BENEFITS */}
      <motion.div
        variants={sectionRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <ServiceBenefits />
      </motion.div>

      {/* MULTI-BATCH MODAL */}
      <MultiBatchModal
        product={selectedProductForMultiBatch}
        onClose={() => setSelectedProductForMultiBatch(null)}
        onSelectBatch={handleAddToCart}
      />
    </div>
  );
}
