import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Check,
  X,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  Heart,
  Calendar,
  Tag,
} from "lucide-react";
import { api, type ApiRequest } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useDebounce } from "@/lib/useDebounce";
import SkeletonLoader from "@/components/SkeletonLoader";
import AnimatedNumber from "@/components/AnimatedNumber";

type OrderStatus = "all" | "pending" | "approved" | "completed" | "cancelled";

const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  pending: {
    bg: "bg-amber-100 dark:bg-amber-950/60",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-800/40",
    label: "Pending Review",
  },
  approved: {
    bg: "bg-sky-100 dark:bg-sky-950/60",
    text: "text-sky-800 dark:text-sky-300",
    border: "border-sky-300 dark:border-sky-800/40",
    label: "Approved & In Prep",
  },
  completed: {
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-800/40",
    label: "Delivered / Rescued",
  },
  cancelled: {
    bg: "bg-rose-100 dark:bg-rose-950/60",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-300 dark:border-rose-800/40",
    label: "Cancelled",
  },
};

const BUYER_TYPE_BADGE: Record<string, { label: string; bg: string }> = {
  individual: { label: "Individual", bg: "bg-secondary text-foreground" },
  ngo: { label: "NGO / Food Bank", bg: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300" },
  orphanage: { label: "Community Shelter", bg: "bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300" },
};

export default function AdminOrders() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<ApiRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");

  const [selectedOrder, setSelectedOrder] = useState<ApiRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.admin.allRequests();
      setOrders(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load rescue orders.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (
    orderId: number,
    nextStatus: "pending" | "approved" | "completed" | "cancelled"
  ) => {
    setUpdatingId(orderId);
    try {
      await api.admin.updateRequestStatus(orderId, nextStatus);
      showToast(`Order #ORD-${orderId} status updated to ${nextStatus}.`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Could not update order status.", "error");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "all" || order.status.toLowerCase() === statusFilter;
      const matchSearch =
        q === "" ||
        `ord-${order.id}`.includes(q) ||
        order.item_name.toLowerCase().includes(q) ||
        (order.buyer_name || "").toLowerCase().includes(q) ||
        (order.donor_name || "").toLowerCase().includes(q) ||
        (order.category || "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, debouncedSearch, statusFilter]);

  // Statistics
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const approvedCount = orders.filter((o) => o.status === "approved").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const totalValue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.discount_price || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-foreground font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase mb-2 border border-border">
            <ShoppingBag className="size-3.5 text-primary" />
            <span>ENTERPRISE ORDER CONSOLE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-[1.08] tracking-[-0.025em]">
            Rescue Orders
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Real-time fulfillment tracking across community partners, NGO food banks, and commercial buyers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-secondary text-xs font-mono font-bold text-foreground transition-all cursor-pointer shadow-none"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Orders</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
            Total Orders
          </p>
          <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            <AnimatedNumber value={totalCount} />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
            <Clock className="size-3" />
            <span>Pending Review</span>
          </p>
          <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            <AnimatedNumber value={pendingCount} />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1">
            <Truck className="size-3" />
            <span>In Preparation</span>
          </p>
          <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            <AnimatedNumber value={approvedCount} />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border">
          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            <span>Delivered / Rescued</span>
          </p>
          <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            <AnimatedNumber value={completedCount} />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border col-span-2 lg:col-span-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
            Gross Rescue Value
          </p>
          <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            ₹<AnimatedNumber value={Math.round(totalValue)} />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { key: "all", label: "All Orders", count: totalCount },
              { key: "pending", label: "Pending", count: pendingCount },
              { key: "approved", label: "Approved", count: approvedCount },
              { key: "completed", label: "Delivered", count: completedCount },
            ] as const
          ).map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatusFilter(filter.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                statusFilter === filter.key
                  ? "bg-primary text-primary-foreground font-bold shadow-none"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <span>{filter.label}</span>
              <span className="ml-1.5 opacity-70 text-[10px] font-mono">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="size-3.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, Buyer, Item..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-background border border-border focus:border-primary text-foreground placeholder:text-muted-foreground text-xs outline-none"
          />
        </div>
      </div>

      {/* Content Table / States */}
      {isLoading ? (
        <SkeletonLoader type="text" count={6} />
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
            <span>Retry</span>
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
          <ShoppingBag className="size-10 text-muted-foreground mx-auto" />
          <h3 className="font-display font-medium text-lg text-foreground">No Orders Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No rescue orders match your current filter criteria or search query.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/40 font-mono text-[11px] text-muted-foreground uppercase font-semibold">
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Rescued Item</th>
                  <th className="py-3 px-4">Buyer Entity</th>
                  <th className="py-3 px-4">Facility Hub</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Placed Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.map((order) => {
                  const statusStyle = STATUS_BADGE[order.status.toLowerCase()] || STATUS_BADGE.pending;
                  const buyerTypeStyle =
                    BUYER_TYPE_BADGE[order.buyer_type || "individual"] ||
                    BUYER_TYPE_BADGE.individual;

                  return (
                    <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        #ORD-{order.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground text-xs">{order.item_name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {order.category || "General"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{order.buyer_name || "Community Partner"}</div>
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold mt-0.5 ${buyerTypeStyle.bg}`}>
                          {buyerTypeStyle.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <Building2 className="size-3 text-muted-foreground shrink-0" />
                          <span>{order.donor_name || "Central Depot"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        ₹{(order.discount_price || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                        {new Date(order.requested_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          <span>{statusStyle.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, "approved")}
                              disabled={updatingId === order.id}
                              className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-bold uppercase hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 shadow-none"
                              title="Approve Order"
                            >
                              <Check className="size-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {order.status === "approved" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, "completed")}
                              disabled={updatingId === order.id}
                              className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 shadow-none"
                              title="Mark Delivered"
                            >
                              <Truck className="size-3" />
                              <span>Deliver</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-full bg-secondary hover:bg-muted text-foreground transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          {order.status !== "cancelled" && order.status !== "completed" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, "cancelled")}
                              disabled={updatingId === order.id}
                              className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                              title="Cancel Order"
                            >
                              <X className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-7 space-y-6 text-foreground font-sans">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <ShoppingBag className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">
                    Order #ORD-{selectedOrder.id}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Placed on {new Date(selectedOrder.requested_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Order item info */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">{selectedOrder.item_name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedOrder.category || "Grocery"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-foreground">
                    ₹{(selectedOrder.discount_price || 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    Rescue Discount Applied
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Buyer Details</p>
                  <p className="font-semibold text-foreground">{selectedOrder.buyer_name || "N/A"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{selectedOrder.buyer_email || "N/A"}</p>
                </div>
                <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Fulfillment Facility</p>
                  <p className="font-semibold text-foreground">{selectedOrder.donor_name || "Indiranagar Metro"}</p>
                  <p className="text-[11px] text-muted-foreground">Direct Pickup Hub</p>
                </div>
              </div>
            </div>

            {/* Actions in modal */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  STATUS_BADGE[selectedOrder.status.toLowerCase()]?.bg || ""
                } ${STATUS_BADGE[selectedOrder.status.toLowerCase()]?.text || ""}`}
              >
                <span>Status: {selectedOrder.status.toUpperCase()}</span>
              </span>

              <div className="flex items-center gap-2">
                {selectedOrder.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "approved")}
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    Approve Order
                  </button>
                )}
                {selectedOrder.status === "approved" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}
                    className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    Mark Delivered
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-full bg-secondary hover:bg-muted text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
