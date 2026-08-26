import { useRef, useState, type MouseEvent, type ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  variant?: "filled" | "outlined" | "ghost" | "glass" | "mint";
  onClick?: (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  href?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function MagneticButton({
  children,
  variant = "filled",
  onClick,
  href,
  className = "",
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const RADIUS = 8;

  const handleMouseMove = (e: MouseEvent) => {
    if (disabled) return;
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setOffset({ x: relX * RADIUS, y: relY * RADIUS });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) return;
    const el = btnRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const id = Date.now();
      setRipples((r) => [
        ...r,
        { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
      ]);
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
    }
    onClick?.(e);
  };

  const baseClasses = [
    "group relative inline-flex items-center justify-center overflow-hidden px-6 py-3.5 font-sans text-sm font-semibold rounded-full",
    "transition-all duration-200 ease-out active:scale-[0.97] select-none cursor-pointer shadow-none",
    disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
  ].join(" ");

  /* Sage & Vanilla variant styles */
  const variantClasses = {
    filled:
      "bg-primary text-primary-foreground hover:opacity-90 border border-primary font-bold",
    outlined:
      "border-[1.5px] border-foreground bg-transparent text-foreground hover:bg-foreground/10 font-bold",
    glass:
      "bg-secondary text-foreground border border-[#2F4156]/20 hover:bg-[#C4C7C4] font-bold",
    ghost:
      "text-foreground hover:bg-foreground/10 font-bold",
    mint:
      "bg-accent text-accent-foreground hover:bg-[#bfef80] border border-[#2F4156]/20 font-bold",
  }[variant];

  const style = {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  };

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Ripple — vanilla translucent */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ern-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      <style>{`
        .ern-ripple {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(240, 233, 211, 0.35);
          transform: scale(0);
          animation: ern-ripple-anim 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        @keyframes ern-ripple-anim {
          to {
            transform: scale(20);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );

  if (href) {
    return (
      <a
        ref={btnRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`${baseClasses} ${variantClasses} ${className}`}
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={btnRef as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={style}
      disabled={disabled}
    >
      {content}
    </button>
  );
}