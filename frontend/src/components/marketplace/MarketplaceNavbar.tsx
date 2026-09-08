import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Heart,
  MapPin,
  ChevronDown,
  X,
  User,
  Package,
  LogOut,
  Sparkles,
  Flame,
  LayoutGrid,
  Menu,
  Bell,
  Home,
} from "lucide-react";
import { MASTER_PRODUCTS, CATEGORIES, type MarketplaceProduct } from "@/data/marketplaceData";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { formatINR } from "@/lib/pricingService";

interface MarketplaceNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  products: MarketplaceProduct[];
  onSelectProduct: (product: MarketplaceProduct) => void;
  currentLocation: string;
  onOpenLocationModal: () => void;
  wishlistCount: number;
  onOpenWishlist?: () => void;
  cartItemCount: number;
  cartTotal: number;
  isCartBouncing: boolean;
  onOpenCart: () => void;
  onOpenAccountModal?: () => void;
}

export default function MarketplaceNavbar({
  searchQuery,
  onSearchChange,
  products,
  currentLocation,
  onOpenLocationModal,
  wishlistCount,
  cartItemCount,
  cartTotal,
  isCartBouncing,
  onOpenCart,
}: MarketplaceNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    // Close mobile menu on ESC
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsSearchFocused(false);
      if (searchQuery.trim()) {
        navigate(`/customer/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate("/customer/browse");
      }
    }
  };

  const isSavedActive = location.pathname.includes("/saved-items") || location.pathname.includes("/wishlist");

  // Mobile nav links
  const mobileNavLinks = [
    { to: "/marketplace", label: "Home", icon: Home },
    { to: "/customer/browse", label: "Browse All", icon: LayoutGrid },
    { to: "/customer/cart", label: "My Cart", icon: ShoppingCart },
    { to: "/customer/orders", label: "My Orders", icon: Package },
    { to: "/customer/saved-items", label: "Saved Items", icon: Heart },
    { to: "/customer/alerts", label: "Notifications", icon: Bell },
    { to: "/customer/profile", label: "My Account", icon: User },
  ];

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-card border-b border-border text-foreground font-sans shadow-xs"
    >
      {/* Mobile Slide-In Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.22, ease: [0.32, 0, 0.67, 0] }}
            className="fixed top-0 left-0 bottom-0 z-[60] w-72 bg-card border-r border-border flex flex-col shadow-2xl"
            role="dialog"
            aria-label="Navigation menu"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <BrandLogo variant="auto" size="sm" showText={true} />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground cursor-pointer"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Location */}
            <button
              type="button"
              onClick={() => { setIsMobileMenuOpen(false); onOpenLocationModal(); }}
              className="flex items-center gap-2 mx-4 mt-4 px-4 py-2.5 rounded-xl bg-secondary hover:bg-muted border border-border text-sm font-mono text-foreground cursor-pointer transition-colors"
            >
              <MapPin className="size-4 text-primary shrink-0" />
              <span className="truncate font-bold">{currentLocation}</span>
              <ChevronDown className="size-3.5 text-muted-foreground ml-auto shrink-0" />
            </button>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {mobileNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + "/");
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{link.label}</span>
                    {link.to === "/customer/cart" && cartItemCount > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-mono font-bold">
                        {cartItemCount}
                      </span>
                    )}
                    {link.to === "/customer/saved-items" && wishlistCount > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-mono font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Category quick links */}
              <div className="pt-3 pb-1">
                <p className="text-[10px] font-mono font-bold uppercase text-muted-foreground px-3 mb-2">Shop Categories</p>
                {CATEGORIES.filter((c) => c.slug !== "all").slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/customer/browse?category=${encodeURIComponent(cat.slug)}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">Theme</span>
                <ThemeSwitcher variant="compact" />
              </div>
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground px-4 py-1.5 text-center text-xs font-mono flex items-center justify-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] uppercase font-bold flex items-center gap-1">
          <Sparkles className="size-3" />
          RESCUE & SAVE
        </span>
        <span className="font-semibold text-[11px] sm:text-xs">
          Authentic groceries • Verified batch expiry dates • Save up to 60%
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Mobile: Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="size-4" />
          </button>

          {/* Left: Brand Logo & Location */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <Link to="/marketplace" className="hover:opacity-90 transition-opacity" title="ERN Marketplace">
              <BrandLogo variant="auto" size="sm" showText={true} />
            </Link>

            {/* Location selector */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-mono text-foreground transition-colors cursor-pointer border border-border"
              title="Change Delivery Location"
            >
              <MapPin className="size-3.5 text-primary" />
              <span className="max-w-[160px] truncate font-bold">{currentLocation}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </div>

          {/* Center: Live Search Bar */}
          <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search milk, bread, rice, dahi, atta, juices, snacks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-9 py-2 rounded-full bg-background border border-border focus:border-primary text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-xl p-2 z-50 overflow-hidden font-mono text-xs">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsSearchFocused(false);
                      navigate(`/marketplace/product/${item.id}`);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="size-9 rounded-lg object-cover bg-white border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                      <div>
                        <p className="font-bold text-foreground font-sans">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.brand} • {item.unit}</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground">{formatINR(item.defaultOffer.price)}</span>
                  </button>
                ))}
                <div className="p-2 border-t border-border mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchFocused(false);
                      navigate(`/customer/browse?search=${encodeURIComponent(searchQuery)}`);
                    }}
                    className="w-full py-1.5 text-center text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    View all results for &quot;{searchQuery}&quot; →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons, Theme & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Light | Dark | Sys Switcher */}
            <ThemeSwitcher variant="compact" className="hidden lg:inline-flex" />

            {/* Saved Items */}
            <Link
              to="/customer/saved-items"
              className={`p-2 rounded-full border border-border transition-colors relative cursor-pointer ${
                isSavedActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
              title="Saved Items"
              aria-label="Saved Items"
            >
              <Heart className="size-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-accent text-accent-foreground text-[9px] font-mono font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-all cursor-pointer active:scale-95 ${
                isCartBouncing ? "scale-105" : ""
              }`}
              title="View Cart"
              aria-label="View Cart"
            >
              <ShoppingCart className="size-3.5" />
              <span className="hidden sm:inline">CART</span>
              <span className="px-1.5 py-0.2 rounded-full bg-accent text-accent-foreground font-bold text-[10px]">
                {cartItemCount}
              </span>
              {cartTotal > 0 && (
                <span className="hidden md:inline font-mono border-l border-primary-foreground/30 pl-1.5">
                  {formatINR(cartTotal)}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer border border-border"
                aria-label="User menu"
              >
                <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <ChevronDown className="size-3 text-muted-foreground mr-1" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-popover border border-border shadow-xl p-2 z-50 font-mono text-xs animate-in fade-in zoom-in-95">
                  <div className="p-2.5 border-b border-border mb-1">
                    <p className="font-bold text-foreground font-sans truncate">{user?.name || "Customer"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email || "customer@ern.local"}</p>
                  </div>

                  <Link
                    to="/customer/orders"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary transition-colors text-foreground"
                  >
                    <Package className="size-3.5 text-muted-foreground" />
                    <span>My Orders</span>
                  </Link>

                  <Link
                    to="/customer/saved-items"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary transition-colors text-foreground"
                  >
                    <Heart className="size-3.5 text-muted-foreground" />
                    <span>Saved Items ({wishlistCount})</span>
                  </Link>

                  <Link
                    to="/customer/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary transition-colors text-foreground"
                  >
                    <User className="size-3.5 text-muted-foreground" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navbar: Category Strip */}
      <div className="border-t border-border/60 bg-secondary/30 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 text-xs font-mono">
          <Link
            to="/customer/browse"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-bold shrink-0"
          >
            <LayoutGrid className="size-3" />
            <span>All Categories</span>
          </Link>

          <Link
            to="/customer/browse?tier=clearance"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground hover:bg-accent/30 transition-colors font-bold shrink-0"
          >
            <Flame className="size-3 text-red-500" />
            <span>Flash Clearance</span>
          </Link>

          <Link
            to="/customer/browse?tier=rescue"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors font-semibold shrink-0"
          >
            <Sparkles className="size-3 text-amber-500" />
            <span>Rescue Deals</span>
          </Link>

          {CATEGORIES.filter((c) => c.slug !== "all").slice(0, 7).map((cat) => (
            <Link
              key={cat.id}
              to={`/customer/browse?category=${encodeURIComponent(cat.slug)}`}
              className="px-3 py-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <span>{cat.icon} {cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.header>
  );
}
