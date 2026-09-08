import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Clock, Trash2, RefreshCw, AlertTriangle, Store, Tag } from "lucide-react";
import { api, type ApiListing } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useDebounce } from "@/lib/useDebounce";
import SkeletonLoader from "@/components/SkeletonLoader";
import AnimatedNumber from "@/components/AnimatedNumber";

export default function AdminListings() {
  const { showToast } = useToast();

  const [listings, setListings] = useState<ApiListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState("All");

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.admin.allListings();
      setListings(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load global listings.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Administrative action: Delete listing "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.listings.delete(id);
      showToast(`Removed "${name}" from global listings.`);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Could not remove listing.", "error");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return listings.filter((l) => {
      const matchSearch =
        q === "" ||
        l.item_name.toLowerCase().includes(q) ||
        (l.donor_name && l.donor_name.toLowerCase().includes(q)) ||
        l.category.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "All" || l.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [listings, debouncedSearch, statusFilter]);

  const activeCount = listings.filter((l) => l.status === "available").length;
  const claimedCount = listings.filter((l) => l.status === "claimed").length;
  const deliveredCount = listings.filter((l) => l.status === "delivered").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-foreground font-body">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>NETWORK OVERSIGHT</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground leading-[1.08] tracking-[-0.025em]">
            Global Listings
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Inspect all active rescue inventory, store postings, and lifecycle stages across the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchListings}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-mono text-xs font-bold uppercase transition-all cursor-pointer min-h-[44px]"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground font-bold">Total Lots</span>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={listings.length} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">All facilities</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground font-bold">Available Now</span>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={activeCount} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">On clearance feed</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground font-bold">Claimed Pending</span>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={claimedCount} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">In fulfillment</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground font-bold">Delivered</span>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={deliveredCount} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">Rescued successfully</span>
        </div>
      </div>

      
      <div className="p-4 rounded-2xl bg-card border border-border shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {["All", "Available", "Claimed", "Delivered"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full font-medium uppercase transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative flex-1 md:w-64">
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
        <SkeletonLoader type="text" count={6} />
      ) : error ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
          <AlertTriangle className="size-8 text-destructive mx-auto" />
          <p className="text-sm font-sans text-foreground">{error}</p>
          <button
            type="button"
            onClick={fetchListings}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3 font-mono text-xs">
          <Store className="size-10 text-muted-foreground mx-auto" />
          <h3 className="font-display font-medium text-lg text-foreground">No Listings Found</h3>
          <p className="text-muted-foreground font-sans max-w-sm mx-auto">
            No network listings match the active status or search query.
          </p>
        </div>
      ) : (
        <>
          
          <div className="hidden md:block rounded-2xl bg-card border border-border overflow-hidden font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[11px]">
                  <th className="py-3.5 px-4 font-bold">Item & Category</th>
                  <th className="py-3.5 px-4 font-bold">Store / Donor</th>
                  <th className="py-3.5 px-4 font-bold">Units</th>
                  <th className="py-3.5 px-4 font-bold">Rescue Price</th>
                  <th className="py-3.5 px-4 font-bold">Expiry Date</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => {
                  const daysLeft = item.days_remaining ?? Math.max(0, Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 86400)));
                  return (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-sans font-bold text-foreground text-sm">{item.item_name}</div>
                        <span className="text-[10px] text-muted-foreground font-mono">{item.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground">
                        {item.donor_name || `Donor #${item.donor_id}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <AnimatedNumber value={item.qty} />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        ₹{item.discount_price.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-foreground">{item.expiry_date}</div>
                        <span className={`text-[10px] font-bold ${daysLeft <= 3 ? "text-destructive" : "text-muted-foreground"}`}>
                          {daysLeft}d left
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === "available"
                            ? "bg-primary text-primary-foreground"
                            : item.status === "claimed"
                            ? "bg-secondary text-foreground"
                            : "bg-card border border-border text-muted-foreground"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.item_name)}
                          disabled={deletingId === item.id}
                          className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                          title="Administrative delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          
          <div className="md:hidden space-y-3 font-mono text-xs">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-sans font-bold text-foreground text-sm">{item.item_name}</h4>
                    <span className="text-[10px] text-muted-foreground">
                      {item.category} · {item.donor_name || `Donor #${item.donor_id}`}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    item.status === "available"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-secondary/30 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Price</span>
                    <span className="font-bold text-foreground">₹{item.discount_price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Available</span>
                    <span className="font-bold text-foreground">{item.qty} units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Expiry</span>
                    <span className="text-foreground">{item.expiry_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Days Left</span>
                    <span className="font-bold text-foreground">{item.days_remaining ?? "--"}d</span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.item_name)}
                    disabled={deletingId === item.id}
                    className="px-4 py-2 rounded-full border border-border text-destructive hover:bg-destructive/10 text-xs font-bold uppercase cursor-pointer min-h-[44px]"
                  >
                    Delete Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
