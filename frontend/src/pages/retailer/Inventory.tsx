import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Boxes,
  Clock,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Tag,
  Package,
} from "lucide-react";
import { api, type ApiListing } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useDebounce } from "@/lib/useDebounce";
import SkeletonLoader from "@/components/SkeletonLoader";
import AnimatedNumber from "@/components/AnimatedNumber";

export default function Inventory() {
  const { showToast } = useToast();

  const [items, setItems] = useState<ApiListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState("All");

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listings.myListings();
      setItems(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load store inventory.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.listings.delete(id);
      showToast(`Removed "${name}" from active listings.`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Could not delete listing.", "error");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return items.filter((item) => {
      const matchSearch =
        q === "" ||
        item.item_name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "All" || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [items, debouncedSearch, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-foreground font-body">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>STORE STOCK CONSOLE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground leading-[1.08] tracking-[-0.025em]">
            Live Inventory
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Real-time batch tracking, automated dynamic markdown status, and liquidation dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/retailer/add-product"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:opacity-90 text-primary-foreground font-mono text-xs font-bold uppercase transition-all shadow-none min-h-[44px]"
          >
            <Plus className="size-4" />
            <span>Add Product</span>
          </Link>
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
            placeholder="Search stock..."
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
            onClick={fetchInventory}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
          <Boxes className="size-10 text-muted-foreground mx-auto" />
          <h3 className="font-display font-medium text-lg text-foreground">No Inventory Items Found</h3>
          <p className="text-xs text-muted-foreground font-sans max-w-sm mx-auto">
            You have not registered any clearance or rescue stock batches matching this filter.
          </p>
          <Link
            to="/retailer/add-product"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase"
          >
            <Plus className="size-3.5" />
            <span>Add First Product</span>
          </Link>
        </div>
      ) : (
        <>
          
          <div className="hidden md:block rounded-2xl bg-card border border-border overflow-hidden shadow-none font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[11px]">
                    <th className="py-3.5 px-4 font-bold">Item & Category</th>
                    <th className="py-3.5 px-4 font-bold">Units</th>
                    <th className="py-3.5 px-4 font-bold">Standard Price</th>
                    <th className="py-3.5 px-4 font-bold">Rescue Price</th>
                    <th className="py-3.5 px-4 font-bold">Expiry Date</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => {
                    const daysLeft = item.days_remaining ?? Math.max(0, Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 86400)));
                    return (
                      <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-sans font-bold text-foreground text-sm">{item.item_name}</div>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">{item.category}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          <AnimatedNumber value={item.qty} />
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          ₹{item.orig_price.toFixed(2)}
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
                            title="Delete listing"
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
          </div>

          
          <div className="md:hidden space-y-3 font-mono text-xs">
            {filteredItems.map((item) => {
              const daysLeft = item.days_remaining ?? Math.max(0, Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 86400)));
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-sans font-bold text-foreground text-sm leading-snug">
                        {item.item_name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">
                        {item.category}
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
                      <span className="text-[10px] text-muted-foreground block uppercase">Rescued Price</span>
                      <span className="font-bold text-foreground">₹{item.discount_price.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground line-through ml-1.5">₹{item.orig_price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Stock Units</span>
                      <span className="font-bold text-foreground">{item.qty} units</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Shelf Life</span>
                      <span className={`font-bold ${daysLeft <= 3 ? "text-destructive" : "text-foreground"}`}>
                        {daysLeft}d left
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Expiry Date</span>
                      <span className="text-foreground">{item.expiry_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.item_name)}
                      disabled={deletingId === item.id}
                      className="px-4 py-2 rounded-full border border-border text-destructive hover:bg-destructive/10 text-xs uppercase font-bold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}