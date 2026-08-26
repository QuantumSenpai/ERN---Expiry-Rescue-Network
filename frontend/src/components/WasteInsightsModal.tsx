import {
  X,
  Leaf,
  Award,
} from "lucide-react";

interface WasteInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WasteInsightsModal({
  isOpen,
  onClose,
}: WasteInsightsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Leaf className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Waste Reduction & Sustainability Insights
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                ERN Impact Tracker: Proactive Loss Avoidance & Food Rescue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Key Impact Numbers */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                Food Saved from Landfills
              </p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">
                4,820 <span className="text-xs text-muted-foreground">kg</span>
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                ↑ 34% this month
              </p>
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-[11px] font-mono uppercase text-primary font-bold">
                CO2 Emissions Prevented
              </p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">
                11.8 <span className="text-xs text-muted-foreground">Tonnes</span>
              </p>
              <p className="text-[10px] text-primary mt-1 font-mono">
                Equivalent to 240 trees planted
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-[11px] font-mono uppercase text-purple-600 dark:text-purple-400 font-bold">
                Direct Financial Recovery
              </p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">
                ₹8,92,300
              </p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 font-mono">
                87.4% write-off reduction
              </p>
            </div>
          </div>

          {/* Breakdown by Category */}
          <div className="border border-border rounded-xl p-4 bg-secondary/20 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-foreground">
              Clearance Efficiency by Food Category
            </h3>
            <div className="space-y-2.5">
              {[
                { category: "Dairy & Milk Products", percentage: 94, saved: "₹2.8L saved" },
                { category: "Bakery & Fresh Breads", percentage: 89, saved: "₹1.9L saved" },
                { category: "Packaged Beverages & Juices", percentage: 82, saved: "₹2.2L saved" },
                { category: "Snacks & Confectionery", percentage: 76, saved: "₹1.4L saved" },
              ].map((row) => (
                <div key={row.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-foreground font-semibold">{row.category}</span>
                    <span className="text-muted-foreground">
                      {row.percentage}% rescued ({row.saved})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Rescue Partnerships */}
          <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-secondary flex items-center justify-center text-primary">
                <Award className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Bulk NGO & Orphanage Rescue Active
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  12 verified NGO kitchens receiving uncollected shelf stock daily
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full shrink-0">
              Active Tier 1
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-border bg-secondary/20">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Close Insights
          </button>
        </div>
      </div>
    </div>
  );
}
