import { X, Sparkles, Hammer, Clock } from "lucide-react";

interface FeatureNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  description?: string;
}

export default function FeatureNoticeModal({
  isOpen,
  onClose,
  featureName = "Feature Module",
  description = "Yeh feature abhi active development me hai. This module will be fully integrated with real-time hardware/APIs in the upcoming update.",
}: FeatureNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-card border border-primary/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Hammer className="size-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
              <Clock className="size-3" />
              <span>Active Construction</span>
            </div>
            <h3 className="font-display text-base font-bold text-foreground leading-tight">
              {featureName}
            </h3>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed font-sans">
          {description}
        </p>

        <div className="p-3 rounded-xl bg-secondary/40 border border-border text-[11px] font-mono text-muted-foreground flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary shrink-0" />
          <span>(यह फीचर अभी तैयार किया जा रहा है। जल्द ही उपलब्ध होगा।)</span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            Theek Hai / Understood
          </button>
        </div>
      </div>
    </div>
  );
}
