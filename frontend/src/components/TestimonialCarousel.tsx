import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { ChevronLeft, ChevronRight } from "lucide-react";

const USE_CASES = [
  {
    id: 1,
    role: "Inventory Operations Command",
    badge: "OPERATIONAL VISIBILITY",
    quote:
      "One platform gives our team complete inventory visibility, while expiry intelligence automatically flags high-risk batches before stock expires.",
  },
  {
    id: 2,
    role: "Warehouse Logistics Team",
    badge: "UNIFIED WORKFLOW",
    quote:
      "Operations teams monitor both durable goods and expiry-tracked lines simultaneously without maintaining disconnected data silos.",
  },
  {
    id: 3,
    role: "Retail Recovery Specialists",
    badge: "RISK MITIGATION",
    quote:
      "ERN identifies expiry risk at early stages, allowing actionable rescue protocols before product value degrades into write-offs.",
  },
];

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % USE_CASES.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + USE_CASES.length) % USE_CASES.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const current = USE_CASES[activeIndex];

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto relative overflow-hidden font-sans">
      <ScrollReveal direction="up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card text-foreground text-xs font-mono mb-2.5 font-semibold uppercase shadow-none border border-[#2F4156]/25">
            OPERATIONALLY TESTED
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground font-bold leading-[1.15] tracking-[-0.02em]">
            <span className="font-sans block">Built for real</span>
            <span className="font-script text-4xl sm:text-5xl md:text-6xl text-foreground block font-bold mt-1">
              inventory decisions.
            </span>
          </h2>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={120}>
        <div className="bg-card border border-[#2F4156]/20 rounded-2xl sm:rounded-[32px] p-7 sm:p-10 relative overflow-hidden shadow-none ern-card-glow">
          {/* Slide Content */}
          <div key={current.id} className="relative z-10 space-y-4 animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card text-foreground text-xs font-mono font-bold uppercase border border-[#2F4156]/15">
              <span>{current.badge}</span>
            </div>

            <blockquote className="font-sans text-xl sm:text-2xl text-foreground font-normal leading-relaxed pt-1 tracking-[-0.015em]">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            <div className="pt-2">
              <p className="font-mono text-xs uppercase font-bold text-foreground">
                {current.role}
              </p>
            </div>
          </div>

          {/* Controls & Slide Indicators */}
          <div className="mt-8 pt-6 border-t border-[#2F4156]/15 flex items-center justify-between relative z-10">
            {/* Dots */}
            <div className="flex gap-2 items-center">
              {USE_CASES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? "w-8 bg-[#2F4156] "
                      : "w-2 bg-card  hover:bg-[rgba(28,58,19,0.15)]"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrow Buttons */}
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="size-9 rounded-full bg-card hover:bg-[rgba(28,58,19,0.15)] flex items-center justify-center text-foreground transition-colors cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={nextSlide}
                className="size-9 rounded-full bg-card hover:bg-[rgba(28,58,19,0.15)] flex items-center justify-center text-foreground transition-colors cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
