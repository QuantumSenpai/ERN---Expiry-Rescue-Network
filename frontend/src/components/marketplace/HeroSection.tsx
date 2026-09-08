import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Plus, Check, Sparkles, Search, ShieldCheck, MapPin, Layers } from "lucide-react";
import { MASTER_PRODUCTS, SEARCH_CHIPS, type MarketplaceProduct } from "@/data/marketplaceData";
import { calculateExpiryStatus } from "@/lib/expiryService";
import { calculatePricing, formatINR } from "@/lib/pricingService";

interface HeroSectionProps {
  onExploreProducts: () => void;
  onExploreDeals: () => void;
  onAddToCart?: (product: MarketplaceProduct) => void;
}

export default function HeroSection({
  onExploreProducts,
  onExploreDeals,
  onAddToCart,
}: HeroSectionProps) {
  const navigate = useNavigate();
  const [isSpotlightAdded, setIsSpotlightAdded] = useState(false);
  const [heroSearch, setHeroSearch] = useState("");

  // Spotlight Product: Amul Taaza Toned Milk 1L
  const spotlightProduct = MASTER_PRODUCTS[0];
  const spotlightOffer = spotlightProduct.defaultOffer;
  const expiryInfo = calculateExpiryStatus(spotlightOffer.expiryDate);
  const pricing = calculatePricing(spotlightOffer.mrp || spotlightProduct.mrp, {
    sellingPrice: spotlightOffer.price,
  });

  const handleAddSpotlight = () => {
    if (onAddToCart) {
      onAddToCart(spotlightProduct);
    }
    setIsSpotlightAdded(true);
    setTimeout(() => setIsSpotlightAdded(false), 1500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/customer/browse?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate("/customer/browse");
    }
  };

  return (
    <section
      id="hero"
      className="relative pt-6 pb-10 px-4 sm:px-6 lg:px-8 border-b border-border bg-gradient-to-b from-card/60 via-background to-background text-foreground overflow-hidden font-body"
    >
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Clear Value Proposition + Search */}
        <div className="lg:col-span-7 space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold uppercase">
            <Sparkles className="size-3.5" />
            <span>Smart Grocery Shopping & Expiry Rescue</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground tracking-tight leading-[1.08]">
            Everyday groceries. <br className="hidden sm:inline" />
            <span className="text-primary">Better prices.</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-xl leading-relaxed">
            Shop fresh branded essentials alongside verified near-expiry rescue deals. Enjoy transparent shelf life, deep discounts on quality foods, and zero supermarket waste.
          </p>

          {/* Integrated Hero Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-lg">
            <div className="relative flex items-center shadow-md rounded-2xl bg-card border border-border p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="size-4 text-muted-foreground ml-3 shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search milk, atta, rice, oil, biscuits, tea, dahi..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-sans"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold uppercase transition-all hover:bg-primary/90 active:scale-98 cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1 font-mono text-xs">
            <span className="text-muted-foreground text-[11px]">Popular:</span>
            {SEARCH_CHIPS.slice(0, 6).map((chip) => (
              <Link
                key={chip.label}
                to={`/customer/browse?search=${encodeURIComponent(chip.label)}`}
                className="px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-secondary text-foreground text-[11px] transition-colors border border-border flex items-center gap-1"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </Link>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs font-bold">
            <Link
              to="/customer/browse"
              className="px-6 py-3.5 rounded-full bg-primary text-primary-foreground uppercase hover:bg-primary/90 transition-all active:scale-98 cursor-pointer flex items-center gap-1.5 shadow-md group"
            >
              <span>SHOP ALL GROCERIES</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <button
              type="button"
              onClick={onExploreDeals}
              className="px-6 py-3.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase transition-all active:scale-98 cursor-pointer border border-border shadow-xs"
            >
              <span>EXPLORE RESCUE DEALS</span>
            </button>
          </div>
        </div>

        {/* Right Showcase: Real Spotlight Deal + Honest Value Cards */}
        <div className="lg:col-span-5 grid sm:grid-cols-1 gap-4">
          {/* Spotlight Deal Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border flex flex-col justify-between space-y-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-bold uppercase tracking-tight shadow-xs">
                TODAY&apos;S RESCUE SPOTLIGHT
              </span>
              <span className="text-xs font-mono text-muted-foreground font-semibold">
                Batch #{spotlightOffer.batchNumber}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to={`/marketplace/product/${spotlightProduct.id}`}
                className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-white border border-border p-2 shrink-0 group block"
              >
                <img
                  src={spotlightProduct.imageUrl}
                  alt={spotlightProduct.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono text-muted-foreground block">
                  {spotlightProduct.brand} • {spotlightProduct.unit}
                </span>
                <Link
                  to={`/marketplace/product/${spotlightProduct.id}`}
                  className="font-display font-bold text-base sm:text-lg text-foreground truncate hover:text-primary transition-colors block"
                >
                  {spotlightProduct.name}
                </Link>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-sans text-foreground">
                    {formatINR(spotlightOffer.price)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through font-mono">
                    {formatINR(pricing.mrp)}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {pricing.discountBadge}
                  </span>
                </div>
              </div>
            </div>

            {/* Expiry & Stock Metadata */}
            <div className="p-3 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-foreground font-medium">
                <Clock className="size-3.5 text-primary" />
                <span>{expiryInfo.expiryText}</span>
              </span>
              <span className="text-muted-foreground">
                Stock: {spotlightOffer.availability} units
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddSpotlight}
              className={`w-full py-3 rounded-full font-mono text-xs font-bold uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isSpotlightAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-98"
              }`}
            >
              {isSpotlightAdded ? (
                <>
                  <Check className="size-4" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Add Spotlight Deal</span>
                </>
              )}
            </button>
          </div>

          {/* ERN Quality Triple Guarantee */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-card border border-border text-center space-y-1">
              <span className="text-lg block">🏷️</span>
              <span className="font-mono text-[11px] font-bold text-foreground block">Exact Dates</span>
              <span className="text-[10px] text-muted-foreground block font-sans">Batch tracking</span>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border text-center space-y-1">
              <span className="text-lg block">⚡</span>
              <span className="font-mono text-[11px] font-bold text-foreground block">Smart Savings</span>
              <span className="text-[10px] text-muted-foreground block font-sans">Up to 60% off</span>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border text-center space-y-1">
              <span className="text-lg block">🏪</span>
              <span className="font-mono text-[11px] font-bold text-foreground block">Store Pickup</span>
              <span className="text-[10px] text-muted-foreground block font-sans">Local fulfilment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
