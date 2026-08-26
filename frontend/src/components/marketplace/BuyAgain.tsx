import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, ChevronRight } from "lucide-react";
import type { MarketplaceProduct, ProductOffer } from "@/data/marketplaceData";

interface BuyAgainProps {
  products: MarketplaceProduct[];
  onAddToCart: (product: MarketplaceProduct, offer?: ProductOffer) => void;
}

const buyAgainContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const buyAgainItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export default function BuyAgain({ products, onAddToCart }: BuyAgainProps) {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const handleAdd = (product: MarketplaceProduct) => {
    onAddToCart(product);
    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1500);
  };

  return (
    <div className="space-y-3 flex flex-col justify-between h-full text-foreground font-body">
      <div>
        <h4 className="font-display font-[350] text-xs sm:text-sm text-foreground uppercase tracking-tight">
          BUY AGAIN
        </h4>
        <p className="text-[11px] text-muted-foreground font-body mt-0.5">
          Your frequently ordered items
        </p>
      </div>

      {/* 3 items in a vertical list */}
      <motion.div
        variants={buyAgainContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="space-y-2 flex-1"
      >
        {products.map((product) => {
          const isAdded = recentlyAddedId === product.id;
          const bestOffer = product.defaultOffer;

          return (
            <motion.div
              key={product.id}
              variants={buyAgainItemVariants}
              whileHover={{ y: -1 }}
              className="p-3 rounded-2xl bg-card flex items-center justify-between gap-3 transition-colors shadow-none"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-xl overflow-hidden bg-background shrink-0 p-0.5">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="min-w-0 font-mono">
                  <h5 className="text-xs font-medium text-foreground truncate">
                    {product.name}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <span>{product.unit}</span>
                    <span>&bull;</span>
                    <span className="font-medium text-foreground">₹{bestOffer.price}</span>
                  </div>
                </div>
              </div>

              {/* Quick Add Button */}
              <button
                type="button"
                onClick={() => handleAdd(product)}
                className={`p-2 rounded-full transition-all duration-150 cursor-pointer shadow-none active:scale-95 shrink-0 ${
                  isAdded
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary text-primary-foreground hover:bg-[#567C8D]"
                }`}
                title="Add to Cart"
              >
                {isAdded ? (
                  <Check className="size-3.5" />
                ) : (
                  <Plus className="size-3.5" />
                )}
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
