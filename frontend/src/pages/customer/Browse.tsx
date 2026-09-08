import { useState, useEffect, useCallback, memo } from "react";
import { Search, Building2, Check, X, AlertTriangle, RefreshCw, ShoppingBag, Clock } from "lucide-react";
import { api, type ApiListing } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useDebounce } from "@/lib/useDebounce";
import SkeletonLoader from "@/components/SkeletonLoader";
import AnimatedNumber from "@/components/AnimatedNumber";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  "All",
  "Bakery",
  "Dairy",
  "Beverages",
  "Packaged Goods",
  "Produce",
  "Deli & Snacks",
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80";

interface ListingCardProps {
  item: ApiListing;
  onClaim: (item: ApiListing) => void;
  isClaiming: boolean;
  canClaim: boolean;
}

const ListingCard = memo(function ListingCard({
  item,
  onClaim,
  isClaiming,
  canClaim,
}: ListingCardProps) {
  const daysLeft = item.days_remaining ?? Math.max(0, Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 86400)));

  let riskBadge = "Fresh Lot";
  let riskColor = "bg-primary text-primary-foreground";
  if (daysLeft <= 3) {
    riskBadge = "Critical Clearance";
    riskColor = "bg-destructive text-destructive-foreground font-bold";
  } else if (daysLeft <= 7) {
    riskBadge = "Urgent Rescue";
    riskColor = "bg-secondary text-foreground font-bold";
  }

  return (
    <div className="group relative flex flex-col justify-between bg-card border border-border rounded-2xl sm:rounded-[24px] overflow-hidden shadow-none transition-all duration-200 hover:border-primary">
      <div>
        
        <div className="relative w-full h-48 bg-secondary overflow-hidden">
          <img
            src={item.image_url || FALLBACK_IMAGE}
            alt={item.item_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-3 py-0.5 rounded-full bg-card/95 backdrop-blur-md text-foreground font-mono text-[10px] font-bold tracking-wider uppercase border border-border">
              {item.category}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className={`px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${riskColor}`}>
              {riskBadge}
            </span>
          </div>
        </div>

        
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>{item.donor_name || "Verified Store Partner"}</span>
            <span className="flex items-center gap-1 font-bold text-foreground">
              <Clock className="size-3 text-muted-foreground" />
              {daysLeft}d left
            </span>
          </div>

          <h3 className="font-display font-medium text-lg sm:text-xl text-foreground tracking-[-0.015em] leading-snug line-clamp-2">
            {item.item_name}
          </h3>

          
          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Rescued Price</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base sm:text-lg font-bold text-foreground font-mono">
                  ₹{item.discount_price.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{item.orig_price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Available Units</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                <AnimatedNumber value={item.qty} /> units
              </span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="p-5 pt-0">
        <button
          type="button"
          onClick={() => onClaim(item)}
          disabled={isClaiming}
          className="w-full py-3 px-4 rounded-full bg-primary hover:opacity-90 text-primary-foreground text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-none cursor-pointer transition-all disabled:opacity-50 min-h-[44px]"
        >
          {isClaiming ? (
            <>
              <div className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span>CLAIMING LOT...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="size-3.5" />
              <span>{canClaim ? "CLAIM RESCUE LOT" : "SIGN IN TO CLAIM"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});

export default function Browse() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [category, setCategory] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  const [listings, setListings] = useState<ApiListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSubmitted, setBulkSubmitted] = useState(false);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listings.browse({
        category: category !== "All" ? category : undefined,
        search: debouncedSearch || undefined,
      });
      setListings(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load clearance catalog. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [category, debouncedSearch]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleClaim = async (item: ApiListing) => {
    if (!isAuthenticated) {
      showToast("Please sign in as a registered buyer to claim rescue lots.", "info");
      navigate("/login");
      return;
    }

    if (user?.role === "retailer" && user.rawRole === "donor") {
      showToast("Donors cannot claim items. Use a buyer or organization account.", "error");
      return;
    }

    setClaimingId(item.id);
    try {
      await api.requests.claim(item.id);
      showToast(`Successfully claimed "${item.item_name}". View in your orders.`);

      setListings((prev) => prev.filter((l) => l.id !== item.id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Could not complete claim. Please try again.", "error");
      }
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
              <span>LIVE CLEARANCE CATALOG</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground leading-[1.08] tracking-[-0.025em]">
              Browse & Rescue
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-2">
              Verified perishable lots, near-expiry clearance items, and commercial surplus from partner stores.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all font-mono text-xs font-medium uppercase shadow-none cursor-pointer min-h-[44px]"
          >
            <Building2 className="size-4" />
            <span>Commercial Bulk Buy</span>
          </button>
        </div>

        
        <div className="p-4 rounded-2xl bg-card border border-border shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full font-medium uppercase transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center ${
                  category === c
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items or stores..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-background border border-border focus:border-primary text-foreground placeholder:text-muted-foreground font-sans text-xs outline-none"
            />
          </div>
        </div>

        
        {isLoading ? (
          <SkeletonLoader type="card" count={6} />
        ) : error ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
            <AlertTriangle className="size-8 text-destructive mx-auto" />
            <h3 className="font-display font-medium text-lg text-foreground">{error}</h3>
            <button
              type="button"
              onClick={fetchListings}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Retry Query</span>
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border text-muted-foreground font-mono text-xs space-y-2">
            <p className="text-sm font-sans text-foreground font-medium">No rescue inventory currently listed in this category.</p>
            <p>Check back shortly or reset your active filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onClaim={handleClaim}
                isClaiming={claimingId === item.id}
                canClaim={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>

      
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-[350] text-xl uppercase text-foreground">Commercial Bulk Inquiry</h3>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {bulkSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <Check className="size-10 text-foreground mx-auto" />
                <h4 className="font-display font-[350] text-lg text-foreground">Inquiry Dispatched</h4>
                <p className="text-xs text-muted-foreground font-body">
                  An enterprise liquidation officer will contact your organization directly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBulkSubmitted(false);
                    setBulkModalOpen(false);
                  }}
                  className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground uppercase font-medium cursor-pointer"
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
                className="space-y-3"
              >
                <div>
                  <label className="text-muted-foreground uppercase font-medium block mb-1">
                    Organization / Entity
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Hospitality Trust"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-primary text-foreground font-sans text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-medium block mb-1">
                    Procurement Volume (Units / Lots)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border focus:border-primary text-foreground font-mono text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-secondary text-foreground uppercase font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-medium cursor-pointer"
                  >
                    Submit Inquiry
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
