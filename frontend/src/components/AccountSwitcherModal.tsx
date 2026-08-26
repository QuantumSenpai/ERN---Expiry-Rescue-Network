import {
  X,
  Store,
  Shield,
  ShoppingBag,
  Building2,
  CheckCircle2,
  LogOut,
  Settings,
  ArrowRight,
  Package,
  User,
  Heart,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, type AuthUser, type Role } from "@/context/AuthContext";

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountProfile {
  id: string;
  name: string;
  businessName: string;
  email: string;
  role: Role;
  roleTitle: string;
  tagline: string;
  icon: typeof Store;
  color: string;
  bg: string;
  defaultRoute: string;
}

const AVAILABLE_ACCOUNTS: AccountProfile[] = [
  {
    id: "acc-retailer",
    name: "Operations Staff",
    businessName: "Central Warehouse Facility",
    email: "ops.staff@ern-network.com",
    role: "retailer",
    roleTitle: "Operations Staff",
    tagline: "Inventory command center, stock receiving, expiry & fulfillment",
    icon: Store,
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    defaultRoute: "/retailer/dashboard",
  },
  {
    id: "acc-customer",
    name: "Alex",
    businessName: "Alex (Customer Marketplace)",
    email: "alex@ern-network.com",
    role: "customer",
    roleTitle: "Customer / Rescuer",
    tagline: "Shop smart, save more, waste less — Deals & Cart",
    icon: ShoppingBag,
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    defaultRoute: "/marketplace",
  },
  {
    id: "acc-admin",
    name: "Karan Johar",
    businessName: "ERN Super Admin Portal",
    email: "superadmin@expiryrescuenetwork.io",
    role: "admin",
    roleTitle: "System Administrator",
    tagline: "Enterprise listings, multi-store audits & security",
    icon: Shield,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    defaultRoute: "/admin/dashboard",
  },
  {
    id: "acc-ngo",
    name: "Hope Children's Foundation",
    businessName: "NGO Bulk Rescue Partner",
    email: "requisitions@hopefoundation.ngo",
    role: "customer",
    roleTitle: "Institutional Bulk Buyer",
    tagline: "Wholesale clearance lots, hostel & charity requisitions",
    icon: Building2,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    defaultRoute: "/marketplace",
  },
];

export default function AccountSwitcherModal({
  isOpen,
  onClose,
}: AccountSwitcherModalProps) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const currentRole = user?.role || "retailer";

  const handleSwitchAccount = (account: AccountProfile) => {
    const newUser: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    };
    login(newUser);
    onClose();
    navigate(account.defaultRoute);
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-foreground font-sans"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center font-bold text-lg shadow-md">
              {(user?.name || "A")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Account & Role Switcher
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Active: <span className="text-foreground font-semibold">{user?.name || "Alex"}</span> ({currentRole})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Switch Profile List */}
        <div className="space-y-2.5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground block">
            Select Workspace / Account Role:
          </span>

          <div className="space-y-2">
            {AVAILABLE_ACCOUNTS.map((acc) => {
              const isCurrent =
                acc.role === currentRole &&
                (user?.name === acc.name || (!user?.name && acc.role === "retailer"));

              const Icon = acc.icon;

              return (
                <div
                  key={acc.id}
                  onClick={() => handleSwitchAccount(acc)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isCurrent
                      ? "bg-[#10B981]/15 border-[#10B981] shadow-xs ring-1 ring-[#10B981]/40"
                      : "bg-secondary border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-10 rounded-xl ${acc.bg} ${acc.color} flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground leading-tight truncate">
                          {acc.businessName}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#10B981] text-foreground shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {acc.name} &bull; <span className="font-semibold text-foreground">{acc.roleTitle}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{acc.tagline}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isCurrent ? (
                      <CheckCircle2 className="size-5 text-[#10B981]" />
                    ) : (
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="p-3.5 rounded-2xl bg-secondary border border-border space-y-2 text-xs">
          <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase block">
            Account & Workspace Navigation:
          </span>
          <div className="grid grid-cols-4 gap-2">
            <Link
              to="/customer/profile"
              onClick={onClose}
              className="p-2 rounded-xl bg-card border border-border hover:border-[#10B981]/50 text-foreground flex flex-col items-center justify-center gap-1 font-medium transition-colors text-center shadow-2xs group"
            >
              <User className="size-4 text-[#10B981] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">My Profile</span>
            </Link>

            <Link
              to="/customer/saved-items"
              onClick={onClose}
              className="p-2 rounded-xl bg-card border border-border hover:border-[#10B981]/50 text-foreground flex flex-col items-center justify-center gap-1 font-medium transition-colors text-center shadow-2xs group"
            >
              <Heart className="size-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">Saved Items</span>
            </Link>

            <Link
              to="/customer/orders"
              onClick={onClose}
              className="p-2 rounded-xl bg-card border border-border hover:border-[#10B981]/50 text-foreground flex flex-col items-center justify-center gap-1 font-medium transition-colors text-center shadow-2xs group"
            >
              <Package className="size-4 text-[#10B981] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">My Orders</span>
            </Link>

            <Link
              to="/customer/profile"
              onClick={onClose}
              className="p-2 rounded-xl bg-card border border-border hover:border-[#10B981]/50 text-foreground flex flex-col items-center justify-center gap-1 font-medium transition-colors text-center shadow-2xs group"
            >
              <Settings className="size-4 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">Settings</span>
            </Link>
          </div>
        </div>

        {/* Logout Footer */}
        <div className="pt-2 flex justify-between items-center border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sign Out / Log Out</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
