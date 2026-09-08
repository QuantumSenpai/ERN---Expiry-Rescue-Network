import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  Download,
  FileText,
  RotateCcw,
  CheckCircle2,
  Headphones,
  Star,
  Leaf,
  X,
  Package,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  getStoredOrders,
  saveStoredOrders,
  type Order,
  type OrderStatus,
} from "@/data/ordersData";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/pricingService";
import InvoiceModal, { downloadInvoiceHtml } from "@/components/orders/InvoiceModal";
import TrackingModal from "@/components/orders/TrackingModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import RateProductsModal from "@/components/orders/RateProductsModal";
import SupportModal from "@/components/orders/SupportModal";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  Processing: { label: "Processing", color: "text-sky-500", bg: "bg-sky-500/10 border border-sky-500/30", icon: Clock },
  Confirmed: { label: "Confirmed", color: "text-sky-500", bg: "bg-sky-500/10 border border-sky-500/30", icon: CheckCircle2 },
  Packed: { label: "Packed", color: "text-indigo-500", bg: "bg-indigo-500/10 border border-indigo-500/30", icon: Package },
  Dispatched: { label: "Dispatched", color: "text-violet-500", bg: "bg-violet-500/10 border border-violet-500/30", icon: Truck },
  "Out for Delivery": { label: "Out for Delivery", color: "text-amber-500", bg: "bg-amber-500/10 border border-amber-500/30", icon: Truck },
  Delivered: { label: "Delivered", color: "text-emerald-500", bg: "bg-emerald-500/10 border border-emerald-500/30", icon: CheckCircle },
  Cancelled: { label: "Cancelled", color: "text-rose-500", bg: "bg-rose-500/10 border border-rose-500/30", icon: X },
};

const BATCH_BADGE: Record<string, string> = {
  "Rescue Deal": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  Clearance: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
  "Fresh Stock": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
};

function getProductFallbackBg(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = [
    "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30",
    "from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30",
    "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30",
    "from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30",
    "from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30",
  ];
  return colors[hash % colors.length];
}

export default function CustomerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reorderFromPastOrder } = useCart();

  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const order = useMemo(
    () =>
      orders.find((o) => o.id.toLowerCase() === id?.toLowerCase()) || orders[0],
    [orders, id]
  );

  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [rateOrder, setRateOrder] = useState<Order | null>(null);
  const [supportOrder, setSupportOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isCancelled = order.status === "Cancelled";
  const isDelivered = order.status === "Delivered";
  const isProcessing = order.status === "Processing" || order.status === "Confirmed";

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
    showToast(`Order ${orderId} cancelled. Refund will be processed.`);
  };

  const handleReorder = () => {
    const result = reorderFromPastOrder(order);
    if (result.successCount > 0) {
      showToast(result.message, result.unavailableCount > 0 || result.partialCount > 0);
    } else {
      showToast(result.message || "No items from this order are currently available.", true);
    }
  };

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["Processing"];
  const StatusIcon = statusCfg.icon;

  if (!order) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Order Not Found</h2>
        <p className="text-sm text-muted-foreground">
          We could not find order {id}. It may have been removed or the ID is incorrect.
        </p>
        <Link
          to="/customer/orders"
          className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold font-mono hover:opacity-90"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto w-full space-y-5">
      {/* Toast */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-20 right-4 sm:right-6 z-50 p-4 rounded-2xl border shadow-2xl text-xs font-sans flex items-center gap-2.5 ${
            toastMessage.isError
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              : "bg-card border-border text-foreground"
          }`}
        >
          {toastMessage.isError ? (
            <AlertCircle className="size-4 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/customer/orders")}
            className="p-2 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground transition-colors cursor-pointer"
            aria-label="Back to orders"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-black text-foreground">
              Order {order.id}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Placed on {order.orderDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.color}`}>
            <StatusIcon className="size-3.5" />
            {order.status}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {!isCancelled && (
          <button
            type="button"
            onClick={() => setTrackingOrder(order)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 cursor-pointer shadow-sm"
          >
            <Truck className="size-3.5" />
            Track Order
          </button>
        )}
        <button
          type="button"
          onClick={() => setInvoiceOrder(order)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-mono font-bold hover:bg-muted cursor-pointer"
        >
          <FileText className="size-3.5" />
          View Invoice
        </button>
        <button
          type="button"
          onClick={() => {
            downloadInvoiceHtml(order);
            showToast("Invoice downloaded successfully.");
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-mono font-bold hover:bg-muted cursor-pointer"
        >
          <Download className="size-3.5" />
          Download Invoice
        </button>
        <button
          type="button"
          onClick={handleReorder}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-mono font-bold hover:bg-muted cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          Reorder
        </button>
        {isDelivered && (
          <button
            type="button"
            onClick={() => setRateOrder(order)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/20 cursor-pointer"
          >
            <Star className="size-3.5" />
            Rate Order
          </button>
        )}
        {isProcessing && (
          <button
            type="button"
            onClick={() => setCancelOrder(order)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold hover:bg-rose-500/20 cursor-pointer"
          >
            <X className="size-3.5" />
            Cancel Order
          </button>
        )}
        <button
          type="button"
          onClick={() => setSupportOrder(order)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-mono font-bold hover:bg-muted cursor-pointer"
        >
          <Headphones className="size-3.5" />
          Support
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN: Items + Timeline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Timeline */}
          <div className="p-5 rounded-2xl bg-card border border-border">
            <h2 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              Order Timeline
            </h2>
            <div className="space-y-0">
              {order.timeline.map((step, i) => (
                <div key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-7 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${
                        step.current
                          ? "border-primary bg-primary text-primary-foreground"
                          : step.completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {step.completed || step.current ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Clock className="size-3.5" />
                      )}
                    </div>
                    {i < order.timeline.length - 1 && (
                      <div
                        className={`w-px flex-1 my-1 ${
                          step.completed ? "bg-emerald-500/40" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-5 flex-1 min-w-0">
                    <p className={`text-sm font-bold ${step.current ? "text-primary" : step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{step.timestamp}</p>
                    {step.locationNote && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" />
                        {step.locationNote}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShoppingBag className="size-4 text-primary" />
              Items ({order.items.length})
              {order.storeName && (
                <span className="ml-1 text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3" />
                  {order.storeName}
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border"
                >
                  {/* Product Image */}
                  <div className="shrink-0">
                    <div className={`size-16 rounded-xl overflow-hidden bg-gradient-to-br ${getProductFallbackBg(item.name)}`}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.brand} · {item.unit}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">{formatINR(item.paidPrice * item.quantity)}</p>
                        {item.savings > 0 && (
                          <p className="text-[10px] text-emerald-500 font-mono">
                            Saved {formatINR(item.savings * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          BATCH_BADGE[item.batchType] || BATCH_BADGE["Fresh Stock"]
                        }`}
                      >
                        {item.batchType}
                      </span>
                      {item.batchNumber && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Batch #{item.batchNumber}
                        </span>
                      )}
                      {item.expiryDate && (
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="size-2.5" />
                          Exp: {item.expiryDate}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Qty: {item.quantity} × {formatINR(item.paidPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eco Impact */}
          {(order.wastePreventedKg > 0 || order.productsRescued > 0) && (
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
              <div className="size-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Leaf className="size-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  You helped prevent {order.wastePreventedKg} kg of food waste
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {order.productsRescued} near-expiry product{order.productsRescued !== 1 ? "s" : ""} rescued from disposal
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Summary + Address + Payment */}
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Order Summary
            </h2>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({order.items.length} items)</span>
                <span>{formatINR(order.itemsSubtotal)}</span>
              </div>
              {order.ernDiscount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>ERN Savings</span>
                  <span>−{formatINR(order.ernDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>{order.deliveryFee === 0 ? "FREE" : formatINR(order.deliveryFee)}</span>
              </div>
              {order.taxes > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes & charges</span>
                  <span>{formatINR(order.taxes)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-sm">
                <span>Total Paid</span>
                <span>{formatINR(order.totalPaid)}</span>
              </div>
              {order.totalSavings > 0 && (
                <div className="flex justify-between text-emerald-500 font-bold">
                  <span>Total Saved</span>
                  <span>{formatINR(order.totalSavings)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Delivery Address
            </h2>
            <div className="text-xs text-foreground space-y-0.5">
              <p className="font-bold">{order.shippingAddress.recipientName}</p>
              <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p className="text-muted-foreground">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
              </p>
              <p className="text-muted-foreground font-mono pt-1">{order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment & Delivery */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              Payment & Delivery
            </h2>
            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-mono">Payment</span>
                <span className="font-bold text-foreground">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-mono">Status</span>
                <span className={`font-bold ${order.paymentStatus.includes("Refunded") ? "text-rose-500" : "text-emerald-500"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-mono">Delivery</span>
                <span className="font-bold text-foreground">{order.deliveryMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-mono">Tracking</span>
                <span className="font-mono text-primary text-[11px]">{order.trackingId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-mono">Est. Delivery</span>
                <span className="font-bold text-foreground">{order.estimatedDelivery}</span>
              </div>
            </div>
          </div>

          {/* Cancellation reason if cancelled */}
          {isCancelled && order.cancellationReason && (
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs">
              <p className="font-bold text-rose-500 mb-1">Cancellation Reason</p>
              <p className="text-muted-foreground">{order.cancellationReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <InvoiceModal
        order={invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
      <TrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />
      <CancelOrderModal
        order={cancelOrder}
        onClose={() => setCancelOrder(null)}
        onConfirmCancel={handleConfirmCancel}
      />
      <RateProductsModal
        order={rateOrder}
        onClose={() => setRateOrder(null)}
      />
      <SupportModal
        order={supportOrder}
        onClose={() => setSupportOrder(null)}
      />
    </div>
  );
}
