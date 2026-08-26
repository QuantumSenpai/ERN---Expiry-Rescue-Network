import { X, Truck, MapPin, Phone, CheckCircle2 } from "lucide-react";
import type { Order } from "@/data/ordersData";

interface TrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function TrackingModal({ order, onClose }: TrackingModalProps) {
  if (!order) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-2xl text-foreground space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
              <Truck className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">
                Live Order Tracking
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {order.id} &bull; {order.trackingId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-110 active:scale-95"
            aria-label="Close tracker"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Courier & Delivery ETA Card */}
        <div className="p-4 rounded-2xl bg-secondary border border-border flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
              Estimated Delivery
            </span>
            <p className="font-display font-black text-base text-[#10B981]">
              {order.estimatedDelivery}
            </p>
            <p className="text-xs text-muted-foreground font-sans">
              Partner: <span className="text-foreground font-semibold">{order.deliveryPartner}</span>
            </p>
          </div>

          {/* OTP Box */}
          <div className="p-2.5 rounded-xl bg-card border border-border text-center font-mono shadow-2xs">
            <span className="text-[9px] text-muted-foreground uppercase block">Delivery OTP</span>
            <span className="font-black text-sm text-[#10B981] tracking-widest block mt-0.5">
              4921
            </span>
          </div>
        </div>

        {/* Interactive Delivery Steps Timeline */}
        <div className="space-y-4 font-mono text-xs pl-2">
          {order.timeline.map((step, idx) => {
            const isLast = idx === order.timeline.length - 1;

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Connecting Line */}
                {!isLast && (
                  <div
                    className={`absolute left-3 top-6 bottom-0 w-0.5 -ml-[1px] ${
                      step.completed ? "bg-[#10B981]" : "bg-muted"
                    }`}
                  />
                )}

                {/* Step Circle Indicator */}
                <div
                  className={`size-6 rounded-full border flex items-center justify-center shrink-0 z-10 ${
                    step.completed
                      ? "bg-[#10B981] border-[#10B981] text-foreground"
                      : step.current
                      ? "bg-amber-400 border-amber-400 text-foreground animate-pulse ring-4 ring-amber-400/20"
                      : "bg-secondary border-border text-muted-foreground"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="size-3.5 stroke-[3]" />
                  ) : step.current ? (
                    <span className="size-2 rounded-full bg-[#2F4156]" />
                  ) : (
                    <span className="text-[9px] font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0 pb-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold text-xs font-sans ${
                        step.completed
                          ? "text-foreground"
                          : step.current
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground">{step.timestamp}</span>
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

        {/* Delivery Address Brief */}
        <div className="p-3.5 rounded-xl bg-secondary border border-border flex items-center gap-3 text-xs">
          <MapPin className="size-4 text-[#10B981] shrink-0" />
          <div className="min-w-0 font-sans">
            <span className="text-muted-foreground text-[10.5px] block font-mono">Delivering to:</span>
            <p className="font-bold text-foreground truncate">{order.shippingAddress.recipientName} &bull; {order.shippingAddress.addressLine1}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3">
          <a
            href="tel:+919876543210"
            className="flex-1 py-2.5 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground font-bold text-xs font-sans flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Phone className="size-3.5 text-[#10B981]" />
            <span>Call Driver (Ramesh)</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#10B981]/90 text-foreground font-bold text-xs font-sans cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
