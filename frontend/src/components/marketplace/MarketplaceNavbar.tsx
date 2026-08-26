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
} from "lucide-react";
import type { MarketplaceProduct } from "@/data/marketplaceData";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import ThemeSwitcher from "@/components/ThemeSwitcher";

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
  onOpenAccountModal: () => void;
}

export default function MarketplaceNavbar({
  searchQuery,
  onSearchChange,
  products,
  onSelectProduct,
  currentLocation,
  onOpenLocationModal,
  wishlistCount,
  cartItemCount,
  isCartBouncing,
  onOpenCart,
}: MarketplaceNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const isSavedActive = location.pathname.includes("/saved-items") || location.pathname.includes("/wishlist");

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-card border-b border-border text-foreground font-sans"
    >
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground px-4 py-1.5 text-center text-xs font-mono flex items-center justify-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] uppercase font-bold">RESCUE FLASH</span>
        <span className="font-medium">Save up to 80% on nearing-expiry certified groceries. Zero waste mission.</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Brand Logo & Location */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <Link to="/marketplace" className="hover:opacity-90 transition-opacity">
              <BrandLogo variant="auto" size="sm" showText={true} />
            </Link>

            {/* Location selector */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-mono text-foreground transition-colors cursor-pointer border border-border ern-btn-hover"
            >
              <MapPin className="size-3.5 text-accent" />
              <span className="max-w-[150px] truncate font-bold">{currentLocation}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </div>

          {/* Center: Live Search Bar */}
          <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search surplus lots, bakery, dairy, pantry..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-9 py-2 rounded-full bg-background border border-border focus:border-primary text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans shadow-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer ern-icon-hover"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-none p-2 z-50 overflow-hidden font-mono text-xs">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectProduct(item);
                      setIsSearchFocused(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary transition-colors text-left cursor-pointer ern-row-hover"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={item.imageUrl} alt={item.name} className="size-9 rounded-lg object-cover bg-white" />
                      <div>
                        <p className="font-bold text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.brand} · {item.category}</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground">₹{item.defaultOffer.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons, Theme & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Light | Dark | Sys Switcher */}
            <ThemeSwitcher variant="compact" className="hidden lg:inline-flex" />

            {/* Wishlist */}
            <Link
              to="/customer/saved-items"
              className={`p-2 rounded-full border border-border transition-colors relative cursor-pointer ern-btn-hover ${
                isSavedActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
              title="Wishlist"
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
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-all cursor-pointer shadow-none active:scale-95 ern-btn-hover ${
                isCartBouncing ? "scale-105" : ""
              }`}
            >
              <ShoppingCart className="size-3.5" />
              <span className="hidden sm:inline">CART</span>
              <span className="px-1.5 py-0.2 rounded-full bg-accent text-accent-foreground font-bold text-[10px]">
                {cartItemCount}
              </span>
            </button>

            {/* Profile Dropdown */}
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-2 rounded-full border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-pointer ern-btn-hover"
              >
                <User className="size-4" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-2xl shadow-none p-2.5 z-50 text-xs font-mono">
                  <div className="pb-2 mb-2 border-b border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Theme</span>
                    <ThemeSwitcher variant="compact" />
                  </div>
                  <Link
                    to="/customer/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary text-foreground font-bold"
                  >
                    <User className="size-3.5 text-foreground" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/customer/orders"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary text-foreground font-bold"
                  >
                    <Package className="size-3.5 text-foreground" />
                    <span>Order History</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                      navigate("/");
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary text-foreground text-left cursor-pointer border-t border-border mt-1 font-bold"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

