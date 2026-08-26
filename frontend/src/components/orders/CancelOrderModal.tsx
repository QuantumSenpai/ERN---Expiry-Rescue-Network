import { useState } from "react";
import { X, AlertTriangle, ArrowRight } from "lucide-react";
import type { Order } from "@/data/ordersData";

interface CancelOrderModalProps {
  order: Order | null;
  onClose: () => void;
  onConfirmCancel: (orderId: string, reason: string) => void;
}

export default function CancelOrderModal({
  order,
  onClose,
  onConfirmCancel,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("Changed delivery location");

  if (!order) return null;

  const reasonsList = [
    "Changed delivery location or facility",
    "Ordered incorrect quantity or batch type",
    "Found an alternate clearance deal",
    "Expected faster delivery window",
    "Other reasons",
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-2xl text-foreground space-y-5 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5 text-rose-500">
            <div className="size-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <AlertTriangle className="size-4.5" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground">
              Cancel Rescue Order
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-foreground font-sans">
            Are you sure you want to cancel order{" "}
            <span className="font-bold font-mono">{order.id}</span>?
          </p>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Your payment of{" "}
            <span className="text-[#10B981] font-bold font-mono">
              ₹{order.totalPaid}
            </span>{" "}
            will be refunded to your original payment method immediately.
          </p>
        </div>

        {/* Reason Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase text-muted-foreground font-bold block">
            Reason for cancellation:
          </label>
          <div className="space-y-1.5 text-xs font-sans">
            {reasonsList.map((r) => (
              <label
                key={r}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  reason === r
                    ? "bg-[#10B981]/15 border-[#10B981] text-foreground font-medium"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="cancel_reason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-[#10B981]"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground font-bold text-xs font-sans cursor-pointer shadow-2xs"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={() => onConfirmCancel(order.id, reason)}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-snow-white font-bold text-xs font-sans cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30"
          >
            <span>Confirm Cancel</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
