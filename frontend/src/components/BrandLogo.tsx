import { useTheme } from "@/context/ThemeContext";
import logoDark from "@/assets/logos/logo-dark.png";
import logoLight from "@/assets/logos/logo-light.png";

interface BrandLogoProps {
  variant?: "main" | "mono" | "compact" | "auto";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export default function BrandLogo({
  size = "md",
  className = "",
  showText = true,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const iconSizes = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
    xl: "size-16",
  }[size];

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  const subtitleSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-[11px]",
    xl: "text-xs",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none group ${className}`}>
      {/* Icon Logo */}
      <div className="relative flex items-center justify-center shrink-0">
        {isDark ? (
          <img
            src={logoDark}
            alt="ERN Dark Logo"
            className={`${iconSizes} object-contain rounded-xl mix-blend-screen transition-transform duration-300 group-hover:scale-105`}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== "/logos/logo-dark.png") {
                img.src = "/logos/logo-dark.png";
              }
            }}
          />
        ) : (
          <img
            src={logoLight}
            alt="ERN Light Logo"
            className={`${iconSizes} object-contain rounded-xl mix-blend-multiply transition-transform duration-300 group-hover:scale-105`}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== "/logos/logo-light.png") {
                img.src = "/logos/logo-light.png";
              }
            }}
          />
        )}
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-none justify-center">
          <div className="flex items-center gap-1.5">
            <span className={`font-display font-medium ${titleSizes} tracking-tight text-current transition-colors`}>
              ERN
            </span>
            {/* Lime-pulse dot — accent only, per spec */}
            <span className="size-2 rounded-full bg-accent animate-pulse" />
          </div>
          <span className={`${subtitleSizes} font-mono uppercase tracking-[0.18em] text-current/65 font-bold mt-1`}>
            Rescue Network
          </span>
        </div>
      )}
    </div>
  );
}
