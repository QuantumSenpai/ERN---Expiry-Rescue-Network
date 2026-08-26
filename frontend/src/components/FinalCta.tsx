import ScrollReveal from "@/components/ScrollReveal";
import {
  ShieldCheck,
  Boxes,
  Clock,
  AlertTriangle,
  Zap,
  PackageCheck,
  Layers,
  ArrowDown,
} from "lucide-react";

export default function FinalCta() {
  return (
    <section className="py-20 px-4 sm:px-6 relative overflow-hidden bg-background">
      <div className="max-w-4xl mx-auto relative z-10">
        <ScrollReveal direction="up">
          <div
            className="rounded-[32px] sm:rounded-[48px] p-8 sm:p-14 text-center relative overflow-hidden surface-forest border border-snow-white/20 shadow-none"
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#567C8D] text-accent text-xs font-mono font-semibold uppercase shadow-none border border-[#2F4156]/20">
                <ShieldCheck className="size-3.5 text-accent" />
                <span>UNIFIED INVENTORY INTELLIGENCE</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-snow-white font-medium leading-[1.15] tracking-[-0.02em] font-display">
                <span className="font-sans block">One unified inventory.</span>
                <span className="font-script text-4xl sm:text-5xl md:text-6xl text-accent block font-bold mt-1">
                  Smarter expiry action.
                </span>
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-snow-white/75 font-sans leading-relaxed font-normal max-w-lg mx-auto">
                Manage your full inventory in one platform. ERN monitors expiry exposure and triggers automated workflows before products lose value.
              </p>

              {/* Architecture Workflow Tree */}
              <div className="my-8 p-6 rounded-2xl bg-[#567C8D] border border-[#F0E9D3]/12 text-left space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-[#F0E9D3]/12 pb-3">
                  <span className="text-xs uppercase tracking-wider text-snow-white/80 font-semibold flex items-center gap-1.5">
                    <Layers className="size-3 text-accent" />
                    <span>UNIFIED ARCHITECTURE WORKFLOW</span>
                  </span>
                  <span className="text-[10px] px-3 py-0.5 rounded-full bg-[#2F4156] text-accent font-semibold uppercase">
                    100% IN ONE SYSTEM
                  </span>
                </div>

                {/* Root Node: ALL INVENTORY */}
                <div className="flex justify-center">
                  <div className="px-5 py-2 rounded-full bg-primary text-primary-foreground border border-[#F0E9D3]/15 flex items-center gap-2 text-xs font-semibold uppercase shadow-none">
                    <Boxes className="size-4 text-accent" />
                    <span>ALL INVENTORY (COMPLETE CATALOG)</span>
                  </div>
                </div>

                {/* Arrow down */}
                <div className="flex justify-center -my-1 text-accent">
                  <ArrowDown className="size-3.5 animate-bounce" />
                </div>

                {/* Tracking Logic Node */}
                <div className="flex justify-center">
                  <div className="px-4 py-1.5 rounded-full bg-[#2F4156] border border-[#F0E9D3]/15 text-xs font-medium text-snow-white/85 flex items-center gap-1.5 uppercase">
                    <Clock className="size-3 text-accent" />
                    <span>EXPIRY TRACKING EVALUATION</span>
                  </div>
                </div>

                {/* Branch Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Left Branch */}
                  <div className="p-4 rounded-xl bg-[#2F4156] border border-[#F0E9D3]/12 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase">
                      <Clock className="size-3.5 text-accent" />
                      <span>EXPIRY APPLICABLE</span>
                    </div>

                    <div className="space-y-1.5 pl-2 border-l border-[#2F4156]/30">
                      <div className="flex items-center gap-1.5 text-xs text-snow-white/70">
                        <AlertTriangle className="size-3 text-[#9F995B] shrink-0" />
                        <span>Expiry Risk Monitoring</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-snow-white/85 font-medium">
                        <Zap className="size-3 text-accent shrink-0" />
                        <span>Timely Action & Recovery</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Branch */}
                  <div className="p-4 rounded-xl bg-[#2F4156] border border-[#F0E9D3]/12 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase">
                      <ShieldCheck className="size-3.5 text-accent" />
                      <span>NON-EXPIRY GOODS</span>
                    </div>

                    <div className="space-y-1.5 pl-2 border-l border-[#2F4156]/30">
                      <div className="flex items-center gap-1.5 text-xs text-snow-white/70">
                        <PackageCheck className="size-3 text-[#698E79] shrink-0" />
                        <span>Standard Stock Tracking</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-snow-white/85">
                        <Boxes className="size-3 text-accent shrink-0" />
                        <span>Cycle Count Management</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <a
                  href="/signup"
                  className="px-7 py-3.5 rounded-full bg-snow-white text-forest-depths font-sans text-sm font-semibold hover:opacity-90 transition-all shadow-none"
                >
                  START FREE DEPLOYMENT →
                </a>
                <a
                  href="/marketplace"
                  className="px-6 py-3.5 rounded-full border border-snow-white/40 bg-transparent text-snow-white font-sans text-sm font-medium hover:bg-snow-white/10 transition-all shadow-none"
                >
                  EXPLORE MARKETPLACE
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
