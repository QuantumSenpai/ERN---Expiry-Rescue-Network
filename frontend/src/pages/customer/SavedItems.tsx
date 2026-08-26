import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Search,
  X,
  Clock,
  Sparkles,
  Flame,
  Trash2,
  Bell,
  Tag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  MASTER_PRODUCTS,
  type MarketplaceProduct,
  type ProductOffer,
} from "@/data/marketplaceData";
import MultiBatchModal from "@/components/marketplace/MultiBatchModal";

type FilterType = "all" | "better-price" | "rescue" | "clearance";

export default function SavedItems() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const [selectedProductForBatch, setSelectedProductForBatch] = useState<MarketplaceProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const savedProducts: MarketplaceProduct[] = useMemo(() => {
    return MASTER_PRODUCTS.filter((p) => wishlist.has(p.id));
  }, [wishlist]);

  const filteredProducts = useMemo(() => {
    let result = savedProducts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [savedProducts, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground font-body py-8 px-4 sm:px-6 lg:px-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="size-4 text-foreground shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
              <span>SAVED PRODUCTS</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground leading-[1.08] tracking-[-0.025em]">
              Wishlist & rescue watch
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-2">
              Track expiring batches and markdown discounts on your favorited items.
            </p>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs font-medium uppercase">
            <Link
              to="/marketplace"
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all shadow-none flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-none flex items-center gap-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved items by product, brand, category..."
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-sans"
          />
        </div>

        {/* Product Cards */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-background border border-border text-muted-foreground font-mono text-xs space-y-3">
            <Heart className="size-10 mx-auto text-muted-foreground" />
            <p>You have no items in your saved watchlist.</p>
            <Link
              to="/marketplace"
              className="inline-block px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-medium"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              const offer = p.defaultOffer;

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-background border border-border hover:border-primary flex flex-col justify-between space-y-3 transition-colors group shadow-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-medium uppercase">
                      {offer.type}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(p.id)}
                      className="p-1.5 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="aspect-square rounded-xl overflow-hidden bg-card flex items-center justify-center p-2">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{p.brand} · {p.category}</span>
                    <h3 className="font-display font-[350] text-base text-foreground truncate mt-0.5">{p.name}</h3>
                  </div>

                  <div className="p-3 rounded-xl bg-card flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-foreground text-base">₹{offer.price}</span>
                    <span className="text-muted-foreground">{offer.daysRemaining}d shelf life</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        addToCart(p, offer);
                        showToast(`${p.name} added to cart`);
                      }}
                      className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase hover:bg-[#567C8D] transition-colors cursor-pointer shadow-none"
                    >
                      Add to Cart
                    </button>
                    {p.allOffers.length > 1 && (
                      <button
                        onClick={() => setSelectedProductForBatch(p)}
                        className="px-3.5 py-2.5 rounded-full bg-card text-foreground text-xs font-mono font-medium uppercase hover:bg-[#c4c7c4]/40 cursor-pointer"
                      >
                        Batches
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MultiBatchModal
        product={selectedProductForBatch}
        onClose={() => setSelectedProductForBatch(null)}
        onSelectBatch={(prod, off) => {
          addToCart(prod, off);
          showToast(`${prod.name} batch added to cart`);
        }}
      />
    </div>
  );
}
