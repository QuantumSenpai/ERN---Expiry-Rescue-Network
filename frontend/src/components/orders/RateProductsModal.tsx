import { useState } from "react";
import { X, Star, Check } from "lucide-react";
import type { Order } from "@/data/ordersData";

interface RateProductsModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function RateProductsModal({ order, onClose }: RateProductsModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

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
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Star className="size-4.5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-foreground">
                Rate Product Freshness
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Order: {order.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            <X className="size-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3 font-sans">
            <div className="size-12 rounded-full bg-[#10B981]/20 text-[#10B981] mx-auto flex items-center justify-center">
              <Check className="size-6 stroke-[3]" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Rating Submitted!</h4>
            <p className="text-xs text-muted-foreground">
              Thank you for helping verify quality across our rescue grocery network.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                How satisfied were you with the freshness and quality of your delivered items?
              </p>

              {/* 5-Star Row */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125"
                  >
                    <Star
                      className={`size-7 ${
                        (hoverRating || rating) >= star
                          ? "text-amber-400 fill-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-mono text-muted-foreground block font-semibold">
                {rating === 5 ? "⭐️⭐️⭐️⭐️⭐️ Exceptional Freshness" : `${rating} / 5 Stars`}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-muted-foreground font-bold uppercase">
                Additional Comments (Optional):
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience about packaging, delivery speed, or batch accuracy..."
                className="w-full p-2.5 rounded-xl bg-secondary border border-border text-foreground outline-none focus:border-[#10B981]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground font-bold cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#10B981]/90 text-foreground font-bold cursor-pointer shadow-lg shadow-[#10B981]/20"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
