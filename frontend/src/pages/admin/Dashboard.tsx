import { useState } from "react";
import {
  Users,
  Package,
  Clock,
  AlertTriangle,
  FileCheck2,
  Activity,
  Sliders,
  FileText,
  Database,
  ChevronRight,
  UserPlus,
  MapPin,
  Download,
  Bell,
  ChevronDown,
  CloudUpload,
  ShieldCheck,
  Settings,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AnimatedNumber from "@/components/AnimatedNumber";
import InventoryHealthModal from "@/components/InventoryHealthModal";
import BulkImportModal from "@/components/BulkImportModal";
import RecentActivityDrawer from "@/components/RecentActivityDrawer";
import GenerateReportModal from "@/components/GenerateReportModal";

const WAREHOUSES = [
  { id: "central", name: "Central Warehouse", type: "Cold Storage & Primary Hub", active: true },
  { id: "store-a", name: "Store A (Metro)", type: "Metro Superstore", active: false },
  { id: "store-b", name: "Store B (Express)", type: "Retail Express Hub", active: false },
  { id: "dc-1", name: "Distribution Center", type: "Regional Logistics Hub", active: false },
];

const ORGANIZATIONS = [
  "GreenLeaf Retail Group",
  "Apex Healthcare Logistics",
  "OmniSupply Consumer Hub",
];

const NOTIFICATIONS = [
  { id: "n1", title: "6 Batches near expiry in Store B", time: "12m ago", unread: true },
  { id: "n2", title: "CSV Catalog Ingestion completed", time: "45m ago", unread: true },
  { id: "n3", title: "New staff member access request", time: "2h ago", unread: true },
];

interface ActivityItem {
  id: string;
  type: "import" | "adjustment" | "invitation" | "expiry_alert" | "location_update";
  title: string;
  description: string;
  time: string;
  link: string;
  icon: typeof CloudUpload;
  iconBg: string;
  iconColor: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "import",
    title: "Bulk Inventory Import completed",
    description: "348 products imported to Store A",
    time: "15 min ago",
    link: "/admin/inventory",
    icon: CloudUpload,
    iconBg: "bg-[#2F4156]",
    iconColor: "text-primary-foreground",
  },
  {
    id: "act-2",
    type: "adjustment",
    title: "Stock Adjustment approved",
    description: "4 stock adjustments were approved",
    time: "1 hour ago",
    link: "/admin/requests",
    icon: Sliders,
    iconBg: "bg-accent",
    iconColor: "text-foreground",
  },
  {
    id: "act-3",
    type: "invitation",
    title: "New User Invitation sent",
    description: "Invitation sent to john@company.com",
    time: "2 hours ago",
    link: "/admin/users",
    icon: UserPlus,
    iconBg: "bg-secondary",
    iconColor: "text-foreground",
  },
  {
    id: "act-4",
    type: "expiry_alert",
    title: "Expiry Alert: 12 items flagged",
    description: "Batches reaching critical threshold in Bay 4",
    time: "3 hours ago",
    link: "/admin/expiry",
    icon: Clock,
    iconBg: "bg-destructive",
    iconColor: "text-primary-foreground",
  },
  {
    id: "act-5",
    type: "location_update",
    title: "Location settings updated",
    description: "Cold storage threshold modified",
    time: "5 hours ago",
    link: "/admin/locations",
    icon: MapPin,
    iconBg: "bg-[#2F4156]",
    iconColor: "text-primary-foreground",
  },
];

const KPI_ROUTES = {
  totalProducts: "/admin/inventory",
  activeUsers: "/admin/users",
  locations: "/admin/locations",
  expiryTracked: "/admin/expiry",
  needsAttention: "/admin/inventory?filter=critical",
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [selectedOrg, setSelectedOrg] = useState(ORGANIZATIONS[0]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(WAREHOUSES[0]);
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [criticalDays, setCriticalDays] = useState(7);
  const [highRiskDays, setHighRiskDays] = useState(15);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="space-y-6 text-foreground font-body">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="size-2 rounded-full bg-[#2F4156]" />
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner / Breadcrumb & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase mb-2">
            <span>ADMIN COMMAND CONSOLE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-[1.08] tracking-[-0.025em]">
            Organization dashboard
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Multi-facility inventory governance, policy controls, and real-time operational telemetry.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Warehouse Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setWarehouseDropdownOpen(!warehouseDropdownOpen)}
              className="px-4 py-2 rounded-full bg-card border border-border hover:border-primary text-foreground font-mono text-xs font-bold flex items-center gap-2 shadow-none cursor-pointer transition-colors"
            >
              <MapPin className="size-3.5 text-foreground dark:text-accent" />
              <span>{selectedWarehouse.name}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>

            {warehouseDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-popover border border-border shadow-none p-2 z-40 space-y-1 font-mono text-xs">
                {WAREHOUSES.map((wh) => (
                  <button
                    key={wh.id}
                    onClick={() => {
                      setSelectedWarehouse(wh);
                      setWarehouseDropdownOpen(false);
                      showToast(`Facility context switched to ${wh.name}`);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-colors flex flex-col ${
                      selectedWarehouse.id === wh.id
                        ? "bg-primary text-primary-foreground font-bold"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    <span className="font-bold">{wh.name}</span>
                    <span className="text-[10px] opacity-80">{wh.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Import Button */}
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#2F4156] hover:bg-[#567C8D] dark:bg-accent dark:hover:bg-[#567c8d] text-primary-foreground dark:text-accent-foreground font-mono text-xs uppercase font-bold flex items-center gap-1.5 shadow-none cursor-pointer ern-shimmer-hover"
          >
            <CloudUpload className="size-3.5" />
            <span>Import CSV</span>
          </button>

          {/* Generate Report Button */}
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 dark:hover:bg-[#b8ccdc] text-foreground font-mono text-xs uppercase font-bold flex items-center gap-1.5 shadow-none cursor-pointer border border-border ern-shimmer-hover"
          >
            <Download className="size-3.5" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Organization Meta Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5 rounded-2xl bg-card border border-border shadow-none ern-card-glow">
        <div>
          <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
            ORGANIZATION
          </p>
          <p className="text-xs sm:text-sm font-bold text-foreground truncate mt-0.5">
            {selectedOrg}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
            WORKSPACE STATUS
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="size-2 rounded-full bg-[#2F4156] dark:bg-accent" />
            <span className="text-xs sm:text-sm font-mono font-bold text-foreground uppercase">
              Live • Production
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
            PRIMARY FACILITY
          </p>
          <p className="text-xs sm:text-sm font-body font-bold text-foreground mt-0.5 truncate">
            {selectedWarehouse.name}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
            INGESTION CYCLE
          </p>
          <p className="text-xs sm:text-sm font-mono text-foreground font-bold mt-0.5">
            Realtime Sync Active
          </p>
        </div>

        <div className="col-span-2 md:col-span-4 lg:col-span-1 flex items-center lg:justify-end">
          <Link
            to="/admin/settings"
            className="text-xs font-mono font-bold uppercase text-foreground dark:text-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Settings</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Operations Pulse Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-none ern-card-glow">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground shrink-0">
          <Activity className="size-4 text-foreground dark:text-accent animate-pulse" />
          <span className="uppercase tracking-wider">OPERATIONS RADAR PULSE:</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap text-xs font-mono">
          <button
            onClick={() => navigate("/admin/inventory?filter=critical")}
            className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground font-bold flex items-center gap-2 cursor-pointer ern-shimmer-hover shadow-none"
          >
            <span className="size-2 rounded-full bg-accent animate-pulse" />
            <span>21 issues need attention</span>
          </button>

          <button
            onClick={() => navigate("/admin/expiry")}
            className="px-3.5 py-1.5 rounded-full bg-destructive text-destructive-foreground font-bold flex items-center gap-2 cursor-pointer ern-shimmer-hover--critical shadow-none"
          >
            <span className="size-2 rounded-full bg-card" />
            <span>6 expiry-risk batches</span>
          </button>

          <button
            onClick={() => navigate("/admin/inventory?filter=low-stock")}
            className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 dark:hover:bg-[#b8ccdc] text-foreground font-bold flex items-center gap-2 cursor-pointer ern-shimmer-hover shadow-none"
          >
            <span>9 low-stock items</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Total Products */}
        <div
          onClick={() => navigate(KPI_ROUTES.totalProducts)}
          role="button"
          tabIndex={0}
          className="p-6 rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between ern-card-hover ern-card-glow transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Package className="size-5" />
            </div>
            <span className="text-xs font-mono font-bold text-foreground dark:text-accent uppercase">
              ▲ 12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono uppercase font-bold text-muted-foreground">
              Total Products
            </p>
            <p className="text-3xl sm:text-4xl font-bold font-display text-foreground uppercase mt-1">
              <AnimatedNumber value={1248} duration={800} />
            </p>
            <p className="text-[11px] text-muted-foreground font-body mt-1">Across all facilities</p>
          </div>
        </div>

        {/* 2. Active Users */}
        <div
          onClick={() => navigate(KPI_ROUTES.activeUsers)}
          role="button"
          tabIndex={0}
          className="p-6 rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between ern-card-hover ern-card-glow transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
              <Users className="size-5" />
            </div>
            <span className="text-xs font-mono font-bold text-foreground dark:text-accent uppercase">
              ▲ 8%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono uppercase font-bold text-muted-foreground">
              Active Users
            </p>
            <p className="text-3xl sm:text-4xl font-bold font-display text-foreground uppercase mt-1">
              <AnimatedNumber value={18} duration={800} />
            </p>
            <p className="text-[11px] text-muted-foreground font-body mt-1">Staff team seats</p>
          </div>
        </div>

        {/* 3. Locations */}
        <div
          onClick={() => navigate(KPI_ROUTES.locations)}
          role="button"
          tabIndex={0}
          className="p-6 rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between ern-card-hover ern-card-glow transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-full bg-secondary text-foreground flex items-center justify-center font-bold">
              <MapPin className="size-5" />
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">—</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono uppercase font-bold text-muted-foreground">
              Locations
            </p>
            <p className="text-3xl sm:text-4xl font-bold font-display text-foreground uppercase mt-1">
              <AnimatedNumber value={4} duration={800} />
            </p>
            <p className="text-[11px] text-muted-foreground font-body mt-1">Active nodes</p>
          </div>
        </div>

        {/* 4. Expiry Tracked */}
        <div
          onClick={() => navigate(KPI_ROUTES.expiryTracked)}
          role="button"
          tabIndex={0}
          className="p-6 rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between ern-card-hover ern-card-glow transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
              <Clock className="size-5" />
            </div>
            <span className="text-xs font-mono font-bold text-foreground dark:text-accent uppercase">
              ▲ 15%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono uppercase font-bold text-muted-foreground">
              Expiry Tracked
            </p>
            <p className="text-3xl sm:text-4xl font-bold font-display text-foreground uppercase mt-1">
              <AnimatedNumber value={326} duration={800} />
            </p>
            <p className="text-[11px] text-muted-foreground font-body mt-1">Live batch telemetry</p>
          </div>
        </div>

        {/* 5. Needs Attention */}
        <div
          onClick={() => navigate(KPI_ROUTES.needsAttention)}
          role="button"
          tabIndex={0}
          className="p-6 rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between ern-card-hover ern-card-glow transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <AlertTriangle className="size-5" />
            </div>
            <span className="text-xs font-mono font-bold text-foreground dark:text-accent uppercase">
              ▲ 5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono uppercase text-foreground dark:text-accent font-bold">
              Needs Attention
            </p>
            <p className="text-3xl sm:text-4xl font-bold font-display text-foreground uppercase mt-1">
              <AnimatedNumber value={21} duration={800} />
            </p>
            <p className="text-[11px] text-muted-foreground font-body mt-1">Immediate action</p>
          </div>
        </div>
      </div>

      {/* Main 3-Column Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Column 1: PENDING ACTIONS */}
        <div className="rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] p-6 flex flex-col justify-between shadow-none ern-card-glow transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="font-display text-lg font-bold text-foreground">Pending Actions</h2>
              <Link
                to="/admin/requests"
                className="text-xs font-mono uppercase font-bold text-foreground dark:text-accent hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {/* Item 1 */}
              <div
                onClick={() => navigate("/admin/users")}
                className="w-full flex items-center justify-between gap-3 text-left p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary/50 dark:hover:bg-[#567C8D] border border-transparent cursor-pointer ern-row-hover"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-9 rounded-full bg-card flex items-center justify-center text-foreground shrink-0 border border-border">
                    <UserPlus className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-display font-bold text-foreground truncate">
                      3 User Invitations
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      Awaiting workspace access
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono uppercase font-bold shrink-0">
                  Review
                </span>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => setImportModalOpen(true)}
                className="w-full flex items-center justify-between gap-3 text-left p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary/50 dark:hover:bg-[#567C8D] border border-transparent cursor-pointer ern-row-hover"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-9 rounded-full bg-card flex items-center justify-center text-foreground shrink-0 border border-border">
                    <CloudUpload className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-display font-bold text-foreground truncate">
                      2 Catalog Ingestions
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      Validation required
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono uppercase font-bold shrink-0">
                  Review
                </span>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => navigate("/admin/requests")}
                className="w-full flex items-center justify-between gap-3 text-left p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary/50 dark:hover:bg-[#567C8D] border border-transparent cursor-pointer ern-row-hover"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-9 rounded-full bg-card flex items-center justify-center text-foreground shrink-0 border border-border">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-display font-bold text-foreground truncate">
                      1 Supplier Onboarding
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      Verification required
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono uppercase font-bold shrink-0">
                  Review
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: SYSTEM HEALTH & SERVICES */}
        <div className="rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] p-6 flex flex-col justify-between shadow-none ern-card-glow transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="font-display text-lg font-bold text-foreground">System Health</h2>
              <button
                onClick={() => setHealthModalOpen(true)}
                className="text-xs font-mono uppercase font-bold text-foreground dark:text-accent hover:underline cursor-pointer"
              >
                Details
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {/* Service 1 */}
              <div
                onClick={() => setHealthModalOpen(true)}
                className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary/50 dark:hover:bg-[#567C8D] cursor-pointer ern-row-hover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-full bg-card flex items-center justify-center text-foreground shrink-0 border border-border">
                    <Settings className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground uppercase font-display truncate">Inventory Core Engine</p>
                    <p className="text-[10.5px] text-muted-foreground font-mono">Operational</p>
                  </div>
                </div>
                <span className="px-3 py-0.5 rounded-full bg-accent text-accent-foreground font-mono text-[10.5px] font-bold uppercase">
                  Healthy
                </span>
              </div>

              {/* Service 2 */}
              <div
                onClick={() => navigate("/admin/policies")}
                className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary/50 dark:hover:bg-[#567C8D] cursor-pointer ern-row-hover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-full bg-card flex items-center justify-center text-foreground shrink-0 border border-border">
                    <Clock className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground uppercase font-display truncate">Expiry Monitoring</p>
                    <p className="text-[10.5px] text-muted-foreground font-mono">Telemetry active</p>
                  </div>
                </div>
                <span className="px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-mono text-[10.5px] font-bold uppercase">
                  Active
                </span>
              </div>

              {/* Service 3 */}
              <div
                onClick={() => setImportModalOpen(true)}
                className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary/50 dark:hover:bg-[#567C8D] cursor-pointer ern-row-hover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-full bg-card flex items-center justify-center text-foreground shrink-0 border border-border">
                    <Database className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground uppercase font-display truncate">Catalog Pipeline</p>
                    <p className="text-[10.5px] text-muted-foreground font-mono">Sync: 1h ago</p>
                  </div>
                </div>
                <span className="px-3 py-0.5 rounded-full bg-secondary text-foreground font-mono text-[10.5px] font-bold uppercase border border-border">
                  Good
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: INVENTORY AT A GLANCE */}
        <div className="rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] p-6 flex flex-col justify-between shadow-none ern-card-glow transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-display text-lg font-bold text-foreground">Inventory Split</h2>
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-xs font-mono uppercase font-bold text-foreground dark:text-accent hover:underline cursor-pointer"
              >
                Report
              </button>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <div className="relative size-32 shrink-0 flex items-center justify-center">
                <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E2D9BE"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#2F4156"
                    strokeWidth="14"
                    strokeDasharray="185.7 251.3"
                    strokeDashoffset="0"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#757C5D"
                    strokeWidth="14"
                    strokeDasharray="47.5 251.3"
                    strokeDashoffset="-185.7"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#9F995B"
                    strokeWidth="14"
                    strokeDasharray="9.5 251.3"
                    strokeDashoffset="-233.2"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-bold font-display text-lg text-foreground leading-none">
                    <AnimatedNumber value={1248} duration={800} />
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5 font-bold">
                    Units
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#2F4156] dark:bg-accent" />
                    <span className="font-bold text-foreground uppercase">Good Stock</span>
                  </div>
                  <span className="font-bold text-foreground">73.9%</span>
                </div>

                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#757C5D] dark:bg-secondary" />
                    <span className="font-bold text-foreground uppercase">Near Expiry</span>
                  </div>
                  <span className="font-bold text-foreground">18.9%</span>
                </div>

                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-destructive" />
                    <span className="font-bold text-foreground uppercase">Cleared</span>
                  </div>
                  <span className="font-bold text-foreground">7.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Area: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Recent Activity */}
        <div className="rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] p-6 flex flex-col justify-between shadow-none ern-card-glow transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="font-display text-lg font-bold text-foreground">Recent Activity</h2>
              <button
                onClick={() => setActivityDrawerOpen(true)}
                className="text-xs font-mono uppercase font-bold text-foreground dark:text-accent hover:underline cursor-pointer"
              >
                <span>Audit Log</span>
              </button>
            </div>

            <div className="space-y-2.5 mt-4">
              {ACTIVITIES.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.link)}
                    className="w-full flex items-center gap-3.5 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/50 dark:hover:bg-[#567C8D] text-left cursor-pointer ern-row-hover"
                  >
                    <div className={`size-9 rounded-full ${item.iconBg} flex items-center justify-center ${item.iconColor} shrink-0`}>
                      <Icon className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-display font-bold text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-muted-foreground shrink-0 font-bold">
                      {item.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] p-6 flex flex-col justify-between shadow-none ern-card-glow transition-colors duration-200">
          <div>
            <div className="pb-4 border-b border-border">
              <h2 className="font-display text-lg font-bold text-foreground">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 font-mono">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="p-4 rounded-xl bg-secondary/60 hover:bg-secondary/60 dark:hover:bg-[#567C8D] flex flex-col items-center justify-center text-center cursor-pointer shadow-none ern-btn-hover"
              >
                <UserPlus className="size-5 text-foreground dark:text-accent" />
                <span className="text-xs font-bold uppercase text-foreground mt-2">Add User</span>
              </button>

              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="p-4 rounded-xl bg-secondary/60 hover:bg-secondary/60 dark:hover:bg-[#567C8D] flex flex-col items-center justify-center text-center cursor-pointer shadow-none ern-btn-hover"
              >
                <CloudUpload className="size-5 text-foreground dark:text-accent" />
                <span className="text-xs font-bold uppercase text-foreground mt-2">Import CSV</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/locations")}
                className="p-4 rounded-xl bg-secondary/60 hover:bg-secondary/60 dark:hover:bg-[#567C8D] flex flex-col items-center justify-center text-center cursor-pointer shadow-none ern-btn-hover"
              >
                <MapPin className="size-5 text-foreground dark:text-accent" />
                <span className="text-xs font-bold uppercase text-foreground mt-2">Facility</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/inventory")}
                className="p-4 rounded-xl bg-secondary/60 hover:bg-secondary/60 dark:hover:bg-[#567C8D] flex flex-col items-center justify-center text-center cursor-pointer shadow-none ern-btn-hover"
              >
                <Sliders className="size-5 text-foreground dark:text-accent" />
                <span className="text-xs font-bold uppercase text-foreground mt-2">Stock Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="p-4 rounded-xl bg-secondary/60 hover:bg-secondary/60 dark:hover:bg-[#567C8D] flex flex-col items-center justify-center text-center cursor-pointer shadow-none ern-btn-hover"
              >
                <FileText className="size-5 text-foreground dark:text-accent" />
                <span className="text-xs font-bold uppercase text-foreground mt-2">Reports</span>
              </button>

              <button
                type="button"
                onClick={() => setPolicyModalOpen(true)}
                className="p-4 rounded-xl bg-secondary/60 hover:bg-secondary/60 dark:hover:bg-[#567C8D] flex flex-col items-center justify-center text-center cursor-pointer shadow-none ern-btn-hover"
              >
                <Bell className="size-5 text-foreground dark:text-accent" />
                <span className="text-xs font-bold uppercase text-foreground mt-2">Policies</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Modal */}
      {policyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl sm:rounded-[32px] p-7 shadow-none space-y-4 text-foreground ern-card-glow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Configure Expiry Policies</h3>
                <p className="text-xs text-muted-foreground font-body mt-0.5">Adjust organizational risk threshold buffers.</p>
              </div>
              <button
                onClick={() => setPolicyModalOpen(false)}
                className="p-1.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Critical Risk Threshold (Days):</label>
                <input
                  type="number"
                  value={criticalDays}
                  onChange={(e) => setCriticalDays(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground outline-none font-bold focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">High Risk Threshold (Days):</label>
                <input
                  type="number"
                  value={highRiskDays}
                  onChange={(e) => setHighRiskDays(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground outline-none font-bold focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setPolicyModalOpen(false)}
                className="px-4 py-2 rounded-full bg-secondary text-foreground text-xs font-mono uppercase font-bold hover:bg-secondary/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setPolicyModalOpen(false);
                  showToast(`Expiry policies updated: Critical <= ${criticalDays}d, High <= ${highRiskDays}d`);
                }}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none"
              >
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Modals */}
      <InventoryHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        onFilterSelect={(filter) => {
          navigate(`/admin/inventory?filter=${filter}`);
        }}
      />

      <BulkImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={(count) => {
          showToast(`Successfully ingested ${count} products into organization catalog.`);
        }}
      />

      <RecentActivityDrawer
        isOpen={activityDrawerOpen}
        onClose={() => setActivityDrawerOpen(false)}
      />

      <GenerateReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onReportGenerated={(rep) => {
          showToast(`Report generated: ${rep}`);
        }}
      />
    </div>
  );
}