import { useTheme, type ThemeMode } from "@/context/ThemeContext";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion } from "framer-motion";

interface ThemeSwitcherProps {
  variant?: "pill" | "compact" | "dropdown";
  className?: string;
}

export default function ThemeSwitcher({
  variant = "pill",
  className = "",
}: ThemeSwitcherProps) {
  const { themeMode, setThemeMode } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: "light", label: "Light", icon: Sun },
    { mode: "dark", label: "Dark", icon: Moon },
    { mode: "system", label: "Sys", icon: Laptop },
  ];

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-full bg-secondary border border-border font-mono text-[11px] select-none ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = themeMode === opt.mode;

          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setThemeMode(opt.mode)}
              title={`${opt.label} Mode`}
              className={`relative px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                isActive
                  ? "font-bold text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground ern-toggle-hover"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeThemePillCompact"
                  className="absolute inset-0 rounded-full bg-primary shadow-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <Icon className="size-3" />
                <span className="text-[10px] uppercase">{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-secondary border border-border font-mono text-xs select-none ${className}`}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = themeMode === opt.mode;

        return (
          <button
            key={opt.mode}
            type="button"
            onClick={() => setThemeMode(opt.mode)}
            className={`relative px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              isActive
                ? "font-bold text-primary-foreground"
                : "text-foreground/70 hover:text-foreground ern-toggle-hover"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeThemePill"
                className="absolute inset-0 rounded-full bg-primary shadow-none"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="size-3.5" />
              <span className="text-[11px] uppercase tracking-wide">{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
