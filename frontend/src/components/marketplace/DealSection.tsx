import { Link } from "react-router-dom";
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
          <h3 className="font-display font-bold text-base sm:text-lg text-foreground uppercase tracking-tight">
            TODAY&rsquo;S RESCUE DEALS
          </h3>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Discounted groceries expiring soon near you:
          </p>
        </div>

        <Link
          to="/customer/browse?tier=rescue"
          className="text-xs font-mono font-bold uppercase text-foreground hover:underline inline-flex items-center gap-1 group transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* 2-Column Product Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-stretch">
        {products.slice(0, 2).map((item) => (
          <div key={item.id} className="h-full">
            <ProductCard
              product={item}
              isWishlisted={wishlist.has(item.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onOpenMultiBatchModal={onOpenMultiBatchModal}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
