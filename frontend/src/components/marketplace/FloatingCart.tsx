import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ArrowRight } from "lucide-react";

interface FloatingCartProps {
  itemCount: number;
  totalAmount: number;
  totalSavings: number;
  onOpenCart: () => void;
}

export default function FloatingCart({
  itemCount,
  totalAmount,
  totalSavings,
  onOpenCart,
}: FloatingCartProps) {
  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 right-6 z-40 font-mono"
      >
        <button
          type="button"
          onClick={onOpenCart}
          className="bg-primary text-primary-foreground hover:bg-[#567C8D] shadow-none p-3.5 sm:px-6 sm:py-3.5 rounded-full flex items-center gap-3.5 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-200 border border-[#2F4156]/20"
        >
          {/* Cart Icon & Count Badge */}
          <div className="relative flex items-center justify-center">
            <ShoppingCart className="size-5 transition-transform duration-200 group-hover:-rotate-6" />
            <span className="absolute -top-2.5 -right-2.5 size-5 rounded-full bg-card text-foreground text-[10px] font-bold flex items-center justify-center shadow-none border border-[#2F4156]/20">
              {itemCount}
            </span>
          </div>

          {/* Amount & Items Info */}
          <div className="text-left font-mono leading-tight">
            <div className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 uppercase">
              <span>{itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}</span>
              <span>&bull;</span>
              <span>₹{totalAmount}</span>
            </div>
            {totalSavings > 0 && (
              <span className="text-[10px] text-primary-foreground/80 block uppercase font-medium">
                Saved ₹{totalSavings}
              </span>
            )}
          </div>

          {/* View Cart Arrow */}
          <div className="flex items-center gap-1 text-xs font-mono uppercase font-semibold border-l border-[#F0E9D3]/30 pl-3">
            <span className="hidden sm:inline">VIEW CART</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
