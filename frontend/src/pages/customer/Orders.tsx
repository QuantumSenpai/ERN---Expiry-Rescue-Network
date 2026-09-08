import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  TrendingDown,
  ShoppingBag,
  Search,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Clock,
} from "lucide-react";
import {
  getStoredOrders,
  saveStoredOrders,
  type Order,
  type OrderStatus,
} from "@/data/ordersData";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/pricingService";
import InvoiceModal from "@/components/orders/InvoiceModal";
import TrackingModal from "@/components/orders/TrackingModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import RateProductsModal from "@/components/orders/RateProductsModal";
import SupportModal from "@/components/orders/SupportModal";

export default function Orders() {
  const { reorderFromPastOrder } = useCart();
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [activeCancelOrder, setActiveCancelOrder] = useState<Order | null>(null);
  const [activeRateOrder, setActiveRateOrder] = useState<Order | null>(null);
  const [activeSupportOrder, setActiveSupportOrder] = useState<Order | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const metrics = useMemo(() => {
    const totalOrdersCount = orders.length;
    const totalSaved = orders.reduce((sum, o) => sum + (o.totalSavings || 0), 0);
    const totalRescued = orders.reduce((sum, o) => sum + (o.productsRescued || o.items.reduce((s, i) => s + i.quantity, 0)), 0);
    return { totalOrdersCount, totalSaved, totalRescued };
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
            item.category.toLowerCase().includes(q)
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  const handleReorder = (order: Order) => {
    const result = reorderFromPastOrder(order);
    if (result.successCount > 0) {
      showToast(result.message, result.unavailableCount > 0 || result.partialCount > 0);
    } else {
      showToast(result.message, true);
    }
  };

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
    showToast(`Order ${orderId} cancelled. Refund issued to original payment method.`);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold border border-emerald-500/30";
      case "Out for Delivery":
        return "bg-primary text-primary-foreground font-bold";
      case "Processing":
      case "Confirmed":
      case "Packed":
      case "Dispatched":
        return "bg-secondary text-foreground font-bold border border-border";
      case "Cancelled":
        return "bg-destructive/10 text-destructive font-bold border border-destructive/30";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full space-y-6 text-foreground font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-2xl text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage.isError ? (
            <AlertCircle className="size-4 text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          )}
          <span className="font-semibold">{toastMessage.text}</span>
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

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase mb-1">
          <span>PURCHASE HISTORY</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-[-0.025em] leading-[1.08]">
          My Orders
        </h1>
        <p className="text-sm text-muted-foreground font-sans max-w-2xl mt-1">
          Track active deliveries, view purchase invoices, and 1-click reorder from available batches.
        </p>
      </div>

      {/* Summary Stat Cards */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 font-mono">
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-none flex items-center gap-3.5">
            <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Package className="size-5" />
            </div>
            <div className="leading-tight">
              <span className="font-bold font-display text-xl sm:text-2xl text-foreground block">
                {metrics.totalOrdersCount}
              </span>
              <span className="text-xs text-foreground font-bold uppercase block mt-0.5">
                Orders Placed
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-none flex items-center gap-3.5">
            <div className="size-11 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0 border border-border">
              <TrendingDown className="size-5" />
            </div>
            <div className="leading-tight">
              <span className="font-bold font-display text-xl sm:text-2xl text-foreground block">
                {formatINR(metrics.totalSaved)}
              </span>
              <span className="text-xs text-foreground font-bold uppercase block mt-0.5">
                Total Saved
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-none flex items-center gap-3.5 col-span-2 lg:col-span-1">
            <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <ShoppingBag className="size-5" />
            </div>
            <div className="leading-tight">
              <span className="font-bold font-display text-xl sm:text-2xl text-foreground block">
                {metrics.totalRescued} Items
              </span>
              <span className="text-xs text-foreground font-bold uppercase block mt-0.5">
                Groceries Rescued
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      {orders.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-none space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, product, brand..."
                className="w-full pl-10 pr-9 py-2 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground text-xs outline-none focus:border-primary font-sans transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
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
                    className={`px-3.5 py-1.5 rounded-full uppercase whitespace-nowrap transition-all duration-150 cursor-pointer font-bold ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-none"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "All" ? "All Orders" : st}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Orders List / Empty State */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="p-14 text-center rounded-3xl bg-card border border-border text-foreground space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="size-16 rounded-full bg-secondary mx-auto flex items-center justify-center text-muted-foreground">
              <Package className="size-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">
                You haven't placed an order yet.
              </h3>
              <p className="text-xs text-muted-foreground font-sans mt-1">
                Start shopping rescue deals and fresh groceries to see your orders here.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-block px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase hover:bg-primary/90 transition-colors shadow-sm"
            >
              Explore Marketplace
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border text-muted-foreground font-mono text-xs">
            No orders match your filter criteria.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isCancelled = order.status === "Cancelled";
            const isDelivered = order.status === "Delivered";

            return (
              <div
                key={order.id}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border hover:border-primary/60 shadow-none transition-all duration-200 space-y-4 group"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-foreground">
                      {order.id}
                    </span>
                    <span className="text-muted-foreground font-mono">•</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Placed on {order.orderDateSimple}
                    </span>
                    {order.storeName && (
                      <span className="text-xs text-muted-foreground font-mono hidden md:inline">
                        • {order.storeName}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono uppercase ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="text-left sm:text-right">
                      <span className="text-muted-foreground font-mono block text-[10px] uppercase">
                        {order.items.length} Items • Total:
                      </span>
                      <span className="font-bold text-base text-foreground font-display">
                        {formatINR(order.totalPaid)}
                      </span>
                    </div>

                    {order.totalSavings > 0 && (
                      <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs text-left sm:text-right uppercase">
                        <span>Save {formatINR(order.totalSavings)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimated Delivery Bar */}
                <div className="flex items-center justify-between text-xs font-mono px-4 py-2.5 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <Truck className="size-3.5 text-primary" />
                    <span>
                      {isDelivered
                        ? `Delivered Successfully • ${order.estimatedDelivery}`
                        : isCancelled
                        ? "Order Cancelled & Refund Processed"
                        : `Estimated Delivery: ${order.estimatedDelivery}`}
                    </span>
                  </div>
                  <span className="text-muted-foreground hidden sm:inline text-[11px]">
                    {order.deliveryPartner}
                  </span>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-background border border-border flex items-center gap-3"
                    >
                      <div className="size-12 rounded-lg overflow-hidden bg-white border border-border shrink-0 p-0.5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-muted-foreground block">
                          {item.brand} • {item.unit}
                          {item.batchNumber && ` • Batch: ${item.batchNumber}`}
                        </span>
                        <p className="font-bold text-xs text-foreground truncate font-sans">
                          {item.name}
                        </p>
                        <div className="flex items-baseline justify-between font-mono text-[11px] mt-0.5">
                          <span className="text-foreground">
                            {formatINR(item.paidPrice)} × {item.quantity}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {item.shelfLifeAtPurchase}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Actions: Track, Reorder, Invoice, Cancel */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border text-xs font-mono">
                  <div className="flex items-center gap-2">
                    {/* Reorder Button */}
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground uppercase font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Reorder</span>
                    </button>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => setActiveTrackingOrder(order)}
                        className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-border"
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
                      className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold"
                    >
                      <Download className="size-3.5" />
                      <span>Invoice</span>
                    </button>

                    {isDelivered && (
                      <button
                        type="button"
                        onClick={() => setActiveRateOrder(order)}
                        className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer font-semibold"
                      >
                        Rate Order
                      </button>
                    )}

                    {!isCancelled && !isDelivered && (
                      <button
                        type="button"
                        onClick={() => setActiveCancelOrder(order)}
                        className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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