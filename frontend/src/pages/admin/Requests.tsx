import { useState, useMemo } from "react";
import {
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Percent,
  Download,
  Settings2,
  Zap,
  ArrowRightLeft,
  Package,
  Brain,
  ArrowRight,
  X,
  Check,
  Truck,
  SlidersHorizontal,
  Plus,
  CheckSquare,
  Square,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";
import ProductDetailModal from "@/components/ProductDetailModal";
import { MASTER_PRODUCTS, MASTER_INVENTORY } from "@/data/mockInventory";
import {
  INITIAL_REQUESTS,
  ASSIGNEES,
  generateRequestsCSV,
} from "@/data/mockRequests";
import type {
  OperationRequest,
  RequestType,
  RequestStatus,
  RequestPriority,
  TimelineEvent,
} from "@/data/mockRequests";
import type { Product, InventoryItem } from "@/types/inventory";

const PAGE_SIZE = 8;
const MOCK_TODAY = "15 Aug 2026";

const PRIORITY_BADGE_STYLE: Record<RequestPriority, string> = {
  Critical: "bg-primary text-primary-foreground font-bold",
  High: "bg-destructive text-destructive-foreground font-bold",
  Medium: "bg-secondary text-foreground font-bold",
  Low: "bg-secondary text-muted-foreground font-bold",
};

const STATUS_BADGE_STYLE: Record<RequestStatus, { bg: string; text: string; dot: string }> = {
  Draft: { bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-[#757C5D]" },
  "Pending Review": { bg: "bg-destructive", text: "text-primary-foreground font-bold", dot: "bg-card" },
  Approved: { bg: "bg-accent", text: "text-foreground font-bold", dot: "bg-[#2F4156]" },
  Rejected: { bg: "bg-[#2F4156]", text: "text-primary-foreground font-bold", dot: "bg-card" },
  Assigned: { bg: "bg-secondary", text: "text-foreground font-bold", dot: "bg-[#2F4156]" },
  "In Progress": { bg: "bg-[#698E79]", text: "text-primary-foreground font-bold", dot: "bg-card" },
  Completed: { bg: "bg-accent", text: "text-foreground font-bold", dot: "bg-[#2F4156]" },
  Cancelled: { bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-[#757C5D]" },
};

const TYPE_CONFIG: Record<RequestType, { icon: typeof Percent; color: string; bg: string }> = {
  Clearance: { icon: Percent, color: "text-primary-foreground", bg: "bg-[#2F4156]" },
  Redistribution: { icon: ArrowRightLeft, color: "text-foreground", bg: "bg-secondary" },
  "FEFO Dispatch": { icon: Zap, color: "text-foreground", bg: "bg-accent" },
  "Stock Adjustment": { icon: SlidersHorizontal, color: "text-foreground", bg: "bg-secondary" },
  Procurement: { icon: Truck, color: "text-primary-foreground", bg: "bg-[#2F4156]" },
  "Critical Expiry Intervention": { icon: ShieldAlert, color: "text-primary-foreground", bg: "bg-[#2F4156]" },
  "Operational Support": { icon: Package, color: "text-foreground", bg: "bg-secondary" },
};

const TAB_OPTIONS = [
  "All Requests",
  "Pending Approvals",
  "Clearance",
  "Redistribution",
  "FEFO Dispatches",
  "My Assigned",
];

export default function AdminRequests() {
  const [requests, setRequests] = useState<OperationRequest[]>(INITIAL_REQUESTS);
  const [selectedTab, setSelectedTab] = useState<string>("All Requests");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("All");
  const [page, setPage] = useState<number>(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeRequest, setActiveRequest] = useState<OperationRequest | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [createModalInitialType, setCreateModalInitialType] = useState<RequestType>("Clearance");
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [rejectPromptOpen, setRejectPromptOpen] = useState<boolean>(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>("");
  const [changePromptOpen, setChangePromptOpen] = useState<boolean>(false);
  const [changeCommentInput, setChangeCommentInput] = useState<string>("");

  const [detailProduct, setDetailProduct] = useState<Product | InventoryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending Review").length;
  const inProgressCount = requests.filter((r) => r.status === "In Progress" || r.status === "Assigned").length;
  const urgentCount = requests.filter((r) => r.priority === "Critical" && r.status !== "Completed" && r.status !== "Rejected").length;
  const completedCount = requests.filter((r) => r.status === "Completed").length;

  const locations = useMemo(() => {
    const setLoc = new Set<string>();
    requests.forEach((r) => {
      if (r.inventoryContext?.location) setLoc.add(r.inventoryContext.location);
      if (r.executionDetails?.sourceLocation) setLoc.add(r.executionDetails.sourceLocation);
    });
    return Array.from(setLoc);
  }, [requests]);

  const urgentRequests = useMemo(() => {
    return requests.filter(
      (r) =>
        r.priority === "Critical" &&
        r.status !== "Completed" &&
        r.status !== "Rejected" &&
        r.status !== "Cancelled"
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (selectedTab === "Pending Approvals" && req.status !== "Pending Review") return false;
      if (selectedTab === "Clearance" && req.type !== "Clearance") return false;
      if (selectedTab === "Redistribution" && req.type !== "Redistribution") return false;
      if (selectedTab === "FEFO Dispatches" && req.type !== "FEFO Dispatch") return false;
      if (selectedTab === "My Assigned" && req.assignedTo !== "Amit Sharma") return false;

      if (statusFilter !== "All" && req.status !== statusFilter) return false;
      if (priorityFilter !== "All" && req.priority !== priorityFilter) return false;
      if (locationFilter !== "All") {
        const reqLoc = req.inventoryContext?.location || req.executionDetails?.sourceLocation;
        if (reqLoc !== locationFilter) return false;
      }
      if (assigneeFilter !== "All" && req.assignedTo !== assigneeFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = req.id.toLowerCase().includes(q);
        const matchTitle = req.title.toLowerCase().includes(q);
        const matchProd = req.inventoryContext?.productName.toLowerCase().includes(q);
        const matchSku = req.inventoryContext?.sku.toLowerCase().includes(q);
        const matchAssignee = req.assignedTo.toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchProd && !matchSku && !matchAssignee) return false;
      }

      return true;
    });
  }, [requests, selectedTab, statusFilter, priorityFilter, locationFilter, assigneeFilter, search]);

  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, page]);

  const handleApprove = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          const newEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            timestamp: `${MOCK_TODAY}, Just now`,
            author: "Amit Sharma",
            authorRole: "Operations Admin",
            title: "Request Approved",
            description: "Approved for immediate execution.",
            type: "approved",
          };
          const updated: OperationRequest = {
            ...r,
            status: "Approved",
            timeline: [...r.timeline, newEvent],
          };
          if (activeRequest?.id === reqId) setActiveRequest(updated);
          return updated;
        }
        return r;
      })
    );
    showToast(`Request ${reqId} approved.`);
  };

  const handleReject = (reqId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          const newEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            timestamp: `${MOCK_TODAY}, Just now`,
            author: "Amit Sharma",
            authorRole: "Operations Admin",
            title: "Request Rejected",
            description: `Reason: ${reason || "Operational review deemed intervention unnecessary."}`,
            type: "rejected",
          };
          const updated: OperationRequest = {
            ...r,
            status: "Rejected",
            rejectionReason: reason,
            timeline: [...r.timeline, newEvent],
          };
          if (activeRequest?.id === reqId) setActiveRequest(updated);
          return updated;
        }
        return r;
      })
    );
    setRejectPromptOpen(false);
    setRejectionReasonInput("");
    showToast(`Request ${reqId} rejected.`);
  };

  const handleStatusTransition = (reqId: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          const newEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            timestamp: `${MOCK_TODAY}, Just now`,
            author: "Amit Sharma",
            authorRole: "Operations Admin",
            title: `Status Changed to ${newStatus}`,
            description: `Operational state updated to ${newStatus}.`,
            type: "status_change",
          };
          const updated: OperationRequest = {
            ...r,
            status: newStatus,
            timeline: [...r.timeline, newEvent],
          };
          if (activeRequest?.id === reqId) setActiveRequest(updated);
          return updated;
        }
        return r;
      })
    );
    showToast(`Request ${reqId} marked as ${newStatus}.`);
  };

  const handleReassign = (reqId: string, newAssigneeName: string) => {
    const assigneeObj = ASSIGNEES.find((a) => a.name === newAssigneeName);
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          const newEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            timestamp: `${MOCK_TODAY}, Just now`,
            author: "Amit Sharma",
            authorRole: "Operations Admin",
            title: `Reassigned to ${newAssigneeName}`,
            description: `Assigned to ${newAssigneeName} (${assigneeObj?.role || "Staff"}).`,
            type: "assigned",
          };
          const updated: OperationRequest = {
            ...r,
            assignedTo: newAssigneeName,
            assignedToRole: assigneeObj?.role || "Staff",
            status: r.status === "Pending Review" ? "Assigned" : r.status,
            timeline: [...r.timeline, newEvent],
          };
          if (activeRequest?.id === reqId) setActiveRequest(updated);
          return updated;
        }
        return r;
      })
    );
    showToast(`Request ${reqId} reassigned to ${newAssigneeName}.`);
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedRequests.map((r) => r.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds([...selectedIds, ...pageIds.filter((id) => !selectedIds.includes(id))]);
    }
  };

  const handleBulkApprove = () => {
    setRequests((prev) =>
      prev.map((r) => {
        if (selectedIds.includes(r.id) && r.status === "Pending Review") {
          return {
            ...r,
            status: "Approved",
            timeline: [
              ...r.timeline,
              {
                id: `tl-${Date.now()}-${r.id}`,
                timestamp: `${MOCK_TODAY}, Just now`,
                author: "Amit Sharma",
                authorRole: "Operations Admin",
                title: "Bulk Approved",
                description: "Approved via bulk review action.",
                type: "approved",
              },
            ],
          };
        }
        return r;
      })
    );
    showToast(`Bulk approved ${selectedIds.length} requests.`);
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const selectedRequests = requests.filter((r) => selectedIds.includes(r.id));
    const csv = generateRequestsCSV(selectedRequests.length > 0 ? selectedRequests : requests);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ERN_Selected_Requests_${MOCK_TODAY.replace(/ /g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${selectedRequests.length || requests.length} requests to CSV.`);
  };

  const resetFilters = () => {
    setSelectedTab("All Requests");
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setLocationFilter("All");
    setAssigneeFilter("All");
    setPage(1);
  };

  const openProductDetail = (productIdOrName: string) => {
    const prod =
      MASTER_PRODUCTS.find((p) => String(p.id) === productIdOrName || p.name.toLowerCase().includes(productIdOrName.toLowerCase())) ||
      MASTER_INVENTORY.find((i) => String(i.productId) === productIdOrName || i.name.toLowerCase().includes(productIdOrName.toLowerCase()));

    if (prod) {
      setDetailProduct(prod);
    } else {
      showToast(`Showing details for ${productIdOrName}.`);
    }
  };

  return (
    <div className="w-full space-y-6 pb-24 text-foreground font-body">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>OPERATIONS CONTROL</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            REQUESTS & WORKFLOWS
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Manage inventory actions, clearance approvals, expiry interventions, and stock transfers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase">
          <button
            onClick={() => {
              setCreateModalInitialType("Clearance");
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all shadow-none cursor-pointer active:scale-95"
          >
            <Plus className="size-4" />
            <span>Create Request</span>
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer shadow-none uppercase font-bold"
          >
            <Download className="size-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

     {/* Top 5 Stat / KPI Quick Filters */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-mono">
  <button
    onClick={() => { setStatusFilter("All"); setPriorityFilter("All"); setPage(1); }}
    className="text-left bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] p-5 shadow-none transition-all duration-200 cursor-pointer flex flex-col justify-between ern-card-glow"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase font-bold text-muted-foreground">Total Queue</span>
      <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
        <Inbox className="size-4" />
      </div>
    </div>
    <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
      <AnimatedNumber value={totalCount} />
    </p>
    <p className="text-[11px] text-muted-foreground font-body mt-0.5">All requests</p>
  </button>

  <button
    onClick={() => { setStatusFilter("Pending Review"); setPriorityFilter("All"); setPage(1); }}
    className="text-left bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] p-5 shadow-none transition-all duration-200 cursor-pointer flex flex-col justify-between ern-card-glow"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase font-bold text-muted-foreground">Pending</span>
      <div className="size-8 rounded-full bg-secondary text-foreground flex items-center justify-center">
        <Clock className="size-4" />
      </div>
    </div>
    <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
      <AnimatedNumber value={pendingCount} />
    </p>
    <p className="text-[11px] text-muted-foreground font-body mt-0.5">Review required</p>
  </button>

  <button
    onClick={() => { setStatusFilter("In Progress"); setPriorityFilter("All"); setPage(1); }}
    className="text-left bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] p-5 shadow-none transition-all duration-200 cursor-pointer flex flex-col justify-between ern-card-glow"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase font-bold text-muted-foreground">In Flight</span>
      <div className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
        <Zap className="size-4" />
      </div>
    </div>
    <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
      <AnimatedNumber value={inProgressCount} />
    </p>
    <p className="text-[11px] text-muted-foreground font-body mt-0.5">Executing</p>
  </button>

  <button
    onClick={() => { setPriorityFilter("Critical"); setStatusFilter("All"); setPage(1); }}
    className="text-left bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] p-5 shadow-none transition-all duration-200 cursor-pointer flex flex-col justify-between ern-card-glow"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase font-bold text-muted-foreground">Critical</span>
      <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
        <ShieldAlert className="size-4" />
      </div>
    </div>
    <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
      <AnimatedNumber value={urgentCount} />
    </p>
    <p className="text-[11px] text-muted-foreground font-body mt-0.5">High urgency</p>
  </button>

  <button
    onClick={() => { setStatusFilter("Completed"); setPriorityFilter("All"); setPage(1); }}
    className="text-left bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] p-5 shadow-none transition-all duration-200 cursor-pointer col-span-2 sm:col-span-1 flex flex-col justify-between ern-card-glow"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase font-bold text-muted-foreground">Resolved</span>
      <div className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
        <CheckCircle2 className="size-4" />
      </div>
    </div>
    <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
      <AnimatedNumber value={completedCount} />
    </p>
    <p className="text-[11px] text-muted-foreground font-body mt-0.5">Fulfilled</p>
  </button>
</div>
      {/* Main Table Container */}
      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono transition-colors duration-200 ern-card-glow">
        {/* Filters Top Bar */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search request ID, item, SKU..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-pointer font-bold uppercase"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Bulk Bar */}
        {selectedIds.length > 0 && (
          <div className="px-5 py-3 bg-[#2F4156] border-b border-border flex flex-wrap items-center justify-between gap-3 text-primary-foreground">
            <span className="font-bold uppercase">
              {selectedIds.length} requests selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase hover:bg-[#bbf070] cursor-pointer"
              >
                Approve Selected
              </button>
              <button
                onClick={handleBulkExport}
                className="px-3.5 py-1.5 rounded-full bg-secondary text-foreground text-xs font-bold uppercase hover:bg-secondary/80 cursor-pointer"
              >
                Export
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-xs text-primary-foreground hover:underline uppercase font-bold"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">
                  <input
                    type="checkbox"
                    checked={paginatedRequests.length > 0 && paginatedRequests.every((r) => selectedIds.includes(r.id))}
                    onChange={handleSelectAllOnPage}
                    className="size-4 accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 font-bold uppercase">Request ID</th>
                <th className="px-4 py-3.5 font-bold uppercase">Type</th>
                <th className="px-4 py-3.5 font-bold uppercase">Item</th>
                <th className="px-4 py-3.5 font-bold uppercase">Location</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Priority</th>
                <th className="px-4 py-3.5 font-bold uppercase">Status</th>
                <th className="px-4 py-3.5 text-right font-bold uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {paginatedRequests.map((req) => {
                const isSelected = selectedIds.includes(req.id);
                return (
                  <tr
                    key={req.id}
                    onClick={() => setActiveRequest(req)}
                    className={`hover:bg-secondary/40 transition-colors cursor-pointer ${
                      isSelected ? "bg-secondary/50" : ""
                    }`}
                  >
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-3.5 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(req.id)}
                        className="size-4 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      {req.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-foreground text-[10.5px] font-bold uppercase">
                        {req.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground font-display uppercase text-sm">
                        {req.inventoryContext?.productName || req.title}
                      </p>
                      <p className="text-[10.5px] text-muted-foreground font-bold">
                        {req.inventoryContext?.sku || "General"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-bold">
                      {req.inventoryContext?.location || "Central Warehouse"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${PRIORITY_BADGE_STYLE[req.priority]}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGE_STYLE[req.status]?.bg} ${STATUS_BADGE_STYLE[req.status]?.text}`}>
                        {req.status}
                      </span>
                    </td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-3.5 text-right"
                    >
                      <button
                        onClick={() => setActiveRequest(req)}
                        className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] transition-all cursor-pointer shadow-none"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in duration-200">
          <div className="bg-card border-l border-border shadow-none w-full max-w-xl h-full flex flex-col overflow-hidden text-foreground">
            <div className="px-6 py-5 border-b border-border flex items-start justify-between">
              <div>
                <span className="font-bold text-xs uppercase text-muted-foreground block">
                  {activeRequest.id} · {activeRequest.type}
                </span>
                <h2 className="text-xl font-display font-bold uppercase text-foreground mt-1">{activeRequest.title}</h2>
              </div>
              <button
                onClick={() => setActiveRequest(null)}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {activeRequest.status === "Pending Review" && (
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-3">
                  <span className="font-bold uppercase text-foreground block">Approval Required</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(activeRequest.id)}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectPromptOpen(true)}
                      className="px-4 py-2 rounded-full bg-secondary border border-border text-foreground uppercase font-bold hover:bg-secondary/80 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <span className="text-muted-foreground uppercase text-[10.5px] block font-bold">Operational Context:</span>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{activeRequest.reason}</p>
              </div>

              {activeRequest.inventoryContext && (
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                  <span className="text-muted-foreground uppercase text-[10.5px] block font-bold">Item Snapshot:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground font-bold block">Product:</span>
                      <strong className="text-foreground uppercase font-display">{activeRequest.inventoryContext.productName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-bold block">Quantity:</span>
                      <strong className="text-foreground">{activeRequest.inventoryContext.quantity} {activeRequest.inventoryContext.unit}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setActiveRequest(null)}
                className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
