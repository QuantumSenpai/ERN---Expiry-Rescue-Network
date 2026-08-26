import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ShieldAlert,
  Search,
  Check,
  MailOpen,
  ArrowUpRight,
  Boxes,
  Truck,
  Clock,
  Settings,
  X,
  CheckCircle2,
  SlidersHorizontal,
  Smartphone,
  Mail,
} from "lucide-react";
import type { AlertItem, AlertType, AlertSeverity } from "@/types/inventory";

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 1,
    title: "Critical Expiry: Amul Taaza Milk 1L expires in 2 days",
    type: "Expiry Alert",
    severity: "Critical",
    productName: "Amul Taaza Milk 1L",
    batchNo: "MLK-042",
    store: "Central Warehouse",
    category: "Dairy",
    detail: "25 units remaining in Batch MLK-042. Dynamic 40% flash clearance recommended before 48h shelf life cutoff.",
    timestamp: "10 mins ago",
    isRead: false,
    isResolved: false,
    expiryTrackingEnabled: true,
    link: "/retailer/clearance",
    linkText: "Launch Clearance",
  },
  {
    id: 2,
    title: "Critical Expiry: Britannia Whole Wheat Bread expires in 3 days",
    type: "Expiry Alert",
    severity: "Critical",
    productName: "Britannia Whole Wheat Bread 400g",
    batchNo: "BRD-101",
    store: "Store A",
    category: "Bakery",
    detail: "11 units remaining in Batch BRD-101. Active shelf markdown discount of 30% applied.",
    timestamp: "35 mins ago",
    isRead: false,
    isResolved: false,
    expiryTrackingEnabled: true,
    link: "/retailer/clearance",
    linkText: "View Clearance",
  },
  {
    id: 3,
    title: "High Risk Expiry: Tropicana Orange Juice expires in 6 days",
    type: "Expiry Alert",
    severity: "High",
    productName: "Tropicana Orange Juice 1L",
    batchNo: "BEV-008",
    store: "Store B",
    category: "Beverages",
    detail: "18 units at 15% promotion. Recommended for inter-facility transfer to high-footfall Store A.",
    timestamp: "2 hours ago",
    isRead: true,
    isResolved: false,
    expiryTrackingEnabled: true,
    link: "/retailer/expiry",
    linkText: "Inspect Expiry",
  },
  {
    id: 4,
    title: "Low Stock Alert: FarmFresh Paneer 200g",
    type: "Low Stock",
    severity: "Medium",
    productName: "FarmFresh Paneer 200g",
    store: "Store B",
    category: "Dairy",
    detail: "Current stock is 8 units (Safety threshold: 15 units). Automated PO drafted.",
    timestamp: "3 hours ago",
    isRead: false,
    isResolved: false,
    expiryTrackingEnabled: true,
    link: "/retailer/inventory",
    linkText: "Order Stock",
  },
  {
    id: 5,
    title: "Out of Stock: Nandini Fresh Curd 500g",
    type: "Out of Stock",
    severity: "High",
    productName: "Nandini Fresh Curd 500g",
    store: "Store A",
    category: "Dairy",
    detail: "Zero units available in Store A. Customer orders pending transfer.",
    timestamp: "5 hours ago",
    isRead: true,
    isResolved: false,
    expiryTrackingEnabled: true,
    link: "/retailer/inventory",
    linkText: "Manage Inventory",
  },
];

const SEVERITY_BADGE_STYLE: Record<AlertSeverity, string> = {
  Critical: "bg-status-critical-bg text-status-critical-text font-bold",
  High: "bg-status-high-bg text-status-high-text font-bold",
  Medium: "bg-status-progress-bg text-status-progress-text font-medium",
  Low: "bg-card text-foreground font-medium",
  Info: "bg-status-progress-bg text-status-progress-text font-medium",
  Resolved: "bg-status-approved-bg text-status-approved-text font-medium",
};

export default function RetailerAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | AlertType>("All");
  const [severityFilter, setSeverityFilter] = useState<"All" | AlertSeverity>("All");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleRead = (id: string | number) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const next = !a.isRead;
          showToast(next ? "Marked as read." : "Marked as unread.");
          return { ...a, isRead: next };
        }
        return a;
      })
    );
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    showToast("All notifications marked as read.");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter((a) => {
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.detail.toLowerCase().includes(q) ||
        (a.productName && a.productName.toLowerCase().includes(q)) ||
        (a.batchNo && a.batchNo.toLowerCase().includes(q)) ||
        (a.store && a.store.toLowerCase().includes(q));

      const matchType = typeFilter === "All" || a.type === typeFilter;
      const matchSeverity = severityFilter === "All" || a.severity === severityFilter;
      const matchUnread = !unreadOnly || !a.isRead;

      return matchSearch && matchType && matchSeverity && matchUnread;
    });
  }, [alerts, search, typeFilter, severityFilter, unreadOnly]);

  const criticalCount = alerts.filter((a) => a.type === "Expiry Alert" && a.severity === "Critical").length;
  const stockAlertsCount = alerts.filter((a) => a.type === "Low Stock" || a.type === "Out of Stock").length;
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6 pb-24 text-foreground font-body">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>REAL-TIME SIGNALS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            ALERTS & NOTIFICATIONS
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Real-time critical expiry triggers, low-stock warnings, and warehouse movements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95"
            >
              <MailOpen className="size-3.5" />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-foreground">Critical Expiry</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{criticalCount} Batches</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Immediate clearance needed</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Stock Warnings</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{stockAlertsCount} SKUs</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Low and out of stock</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Unread Queue</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{unreadCount} Alerts</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Pending user review</p>
        </div>
      </div>

      {/* Alert Feed Table */}
      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono text-xs transition-colors duration-200 ern-card-glow">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search alerts..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-sans text-xs"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "All" | AlertType)}
              className="px-3.5 py-2 rounded-full bg-card border border-border text-foreground font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Expiry Alert">Expiry Alerts</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as "All" | AlertSeverity)}
              className="px-3.5 py-2 rounded-full bg-card border border-border text-foreground font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-[rgba(28,58,19,0.15)]">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                !alert.isRead ? "bg-secondary/50" : "hover:bg-card"
              }`}
            >
              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground font-display uppercase text-sm">{alert.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${SEVERITY_BADGE_STYLE[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">{alert.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{alert.detail}</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                  <span>📍 {alert.store}</span>
                  {alert.batchNo && <span>Batch: {alert.batchNo}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {alert.link && (
                  <Link
                    to={alert.link}
                    className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] transition-all cursor-pointer shadow-none flex items-center gap-1"
                  >
                    <span>{alert.linkText || "Action"}</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => toggleRead(alert.id)}
                  className="px-2.5 py-1 rounded-lg bg-background border border-border text-foreground text-xs font-bold uppercase hover:border-primary cursor-pointer"
                >
                  {alert.isRead ? "Unread" : "Mark Read"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
