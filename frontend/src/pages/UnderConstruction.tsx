import { Link, useNavigate, useLocation } from "react-router-dom";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import {
  Hammer,
  ArrowLeft,
  Store,
  Boxes,
  Clock,
} from "lucide-react";

interface UnderConstructionProps {
  title?: string;
  moduleName?: string;
  description?: string;
}

export default function UnderConstruction({
  title = "Module Under Active Development",
  moduleName,
  description = "Yeh page / module abhi banaya ja raha hai. This feature is currently being developed and will be available in the upcoming platform release.",
}: UnderConstructionProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = moduleName || location.pathname;

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <LiquidGlassCard className="max-w-xl w-full p-8 text-center space-y-6 rounded-3xl border border-primary/30 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 size-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="size-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shadow-inner border border-primary/30 animate-pulse">
            <Hammer className="size-8 text-primary" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
            <Clock className="size-3.5" />
            <span>🚧 Work In Progress / Under Active Construction</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-lg inline-block">
            Route: {currentPath}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            {description}
          </p>
          <p className="text-xs font-mono text-muted-foreground/80">
            (यह पेज अभी तैयार किया जा रहा है। आप अन्य सक्रिय फीचर्स देख सकते हैं।)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Go Back / Pichhe Jayein</span>
          </button>

          <Link
            to="/retailer/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md cursor-pointer"
          >
            <Store className="size-4" />
            <span>Retailer Dashboard</span>
          </Link>

          <Link
            to="/retailer/inventory"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            <Boxes className="size-4 text-primary" />
            <span>All Inventory</span>
          </Link>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
