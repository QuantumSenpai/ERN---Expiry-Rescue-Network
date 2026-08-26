import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  TrendingDown,
  Leaf,
  ShoppingBag,
  Search,
  ChevronRight,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  Download,
  X,
} from "lucide-react";
import {
  getStoredOrders,
  saveStoredOrders,
  type Order,
  type OrderStatus,
} from "@/data/ordersData";
import { useCart } from "@/context/CartContext";
import InvoiceModal from "@/components/orders/InvoiceModal";
import TrackingModal from "@/components/orders/TrackingModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import RateProductsModal from "@/components/orders/RateProductsModal";
import SupportModal from "@/components/orders/SupportModal";

export default function Orders() {
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [activeCancelOrder, setActiveCancelOrder] = useState<Order | null>(null);
  const [activeRateOrder, setActiveRateOrder] = useState<Order | null>(null);
  const [activeSupportOrder, setActiveSupportOrder] = useState<Order | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const metrics = useMemo(() => {
    const totalOrdersCount = orders.length;
    const totalSaved = orders.reduce((sum, o) => sum + o.totalSavings, 0);
    const totalRescued = orders.reduce((sum, o) => sum + o.productsRescued, 0);
    const totalWasteKg = Number(
      orders.reduce((sum, o) => sum + o.wastePreventedKg, 0).toFixed(1)
    );
    return { totalOrdersCount, totalSaved, totalRescued, totalWasteKg };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === "All" ||
        order.status.toLowerCase() === selectedStatus.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        order.id.toLowerCase().includes(q) ||
        order.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.brand.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.batchType.toLowerCase().includes(q)
        );

      let matchesDate = true;
      if (dateFilter === "aug2026") {
        matchesDate = order.orderDate.includes("Aug 2026");
      }

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [orders, selectedStatus, searchQuery, dateFilter]);

  const handleConfirmCancel = (orderId: string, reason: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Cancelled" as OrderStatus,
          paymentStatus: "Refunded to Source",
          cancellationReason: reason,
          timeline: [
            ...o.timeline,
            {
              id: `step-cancelled-${Date.now()}`,
              title: "Cancelled & Refunded",
              timestamp: "Just Now",
              completed: true,
              current: true,
              locationNote: `Reason: ${reason}`,
            },
          ],
        };
      }
      return o;
    });
    setOrders(updated);
    saveStoredOrders(updated);
    setActiveCancelOrder(null);
    showToast(`Order ${orderId} cancelled. Refund issued to original source.`);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return "bg-primary text-primary-foreground font-medium";
      case "Out for Delivery":
        return "bg-primary text-primary-foreground font-medium";
      case "Processing":
      case "Confirmed":
      case "Packed":
        return "bg-card text-foreground font-medium";
      case "Dispatched":
        return "bg-card text-foreground font-medium";
      case "Cancelled":
        return "border border-[#2F4156] bg-transparent text-foreground font-medium";
      default:
        return "bg-card text-muted-foreground";
    }
  };

  const getBatchBadge = (batchType: string) => {
    if (batchType === "Clearance") {
      return "border border-[#2F4156] bg-transparent text-foreground font-medium";
    }
    if (batchType === "Rescue Deal") {
      return "bg-primary text-primary-foreground font-medium";
    }
    return "bg-card text-foreground font-medium";
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full space-y-6 text-foreground font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-300">
          <Sparkles className="size-4 text-foreground shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-1">
          <span>PURCHASE HISTORY</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground tracking-[-0.025em] leading-[1.08]">
          My orders
        </h1>
        <p className="text-sm text-muted-foreground font-body max-w-2xl mt-1">
          Track your purchases, manage deliveries, and audit verified shelf-life savings.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-none flex items-center gap-3.5">
          <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Package className="size-5" />
          </div>
          <div className="leading-tight">
            <span className="font-[350] font-display text-2xl text-foreground block">
              {metrics.totalOrdersCount}
            </span>
            <span className="text-xs text-foreground font-medium uppercase block mt-0.5">
              Orders Placed
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Active & Completed
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-none flex items-center gap-3.5">
          <div className="size-11 rounded-full bg-card text-foreground flex items-center justify-center shrink-0">
            <TrendingDown className="size-5" />
          </div>
          <div className="leading-tight">
            <span className="font-[350] font-display text-2xl text-foreground block">
              ₹{metrics.totalSaved}
            </span>
            <span className="text-xs text-foreground font-medium uppercase block mt-0.5">
              Total Saved
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Direct Discounts
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-none flex items-center gap-3.5">
          <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <ShoppingBag className="size-5" />
          </div>
          <div className="leading-tight">
            <span className="font-[350] font-display text-2xl text-foreground block">
              {metrics.totalRescued}
            </span>
            <span className="text-xs text-foreground font-medium uppercase block mt-0.5">
              Items Rescued
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Verified Fresh
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-none flex items-center gap-3.5">
          <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Leaf className="size-5" />
          </div>
          <div className="leading-tight">
            <span className="font-[350] font-display text-2xl text-foreground block">
              {metrics.totalWasteKg} KG
            </span>
            <span className="text-xs text-foreground font-medium uppercase block mt-0.5">
              Waste Prevented
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Landfill Diverted
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-none space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, product, brand..."
              className="w-full pl-10 pr-9 py-2.5 rounded-full bg-card border border-transparent text-foreground placeholder:text-muted-foreground text-xs outline-none focus:border-primary font-mono transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
              Period:
            </span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 rounded-full bg-card border border-transparent text-foreground text-xs outline-none focus:border-primary font-mono cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="aug2026">August 2026</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
          {[
            "All",
            "Processing",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
          ].map((st) => {
            const isSelected = selectedStatus === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-4 py-1.5 rounded-full uppercase whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-medium shadow-none"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "All" ? "All Orders" : st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isCancelled = order.status === "Cancelled";
            const isDelivered = order.status === "Delivered";

            return (
              <div
                key={order.id}
                className="p-6 rounded-2xl sm:rounded-[32px] bg-background border border-border hover:border-primary shadow-none transition-all duration-200 space-y-4 group"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-medium text-sm text-foreground">
                      {order.id}
                    </span>
                    <span className="text-muted-foreground font-mono">&bull;</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Placed on {order.orderDateSimple}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10.5px] font-mono uppercase ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-left sm:text-right">
                      <span className="text-muted-foreground font-mono block text-[10.5px] uppercase">
                        {order.items.length} Items &bull; Total:
                      </span>
                      <span className="font-medium text-base text-foreground font-display uppercase">
                        ₹{order.totalPaid}
                      </span>
                    </div>

                    {order.totalSavings > 0 && (
                      <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium text-xs text-left sm:text-right uppercase">
                        <span>Save ₹{order.totalSavings}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimated Delivery Bar */}
                <div className="flex items-center justify-between text-xs font-mono px-4 py-2.5 rounded-xl bg-card border border-transparent">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Truck className="size-3.5 text-foreground" />
                    <span>
                      {isDelivered
                        ? "Delivered Successfully on " + order.estimatedDelivery
                        : isCancelled
                        ? "Order Cancelled"
                        : "Estimated Delivery: " + order.estimatedDelivery}
                    </span>
                  </div>
                  <span className="text-muted-foreground hidden sm:inline text-[11px]">
                    {order.deliveryPartner}
                  </span>
                </div>

                {/* Horizontal Products */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-card border border-transparent flex items-center gap-3 group/item hover:border-primary transition-colors"
                    >
                      <div className="size-14 rounded-lg overflow-hidden bg-background shrink-0 p-0.5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md group-hover/item:scale-105 transition-transform"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase ${getBatchBadge(
                              item.batchType
                            )}`}
                          >
                            {item.batchType}
                          </span>
                          <span className="text-[9.5px] font-mono text-muted-foreground flex items-center gap-0.5 truncate">
                            <Clock className="size-2.5 text-foreground" />
                            <span>{item.shelfLifeAtPurchase}</span>
                          </span>
                        </div>

                        <p className="font-display font-[350] text-xs text-foreground truncate mt-1">
                          {item.name}
                        </p>

                        <div className="flex items-baseline justify-between font-mono text-[11px] mt-0.5">
                          <span className="text-foreground">
                            ₹{item.paidPrice} &times; {item.quantity}
                          </span>
                          {item.savings > 0 && (
                            <span className="text-[10px] text-foreground font-medium">
                              Save ₹{item.savings}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/customer/orders/${order.id}`}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground uppercase font-medium hover:bg-[#567C8D] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-none"
                    >
                      <span>View Details</span>
                      <ChevronRight className="size-3.5" />
                    </Link>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => setActiveTrackingOrder(order)}
                        className="px-4 py-2 rounded-full bg-card hover:bg-[#c4c7c4]/40 text-foreground uppercase font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-none"
                      >
                        <Truck className="size-3.5" />
                        <span>Track Order</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveInvoiceOrder(order)}
                      className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="size-3.5" />
                      <span>Invoice</span>
                    </button>

                    {isDelivered && (
                      <button
                        type="button"
                        onClick={() => setActiveRateOrder(order)}
                        className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                      >
                        Rate Order
                      </button>
                    )}

                    {!isCancelled && !isDelivered && (
                      <button
                        type="button"
                        onClick={() => setActiveCancelOrder(order)}
                        className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-2xl bg-background border border-border text-muted-foreground font-mono text-xs">
            No orders match your active filter criteria.
          </div>
        )}
      </div>

      {/* Modals */}
      {activeInvoiceOrder && (
        <InvoiceModal
          order={activeInvoiceOrder}
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}

      {activeTrackingOrder && (
        <TrackingModal
          order={activeTrackingOrder}
          onClose={() => setActiveTrackingOrder(null)}
        />
      )}

      {activeCancelOrder && (
        <CancelOrderModal
          order={activeCancelOrder}
          onClose={() => setActiveCancelOrder(null)}
          onConfirmCancel={handleConfirmCancel}
        />
      )}

      {activeRateOrder && (
        <RateProductsModal
          order={activeRateOrder}
          onClose={() => setActiveRateOrder(null)}
        />
      )}

      {activeSupportOrder && (
        <SupportModal
          order={activeSupportOrder}
          onClose={() => setActiveSupportOrder(null)}
        />
      )}
    </div>
  );
}