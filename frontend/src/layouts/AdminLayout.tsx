import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  MapPin,
  Building2,
  LogOut,
  Sliders,
  ChevronDown,
  Menu,
  Truck,
  Store,
  Package,
  ArrowLeftRight,
  ShieldCheck,
  AlertOctagon,
  BarChart3,
  ClipboardList,
  Bell,
  ShoppingBag,
} from "lucide-react";
import WasteInsightsModal from "@/components/WasteInsightsModal";
import CalendarModal from "@/components/CalendarModal";
import AccountSwitcherModal from "@/components/AccountSwitcherModal";

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

interface NavSection {
  heading?: string;
  items: NavItem[];
}

const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    heading: "MAIN",
    items: [
      { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
      { label: "Listings", to: "/admin/listings", icon: Store },
      { label: "Inventory", to: "/admin/inventory", icon: Package },
      { label: "Transfers", to: "/admin/transfers", icon: ArrowLeftRight },
      { label: "Stock Requests", to: "/admin/requests", icon: Sliders, badge: 4 },
    ],
  },
  {
    heading: "NETWORK",
    items: [
      { label: "User Management", to: "/admin/users", icon: Users, badge: 3 },
      { label: "Suppliers", to: "/admin/suppliers", icon: Truck },
      { label: "Organization", to: "/admin/organization", icon: Building2 },
      { label: "Locations", to: "/admin/locations", icon: MapPin },
    ],
  },
  {
    heading: "OPERATIONS",
    items: [
      { label: "Verification", to: "/admin/verification", icon: ShieldCheck },
      { label: "Expiry Monitoring", to: "/admin/expiry", icon: Shield },
      { label: "Moderation & Disputes", to: "/admin/moderation", icon: AlertOctagon },
    ],
  },
  {
    heading: "GOVERNANCE",
    items: [
      { label: "Policies & Expiry", to: "/admin/policies", icon: Shield },
      { label: "Reports & Analytics", to: "/admin/reports", icon: BarChart3 },
      { label: "Audit Logs", to: "/admin/audit-logs", icon: ClipboardList },
    ],
  },
  {
    heading: "SYSTEM",
    items: [
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "System Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-card border-r border-border text-foreground font-sans ern-card-glow">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border">
        <NavLink to="/admin/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <BrandLogo variant="auto" size="sm" showText={true} />
        </NavLink>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
        {ADMIN_NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.heading && (
              <p className="px-3.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                {section.heading}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-full text-xs font-semibold ern-shimmer-hover ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-none font-bold"
                      : "text-foreground ern-nav-link-pill-hover"
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer User Profile & Switcher */}
      <div className="p-3.5 border-t border-border space-y-2">
        <button
          type="button"
          onClick={() => setAccountSwitcherOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-secondary/60 hover:bg-secondary ern-shimmer-hover text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-full bg-primary text-primary-foreground font-mono text-xs flex items-center justify-center font-bold shrink-0 ern-icon-hover">
              {user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user?.name || "Admin User"}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{user?.email || "admin@enterprise.io"}</p>
            </div>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-mono font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/60 ern-shimmer-hover cursor-pointer"
        >
          <LogOut className="size-3.5" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-card shadow-none z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-8 border-b border-border bg-card sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-full text-foreground hover:bg-secondary ern-icon-hover cursor-pointer"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-foreground font-mono text-xs uppercase font-bold border border-border">
              <span className="size-1.5 rounded-full bg-primary" />
              <span>COMMAND CONSOLE</span>
            </div>
          </div>

          {/* Right Header Actions & Theme Switcher */}
          <div className="flex items-center gap-2.5">
            <ThemeSwitcher variant="compact" />

            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-mono font-bold text-foreground ern-btn-hover cursor-pointer hidden md:flex items-center gap-1.5"
            >
              <span>Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => setInsightsOpen(true)}
              className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-xs font-mono font-bold ern-btn-hover cursor-pointer flex items-center gap-1.5 shadow-none"
            >
              <span>Insights</span>
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <WasteInsightsModal isOpen={insightsOpen} onClose={() => setInsightsOpen(false)} />
      <CalendarModal isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} />
      <AccountSwitcherModal
        isOpen={accountSwitcherOpen}
        onClose={() => setAccountSwitcherOpen(false)}
      />
    </div>
  );
}