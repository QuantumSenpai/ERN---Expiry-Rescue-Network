import { motion } from "framer-motion";
import { ChevronRight, Layers } from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";

interface RecommendationsProps {
  products: MarketplaceProduct[];
  wishlist?: Set<string>;
  onToggleWishlist?: (product: MarketplaceProduct) => void;
  onAddToCart?: (product: MarketplaceProduct, offer?: ProductOffer) => void;
  onOpenMultiBatchModal: (product: MarketplaceProduct) => void;
  onViewAll?: () => void;
}

const recContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const recItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export default function Recommendations({
  products,
  onOpenMultiBatchModal,
  onViewAll,
}: RecommendationsProps) {
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      const el = document.getElementById("products") || document.getElementById("main-deals-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-3 flex flex-col justify-between h-full text-foreground font-body">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display font-[350] text-xs sm:text-sm text-foreground uppercase tracking-tight">
            RECOMMENDED FOR YOU
          </h4>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">
            Based on current fast-moving inventory
          </p>
        </div>

        <button
          type="button"
          onClick={handleViewAll}
          className="text-xs font-mono uppercase text-foreground hover:underline inline-flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 3 items in a vertical list */}
      <motion.div
        variants={recContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="space-y-2 flex-1"
      >
        {products.slice(0, 3).map((product) => {
          const offer = product.defaultOffer;

          return (
            <motion.div
              key={product.id}
              variants={recItemVariants}
              whileHover={{ y: -1 }}
              onClick={() => onOpenMultiBatchModal(product)}
              className="p-3 rounded-2xl bg-card hover:bg-[#c4c7c4]/40 flex items-center justify-between gap-3 transition-colors cursor-pointer shadow-none group"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-xl overflow-hidden bg-background shrink-0 p-0.5">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <div className="min-w-0 font-mono">
                  <h5 className="text-xs font-medium text-foreground truncate">
                    {product.name}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <span className="text-foreground font-medium">₹{offer.price}</span>
                    <span>&bull;</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground font-medium uppercase">
                      {offer.discountPercent}% OFF
                    </span>
                  </div>
                </div>
              </div>

              {/* Batches indicator */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                <Layers className="size-3" />
                <span>{product.allOffers.length} Batches</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
