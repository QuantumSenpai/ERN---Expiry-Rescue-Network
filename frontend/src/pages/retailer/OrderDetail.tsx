import { useState, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  Printer,
  CheckCircle2,
  X,
  Phone,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  getStoredOrders,
  saveStoredOrders,
  type Order,
  type OrderStatus,
} from "@/data/ordersData";
import { formatINR } from "@/lib/pricingService";
import InvoiceModal from "@/components/orders/InvoiceModal";
import TrackingModal from "@/components/orders/TrackingModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

const STATUS_BADGE: Record<OrderStatus, string> = {
  Processing: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30",
  Confirmed: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30",
  Packed: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30",
  Dispatched: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30",
  "Out for Delivery": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  Delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  Processing: "Packed",
  Confirmed: "Packed",
  Packed: "Dispatched",
  Dispatched: "Out for Delivery",
  "Out for Delivery": "Delivered",
};

const BATCH_BADGE: Record<string, string> = {
  "Rescue Deal": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  Clearance: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
  "Fresh Stock": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
};

export default function RetailerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const basePath = isAdmin ? "/admin/orders" : "/retailer/orders";

  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());

  const order = useMemo(() => {
    return (
      orders.find((o) => o.id.toLowerCase() === id?.toLowerCase()) ||
      orders[0]
    );
  }, [orders, id]);

  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isCancelled = order?.status === "Cancelled";
  const isDelivered = order?.status === "Delivered";

  const updateOrderStatus = (newStatus: OrderStatus, note?: string) => {
    if (!order) return;
    const updated = orders.map((o) => {
      if (o.id === order.id) {
        return {
          ...o,
          status: newStatus,
          timeline: [
            ...o.timeline,
            {
              id: `step-${Date.now()}`,
              title: `Marked as ${newStatus}`,
              timestamp: "Just Now",
              completed: true,
              current: true,
              locationNote: note || `Updated by ${isAdmin ? "Admin Console" : "Retailer Operations Desk"}`,
            },
          ],
        };
      }
      return o;
    });
    setOrders(updated);
    saveStoredOrders(updated);
    showToast(`Order ${order.id} status updated to ${newStatus}`);
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
    setCancelOrder(null);
    showToast(`Order ${orderId} cancelled.`);
  };

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="size-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Order Not Found</h2>
        <p className="text-xs text-muted-foreground">Order ID {id} does not exist in the current store registry.</p>
        <Link
          to={basePath}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold"
        >
          <ArrowLeft className="size-3.5" />
          <span>Return to Orders List</span>
        </Link>
      </div>
    );
  }

  const nextActionStatus = NEXT_STATUS[order.status];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-card border border-primary/50 shadow-2xl text-foreground text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="size-4 text-primary shrink-0" />
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

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={basePath}
              className="p-2 rounded-full bg-secondary hover:bg-muted border border-border text-foreground transition-colors inline-flex items-center justify-center cursor-pointer"
              title="Back to Orders"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-muted-foreground font-bold">
                  {isAdmin ? "Admin Order Desk" : "Retailer Operations"}
                </span>
                <span>•</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {order.storeName || "Central Store"}
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-black text-foreground mt-0.5">
                Order #{order.id}
              </h1>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                STATUS_BADGE[order.status] || "bg-secondary text-muted-foreground"
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
            <span>Placed: {order.orderDate}</span>
            <span>•</span>
            <span className="text-foreground font-medium">Payment: {order.paymentStatus}</span>
            <span>•</span>
            <span>Tracking: {order.trackingId}</span>
          </div>
        </div>

        {/* Operations Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {nextActionStatus && !isCancelled && (
            <button
              type="button"
              onClick={() => updateOrderStatus(nextActionStatus)}
              className="px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Advance to {nextActionStatus}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setInvoiceOrder(order)}
            className="px-3.5 py-2 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-foreground font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Print Invoice</span>
          </button>

          {!isCancelled && (
            <button
              type="button"
              onClick={() => setTrackingOrder(order)}
              className="px-3.5 py-2 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-foreground font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="size-3.5" />
              <span>Logistics</span>
            </button>
          )}

          {!isCancelled && !isDelivered && (
            <button
              type="button"
              onClick={() => setCancelOrder(order)}
              className="px-3 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-mono font-bold text-xs cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: 8 Cols Left (Items & Dispatch) + 4 Cols Right (Financials & Store details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Batches Table */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                  <Package className="size-4 text-primary" />
                  <span>Purchased Batches ({order.items.length} Items)</span>
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Inventory deducted from store stock registry upon checkout.
                </p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-14 rounded-2xl overflow-hidden bg-secondary border border-border shrink-0 p-1">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            BATCH_BADGE[item.batchType] || "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {item.batchType}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3 text-amber-500" />
                          <span>{item.shelfLifeAtPurchase}</span>
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-sm text-foreground truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.brand} • {item.unit} • Qty: <strong className="text-foreground font-black">×{item.quantity}</strong>
                        {item.batchNumber && (
                          <span className="text-primary font-bold ml-1.5">
                            • Batch #{item.batchNumber}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono shrink-0 pl-16 sm:pl-0">
                    <div className="text-sm font-black text-foreground">
                      {formatINR(item.paidPrice * item.quantity)}
                    </div>
                    {item.originalPrice > item.paidPrice && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatINR(item.originalPrice * item.quantity)}
                      </div>
                    )}
                    {item.savings > 0 && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        Saved {formatINR(item.savings)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfillment & Customer Delivery Info */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <MapPin className="size-4.5 text-primary" />
              <div>
                <h3 className="font-display font-bold text-base text-foreground">
                  Fulfillment & Delivery Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  Dispatch parameters and destination contact.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Shipping Destination */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                  Customer Destination
                </span>
                <p className="font-bold text-foreground text-sm">
                  {order.shippingAddress.recipientName} ({order.shippingAddress.type})
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center gap-1">
                  <Phone className="size-3 text-primary" />
                  <span>Contact: {order.shippingAddress.phone}</span>
                </p>
              </div>

              {/* Logistics Partner Info */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                  Carrier & Logistics
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fulfillment Mode:</span>
                  <span className="font-bold text-foreground">{order.deliveryMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Carrier:</span>
                  <span className="font-bold text-foreground">{order.deliveryPartner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tracking No:</span>
                  <span className="font-mono font-bold text-primary">{order.trackingId}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-muted-foreground">Target Delivery:</span>
                  <span className="font-bold text-foreground font-mono">{order.estimatedDelivery}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Price Breakdown */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-3 font-mono text-xs">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-foreground pb-2 border-b border-border">
              Order Financials
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal:</span>
                <span className="text-foreground">{formatINR(order.itemsSubtotal)}</span>
              </div>

              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Total ERN Discount:</span>
                <span>-{formatINR(order.ernDiscount)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee:</span>
                <span className={order.deliveryFee === 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-foreground"}>
                  {order.deliveryFee === 0 ? "FREE" : formatINR(order.deliveryFee)}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Taxes (GST 0% Included):</span>
                <span>₹0</span>
              </div>

              <div className="pt-2 border-t border-border flex justify-between items-baseline text-foreground">
                <span className="font-bold text-sm font-sans">Total Paid:</span>
                <span className="font-black text-lg text-primary">{formatINR(order.totalPaid)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="text-foreground font-bold">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Quick Operations Actions */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-foreground pb-2 border-b border-border">
              Operations Controls
            </h4>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-muted-foreground block">
                Change Status Manually:
              </label>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(e.target.value as OrderStatus)}
                className="w-full p-2.5 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="Processing">Processing</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

      {trackingOrder && (
        <TrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}

      {cancelOrder && (
        <CancelOrderModal
          order={cancelOrder}
          onClose={() => setCancelOrder(null)}
          onConfirmCancel={handleConfirmCancel}
        />
      )}
    </div>
  );
}
