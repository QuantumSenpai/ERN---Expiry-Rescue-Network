import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  X,
  MapPin,
  ShoppingBag,
  Filter,
  AlertCircle,
} from "lucide-react";
import {
  getStoredOrders,
  type OrderStatus,
} from "@/data/ordersData";
import { useSelectedStore } from "@/lib/inventoryStore";
import { formatINR } from "@/lib/pricingService";

const STATUS_OPTIONS: OrderStatus[] = [
  "Processing",
  "Confirmed",
  "Packed",
  "Dispatched",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  Processing: "bg-sky-500/15 text-sky-800 dark:text-sky-400 border border-sky-500/30",
  Confirmed: "bg-sky-500/15 text-sky-800 dark:text-sky-400 border border-sky-500/30",
  Packed: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-400 border border-indigo-500/30",
  Dispatched: "bg-violet-500/15 text-violet-800 dark:text-violet-400 border border-violet-500/30",
  "Out for Delivery": "bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30",
  Delivered: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30",
  Cancelled: "bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-500/30",
};

const STATUS_ICON: Record<OrderStatus, React.ElementType> = {
  Processing: Clock,
  Confirmed: CheckCircle2,
  Packed: Package,
  Dispatched: Truck,
  "Out for Delivery": Truck,
  Delivered: CheckCircle2,
  Cancelled: X,
};

export default function RetailerOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const basePath = isAdmin ? "/admin/orders" : "/retailer/orders";
  const { storeId, storeName } = useSelectedStore();

  const allOrders = useMemo(() => getStoredOrders(), []);

  // Filter orders that belong to this retailer's store (or all stores if Admin)
  const storeOrders = useMemo(() => {
    if (isAdmin || !storeId) return allOrders;
    return allOrders.filter(
      (order) =>
        !order.storeId ||
        order.storeId === storeId ||
        order.items.some(
          (item) => !item.storeId || item.storeId === storeId
        )
    );
  }, [allOrders, storeId, isAdmin]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | OrderStatus>("All");

  const filteredOrders = useMemo(() => {
    return storeOrders.filter((order) => {
      const matchesStatus =
        selectedStatus === "All" ||
        order.status === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        order.id.toLowerCase().includes(q) ||
        (order.shippingAddress.recipientName || "").toLowerCase().includes(q) ||
        order.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.brand.toLowerCase().includes(q) ||
            (item.batchNumber || "").toLowerCase().includes(q)
        );

      return matchesStatus && matchesSearch;
    });
  }, [storeOrders, selectedStatus, searchQuery]);

  const metrics = useMemo(() => {
    const pending = storeOrders.filter((o) =>
      ["Processing", "Confirmed", "Packed", "Dispatched", "Out for Delivery"].includes(o.status)
    ).length;
    const delivered = storeOrders.filter((o) => o.status === "Delivered").length;
    const cancelled = storeOrders.filter((o) => o.status === "Cancelled").length;
    return { total: storeOrders.length, pending, delivered, cancelled };
  }, [storeOrders]);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
            <MapPin className="size-3.5" />
            {storeName || "All Stores"}
          </p>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} shown
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: metrics.total, color: "text-foreground" },
          { label: "Active", value: metrics.pending, color: "text-sky-500" },
          { label: "Delivered", value: metrics.delivered, color: "text-emerald-500" },
          { label: "Cancelled", value: metrics.cancelled, color: "text-rose-500" },
        ].map((m) => (
          <div key={m.label} className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground font-mono">{m.label}</p>
            <p className={`text-2xl font-black mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order ID, customer, product, batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-background border border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <Filter className="size-4 text-muted-foreground shrink-0" />
          <button
            type="button"
            onClick={() => setSelectedStatus("All")}
            className={`px-3 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors border ${
              selectedStatus === "All"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors border ${
                selectedStatus === status
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="size-10 text-muted-foreground" />
          <p className="text-base font-bold text-foreground">No orders found</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {searchQuery || selectedStatus !== "All"
              ? "Try adjusting your search or filter."
              : "No orders have been placed for this store yet."}
          </p>
          {(searchQuery || selectedStatus !== "All") && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSelectedStatus("All"); }}
              className="mt-2 px-4 py-2 rounded-full bg-secondary border border-border text-xs font-mono font-bold text-foreground hover:bg-muted cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const StatusIcon = STATUS_ICON[order.status] ?? Package;
            const statusBadge = STATUS_BADGE[order.status] ?? "bg-secondary text-muted-foreground border border-border";
            const isActive = !["Delivered", "Cancelled"].includes(order.status);

            return (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`${basePath}/${order.id}`)}
                className="w-full text-left p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: ID + Date + Store */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm text-foreground group-hover:text-primary transition-colors">
                        {order.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${statusBadge}`}>
                        <StatusIcon className="size-3" />
                        {order.status}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30">
                          Action Needed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{order.orderDate}</p>
                    {order.storeName && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3" />
                        {order.storeName}
                      </p>
                    )}
                  </div>

                  {/* Right: Items summary + total */}
                  <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                    <p className="text-sm font-black text-foreground">
                      {formatINR(order.totalPaid)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Item Previews */}
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ShoppingBag className="size-3.5 text-muted-foreground shrink-0" />
                        <p className="text-xs text-foreground font-medium truncate">{item.name}</p>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">×{item.quantity}</span>
                        {item.batchNumber && (
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                            #{item.batchNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          item.batchType === "Rescue Deal" ? "bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/20" :
                          item.batchType === "Clearance" ? "bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-500/20" :
                          "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {item.batchType}
                        </span>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-[10px] text-muted-foreground font-mono pl-5">
                      +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors font-mono">
                  <span>View Details</span>
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
