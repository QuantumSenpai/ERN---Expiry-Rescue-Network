import { useState, useMemo } from "react";
import {
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  MapPin,
  Percent,
  Download,
  Plus,
  Package,
  Layers,
  Sparkles,
  X,
  Calendar,
  Clock3,
  ArrowRightLeft,
  User,
  MessageSquare,
  ShieldCheck,
  Check,
  XCircle,
  Loader2,
  SlidersHorizontal,
  History,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export type RequestType =
  | "Stock Adjustment"
  | "Transfer"
  | "Purchase/Replenishment"
  | "Rescue"
  | "Clearance"
  | "Damage/Expiry";

export type RequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Processing"
  | "Completed"
  | "Overdue";

export type Priority = "Low" | "Normal" | "High" | "Critical";

export interface ApprovalEvent {
  id: string;
  time: string;
  action: string;
  by?: string;
  comment?: string;
}

export interface StaffRequest {
  id: string;
  type: RequestType;
  product: string;
  sku: string;
  batch: string;
  quantity: number;
  unit: string;
  currentStock: number;
  stockValue: number;
  expiry: string;
  daysLeft: number | null;
  requestedBy: string;
  department: string;
  location: string;
  destinationLocation?: string;
  date: string;
  dueDate: string;
  priority: Priority;
  status: RequestStatus;
  reason: string;
  notes?: string;
  isMyRequest?: boolean;
  history: ApprovalEvent[];
}

const INITIAL_REQUESTS: StaffRequest[] = [
  {
    id: "REQ-2026-0044",
    type: "Clearance",
    product: "Tropicana Valencia Orange Juice 1L",
    sku: "JUC-882",
    batch: "JUC-882-B",
    quantity: 45,
    unit: "Bottles",
    currentStock: 45,
    stockValue: 1890,
    expiry: "18 Aug 2026",
    daysLeft: 2,
    requestedBy: "Operations Staff (You)",
    department: "Store Operations",
    location: "Central Warehouse",
    date: "15 Aug 2026",
    dueDate: "16 Aug 2026",
    priority: "Critical",
    status: "Pending",
    reason: "Batch approaching 48h critical expiry threshold — markdown discount of 35% requested.",
    notes: "Requires quick approval to publish clearance deal before noon picking cycle.",
    isMyRequest: true,
    history: [
      { id: "h-1", time: "09:30 AM", action: "Request Created", by: "Operations Staff" },
      { id: "h-2", time: "09:32 AM", action: "Assigned to Supervisor", by: "System Router" },
    ],
  },
  {
    id: "REQ-2026-0043",
    type: "Transfer",
    product: "Real Fruit Mixed Juice 1L",
    sku: "JUC-REAL-1L",
    batch: "JUC-882",
    quantity: 30,
    unit: "Pcs",
    currentStock: 50,
    stockValue: 3300,
    expiry: "24 Aug 2026",
    daysLeft: 8,
    requestedBy: "Store A Lead",
    department: "Store Operations",
    location: "Distribution Center",
    destinationLocation: "Store A",
    date: "15 Aug 2026",
    dueDate: "16 Aug 2026",
    priority: "High",
    status: "Approved",
    reason: "Redistribution to Store A where weekend footfall and demand velocity are 3x higher.",
    isMyRequest: false,
    history: [
      { id: "h-3", time: "08:15 AM", action: "Transfer Request Created", by: "Store A Lead" },
      { id: "h-4", time: "08:45 AM", action: "Approved by Logistics Admin", by: "Amit Sharma" },
    ],
  },
  {
    id: "REQ-2026-0042",
    type: "Rescue",
    product: "FarmFresh Pasteurized Paneer 200g",
    sku: "PNR-FF-200G",
    batch: "PNR-882",
    quantity: 30,
    unit: "Pcs",
    currentStock: 30,
    stockValue: 2700,
    expiry: "20 Aug 2026",
    daysLeft: 4,
    requestedBy: "Operations Staff (You)",
    department: "Inventory Control",
    location: "Store B",
    date: "14 Aug 2026",
    dueDate: "16 Aug 2026",
    priority: "Critical",
    status: "Processing",
    reason: "Publish dynamic rescue deal to prevent ₹2,700 write-off.",
    isMyRequest: true,
    history: [
      { id: "h-5", time: "02:10 PM", action: "Request Created", by: "Operations Staff" },
      { id: "h-6", time: "02:30 PM", action: "Approved for Rescue Deal", by: "Store Manager" },
      { id: "h-7", time: "03:00 PM", action: "Discount Published on Marketplace" },
    ],
  },
  {
    id: "REQ-2026-0040",
    type: "Stock Adjustment",
    product: "Mother Dairy Classic Curd 400g",
    sku: "CRD-MD-400G",
    batch: "CRD-551",
    quantity: 5,
    unit: "Tubs",
    currentStock: 35,
    stockValue: 175,
    expiry: "25 Aug 2026",
    daysLeft: 9,
    requestedBy: "Store A Staff",
    department: "Store Operations",
    location: "Store A",
    date: "14 Aug 2026",
    dueDate: "15 Aug 2026",
    priority: "Normal",
    status: "Completed",
    reason: "Damaged seal on 5 tubs identified during cold storage intake.",
    isMyRequest: false,
    history: [
      { id: "h-8", time: "11:20 AM", action: "Adjustment Logged", by: "Store A Staff" },
      { id: "h-9", time: "11:45 AM", action: "Approved & Inventory Adjusted", by: "Store Manager" },
    ],
  },
];

const TYPE_FILTERS: RequestType[] = [
  "Stock Adjustment",
  "Transfer",
  "Purchase/Replenishment",
  "Rescue",
  "Clearance",
  "Damage/Expiry",
];

const PRIORITY_FILTERS: Priority[] = ["Low", "Normal", "High", "Critical"];

const LOCATION_FILTERS = [
  "All Locations",
  "Central Warehouse",
  "Store A",
  "Store B",
  "Distribution Center",
];

const STATUS_TABS: { label: string; value: RequestStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Processing", value: "Processing" },
  { label: "Completed", value: "Completed" },
  { label: "Overdue", value: "Overdue" },
  { label: "Rejected", value: "Rejected" },
];

function statusBadgeClasses(status: RequestStatus) {
  switch (status) {
    case "Pending":
      return "bg-primary text-primary-foreground border border-[#2F4156] font-bold";
    case "Approved":
    case "Completed":
      return "bg-primary text-primary-foreground font-bold";
    case "Rejected":
    case "Overdue":
      return "bg-primary text-primary-foreground font-bold";
    case "Processing":
      return "bg-card text-foreground border border-border font-bold";
  }
}

function priorityBadgeClasses(priority: Priority) {
  switch (priority) {
    case "Low":
      return "bg-card text-muted-foreground";
    case "Normal":
      return "bg-card text-foreground border border-border";
    case "High":
      return "bg-primary text-primary-foreground border border-[#2F4156] font-bold";
    case "Critical":
      return "bg-primary text-primary-foreground font-bold";
  }
}

export default function StaffRequests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState<StaffRequest[]>(INITIAL_REQUESTS);
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<RequestStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [locationFilter, setLocationFilter] = useState(LOCATION_FILTERS[0]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesQuery =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.batch.toLowerCase().includes(q) ||
        r.requestedBy.toLowerCase().includes(q);
      const matchesStatus = statusTab === "All" || r.status === statusTab;
      const matchesType = typeFilter === "all" || r.type === typeFilter;
      const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter;
      const matchesLocation =
        locationFilter === "All Locations" || r.location === locationFilter;
      return matchesQuery && matchesStatus && matchesType && matchesPriority && matchesLocation;
    });
  }, [requests, query, statusTab, typeFilter, priorityFilter, locationFilter]);

  const kpis = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === "Pending").length,
      highPriority: requests.filter((r) => r.priority === "High" || r.priority === "Critical").length,
      approved: requests.filter((r) => r.status === "Approved").length,
      completed: requests.filter((r) => r.status === "Completed").length,
    }),
    [requests]
  );

  const selected = useMemo(() => requests.find((r) => r.id === selectedId) || null, [requests, selectedId]);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: "Approved",
            history: [
              ...r.history,
              { id: `h-${Date.now()}`, time: "Just now", action: "Approved by Operations Staff", by: user?.name || "Staff" },
            ],
          };
        }
        return r;
      })
    );
    showToast(`Request ${id} approved.`);
  };

  return (
    <div className="space-y-6 pb-24 text-foreground font-body">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>OPERATIONAL WORKFLOWS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            STAFF REQUESTS
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Submit, track, and authorize internal stock movements, adjustments, and expiry interventions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95"
          >
            <Plus className="size-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Pending</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{kpis.pending}</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Needs review</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-foreground">Urgent</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{kpis.highPriority}</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">High/Critical</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Approved</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{kpis.approved}</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Ready to execute</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Completed</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{kpis.completed}</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Fulfilled</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatusTab(t.value)}
            className={`px-4 py-2 rounded-full font-bold uppercase transition-all cursor-pointer ${
              statusTab === t.value
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground border border-border hover:border-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono text-xs transition-colors duration-200 ern-card-glow">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search request ID, item, SKU..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
              />
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
            >
              {LOCATION_FILTERS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
              <tr>
                <th className="px-4 py-3.5 font-bold uppercase">ID</th>
                <th className="px-4 py-3.5 font-bold uppercase">Type</th>
                <th className="px-4 py-3.5 font-bold uppercase">Product</th>
                <th className="px-4 py-3.5 font-bold uppercase">Location</th>
                <th className="px-4 py-3.5 font-bold uppercase text-right">Quantity</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Priority</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Status</th>
                <th className="px-4 py-3.5 text-right font-bold uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5 font-bold text-foreground">{r.id}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-card border border-border text-foreground text-[10px] font-bold uppercase">
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-foreground font-display uppercase text-sm">{r.product}</p>
                    <p className="text-[10px] text-muted-foreground">{r.sku} · {r.batch}</p>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{r.location}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-foreground">{r.quantity} {r.unit}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityBadgeClasses(r.priority)}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadgeClasses(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] cursor-pointer shadow-none"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="bg-background border-l border-border shadow-none w-full max-w-xl h-full flex flex-col overflow-hidden text-foreground">
            <div className="px-6 py-5 border-b border-border flex items-start justify-between">
              <div>
                <span className="font-bold text-xs uppercase text-muted-foreground block">{selected.id} · {selected.type}</span>
                <h2 className="text-xl font-display font-bold uppercase text-foreground mt-1">{selected.product}</h2>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <span className="text-muted-foreground uppercase text-[10.5px] font-bold block">Justification</span>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{selected.reason}</p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Quantity:</span>
                  <strong className="text-foreground">{selected.quantity} {selected.unit}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Stock Value:</span>
                  <strong className="text-foreground">₹{selected.stockValue.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Location:</span>
                  <strong className="text-foreground">{selected.location}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Due Date:</span>
                  <strong className="text-foreground">{selected.dueDate}</strong>
                </div>
              </div>

              {selected.status === "Pending" && (
                <div className="p-4 rounded-2xl bg-primary text-primary-foreground border border-[#2F4156] flex items-center justify-between">
                  <span className="font-bold uppercase">Ready for approval</span>
                  <button
                    onClick={() => handleApprove(selected.id)}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold uppercase hover:bg-[#567C8D] cursor-pointer"
                  >
                    Approve Now
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-bold text-xl uppercase text-foreground">Create Request</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Product</label>
                <input
                  type="text"
                  defaultValue="Amul Taaza Milk 1L"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-sans text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Quantity</label>
                  <input
                    type="number"
                    defaultValue="25"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-mono text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Priority</label>
                  <select className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-mono text-xs outline-none">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const newReq: StaffRequest = {
                    id: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                    type: "Stock Adjustment",
                    product: "Amul Taaza Milk 1L",
                    sku: "MLK-AMUL-1L",
                    batch: "MILK-0042",
                    quantity: 25,
                    unit: "Pcs",
                    currentStock: 45,
                    stockValue: 1050,
                    expiry: "18 Aug 2026",
                    daysLeft: 2,
                    requestedBy: "Operations Staff (You)",
                    department: "Warehouse",
                    location: "Central Warehouse",
                    date: "15 Aug 2026",
                    dueDate: "18 Aug 2026",
                    priority: "Normal",
                    status: "Pending",
                    reason: "Inbound adjustment request.",
                    isMyRequest: true,
                    history: [{ id: `h-${Date.now()}`, time: "Just now", action: "Created" }],
                  };
                  setRequests((prev) => [newReq, ...prev]);
                  setCreateOpen(false);
                  showToast(`Request ${newReq.id} created.`);
                }}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none active:scale-95"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
