import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Clock,
  Leaf,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function RetailerOrderSuccess() {
  const navigate = useNavigate();
  const { placedOrder } = useCart();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Fallback if accessed directly without state
  const order = placedOrder || {
    orderId: "ERN-2026-10482",
    items: [],
    totalUnits: 4,
    subtotal: 169,
    deliveryFee: 0,
    totalSavings: 49,
    totalPaid: 169,
    address: {
      id: "addr-1",
      type: "Home" as const,
      recipientName: "Alex",
      tagline: "Workspace Member & Retail Partner",
      addressLine1: "Plot 42, Sector 18, Phase II, Industrial Area",
      addressLine2: "Near Central Food Logistics Hub",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400072",
      phone: "+91 98765 43210",
      isDefault: true,
    },
    deliveryOption: {
      id: "standard" as const,
      title: "Standard Delivery",
      subtitle: "Eco-routed standard delivery",
      duration: "2–3 Days",
      fee: 0,
      tag: "Free above ₹500",
    },
    paymentMethod: "UPI (Google Pay, PhonePe, Paytm)",
    placedAt: new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    estimatedDelivery: "Tomorrow by 2:00 PM",
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Celebratory Checkmark Hero */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 200 }}
            className="size-18 sm:size-20 rounded-full bg-[#10B981]/20 border-2 border-[#10B981] text-[#10B981] mx-auto flex items-center justify-center shadow-2xl shadow-[#10B981]/30"
          >
            <CheckCircle2 className="size-10 sm:size-11 stroke-[2.5]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-1.5"
          >
            <span className="px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-xs font-mono font-bold tracking-wide inline-block">
              ✓ ORDER CONFIRMED
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
              Your ERN rescue order has been placed.
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              We&rsquo;ve reserved your selected grocery batches to guarantee freshness and prevent store write-off waste.
            </p>
          </motion.div>
        </div>

        {/* Order ID & Timing Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono"
        >
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-sans">
              Confirmed Order Reference
            </span>
            <span className="font-black text-base sm:text-lg text-foreground">
              {order.orderId}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-sans">
                Order Placed On
              </span>
              <span className="text-foreground">{order.placedAt}</span>
            </div>
            <div className="text-left sm:text-right border-l border-border pl-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-sans">
                Estimated Delivery
              </span>
              <span className="text-[#10B981] font-bold">
                {order.estimatedDelivery}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Items List (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-foreground">
                  Purchased Rescue Batches ({order.totalUnits} items)
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Inspected & Verified
                </span>
              </div>

              <div className="space-y-2.5">
                {order.items.length > 0 ? (
                  order.items.map((item, idx) => {
                    const isRescue = item.selectedOffer.type === "Rescue Deal";
                    const isClearance =
                      item.selectedOffer.type === "Clearance";
                    const itemSavings =
                      item.selectedOffer.savings * item.quantity;

                    return (
                      <div
                        key={`${item.product.id}-${item.selectedOffer.id}-${idx}`}
                        className="p-3 rounded-xl bg-secondary border border-border flex items-center justify-between gap-3"
                      >
                        <div className="size-12 rounded-lg overflow-hidden bg-card border border-border shrink-0">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                isClearance
                                  ? "bg-rose-500 text-snow-white"
                                  : isRescue
                                  ? "bg-amber-500 text-foreground"
                                  : "bg-[#10B981]/20 text-[#10B981]"
                              }`}
                            >
                              {item.selectedOffer.type}
                            </span>
                            <span className="text-[9.5px] font-mono text-muted-foreground flex items-center gap-0.5">
                              <Clock className="size-2.5" />
                              <span>{item.selectedOffer.expiryText}</span>
                            </span>
                          </div>

                          <p className="font-bold text-xs text-foreground truncate mt-0.5">
                            {item.product.name}
                          </p>

                          <div className="flex items-baseline justify-between font-mono mt-0.5 text-[11px]">
                            <span className="text-foreground">
                              ₹{item.selectedOffer.price} &times; {item.quantity}
                            </span>
                            {itemSavings > 0 && (
                              <span className="text-[10px] text-[#10B981] font-sans">
                                Saved ₹{itemSavings}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-muted-foreground py-2">
                    Standard mock batch inventory confirmed.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Delivery & Payment Specs (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            {/* Sustainability Badge */}
            {order.totalSavings > 0 && (
              <div className="p-4 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
                    <Sparkles className="size-4 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#10B981] font-bold block">
                      Total Expiry Savings
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      ₹{order.totalSavings} saved today
                    </span>
                  </div>
                </div>
                <Leaf className="size-5 text-[#10B981]" />
              </div>
            )}

            {/* Delivery & Payment Details Card */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xl space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold flex items-center gap-1">
                  <MapPin className="size-3 text-[#10B981]" />
                  <span>Delivery Address</span>
                </span>
                <p className="font-bold text-foreground">
                  {order.address.recipientName} ({order.address.type})
                </p>
                <p className="text-muted-foreground font-sans">
                  {order.address.addressLine1}, {order.address.city} -{" "}
                  {order.address.pincode}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-border">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold flex items-center gap-1">
                  <Truck className="size-3 text-amber-500" />
                  <span>Fulfillment Mode</span>
                </span>
                <p className="font-bold text-foreground">
                  {order.deliveryOption.title}
                </p>
                <p className="text-muted-foreground">
                  {order.deliveryOption.subtitle} ({order.estimatedDelivery})
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-border font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee:</span>
                  <span>
                    {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-foreground font-bold text-sm pt-1 border-t border-border">
                  <span>Total Paid:</span>
                  <span className="text-[#10B981]">₹{order.totalPaid}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setIsTrackingModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-card hover:bg-secondary border border-border text-foreground font-bold text-xs font-sans transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
          >
            <Package className="size-4 text-[#10B981]" />
            <span>Track Order</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/marketplace")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#10B981]/90 text-foreground font-bold text-xs font-sans transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20"
          >
            <ShoppingBag className="size-4" />
            <span>Continue Shopping</span>
          </button>

          <Link
            to="/customer/orders"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-card hover:bg-secondary border border-border text-foreground font-bold text-xs font-sans transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <span>View My Orders</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </div>

      {/* Live Order Tracker Modal */}
      {isTrackingModalOpen && (
        <div
          onClick={() => setIsTrackingModalOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-[#10B981]" />
                <h3 className="font-display font-bold text-sm text-foreground">
                  Live Dispatch Tracking
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-[#10B981] text-foreground flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-foreground block">
                    Order Verified & Logged
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Expiry batches locked at warehouse
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-[#10B981] text-foreground flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-foreground block">
                    Quality Inspection Passed
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Seal & batch temperature checked
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-amber-400 text-foreground flex items-center justify-center font-bold text-[10px] animate-pulse">
                  ⟳
                </div>
                <div>
                  <span className="font-bold text-amber-500 block">
                    Dispatched for Delivery
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Expected {order.estimatedDelivery}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-40">
                <div className="size-6 rounded-full bg-secondary border border-border text-foreground flex items-center justify-center font-bold text-[10px]">
                  4
                </div>
                <div>
                  <span className="font-bold text-muted-foreground block">
                    Delivered / Handed Over
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Counter OTP verification required
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTrackingModalOpen(false)}
              className="w-full py-2 rounded-xl bg-secondary hover:bg-muted text-foreground font-bold text-xs"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
