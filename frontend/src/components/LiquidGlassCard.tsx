import { useRef, useState, type MouseEvent, type ReactNode } from "react";

interface LiquidGlassCardProps {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: boolean;
  beam?: boolean;
  onClick?: () => void;
}

export default function LiquidGlassCard({
  children,
  className = "",
  tilt = true,
  onClick,
}: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltOffset, setTiltOffset] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tilt) {
      const px = (x / rect.width - 0.5) * 4;
      const py = (y / rect.height - 0.5) * -4;
      setTiltOffset({ rx: py, ry: px });
    }
  };

  const handleMouseLeave = () => {
    if (tilt) {
      setTiltOffset({ rx: 0, ry: 0 });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`group relative h-full ${onClick ? "cursor-pointer" : ""}`}
      style={{ perspective: "1000px" }}
    >
      <div
        className={`bg-background text-foreground border border-border rounded-2xl sm:rounded-[32px] p-6 relative overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary shadow-none h-full ${className}`}
        style={{
          transform: tilt
            ? `rotateX(${tiltOffset.rx}deg) rotateY(${tiltOffset.ry}deg)`
            : undefined,
        }}
      >
        <div className="relative z-10 h-full flex flex-col justify-between font-body">
          {children}
        </div>
      </div>
    </div>
  );
}
