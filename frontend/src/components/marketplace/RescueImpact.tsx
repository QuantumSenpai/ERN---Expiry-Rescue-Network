import { Leaf, Wallet, ShoppingBag } from "lucide-react";

export default function RescueImpact() {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-background text-foreground relative overflow-hidden font-body">
      <div className="max-w-[1440px] mx-auto space-y-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 text-[10.5px] font-mono font-bold uppercase mb-1">
              <span>COMMUNITY IMPACT</span>
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground tracking-[-0.015em]">
              The impact of rescuing groceries
            </h3>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              Every rescue purchase diverts edible food from store waste while keeping household grocery budgets lower.
            </p>
          </div>
        </div>

        {/* 3 Clear Stat Cards */}
        <div className="grid sm:grid-cols-3 gap-4 font-mono">
          {/* Stat 1 */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border flex items-center gap-4 shadow-none">
            <div className="size-12 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-display text-foreground leading-none">
                3,400+
              </p>
              <p className="text-xs text-muted-foreground mt-1 uppercase font-semibold">
                Packs Rescued This Month
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border flex items-center gap-4 shadow-none">
            <div className="size-12 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
              <Wallet className="size-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-display text-foreground leading-none">
                ₹85,000+
              </p>
              <p className="text-xs text-muted-foreground mt-1 uppercase font-semibold">
                Customer Savings Given
              </p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border flex items-center gap-4 shadow-none">
            <div className="size-12 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
              <Leaf className="size-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-display text-foreground leading-none">
                1.4 Tons
              </p>
              <p className="text-xs text-muted-foreground mt-1 uppercase font-semibold">
                Food Waste Diverted
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
