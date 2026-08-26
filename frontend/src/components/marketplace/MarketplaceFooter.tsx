import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function MarketplaceFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3000);
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      className="bg-background border-t border-border text-foreground pt-12 pb-8 px-4 sm:px-6 lg:px-8 relative z-10 font-body transition-colors duration-200"
    >
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Top 3-Section Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Column 1: Brand & Slogan */}
          <div className="md:col-span-4 space-y-3">
            <BrandLogo variant="auto" size="sm" showText={true} />

            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs pt-1">
              Smart shopping for a better future.<br />
              Save more. Waste less.<br />
              Recover inventory value.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2 text-foreground">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full bg-card hover:bg-[#c4c7c4]/40 flex items-center justify-center transition-colors shadow-none"
                aria-label="Facebook"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full bg-card hover:bg-[#c4c7c4]/40 flex items-center justify-center transition-colors shadow-none"
                aria-label="Instagram"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full bg-card hover:bg-[#c4c7c4]/40 flex items-center justify-center transition-colors shadow-none"
                aria-label="X (Twitter)"
              >
                <svg className="size-3 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Newsletter */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-mono text-xs uppercase text-foreground font-medium tracking-wider">
              SUBSCRIBE TO RESCUE FLASH
            </h4>
            <p className="text-xs text-muted-foreground font-body">
              Get notified of rapid markdown releases and near-expiry lots.
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 bg-card border border-transparent focus:border-primary rounded-full px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium hover:bg-[#567C8D] transition-colors cursor-pointer shadow-none shrink-0"
              >
                {subscribed ? <Check className="size-3.5" /> : "JOIN"}
              </button>
            </form>
          </div>

          {/* Column 3: Trust Certifications */}
          <div className="md:col-span-4 space-y-2 text-xs font-mono text-muted-foreground">
            <span className="text-[10px] uppercase tracking-wider text-foreground font-medium block">
              COMPLIANCE & SAFETY
            </span>
            <p className="font-body text-[11px] leading-relaxed">
              All rescue products undergo algorithmic temperature validation and FSSAI shelf-life audit before clearance.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
          <p>© 2026 ERN Marketplace. All rights reserved.</p>
          <p>Zero Waste • Expiry Intelligence • Sustainable Commerce</p>
        </div>
      </div>
    </motion.footer>
  );
}
