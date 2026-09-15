import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/80 bg-[#182635] dark:bg-[#0A141F] text-slate-100 px-6 sm:px-10 lg:px-12 py-16 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-12">
        <div className="max-w-md">
          <div className="mb-4">
            <BrandLogo variant="main" size="lg" />
          </div>
          <p className="text-slate-300 text-sm font-sans leading-relaxed mt-3 max-w-sm">
            Unified inventory management with expiry intelligence for products that require it.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 text-sky-300 text-[10.5px] font-mono font-bold uppercase tracking-wider border border-slate-700/60">
            <span>PREVENT EXPIRY • RECOVER VALUE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12 text-xs sm:text-sm font-mono">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-wider text-white font-bold mb-1">
              Platform
            </span>
            <Link to="/retailer/inventory" className="text-slate-300 hover:text-white transition-colors font-sans">
              Inventory System
            </Link>
            <Link to="/retailer/expiry" className="text-slate-300 hover:text-white transition-colors font-sans">
              Expiry Radar
            </Link>
            <Link to="/retailer/alerts" className="text-slate-300 hover:text-white transition-colors font-sans">
              Risk Monitoring
            </Link>
            <Link to="/retailer/clearance" className="text-slate-300 hover:text-white transition-colors font-sans">
              Recovery Workflows
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-wider text-white font-bold mb-1">
              Solutions
            </span>
            <a href="/#solutions" className="text-slate-300 hover:text-white transition-colors font-sans">
              Food & Beverage
            </a>
            <a href="/#solutions" className="text-slate-300 hover:text-white transition-colors font-sans">
              Healthcare
            </a>
            <a href="/#solutions" className="text-slate-300 hover:text-white transition-colors font-sans">
              Personal Care
            </a>
            <a href="/#solutions" className="text-slate-300 hover:text-white transition-colors font-sans">
              Consumer Goods
            </a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-wider text-white font-bold mb-1">
              Architecture
            </span>
            <span className="text-slate-300 font-sans">Multi-Facility Core</span>
            <span className="text-slate-300 font-sans">Batch Level Tracing</span>
            <span className="text-slate-300 font-sans">Realtime Webhooks</span>
            <span className="text-slate-300 font-sans">Automated Interventions</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-wider text-white font-bold mb-1">
              Operations
            </span>
            <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-sans">
              Sign In
            </Link>
            <Link to="/signup" className="text-slate-300 hover:text-white transition-colors font-sans">
              Get Started
            </Link>
            <Link to="/marketplace" className="text-slate-300 hover:text-white transition-colors font-sans">
              Customer Portal
            </Link>
            <Link to="/admin/login" className="text-sky-300 hover:text-white transition-colors font-sans flex items-center gap-1.5 font-bold">
              <ShieldCheck className="size-3.5 text-sky-400" />
              <span>Admin Console</span>
            </Link>
            <Link to="/privacy-policy" className="text-slate-300 hover:text-white transition-colors font-sans">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <p>© {new Date().getFullYear()} ERN (Expiry Rescue Network). All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/privacy-policy" className="hover:text-slate-200 cursor-pointer transition-colors">
            Privacy Policy
          </Link>
          <span className="hover:text-slate-200 cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-slate-200 cursor-pointer transition-colors">Security Standards</span>
        </div>
      </div>
    </footer>
  );
}