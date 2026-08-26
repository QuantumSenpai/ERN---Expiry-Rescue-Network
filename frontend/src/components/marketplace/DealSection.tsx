import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";

interface DealSectionProps {
  products: MarketplaceProduct[];
  wishlist: Set<string>;
  onToggleWishlist: (product: MarketplaceProduct) => void;
  onAddToCart: (product: MarketplaceProduct, offer?: ProductOffer) => void;
  onOpenMultiBatchModal: (product: MarketplaceProduct) => void;
}

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const cardItemVariants = {
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

export default function DealSection({
  products,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onOpenMultiBatchModal,
}: DealSectionProps) {
  return (
    <div className="space-y-3 relative flex flex-col justify-between h-full text-foreground font-body">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-[350] text-base sm:text-lg text-foreground uppercase tracking-tight">
            TODAY&rsquo;S RESCUE DEALS
          </h3>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">
            Limited time offers on verified warehouse lots.
          </p>
        </div>

        <a
          href="#deals"
          className="text-xs font-mono uppercase text-foreground hover:underline inline-flex items-center gap-1 group transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>

      {/* 2-Column Product Card Grid */}
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-stretch"
      >
        {products.slice(0, 2).map((item) => (
          <motion.div
            key={item.id}
            variants={cardItemVariants}
            className="h-full"
          >
            <ProductCard
              product={item}
              isWishlisted={wishlist.has(item.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onOpenMultiBatchModal={onOpenMultiBatchModal}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
