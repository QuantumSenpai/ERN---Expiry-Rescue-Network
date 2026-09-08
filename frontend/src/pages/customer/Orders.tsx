import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  ShoppingBag,
  Building2,
} from "lucide-react";
import { api, type ApiRequest } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useDebounce } from "@/lib/useDebounce";
import SkeletonLoader from "@/components/SkeletonLoader";
import AnimatedNumber from "@/components/AnimatedNumber";

export default function Orders() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<ApiRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState("All");

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.requests.myRequests();
      setOrders(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load your rescue orders.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelRequest = async (order: ApiRequest) => {
    if (!window.confirm(`Are you sure you want to cancel your request for "${order.item_name}"?`)) {
      return;
    }

    setCancellingId(order.id);
    try {
      await api.requests.cancel(order.id);
      showToast(`Request for "${order.item_name}" cancelled. Item returned to marketplace.`);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Could not cancel request. Please try again.", "error");
      }
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return orders.filter((order) => {
      const matchSearch =
        q === "" ||
        order.item_name.toLowerCase().includes(q) ||
        (order.donor_name && order.donor_name.toLowerCase().includes(q)) ||
        (order.category && order.category.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === "All" || order.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [orders, debouncedSearch, statusFilter]);

  const totalSpent = useMemo(
    () => orders.reduce((sum, o) => (o.status !== "cancelled" ? sum + (o.discount_price || 0) : sum), 0),
    [orders]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-foreground font-body">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>BUYER RESCUE FULFILLMENT</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground leading-[1.08] tracking-[-0.025em]">
            My Rescue Orders
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Track claims, counter pick-up verification, and order lifecycle states.
          </p>
        </div>

        
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border font-mono text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Total Rescued</span>
            <span className="font-bold text-foreground text-sm">
              <AnimatedNumber value={orders.filter((o) => o.status !== "cancelled").length} /> Lots
            </span>
          </div>
          <div className="h-6 w-px bg-border mx-1" />
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Dispatched Value</span>
            <span className="font-bold text-foreground text-sm">₹{totalSpent.toFixed(2)}</span>
          </div>
        </div>
      </div>

      
      <div className="p-4 rounded-2xl bg-card border border-border shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {["All", "Pending", "Approved", "Completed", "Cancelled"].map((st) => (
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
            placeholder="Search orders..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-background border border-border focus:border-primary text-foreground placeholder:text-muted-foreground font-sans text-xs outline-none"
          />
        </div>
      </div>

      
      {isLoading ? (
        <SkeletonLoader type="text" count={5} />
      ) : error ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
          <AlertTriangle className="size-8 text-destructive mx-auto" />
          <p className="text-sm font-sans text-foreground">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
          <Package className="size-10 text-muted-foreground mx-auto" />
          <h3 className="font-display font-medium text-lg text-foreground">No Rescue Orders Found</h3>
          <p className="text-xs text-muted-foreground font-sans max-w-sm mx-auto">
            You have not placed any claims matching this filter. Explore the live marketplace to rescue near-expiry lots.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase"
          >
            <ShoppingBag className="size-3.5" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      ) : (
        <>
          
          <div className="hidden md:block rounded-2xl bg-card border border-border overflow-hidden shadow-none font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[11px]">
                    <th className="py-3.5 px-4 font-bold">Order / Item</th>
                    <th className="py-3.5 px-4 font-bold">Store Partner</th>
                    <th className="py-3.5 px-4 font-bold">Rescued Price</th>
                    <th className="py-3.5 px-4 font-bold">Claimed At</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-sans font-bold text-foreground text-sm">{order.item_name}</div>
                        <span className="text-[10px] text-muted-foreground font-mono">REQ-{order.id}</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground">
                        {order.donor_name || "Partner Store"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        ₹{(order.discount_price || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(order.requested_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === "approved"
                            ? "bg-primary text-primary-foreground"
                            : order.status === "completed"
                            ? "bg-secondary text-foreground"
                            : order.status === "pending"
                            ? "bg-accent text-accent-foreground font-bold"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {order.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleCancelRequest(order)}
                            disabled={cancellingId === order.id}
                            className="px-3 py-1.5 rounded-full border border-border text-destructive hover:bg-destructive/10 text-xs font-mono font-bold uppercase transition-colors cursor-pointer min-h-[44px]"
                          >
                            Cancel Claim
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          
          <div className="md:hidden space-y-3 font-mono text-xs">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-sans font-bold text-foreground text-sm leading-snug">
                      {order.item_name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      REQ-{order.id} · {order.donor_name || "Partner Store"}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    order.status === "approved"
                      ? "bg-primary text-primary-foreground"
                      : order.status === "completed"
                      ? "bg-secondary text-foreground"
                      : order.status === "pending"
                      ? "bg-accent text-accent-foreground font-bold"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-secondary/30 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Claim Value</span>
                    <span className="font-bold text-foreground">₹{(order.discount_price || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Placed At</span>
                    <span className="text-foreground">
                      {new Date(order.requested_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>

                {order.status === "pending" && (
                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleCancelRequest(order)}
                      disabled={cancellingId === order.id}
                      className="px-4 py-2 rounded-full border border-border text-destructive hover:bg-destructive/10 text-xs uppercase font-bold cursor-pointer min-h-[44px]"
                    >
                      Cancel Claim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}