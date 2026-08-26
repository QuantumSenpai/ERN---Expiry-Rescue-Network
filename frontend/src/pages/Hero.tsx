import IsometricCluster from "@/components/IsometricCluster";
import MagneticButton from "@/components/MagneticButton";
import { ScanLine, AlertTriangle, RefreshCw } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="platform"
      className="relative w-full overflow-hidden bg-background text-foreground pt-32 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 md:px-8 scroll-mt-20 transition-colors"
    >
      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 lg:gap-16 md:flex-row md:justify-between relative z-10">
        {/* Left column — text & CTAs */}
        <div className="max-w-xl text-center md:text-left flex-1">
          {/* Eyebrow Badge — lime-pulse pill */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-foreground border border-border shadow-none">
            <span className="size-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
              EXPIRY RESCUE NETWORK
            </span>
          </div>

          {/* Headline — Poppins display, weight 500, 32px+ */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[0.92] text-foreground font-medium tracking-[-0.02em] font-display">
            <span className="block">Prevent expiry.</span>
            <span className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-[5.75rem] text-foreground dark:text-accent block -mt-2 sm:-mt-3 normal-case">
              Recover value.
            </span>
          </h1>

          {/* Description in Inter */}
          <p className="mt-6 font-sans text-sm sm:text-base text-muted-foreground leading-relaxed font-normal max-w-lg">
            ERN monitors multi-facility inventory, flags products approaching expiry, and triggers automated clearance interventions before stock converts to financial loss.
          </p>

          {/* Pill CTAs (9999px radius) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 md:justify-start">
            <MagneticButton variant="filled" href="/signup">
              <span>GET STARTED →</span>
            </MagneticButton>
            <MagneticButton variant="outlined" href="/dashboard">
              <span>EXPLORE PLATFORM</span>
            </MagneticButton>
          </div>

          {/* Core Platform Capabilities */}
          <div className="mt-12 pt-8 border-t border-dotted border-border grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-5 text-left font-mono">
            <div className="group sm:border-r sm:border-dotted sm:border-border sm:pr-4">
              <div className="flex items-center gap-2 text-foreground dark:text-accent">
                <ScanLine className="size-4 shrink-0" />
                <h3 className="text-xs uppercase font-bold tracking-wider">
                  INTELLIGENCE
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-sans mt-1 leading-snug">
                Unified live tracking of catalog and expiry batches.
              </p>
            </div>

            <div className="group sm:border-r sm:border-dotted sm:border-border sm:pr-4">
              <div className="flex items-center gap-2 text-foreground dark:text-accent">
                <AlertTriangle className="size-4 shrink-0" />
                <h3 className="text-xs uppercase font-bold tracking-wider">
                  RISK RADAR
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-sans mt-1 leading-snug">
                Early algorithmic detection before stock goes critical.
              </p>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 text-foreground dark:text-accent">
                <RefreshCw className="size-4 shrink-0" />
                <h3 className="text-xs uppercase font-bold tracking-wider">
                  RECOVERY
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-sans mt-1 leading-snug">
                Automated dynamic markdowns and rescue liquidation.
              </p>
            </div>
          </div>
        </div>

        {/* Right column — 3D Floating Isometric Artifact */}
        <div className="flex flex-1 justify-center md:justify-end">
          <IsometricCluster />
        </div>
      </div>
    </section>
  );
}