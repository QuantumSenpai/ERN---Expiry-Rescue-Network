import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

export default function PrivacyNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const acknowledged = localStorage.getItem("ern_cookie_ack");
      if (!acknowledged) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(false);
    }
  }, []);

  const handleAcknowledge = () => {
    try {
      localStorage.setItem("ern_cookie_ack", "true");
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Storage and session disclosure"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-2xl bg-card border border-border shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300 font-sans text-xs text-foreground"
    >
      <div className="flex items-start gap-3">
        <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <Cookie className="size-4" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground font-mono text-[11px] uppercase tracking-wider">
              Local Storage Disclosure
            </h4>
            <button
              type="button"
              onClick={handleAcknowledge}
              className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
              aria-label="Dismiss notice"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <p className="text-muted-foreground leading-relaxed text-[11.5px]">
            ERN stores your session token (<code className="font-mono text-[10.5px] bg-secondary px-1 py-0.5 rounded text-foreground">ern_token</code>) and profile in your browser to keep you securely signed in. We do not use advertising cookies. Read our{" "}
            <Link to="/privacy-policy" className="text-foreground underline font-bold hover:text-primary">
              Privacy Policy
            </Link>.
          </p>
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleAcknowledge}
              className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-mono text-[10.5px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
