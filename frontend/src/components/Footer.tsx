import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground px-6 sm:px-10 lg:px-12 py-16 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-12">
        <div className="max-w-md">
          <div className="mb-4">
            <BrandLogo variant="main" size="lg" />
          </div>
          <p className="text-primary-foreground/70 text-sm font-sans leading-relaxed mt-3 max-w-sm">
            Unified inventory management with expiry intelligence for products that require it.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#567C8D] text-accent text-[10.5px] font-mono font-bold uppercase tracking-wider border border-[#2F4156]/20">
            <span>PREVENT EXPIRY • RECOVER VALUE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12 text-xs sm:text-sm font-mono">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-wider text-primary-foreground font-bold mb-1">
              Platform
            </span>
            <Link to="/retailer/inventory" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Inventory System
            </Link>
            <Link to="/retailer/expiry-intelligence" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Expiry Radar
            </Link>
            <Link to="/retailer/alerts" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Risk Monitoring
            </Link>
            <Link to="/retailer/clearance" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Recovery Workflows
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-wider text-primary-foreground font-bold mb-1">
              Solutions
            </span>
            <a href="/#solutions" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Food & Beverage
            </a>
            <a href="/#solutions" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Healthcare
            </a>
            <a href="/#solutions" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Personal Care
            </a>
            <a href="/#solutions" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Consumer Goods
            </a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-wider text-primary-foreground font-bold mb-1">
              Architecture
            </span>
            <span className="text-primary-foreground/65 font-sans">Multi-Facility Core</span>
            <span className="text-primary-foreground/65 font-sans">Batch Level Tracing</span>
            <span className="text-primary-foreground/65 font-sans">Realtime Webhooks</span>
            <span className="text-primary-foreground/65 font-sans">Automated Interventions</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-wider text-primary-foreground font-bold mb-1">
              Operations
            </span>
            <Link to="/login" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Sign In
            </Link>
            <Link to="/signup" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Get Started
            </Link>
            <Link to="/marketplace" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Customer Portal
            </Link>
            <Link to="/privacy-policy" className="text-primary-foreground/65 hover:text-primary-foreground transition-colors font-sans">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-primary-foreground/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-primary-foreground/50">
        <p>© 2026 ERN (Expiry Rescue Network). All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/privacy-policy" className="hover:text-primary-foreground cursor-pointer transition-colors">
            Privacy Policy
          </Link>
          <span className="hover:text-primary-foreground cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-primary-foreground cursor-pointer transition-colors">Security Standards</span>
        </div>
      </div>
    </footer>
  );
}