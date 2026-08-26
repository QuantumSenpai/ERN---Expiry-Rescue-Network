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
  RotateCcw,
  CheckCircle2,
  Headphones,
  Star,
  Leaf,
  X,
  Phone,
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());

  // Match the order by ID, fallback to the first order if not found
  const order = useMemo(() => {
    return (
      orders.find((o) => o.id.toLowerCase() === id?.toLowerCase()) ||
      orders[0]
    );
  }, [orders, id]);

  // Modals state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRateOpen, setIsRateOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isCancelled = order.status === "Cancelled";
  const isDelivered = order.status === "Delivered";
  const isProcessing = order.status === "Processing" || order.status === "Confirmed";

  // Handle Cancellation
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
    setIsCancelOpen(false);
    showToast(`Order ${orderId} cancelled. Refund issued.`);
  };

  // Status Badge Class
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-500/20 text-[#10B981] border border-emerald-500/40";
      case "Out for Delivery":
        return "bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse";
      case "Processing":
      case "Confirmed":
      case "Packed":
        return "bg-sky-500/20 text-sky-500 border border-sky-500/40";
      case "Dispatched":
        return "bg-indigo-500/20 text-indigo-500 border border-indigo-500/40";
      case "Cancelled":
        return "bg-rose-500/20 text-rose-500 border border-rose-500/40";
      default:
        return "bg-secondary text-muted-foreground border border-border";
    }
  };

  const getBatchBadge = (batchType: string) => {
    if (batchType === "Clearance") {
      return "bg-rose-500 text-snow-white font-black";
    }
    if (batchType === "Rescue Deal") {
      return "bg-amber-500 text-foreground font-bold";
    }
    return "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 font-bold";
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full space-y-6">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-[#10B981]/50 shadow-2xl text-foreground font-sans text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-300">
          <Sparkles className="size-4 text-[#10B981] shrink-0" />
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

      {/* ─── HEADER IDENTITY BANNER ─── */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/customer/orders"
              className="p-1.5 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground transition-colors inline-flex items-center justify-center cursor-pointer mr-1"
              title="Back to Orders"
            >
              <ArrowLeft className="size-4 text-[#10B981]" />
            </Link>
            <h1 className="font-display text-xl sm:text-2xl font-black text-foreground">
              Order {order.id}
            </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
              <span>Placed on {order.orderDate}</span>
              <span>&bull;</span>
              <span className="text-foreground">{order.paymentStatus}</span>
              <span>&bull;</span>
              <span className="text-emerald-500 font-semibold">
                Tracking: {order.trackingId}
              </span>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isCancelled && (
              <button
                type="button"
                onClick={() => setIsTrackingOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#10B981]/90 text-foreground font-bold text-xs font-sans flex items-center gap-1.5 shadow-md shadow-[#10B981]/20 cursor-pointer"
              >
                <Truck className="size-4" />
                <span>Track Live Order</span>
              </button>
            )}

            {isDelivered && (
              <button
                type="button"
                onClick={() => setIsRateOpen(true)}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted border border-border text-amber-500 font-bold text-xs font-sans flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span>Rate Freshness</span>
              </button>
            )}

            {isProcessing && (
              <button
                type="button"
                onClick={() => setIsCancelOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-bold text-xs font-sans cursor-pointer"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* ─── ORDER TRACKING SECTION (DELIVERY TIMELINE) ─── */}
        {!isCancelled && (
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
                  <Truck className="size-4.5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-sm sm:text-base text-foreground">
                    Delivery Progress & Dispatch Timeline
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Real-time temperature and shelf-life verification
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono text-xs">
                <span className="text-muted-foreground text-[10px] block font-sans">
                  Target Delivery:
                </span>
                <span className="font-bold text-[#10B981]">
                  {order.estimatedDelivery}
                </span>
              </div>
            </div>

            {/* Horizontal Timeline (Desktop) / Vertical (Mobile) */}
            <div className="hidden lg:grid grid-cols-6 gap-2 font-mono text-xs relative">
              {/* Horizontal Connecting Progress Line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-muted -z-0">
                <div
                  className="h-full bg-[#10B981] transition-all duration-500"
                  style={{
                    width:
                      order.status === "Delivered"
                        ? "100%"
                        : order.status === "Out for Delivery"
                        ? "80%"
                        : order.status === "Dispatched"
                        ? "60%"
                        : order.status === "Packed"
                        ? "40%"
                        : "20%",
                  }}
                />
              </div>

              {order.timeline.map((step, index) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center space-y-2 relative z-10"
                >
                  <div
                    className={`size-8 rounded-full border-2 flex items-center justify-center ${
                      step.completed
                        ? "bg-[#10B981] border-[#10B981] text-foreground shadow-lg shadow-[#10B981]/30"
                        : step.current
                        ? "bg-amber-400 border-amber-400 text-foreground animate-pulse ring-4 ring-amber-400/20"
                        : "bg-secondary border-border text-muted-foreground"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="size-4 stroke-[3]" />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <span
                      className={`font-display font-bold text-xs block ${
                        step.completed
                          ? "text-foreground"
                          : step.current
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {step.timestamp}
                    </span>
                    {step.locationNote && (
                      <span className="text-[9.5px] text-muted-foreground font-sans block max-w-[140px] leading-tight">
                        {step.locationNote}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="lg:hidden space-y-4 font-mono text-xs pl-2">
              {order.timeline.map((step, idx) => {
                const isLast = idx === order.timeline.length - 1;
                return (
                  <div key={step.id} className="relative flex items-start gap-4">
                    {!isLast && (
                      <div
                        className={`absolute left-3 top-6 bottom-0 w-0.5 -ml-[1px] ${
                          step.completed ? "bg-[#10B981]" : "bg-muted"
                        }`}
                      />
                    )}
                    <div
                      className={`size-6 rounded-full border flex items-center justify-center shrink-0 z-10 ${
                        step.completed
                          ? "bg-[#10B981] border-[#10B981] text-foreground"
                          : step.current
                          ? "bg-amber-400 border-amber-400 text-foreground animate-pulse"
                          : "bg-secondary border-border text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="size-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[9px] font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-bold font-sans ${
                            step.completed
                              ? "text-foreground"
                              : step.current
                              ? "text-amber-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {step.timestamp}
                        </span>
                      </div>
                      {step.locationNote && (
                        <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                          {step.locationNote}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── TWO-COLUMN MAIN DETAILS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Purchased Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Purchased Items Card */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                    Purchased Inventory Batches ({order.items.length} Items)
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-sans">
                    Each item traces to a specific shelf life tier chosen at checkout.
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
                      <div className="size-16 rounded-2xl overflow-hidden bg-secondary border border-border shrink-0 p-0.5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono ${getBatchBadge(
                              item.batchType
                            )}`}
                          >
                            {item.batchType}
                          </span>
                          <span className="text-[10.5px] font-mono text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3 text-amber-500" />
                            <span>{item.shelfLifeAtPurchase}</span>
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-xs sm:text-sm text-foreground truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {item.category} &bull; {item.unit} &bull; Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono shrink-0 pl-19 sm:pl-0">
                      <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0.5">
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{item.originalPrice * item.quantity}
                        </span>
                        <span className="font-bold text-base text-foreground">
                          ₹{item.paidPrice * item.quantity}
                        </span>
                      </div>
                      {item.savings > 0 && (
                        <span className="text-[11px] text-[#10B981] font-bold font-sans block mt-0.5">
                          You saved ₹{item.savings}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information Card */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="size-8 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
                  <MapPin className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                    Fulfillment & Delivery Information
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Dispatch logistics and destination parameters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                {/* Shipping Destination */}
                <div className="p-4 rounded-2xl bg-secondary border border-border space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                    Delivery Address
                  </span>
                  <p className="font-bold text-foreground sm:text-sm">
                    {order.shippingAddress.recipientName} ({order.shippingAddress.type})
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {order.shippingAddress.addressLine1},{" "}
                    {order.shippingAddress.addressLine2}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center gap-1">
                    <Phone className="size-3 text-[#10B981]" />
                    <span>Contact: {order.shippingAddress.phone}</span>
                  </p>
                </div>

                {/* Logistics Partner Info */}
                <div className="p-4 rounded-2xl bg-secondary border border-border space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                    Dispatch Details
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fulfillment Mode:</span>
                    <span className="font-bold text-foreground">{order.deliveryMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Carrier Partner:</span>
                    <span className="font-bold text-foreground">{order.deliveryPartner}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tracking Number:</span>
                    <span className="font-mono font-bold text-[#10B981]">{order.trackingId}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-muted-foreground">Target ETA:</span>
                    <span className="font-bold text-amber-500 font-mono">{order.estimatedDelivery}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: ERN Impact & Price Breakdown (4 cols) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* ─── YOUR ERN IMPACT CARD ─── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl bg-gradient-to-br from-[#0F291E] via-[#122B20] to-[#0A1A13] border border-[#10B981]/50 shadow-2xl relative overflow-hidden space-y-3.5 text-snow-white"
            >
              <div className="absolute top-0 right-0 size-32 bg-[#10B981]/20 blur-2xl rounded-full pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
                    <Sparkles className="size-4.5 text-amber-400" />
                  </div>
                  <h3 className="font-display font-black text-sm text-snow-white tracking-wider uppercase">
                    Your ERN Impact
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-foreground text-[10px] font-mono font-black">
                  VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                <div className="p-2 rounded-xl bg-[#2F4156]/40 border border-[#10B981]/40">
                  <span className="text-[9.5px] text-zinc-300 block font-sans">
                    Total Savings
                  </span>
                  <span className="font-black text-sm text-[#10B981] mt-0.5 block">
                    ₹{order.totalSavings}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#2F4156]/40 border border-[#10B981]/40">
                  <span className="text-[9.5px] text-zinc-300 block font-sans">
                    Rescued
                  </span>
                  <span className="font-black text-sm text-snow-white mt-0.5 block">
                    {order.productsRescued} items
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#2F4156]/40 border border-[#10B981]/40">
                  <span className="text-[9.5px] text-zinc-300 block font-sans">
                    Waste Saved
                  </span>
                  <span className="font-black text-sm text-emerald-400 mt-0.5 block">
                    {order.wastePreventedKg} kg
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-200 font-sans leading-relaxed">
                🌱 Nice choice! You saved money while helping prevent perfectly usable products from becoming waste.
              </p>
            </motion.div>

            {/* ─── PRICE BREAKDOWN CARD ─── */}
            <div className="p-5 rounded-3xl bg-card border border-border shadow-xl space-y-3 font-mono text-xs">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-foreground font-sans pb-2 border-b border-border">
                Price Breakdown
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Subtotal:</span>
                  <span className="text-foreground">₹{order.itemsSubtotal}</span>
                </div>

                <div className="flex justify-between text-[#10B981]">
                  <span>Total ERN Discount:</span>
                  <span>-₹{order.ernDiscount}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee:</span>
                  <span className={order.deliveryFee === 0 ? "text-[#10B981] font-bold" : "text-foreground"}>
                    {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (GST 0% Included):</span>
                  <span className="text-muted-foreground">₹0</span>
                </div>

                <div className="pt-2 border-t border-border flex justify-between items-baseline text-foreground">
                  <span className="font-bold text-sm font-sans">Total Paid:</span>
                  <span className="font-black text-lg text-[#10B981]">₹{order.totalPaid}</span>
                </div>
              </div>

              {/* Payment Method Badge */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-sans">Payment Method:</span>
                <span className="text-foreground font-bold">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Bottom Actions for Detail Page */}
            <div className="space-y-2 pt-1 font-sans">
              <button
                type="button"
                onClick={() => {
                  order.items.forEach((item) => {
                    addToCart(
                      {
                        id: item.productId,
                        productId: item.productId,
                        name: item.name,
                        subtitle: item.subtitle,
                        brand: item.brand,
                        category: item.category,
                        categorySlug: "dairy",
                        imageUrl: item.imageUrl,
                        unit: item.unit,
                        rating: 4.8,
                        reviewsCount: 200,
                        isRescueDeal: item.batchType === "Rescue Deal",
                        isPopular: true,
                        isRecommended: true,
                        isClearance: item.batchType === "Clearance",
                        isBuyAgain: true,
                        defaultOffer: {
                          id: `off-${item.id}`,
                          type: item.batchType,
                          price: item.paidPrice,
                          originalPrice: item.originalPrice,
                          discountPercent: 20,
                          savings: item.savings,
                          expiryText: item.shelfLifeAtPurchase,
                          daysRemaining: item.daysRemaining,
                          availability: 20,
                        },
                        allOffers: [],
                      },
                      {
                        id: `off-${item.id}`,
                        type: item.batchType,
                        price: item.paidPrice,
                        originalPrice: item.originalPrice,
                        discountPercent: 20,
                        savings: item.savings,
                        expiryText: item.shelfLifeAtPurchase,
                        daysRemaining: item.daysRemaining,
                        availability: 20,
                      }
                    );
                  });
                  showToast(`Added ${order.items.length} items to cart!`);
                  navigate("/marketplace");
                }}
                className="w-full py-3 rounded-2xl bg-[#10B981] hover:bg-[#10B981]/90 text-foreground font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#10B981]/20 transition-all hover:scale-102 active:scale-98"
              >
                <RotateCcw className="size-4" />
                <span>Reorder Items (Buy Again)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSupportOpen(true)}
                className="w-full py-2.5 rounded-2xl bg-card hover:bg-secondary border border-border text-foreground font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <Headphones className="size-3.5 text-sky-500" />
                <span>Report an Issue / Need Help</span>
              </button>
            </div>
          </div>
        </div>

      {/* ─── MODALS ─── */}
      {isInvoiceOpen && (
        <InvoiceModal
          order={order}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}

      {isTrackingOpen && (
        <TrackingModal
          order={order}
          onClose={() => setIsTrackingOpen(false)}
        />
      )}

      {isCancelOpen && (
        <CancelOrderModal
          order={order}
          onClose={() => setIsCancelOpen(false)}
          onConfirmCancel={handleConfirmCancel}
        />
      )}

      {isRateOpen && (
        <RateProductsModal
          order={order}
          onClose={() => setIsRateOpen(false)}
        />
      )}

      {isSupportOpen && (
        <SupportModal
          order={order}
          onClose={() => setIsSupportOpen(false)}
        />
      )}
    </div>
  );
}
