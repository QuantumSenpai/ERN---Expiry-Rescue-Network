import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth, getRoleHomeRoute } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { LayoutDashboard, LogOut, Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setIsScrolled(scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    return getRoleHomeRoute(user.role);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isScrolled ? "pt-0 px-0" : "pt-5 px-4 sm:px-8"
      }`}
    >
      <header
        className={`pointer-events-auto w-full text-foreground shadow-none transition-[max-width,border-radius,padding,background-color,backdrop-filter,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled
            ? "max-w-full rounded-none border-x-0 border-t-0 border-b border-border bg-card/90 backdrop-blur-xl px-4 sm:px-8 py-3"
            : "max-w-5xl rounded-full border border-border bg-card px-4 sm:px-6 py-2.5"
        }`}
      >
        <div className="flex items-center justify-between w-full gap-2">
          {/* Brand Logo (ERN) */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hover:opacity-90 transition-opacity flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <BrandLogo variant="auto" size="sm" showText={true} />
          </Link>

          {/* Nav Links in Poppins/Inter */}
          <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-semibold text-foreground">
            <button
              onClick={() => handleNavClick("platform")}
              className="hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-secondary cursor-pointer"
            >
              Platform
            </button>
            <button
              onClick={() => handleNavClick("solutions")}
              className="hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-secondary cursor-pointer"
            >
              Solutions
            </button>
            <button
              onClick={() => handleNavClick("how-it-works")}
              className="hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-secondary cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick("impact")}
              className="hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-secondary cursor-pointer"
            >
              Impact
            </button>

            {user && (
              <Link
                to={getDashboardPath()}
                className="hover:text-foreground transition-colors px-3.5 py-1.5 rounded-full hover:bg-secondary flex items-center gap-1.5 font-semibold"
              >
                <LayoutDashboard className="size-3.5" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Right Action Pill Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Switcher */}
            <ThemeSwitcher variant="compact" className="hidden sm:inline-flex" />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-none"
                >
                  <span>{user.name.split(" ")[0]}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
                <button
                  onClick={() => logout()}
                  className="size-8 rounded-full bg-secondary hover:bg-muted flex items-center justify-center text-foreground transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 sm:px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-none"
                >
                  Get Started →
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full text-foreground hover:bg-secondary cursor-pointer"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-border mt-3 flex flex-col gap-2.5 font-medium text-sm text-foreground">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs text-muted-foreground font-mono uppercase font-semibold">Theme:</span>
              <ThemeSwitcher variant="compact" />
            </div>
            <button
              onClick={() => handleNavClick("platform")}
              className="text-left px-3 py-2 rounded-xl hover:bg-secondary"
            >
              Platform
            </button>
            <button
              onClick={() => handleNavClick("solutions")}
              className="text-left px-3 py-2 rounded-xl hover:bg-secondary"
            >
              Solutions
            </button>
            <button
              onClick={() => handleNavClick("how-it-works")}
              className="text-left px-3 py-2 rounded-xl hover:bg-secondary"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick("impact")}
              className="text-left px-3 py-2 rounded-xl hover:bg-secondary"
            >
              Impact
            </button>
          </div>
        )}
      </header>
    </div>
  );
}