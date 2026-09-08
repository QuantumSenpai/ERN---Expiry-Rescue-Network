import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Package, Heart, User, Bell, LayoutGrid, ShoppingBag, Tag, Flame } from "lucide-react";
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

  const shopLinks = [
    { to: "/customer/browse", label: "All Products", icon: LayoutGrid },
    { to: "/customer/browse?tier=rescue", label: "Rescue Deals", icon: Flame },
    { to: "/customer/browse?tier=clearance", label: "Flash Clearance", icon: Tag },
    { to: "/customer/saved-items", label: "Saved Items", icon: Heart },
  ];

  const accountLinks = [
    { to: "/customer/orders", label: "My Orders", icon: Package },
    { to: "/customer/profile", label: "Account Settings", icon: User },
    { to: "/customer/alerts", label: "Notifications", icon: Bell },
    { to: "/customer/cart", label: "My Cart", icon: ShoppingBag },
  ];

  return (
    <footer className="bg-background border-t border-border text-foreground pt-12 pb-8 px-4 sm:px-6 lg:px-8 relative z-10 font-body transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 items-start">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-4 space-y-3">
            <BrandLogo variant="auto" size="sm" showText={true} />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs pt-1 font-sans">
              Smart grocery shopping for every home.<br />
              Save more on branded essentials.<br />
              Help reduce avoidable store waste.
            </p>
            <p className="text-[11px] font-mono text-muted-foreground pt-1">
              Zero Waste · Expiry Intelligence · Honest Savings
            </p>
          </div>

          {/* Column 2: Shop */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono text-xs uppercase text-foreground font-bold tracking-wider">Shop</h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-muted-foreground hover:text-foreground font-sans transition-colors flex items-center gap-1.5"
                  >
                    <link.icon className="size-3 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Account */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono text-xs uppercase text-foreground font-bold tracking-wider">Account</h4>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-muted-foreground hover:text-foreground font-sans transition-colors flex items-center gap-1.5"
                  >
                    <link.icon className="size-3 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-mono text-xs uppercase text-foreground font-bold tracking-wider">
              DAILY RESCUE ALERTS
            </h4>
            <p className="text-xs text-muted-foreground font-sans">
              Get notified when new near-expiry grocery batches and markdown deals are posted.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 bg-card border border-border focus:border-primary rounded-full px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-none shrink-0"
              >
                {subscribed ? <Check className="size-3.5" /> : "JOIN"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
          <p>© 2026 ERN Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/customer/browse" className="hover:text-foreground transition-colors">Browse</Link>
            <Link to="/customer/orders" className="hover:text-foreground transition-colors">Orders</Link>
            <Link to="/customer/profile" className="hover:text-foreground transition-colors">Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
