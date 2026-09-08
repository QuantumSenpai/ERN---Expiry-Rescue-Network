import AnimatedNumber from "@/components/AnimatedNumber";
import {
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export interface ItemCardProps {
  id?: string | number;
  name: string;
  category: string;
  location?: string;
  store?: string;
  sku?: string;
  batchNo?: string;
  quantity?: number;
  unit?: string;
  stockStatus?: "In Stock" | "Low Stock" | "Out of Stock";
  expiryTrackingEnabled?: boolean;
  expiryDate?: string;
  daysRemaining?: number;
  expiryStatus?: "Safe" | "Warning" | "High" | "Critical" | "Not Applicable";
  price?: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercent?: number;
  expiresIn?: string;
  freshness?: number;
  isBulkEligible?: boolean;
  imageUrl?: string;
  brand?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80";

/* Risk badge styles — Sage & Vanilla palette */
const RISK_BADGE_STYLE: Record<
  string,
  { badge: string; dot: string; pill: string }
> = {
  Critical: {
    badge: "border border-[#9F995B] bg-secondary text-foreground font-bold",
    dot: "bg-destructive",
    pill: "border border-[#9F995B] bg-secondary text-foreground font-bold",
  },
  High: {
    badge: "bg-secondary text-foreground border border-[#9F995B]/40 font-bold",
    dot: "bg-destructive",
    pill: "bg-secondary text-foreground font-bold",
  },
  Warning: {
    badge: "bg-[#EEEEE9] text-muted-foreground font-semibold border border-[#C4C7C4]",
    dot: "bg-[#757C5D]",
    pill: "bg-[#EEEEE9] text-muted-foreground font-semibold",
  },
  Safe: {
    badge: "bg-accent text-accent-foreground font-bold border border-[#2F4156]/20",
    dot: "bg-[#2F4156]",
    pill: "bg-accent text-accent-foreground font-bold",
  },
  "Not Applicable": {
    badge: "bg-[#EEEEE9] text-muted-foreground font-medium",
    dot: "bg-[#757C5D]",
    pill: "bg-[#EEEEE9] text-muted-foreground font-medium",
  },
};

export default function ItemCard(props: ItemCardProps) {
  const {
    name,
    category,
    location = props.store || "Main Branch",
    sku = "SKU-" + (props.id || "001"),
    batchNo,
    quantity = 50,
    unit = "Pcs",
    expiryTrackingEnabled = true,
    daysRemaining = 6,
    expiryStatus = "Safe",
    imageUrl = FALLBACK_IMAGE,
    brand = "ERN Essential",
  } = props;

  const riskInfo = RISK_BADGE_STYLE[expiryStatus] || RISK_BADGE_STYLE["Safe"];

  return (
    <div
      className={`group relative flex flex-col h-full justify-between bg-card border border-[#2F4156]/15 rounded-2xl overflow-hidden shadow-none ern-card-hover ${
        expiryStatus === "Critical" ? "ern-card-glow" : "ern-card-glow"
      }`}
    >
      <div className="flex flex-col flex-1">
        {/* Product Image */}
        <div className="relative w-full h-44 shrink-0 bg-secondary overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Category Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-card/95 backdrop-blur-md text-foreground font-mono text-[10px] font-bold tracking-wider uppercase border border-border">
              {category}
            </span>
          </div>

          {/* Risk Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${riskInfo.badge}`}>
              {expiryStatus}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between gap-2 h-5">
            <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase font-semibold">
              {sku}
            </span>
            {batchNo ? (
              <span className="font-mono text-xs text-muted-foreground truncate">
                Batch: {batchNo}
              </span>
            ) : (
              <span className="font-mono text-xs text-muted-foreground">
                Batch: Standalone
              </span>
            )}
          </div>

          <h3 className="font-display font-medium text-lg sm:text-xl text-foreground tracking-[-0.015em] leading-snug mt-1.5 line-clamp-2 min-h-[3.25rem]">
            {name}
          </h3>

          <p className="text-xs text-muted-foreground font-sans mt-1 truncate min-h-[1.25rem]">{brand} · {location}</p>

          {/* Inventory & Expiry Metrics */}
          <div className="mt-auto pt-4">
            <div className="p-3.5 rounded-xl bg-secondary/60 border border-[#2F4156]/10 dark:border-transparent grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Stock</span>
                <span className="font-bold text-foreground">
                  <AnimatedNumber value={quantity} /> {unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Shelf Life</span>
                {expiryTrackingEnabled ? (
                  <span className="font-bold text-foreground whitespace-nowrap inline-flex items-center gap-1">{daysRemaining}D LEFT</span>
                ) : (
                  <span className="text-muted-foreground">Durable</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer CTA */}
      <div className="p-5 pt-0 mt-auto">
        <Link
          to={`/retailer/inventory`}
          className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 hover:opacity-90 transition-colors shadow-none ern-btn-hover"
        >
          <span>Inspect Lot</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}