import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Building2,
  Check,
  X,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Sparkles,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import {
  CATEGORIES,
  type MarketplaceProduct,
  type ProductOffer,
  type CategorySlug,
} from "@/data/marketplaceData";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/marketplace/ProductCard";
import MultiBatchModal from "@/components/marketplace/MultiBatchModal";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { useStoreCatalog } from "@/lib/inventoryStore";

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { catalog, storeId, storeName } = useStoreCatalog();

  // URL search params
  const urlCategory = searchParams.get("category") || "all";
  const urlSearch = searchParams.get("search") || "";
  const urlTier = searchParams.get("tier") || "all";
  const urlSort = searchParams.get("sort") || "featured";
  const urlBrand = searchParams.get("brand") || "all";
  const urlPriceRange = searchParams.get("price") || "all";

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [selectedTier, setSelectedTier] = useState<string>(urlTier);
  const [selectedSort, setSelectedSort] = useState<string>(urlSort);
  const [selectedBrand, setSelectedBrand] = useState<string>(urlBrand);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(urlPriceRange);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSubmitted, setBulkSubmitted] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] = useState<MarketplaceProduct | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state with URL search params when they change
  useEffect(() => {
    const rawCat = searchParams.get("category") || "all";
    const matchedCat = CATEGORIES.find(
      (c) =>
        c.slug.toLowerCase() === rawCat.toLowerCase() ||
        c.name.toLowerCase().includes(rawCat.toLowerCase()) ||
        c.id.toLowerCase() === rawCat.toLowerCase()
    );
    setSelectedCategory(matchedCat ? matchedCat.slug : rawCat);
    setSearchQuery(searchParams.get("search") || "");
    setSelectedTier(searchParams.get("tier") || "all");
    setSelectedSort(searchParams.get("sort") || "featured");
    setSelectedBrand(searchParams.get("brand") || "all");
    setSelectedPriceRange(searchParams.get("price") || "all");
  }, [searchParams]);

  // Helper to update search params
  const updateFilterParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedTier("all");
    setSelectedSort("featured");
    setSelectedBrand("all");
    setSelectedPriceRange("all");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: MarketplaceProduct, offer?: ProductOffer) => {
    const targetOffer = offer || product.defaultOffer;
    addToCart(product, targetOffer, 1, storeId, storeName);
    showToast(`${product.name} (${targetOffer.type}) added to cart`);
  };

  const handleToggleWishlist = (product: MarketplaceProduct) => {
    const isSaved = toggleWishlist(product);
    showToast(
      isSaved
        ? `${product.name} saved to Saved Items`
        : `${product.name} removed from Saved Items`
    );
  };

  // Distinct brands list
  const allBrands = useMemo(() => {
    const brands = new Set(catalog.map((p) => p.brand));
    return Array.from(brands).sort();
  }, [catalog]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...catalog];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q))
      );
    }

    // 2. Category filter
    if (selectedCategory !== "all") {
      const catLower = selectedCategory.toLowerCase();
      list = list.filter(
        (p) =>
          p.categorySlug.toLowerCase() === catLower ||
          p.category.toLowerCase().includes(catLower) ||
          catLower.includes(p.categorySlug.toLowerCase()) ||
          (catLower === "milk" && (p.categorySlug === "dairy" || p.name.toLowerCase().includes("milk"))) ||
          (catLower === "bread" && (p.categorySlug === "bakery" || p.name.toLowerCase().includes("bread")))
      );
    }

    // 3. Brand filter
    if (selectedBrand !== "all") {
      list = list.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // 4. Expiry / Rescue Tier filter
    if (selectedTier !== "all") {
      if (selectedTier === "clearance") {
        list = list.filter(
          (p) =>
            p.defaultOffer.type === "Clearance" ||
            p.allOffers.some((o) => o.type === "Clearance")
        );
      } else if (selectedTier === "rescue") {
        list = list.filter(
          (p) =>
            p.defaultOffer.type === "Rescue Deal" ||
            p.allOffers.some((o) => o.type === "Rescue Deal")
        );
      } else if (selectedTier === "fresh") {
        list = list.filter(
          (p) =>
            p.defaultOffer.type === "Fresh Stock" ||
            p.allOffers.some((o) => o.type === "Fresh Stock")
        );
      }
    }

    // 5. Price range filter
    if (selectedPriceRange !== "all") {
      if (selectedPriceRange === "under-50") {
        list = list.filter((p) => p.defaultOffer.price < 50);
      } else if (selectedPriceRange === "50-100") {
        list = list.filter((p) => p.defaultOffer.price >= 50 && p.defaultOffer.price <= 100);
      } else if (selectedPriceRange === "100-200") {
        list = list.filter((p) => p.defaultOffer.price > 100 && p.defaultOffer.price <= 200);
      } else if (selectedPriceRange === "above-200") {
        list = list.filter((p) => p.defaultOffer.price > 200);
      }
    }

    // 6. Sorting
    if (selectedSort === "price-asc") {
      list.sort((a, b) => a.defaultOffer.price - b.defaultOffer.price);
    } else if (selectedSort === "price-desc") {
      list.sort((a, b) => b.defaultOffer.price - a.defaultOffer.price);
    } else if (selectedSort === "discount") {
      list.sort((a, b) => b.defaultOffer.discountPercent - a.defaultOffer.discountPercent);
    } else if (selectedSort === "expiry") {
      list.sort((a, b) => {
        const daysA = a.defaultOffer.daysRemaining ?? 999;
        const daysB = b.defaultOffer.daysRemaining ?? 999;
        return daysA - daysB;
      });
    }

    return list;
  }, [selectedCategory, searchQuery, selectedTier, selectedBrand, selectedPriceRange, selectedSort]);

  // Active filter count
  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedTier !== "all" ? 1 : 0) +
    (selectedBrand !== "all" ? 1 : 0) +
    (selectedPriceRange !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold uppercase mb-2">
              <Sparkles className="size-3" />
              <span>Full Marketplace Catalog</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Everyday Groceries & Rescue Deals
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">
              Browse brand-name groceries with transparent expiry batches, discount tiers, and store pickup.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBulkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all font-mono text-xs font-bold uppercase border border-border cursor-pointer shadow-xs"
            >
              <Building2 className="size-4" />
              <span>Commercial Bulk Inquiry</span>
            </button>
          </div>
        </div>

        {/* Search Bar + Mobile Filter Toggle + Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name, brand, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateFilterParam("search", e.target.value);
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-background border border-border focus:border-primary text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  updateFilterParam("search", "");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-mono text-xs font-bold border border-border cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-1.5 font-mono text-xs">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  updateFilterParam("sort", e.target.value);
                }}
                className="bg-transparent text-foreground outline-none cursor-pointer font-medium text-xs pr-1"
                aria-label="Sort products"
              >
                <option value="featured" className="bg-popover text-popover-foreground">Featured</option>
                <option value="price-asc" className="bg-popover text-popover-foreground">Price: Low to High</option>
                <option value="price-desc" className="bg-popover text-popover-foreground">Price: High to Low</option>
                <option value="discount" className="bg-popover text-popover-foreground">Highest Discount %</option>
                <option value="expiry" className="bg-popover text-popover-foreground">Expiring Soonest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-muted-foreground font-semibold">Active Filters:</span>

            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <span>Category: {CATEGORIES.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    updateFilterParam("category", "all");
                  }}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {selectedTier !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <span>Tier: {selectedTier === "clearance" ? "Clearance (≤2d)" : selectedTier === "rescue" ? "Rescue Deal (3-7d)" : "Fresh Stock"}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier("all");
                    updateFilterParam("tier", "all");
                  }}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {selectedBrand !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <span>Brand: {selectedBrand}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand("all");
                    updateFilterParam("brand", "all");
                  }}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {selectedPriceRange !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <span>Price: {selectedPriceRange}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPriceRange("all");
                    updateFilterParam("price", "all");
                  }}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <span>Keyword: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    updateFilterParam("search", "");
                  }}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline ml-2 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="size-3" />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* Main Body: 2 Columns (Sidebar + Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Filter Sidebar (3 cols) */}
          <aside
            className={`lg:col-span-3 space-y-5 bg-card border border-border rounded-2xl p-5 sticky top-24 ${
              isMobileFilterOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-mono text-xs font-bold uppercase tracking-tight text-foreground flex items-center gap-1.5">
                <Filter className="size-3.5 text-primary" />
                <span>Filters & Refinements</span>
              </h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h4 className="font-mono text-[11px] font-bold uppercase text-muted-foreground">
                Category
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        updateFilterParam("category", cat.slug);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                      <span className="text-[10px] font-mono opacity-80 shrink-0">
                        {cat.itemCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expiry / Rescue Tier Filter */}
            <div className="space-y-2 pt-3 border-t border-border">
              <h4 className="font-mono text-[11px] font-bold uppercase text-muted-foreground">
                Expiry & Rescue Tier
              </h4>
              <div className="space-y-1">
                {[
                  { id: "all", label: "All Products", desc: "Fresh + Rescue" },
                  { id: "clearance", label: "Clearance (≤ 2 days)", desc: "Up to 60% off" },
                  { id: "rescue", label: "Rescue Deals (3-7 days)", desc: "20-40% off" },
                  { id: "fresh", label: "Fresh Stock (> 7 days)", desc: "Standard grocery" },
                ].map((tier) => {
                  const isSelected = selectedTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        setSelectedTier(tier.id);
                        updateFilterParam("tier", tier.id);
                      }}
                      className={`w-full flex flex-col px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{tier.label}</span>
                      <span className="text-[10px] font-mono opacity-70">{tier.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2 pt-3 border-t border-border">
              <h4 className="font-mono text-[11px] font-bold uppercase text-muted-foreground">
                Price Range
              </h4>
              <div className="space-y-1">
                {[
                  { id: "all", label: "All Prices" },
                  { id: "under-50", label: "Under ₹50" },
                  { id: "50-100", label: "₹50 - ₹100" },
                  { id: "100-200", label: "₹100 - ₹200" },
                  { id: "above-200", label: "Above ₹200" },
                ].map((range) => {
                  const isSelected = selectedPriceRange === range.id;
                  return (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => {
                        setSelectedPriceRange(range.id);
                        updateFilterParam("price", range.id);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{range.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 pt-3 border-t border-border">
              <h4 className="font-mono text-[11px] font-bold uppercase text-muted-foreground">
                Brand
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand("all");
                    updateFilterParam("brand", "all");
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    selectedBrand === "all"
                      ? "bg-primary text-primary-foreground font-bold"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>All Brands</span>
                </button>
                {allBrands.map((brand) => {
                  const isSelected = selectedBrand.toLowerCase() === brand.toLowerCase();
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(brand);
                        updateFilterParam("brand", brand);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{brand}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Main Product Grid (9 cols) */}
          <main className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{filteredProducts.length}</strong> items
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 px-4 bg-card rounded-3xl border border-border space-y-4">
                <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                  No products match your filters
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md mx-auto">
                  Try clearing some filter criteria or searching for different brands or grocery categories.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold uppercase transition-all hover:bg-primary/90 cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredProducts.map((item) => (
                  <div key={item.id} className="h-full">
                    <ProductCard
                      product={item}
                      isWishlisted={wishlist.has(item.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onOpenMultiBatchModal={(p) => setSelectedProductForBatch(p)}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Multi-Batch Modal */}
      <MultiBatchModal
        product={selectedProductForBatch}
        onClose={() => setSelectedProductForBatch(null)}
        onSelectBatch={handleAddToCart}
      />

      {/* Commercial Bulk Inquiry Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs font-body">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-foreground">
                <Building2 className="size-4 text-primary" />
                <span>Commercial Bulk Inquiry</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBulkModalOpen(false);
                  setBulkSubmitted(false);
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {bulkSubmitted ? (
              <div className="text-center py-8 space-y-3 font-sans">
                <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="size-6" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Inquiry Received</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Our store operations team will review your bulk order requirements and contact you within 2 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBulkModalOpen(false);
                    setBulkSubmitted(false);
                  }}
                  className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setBulkSubmitted(true);
                }}
                className="space-y-4 text-xs font-sans"
              >
                <p className="text-muted-foreground leading-relaxed">
                  Looking to purchase large volumes of rescue batches for restaurants, caterers, or community kitchens? Submit your requirements below.
                </p>

                <div className="space-y-1.5 font-mono">
                  <label className="text-foreground font-bold uppercase text-[11px] block">
                    Organization / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Cafe Green Kitchen"
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold uppercase text-[11px] block">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold uppercase text-[11px] block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-foreground font-bold uppercase text-[11px] block">
                    Target Categories & Estimated Quantity
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. 50L Amul Milk, 30kg Aashirvaad Atta weekly"
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary text-foreground outline-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold uppercase hover:bg-primary/90 cursor-pointer shadow-xs"
                  >
                    Submit Bulk Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
