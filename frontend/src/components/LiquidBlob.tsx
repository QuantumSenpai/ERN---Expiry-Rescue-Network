import { useEffect, useRef, useState } from "react";

interface LiquidBlobProps {
  size?: "hero" | "compact";
  scrollLinked?: boolean;
}

export default function LiquidBlob({
  size = "hero",
  scrollLinked = true,
}: LiquidBlobProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!scrollLinked) return;
    const onScroll = () => {
      const p = Math.min(window.scrollY / window.innerHeight, 1);
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollLinked]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };
  const handleMouseLeave = () => setMouse({ x: 0.5, y: 0.5 });

  const dimension =
    size === "hero" ? "clamp(300px, 36vw, 480px)" : "clamp(180px, 20vw, 260px)";

  const scale = 1 - progress * 0.15;
  const rotY = (mouse.x - 0.5) * 16;
  const rotX = (mouse.y - 0.5) * -16;

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center select-none"
      style={{
        width: dimension,
        height: dimension,
        perspective: "1200px",
      }}
    >
      {/* 3D Tactile Brutalist Physical Composition */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Main Base Physical Card / Concrete Slab */}
        <div
          className="w-[78%] h-[78%] bg-background rounded-[32px] sm:rounded-[48px] border border-border p-6 sm:p-8 flex flex-col justify-between transition-transform duration-300 ease-out"
          style={{ transform: "translateZ(20px)" }}
        >
          {/* Top Tag Pill */}
          <div className="flex items-center justify-between">
            <span className="bg-primary text-primary-foreground font-mono text-[11px] uppercase px-3 py-1 rounded-full font-bold">
              ERN CORE v2.4
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              #009-RECOVERY
            </span>
          </div>

          {/* Geometric Product Render Art */}
          <div className="my-4 flex items-center justify-center gap-3">
            {/* Dark Concrete Cube */}
            <div
              className="size-16 sm:size-20 rounded-2xl bg-forest-depths flex items-center justify-center text-snow-white font-mono font-bold text-xs shadow-none transition-transform duration-200 hover:scale-105"
              style={{ transform: "translateZ(30px)" }}
            >
              MONITOR
            </div>
            {/* Mint Block */}
            <div
              className="size-14 sm:size-16 rounded-2xl bg-[#2F4156] flex items-center justify-center text-foreground font-mono font-bold text-[11px] shadow-none transition-transform duration-200 hover:scale-105"
              style={{ transform: "translateZ(45px)" }}
            >
              RESCUE
            </div>
            {/* Voltage Yellow Mini Dot */}
            <div
              className="size-10 sm:size-12 rounded-xl bg-[#2F4156] flex items-center justify-center text-foreground font-mono font-bold text-[10px] shadow-none transition-transform duration-200 hover:scale-105"
              style={{ transform: "translateZ(60px)" }}
            >
              VAL
            </div>
          </div>

          {/* Bottom Metric */}
          <div className="pt-3 border-t border-border flex items-baseline justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">
                EFFICIENCY
              </p>
              <p className="font-display text-2xl font-bold uppercase text-foreground leading-none mt-0.5">
                99.8%
              </p>
            </div>
            <span className="bg-card text-muted-foreground text-[10px] font-mono uppercase px-2.5 py-1 rounded-full">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Tactile Layer Floating Behind */}
        <div
          className="absolute w-[86%] h-[86%] bg-card rounded-[36px] sm:rounded-[54px] border border-border -z-10"
          style={{ transform: "translateZ(-15px)" }}
        />
      </div>
    </div>
  );
}