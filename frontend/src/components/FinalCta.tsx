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
            className="rounded-[32px] sm:rounded-[48px] p-8 sm:p-14 text-center relative overflow-hidden bg-[#182635] dark:bg-[#142230] text-slate-100 border border-slate-700/60 shadow-xl"
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-800/80 text-sky-300 text-xs font-mono font-semibold uppercase shadow-none border border-slate-700/70">
                <ShieldCheck className="size-3.5 text-sky-400" />
                <span>UNIFIED INVENTORY INTELLIGENCE</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-medium leading-[1.15] tracking-[-0.02em] font-display">
                <span className="font-sans block">One unified inventory.</span>
                <span className="font-script text-4xl sm:text-5xl md:text-6xl text-sky-300 block font-bold mt-1">
                  Smarter expiry action.
                </span>
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed font-normal max-w-lg mx-auto">
                Manage your full inventory in one platform. ERN monitors expiry exposure and triggers automated workflows before products lose value.
              </p>

              {/* Architecture Workflow Tree */}
              <div className="my-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-left space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <span className="text-xs uppercase tracking-wider text-slate-200 font-semibold flex items-center gap-1.5">
                    <Layers className="size-3 text-sky-400" />
                    <span>UNIFIED ARCHITECTURE WORKFLOW</span>
                  </span>
                  <span className="text-[10px] px-3 py-0.5 rounded-full bg-slate-800 text-sky-300 font-semibold uppercase border border-slate-700/60">
                    100% IN ONE SYSTEM
                  </span>
                </div>

                {/* Root Node: ALL INVENTORY */}
                <div className="flex justify-center">
                  <div className="px-5 py-2 rounded-full bg-slate-800 text-white border border-slate-700/70 flex items-center gap-2 text-xs font-semibold uppercase shadow-none">
                    <Boxes className="size-4 text-sky-400" />
                    <span>ALL INVENTORY (COMPLETE CATALOG)</span>
                  </div>
                </div>

                {/* Arrow down */}
                <div className="flex justify-center -my-1 text-sky-400">
                  <ArrowDown className="size-3.5 animate-bounce" />
                </div>

                {/* Tracking Logic Node */}
                <div className="flex justify-center">
                  <div className="px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-200 flex items-center gap-1.5 uppercase">
                    <Clock className="size-3 text-sky-400" />
                    <span>EXPIRY TRACKING EVALUATION</span>
                  </div>
                </div>

                {/* Branch Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Left Branch */}
                  <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700/60 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300 uppercase">
                      <Clock className="size-3.5 text-sky-400" />
                      <span>EXPIRY APPLICABLE</span>
                    </div>

                    <div className="space-y-1.5 pl-2 border-l border-slate-700/60">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <AlertTriangle className="size-3 text-amber-400 shrink-0" />
                        <span>Expiry Risk Monitoring</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                        <Zap className="size-3 text-sky-400 shrink-0" />
                        <span>Timely Action & Recovery</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Branch */}
                  <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700/60 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300 uppercase">
                      <ShieldCheck className="size-3.5 text-sky-400" />
                      <span>NON-EXPIRY GOODS</span>
                    </div>

                    <div className="space-y-1.5 pl-2 border-l border-slate-700/60">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <PackageCheck className="size-3 text-emerald-400 shrink-0" />
                        <span>Standard Stock Tracking</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white">
                        <Boxes className="size-3 text-sky-400 shrink-0" />
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
                  className="px-7 py-3.5 rounded-full bg-white text-slate-900 font-sans text-sm font-bold hover:bg-slate-100 transition-all shadow-none"
                >
                  START FREE DEPLOYMENT →
                </a>
                <a
                  href="/marketplace"
                  className="px-6 py-3.5 rounded-full border border-slate-600 bg-transparent text-white font-sans text-sm font-medium hover:bg-white/10 transition-all shadow-none"
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
