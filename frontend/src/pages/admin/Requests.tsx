import { useState, useMemo, useEffect } from "react";
import {
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Zap,
  X,
  Plus,
} from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";
import { MASTER_PRODUCTS } from "@/data/mockInventory";
import {
  INITIAL_REQUESTS,
  generateRequestsCSV,
} from "@/data/mockRequests";
import type {
  OperationRequest,
  RequestType,
  RequestStatus,
  RequestPriority,
  TimelineEvent,
} from "@/data/mockRequests";

const PAGE_SIZE = 8;
const MOCK_TODAY = "15 Aug 2026";
const STORAGE_KEY = "ern_admin_operation_requests";

const PRODUCT_BATCHES_MAP: Record<string, string[]> = {
  "prod-1": ["MLK-042", "MLK-043", "AML-TZ-804"],
  "prod-2": ["BRD-048", "BRD-049", "BRD-WW-201"],
  "prod-3": ["JUC-078", "JUC-079", "TRP-OJ-102"],
  "prod-4": ["MED-902", "MED-904", "CIP-PCM-500"],
  "prod-5": ["DAH-091", "AML-DH-302"],
  "prod-6": ["LAY-201", "LAY-CS-901"],
};

const LOCATIONS = [
  "Central Warehouse",
  "Store A",
  "Store B",
  "Distribution Center",
];

const REQUEST_TYPES: RequestType[] = [
  "Clearance",
  "Redistribution",
  "FEFO Dispatch",
  "Critical Expiry Intervention",
  "Stock Adjustment",
  "Procurement",
];

const PRIORITY_BADGE_STYLE: Record<RequestPriority, string> = {
  Critical: "bg-primary text-primary-foreground font-bold",
  High: "bg-destructive text-destructive-foreground font-bold",
  Medium: "bg-secondary text-foreground font-bold",
  Low: "bg-secondary text-muted-foreground font-bold",
};

const STATUS_BADGE_STYLE: Record<RequestStatus, { bg: string; text: string; dot: string }> = {
  Draft: { bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-[#757C5D]" },
  "Pending Review": { bg: "bg-destructive", text: "text-primary-foreground font-bold", dot: "bg-card" },
  Approved: { bg: "bg-accent", text: "text-accent-foreground font-bold", dot: "bg-card" },
  Rejected: { bg: "bg-[#2F4156]", text: "text-primary-foreground font-bold", dot: "bg-card" },
  Assigned: { bg: "bg-secondary", text: "text-foreground font-bold", dot: "bg-[#2F4156]" },
  "In Progress": { bg: "bg-[#698E79]", text: "text-primary-foreground font-bold", dot: "bg-card" },
  Completed: { bg: "bg-accent", text: "text-accent-foreground font-bold", dot: "bg-card" },
  Cancelled: { bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-[#757C5D]" },
};

const TAB_OPTIONS = [
  "All Requests",
  "Pending Approvals",
  "Clearance",
  "Redistribution",
  "FEFO Dispatches",
  "My Assigned",
];

function loadStoredRequests(): OperationRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load requests from localStorage:", e);
  }
  return INITIAL_REQUESTS;
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<OperationRequest[]>(() => loadStoredRequests());
  const [selectedTab, setSelectedTab] = useState<string>("All Requests");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("All");
  const [page, setPage] = useState<number>(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeRequest, setActiveRequest] = useState<OperationRequest | null>(null);

  // Create Request Modal state
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [createType, setCreateType] = useState<RequestType>("Clearance");
  const [createProductId, setCreateProductId] = useState<string>("");
  const [createLocation, setCreateLocation] = useState<string>("Central Warehouse");
  const [createTargetLocation, setCreateTargetLocation] = useState<string>("Store A");
  const [createPriority, setCreatePriority] = useState<RequestPriority>("High");
  const [createQuantity, setCreateQuantity] = useState<number | string>(10);
  const [createBatchNo, setCreateBatchNo] = useState<string>("");
  const [createReason, setCreateReason] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Rejection Prompt state
  const [rejectPromptOpen, setRejectPromptOpen] = useState<boolean>(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>("");

  const [toast, setToast] = useState<string | null>(null);

  // Persist requests to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
      console.error("Failed to persist requests to localStorage:", e);
    }
  }, [requests]);

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
    const setLoc = new Set<string>(LOCATIONS);
    requests.forEach((r) => {
      if (r.inventoryContext?.location) setLoc.add(r.inventoryContext.location);
      if (r.executionDetails?.sourceLocation) setLoc.add(r.executionDetails.sourceLocation);
    });
    return Array.from(setLoc);
  }, [requests]);

  const selectedProduct = useMemo(() => {
    return MASTER_PRODUCTS.find((p) => p.id === createProductId);
  }, [createProductId]);

  const availableBatches = useMemo(() => {
    if (!createProductId) return [];
    return PRODUCT_BATCHES_MAP[createProductId] || [];
  }, [createProductId]);

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

  const openCreateModal = (type: RequestType = "Clearance") => {
    const defaultProd = MASTER_PRODUCTS[0];
    const prodId = String(defaultProd?.id || "");
    setCreateType(type);
    setCreateProductId(prodId);
    setCreateLocation("Central Warehouse");
    setCreateTargetLocation("Store A");
    setCreatePriority("High");
    setCreateQuantity(10);
    setCreateBatchNo(PRODUCT_BATCHES_MAP[prodId]?.[0] || "");
    setCreateReason("");
    setFormError(null);
    setCreateModalOpen(true);
  };

  const handleProductChange = (productId: string) => {
    setCreateProductId(productId);
    const batches = PRODUCT_BATCHES_MAP[productId] || [];
    setCreateBatchNo(batches.length > 0 ? batches[0] : "");
  };

  const handleCreateRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!createProductId || !selectedProduct) {
      setFormError("Please select a product/item from inventory.");
      return;
    }

    if (!createLocation) {
      setFormError("Please select an origin location.");
      return;
    }

    const qty = parseInt(String(createQuantity), 10);
    if (isNaN(qty) || qty <= 0) {
      setFormError("Quantity must be a valid number greater than 0.");
      return;
    }

    if (createType === "Redistribution") {
      if (!createTargetLocation) {
        setFormError("Destination location is required for Redistribution requests.");
        return;
      }
      if (createLocation === createTargetLocation) {
        setFormError("Source and destination locations cannot be the same.");
        return;
      }
    }

    if (selectedProduct.expiryTrackingEnabled && !createBatchNo.trim()) {
      setFormError("Batch number is required for expiry-tracked products.");
      return;
    }

    if (!createReason.trim()) {
      setFormError("Please provide an operational reason or explanation.");
      return;
    }

    // Generate unique ID in the format REQ-2026-XXX
    const existingNumbers = requests
      .map((r) => {
        const match = r.id.match(/REQ-2026-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 43;
    const newId = `REQ-2026-${String(nextNum).padStart(3, "0")}`;

    const title =
      createType === "Redistribution"
        ? `Stock Transfer: ${selectedProduct.name}`
        : `${createType}: ${selectedProduct.name}`;

    const newReq: OperationRequest = {
      id: newId,
      type: createType,
      title,
      reason: createReason.trim(),
      priority: createPriority,
      status: "Pending Review",
      requestedBy: "Amit Sharma",
      requestedByRole: "Operations Admin",
      assignedTo: "Amit Sharma",
      assignedToRole: "Operations Admin",
      createdAt: `${MOCK_TODAY}, Just now`,
      dueDate: "22 Aug 2026",
      sourceModule: "Store Operations",
      inventoryContext: {
        productId: String(selectedProduct.id),
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        batchNo: createBatchNo.trim() || undefined,
        category: selectedProduct.category,
        brand: selectedProduct.brand,
        location: createLocation,
        quantity: qty,
        unit: selectedProduct.unit || "Pcs",
        unitPrice: selectedProduct.price || 0,
        stockValue: (selectedProduct.price || 0) * qty,
        expiryDate: selectedProduct.expiryTrackingEnabled ? "25 Aug 2026" : undefined,
        daysLeft: selectedProduct.expiryTrackingEnabled ? 10 : undefined,
        riskLevel: createPriority === "Critical" ? "Critical" : createPriority === "High" ? "High Risk" : "Safe",
      },
      executionDetails: {
        sourceLocation: createLocation,
        destinationLocation: createType === "Redistribution" ? createTargetLocation : undefined,
        transferQuantity: createType === "Redistribution" ? qty : undefined,
        clearanceQuantity: createType === "Clearance" ? qty : undefined,
        adjustmentQuantity: createType === "Stock Adjustment" ? qty : undefined,
        validityDate: "25 Aug 2026",
      },
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: `${MOCK_TODAY}, Just now`,
          author: "Amit Sharma",
          authorRole: "Operations Admin",
          title: "Request Created",
          description: createReason.trim(),
          type: "created",
        },
      ],
    };

    setRequests((prev) => [newReq, ...prev]);
    showToast("Request created successfully");
    setCreateModalOpen(false);
    setPage(1);

    // Reset form state
    setCreateReason("");
    setFormError(null);
  };

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

  const handleExportCSV = () => {
    const dataToExport =
      selectedIds.length > 0
        ? requests.filter((r) => selectedIds.includes(r.id))
        : filteredRequests.length > 0
        ? filteredRequests
        : requests;
    const csv = generateRequestsCSV(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ERN_Stock_Requests_${MOCK_TODAY.replace(/ /g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${dataToExport.length} requests to CSV.`);
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

  return (
    <div className="w-full space-y-6 pb-24 text-foreground font-body">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-lg text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-primary shrink-0" />
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
            onClick={() => openCreateModal("Clearance")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all shadow-none cursor-pointer active:scale-95"
          >
            <Plus className="size-4" />
            <span>Create Request</span>
          </button>
          <button
            onClick={handleExportCSV}
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

      {/* Tab Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs no-scrollbar">
        {TAB_OPTIONS.map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { setSelectedTab(tab); setPage(1); }}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-card text-foreground border border-border hover:bg-secondary hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          );
        })}
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
              <option value="Low">Low</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
            >
              <option value="All">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-pointer font-bold uppercase"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
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
                onClick={handleExportCSV}
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
                    aria-label="Select all rows on page"
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
                        aria-label={`Select request ${req.id}`}
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
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${PRIORITY_BADGE_STYLE[req.priority]}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${STATUS_BADGE_STYLE[req.status]?.bg} ${STATUS_BADGE_STYLE[req.status]?.text}`}>
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
              {paginatedRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground font-body">
                    No requests match your selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
          <div>
            Showing{" "}
            <span className="font-bold text-foreground">
              {filteredRequests.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {Math.min(page * PAGE_SIZE, filteredRequests.length)}
            </span>{" "}
            of <span className="font-bold text-foreground">{filteredRequests.length}</span> requests
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-3 py-1 font-bold text-foreground bg-secondary/50 rounded-md">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Request Modal */}
      {createModalOpen && (
        <div
          onClick={() => setCreateModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-foreground animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-border flex items-start justify-between shrink-0 bg-secondary/30">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-medium uppercase mb-1.5">
                  <span>OPERATIONS WORKFLOW</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold uppercase text-foreground leading-tight">
                  Create Stock Request
                </h2>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  Draft an inventory clearance, redistribution, or intervention request.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-3 mx-5 sm:mx-6 mt-4 rounded-xl bg-destructive/15 border border-destructive text-destructive font-mono text-xs flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span className="font-bold">{formError}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleCreateRequestSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Request Type */}
                <div>
                  <label className="text-muted-foreground font-bold text-[11px] uppercase block mb-1.5">
                    Request Type *
                  </label>
                  <select
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as RequestType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary cursor-pointer font-bold"
                  >
                    {REQUEST_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Priority */}
                <div>
                  <label className="text-muted-foreground font-bold text-[11px] uppercase block mb-1.5">
                    Priority Level *
                  </label>
                  <select
                    value={createPriority}
                    onChange={(e) => setCreatePriority(e.target.value as RequestPriority)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary cursor-pointer font-bold"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* 3. Product / Item */}
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground font-bold text-[11px] uppercase block mb-1.5">
                    Inventory Product / Item *
                  </label>
                  <select
                    value={createProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary cursor-pointer font-bold"
                  >
                    <option value="">Select a product from inventory...</option>
                    {MASTER_PRODUCTS.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.sku ? `[${prod.sku}] ` : ""}{prod.name} ({prod.category})
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <div className="mt-2 p-2.5 rounded-lg bg-secondary/50 border border-border text-[11px] flex flex-wrap items-center justify-between gap-2 text-muted-foreground">
                      <span>Brand: <strong className="text-foreground">{selectedProduct.brand}</strong></span>
                      <span>Unit: <strong className="text-foreground">{selectedProduct.unit}</strong></span>
                      <span>Price: <strong className="text-foreground">₹{selectedProduct.price}</strong></span>
                      <span>
                        Tracking: <strong className={selectedProduct.expiryTrackingEnabled ? "text-primary" : "text-muted-foreground"}>
                          {selectedProduct.expiryTrackingEnabled ? "Expiry Tracked" : "Standard Non-expiry"}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Origin Location */}
                <div>
                  <label className="text-muted-foreground font-bold text-[11px] uppercase block mb-1.5">
                    Origin Location *
                  </label>
                  <select
                    value={createLocation}
                    onChange={(e) => setCreateLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary cursor-pointer font-bold"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Destination / Target Location (Conditional for Redistribution) */}
                {createType === "Redistribution" ? (
                  <div>
                    <label className="text-muted-foreground font-bold text-[11px] uppercase block mb-1.5">
                      Destination Location *
                    </label>
                    <select
                      value={createTargetLocation}
                      onChange={(e) => setCreateTargetLocation(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary cursor-pointer font-bold"
                    >
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc} disabled={loc === createLocation}>
                          {loc} {loc === createLocation ? "(Source)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-muted-foreground font-bold text-[11px] uppercase block mb-1.5">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={createQuantity}
                      onChange={(e) => setCreateQuantity(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary font-bold"
                    />
                  </div>
                )}

                {/* If Redistribution, place Quantity below */}
                {createType === "Redistribution" && (
                  <div>
                    <label className="text-muted-foreground font-bold text-[11px] uppercase block mb-1.5">
                      Transfer Quantity *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={createQuantity}
                      onChange={(e) => setCreateQuantity(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary font-bold"
                    />
                  </div>
                )}

                {/* 6. Batch (if expiry tracked or applicable) */}
                <div>
                  <label className="text-muted-foreground font-bold text-[11px] uppercase block mb-1.5">
                    Batch Number {selectedProduct?.expiryTrackingEnabled ? "*" : "(Optional)"}
                  </label>
                  {availableBatches.length > 0 ? (
                    <select
                      value={createBatchNo}
                      onChange={(e) => setCreateBatchNo(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary cursor-pointer font-bold"
                    >
                      <option value="">Select an active batch...</option>
                      {availableBatches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={createBatchNo}
                      onChange={(e) => setCreateBatchNo(e.target.value)}
                      placeholder={selectedProduct?.expiryTrackingEnabled ? "e.g. LOT-2026-A" : "Not batch tracked"}
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary font-bold"
                    />
                  )}
                </div>

                {/* 7. Reason / Operational Notes */}
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground font-bold text-[11px] uppercase block mb-1.5">
                    Operational Reason & Notes *
                  </label>
                  <textarea
                    rows={3}
                    value={createReason}
                    onChange={(e) => setCreateReason(e.target.value)}
                    placeholder="Describe the operational trigger, urgency, batch status, or justification for this workflow request..."
                    className="w-full p-3 rounded-xl bg-background border border-border text-foreground font-body text-xs focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-border flex items-center justify-end gap-3 shrink-0 bg-secondary/20">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-mono text-xs uppercase font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRequestSubmit}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-mono text-xs uppercase font-bold hover:bg-[#567C8D] cursor-pointer transition-all shadow-none active:scale-95"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {rejectPromptOpen && activeRequest && (
        <div
          onClick={() => setRejectPromptOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl p-6 shadow-2xl w-full max-w-md text-foreground space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold uppercase text-foreground">Reject Request</h3>
              <button
                onClick={() => setRejectPromptOpen(false)}
                className="p-1 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Please specify the operational reason for rejecting request <strong className="text-foreground">{activeRequest.id}</strong>.
            </p>
            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="Operational review deemed intervention unnecessary."
              className="w-full p-3 rounded-xl bg-background border border-border text-foreground font-body text-xs focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectPromptOpen(false)}
                className="px-4 py-2 rounded-full bg-secondary text-foreground font-bold uppercase hover:bg-secondary/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(activeRequest.id, rejectionReasonInput)}
                className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-bold uppercase hover:bg-destructive/80 cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {activeRequest && (
        <div
          onClick={() => setActiveRequest(null)}
          className="fixed inset-0 z-50 flex items-center justify-end bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border-l border-border shadow-none w-full max-w-xl h-full flex flex-col overflow-hidden text-foreground cursor-default"
          >
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
                aria-label="Close drawer"
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

              {/* Status & Priority Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${PRIORITY_BADGE_STYLE[activeRequest.priority]}`}>
                  Priority: {activeRequest.priority}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${STATUS_BADGE_STYLE[activeRequest.status]?.bg} ${STATUS_BADGE_STYLE[activeRequest.status]?.text}`}>
                  Status: {activeRequest.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-bold uppercase border border-border">
                  Type: {activeRequest.type}
                </span>
              </div>

              {/* Item Snapshot */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-3">
                <span className="text-foreground uppercase text-xs block font-bold">Item & Location Telemetry</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground font-bold block text-[10.5px] uppercase">Product:</span>
                    <strong className="text-foreground uppercase font-display block mt-0.5">
                      {activeRequest.inventoryContext?.productName || activeRequest.title}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-bold block text-[10.5px] uppercase">SKU:</span>
                    <strong className="text-foreground font-mono block mt-0.5">
                      {activeRequest.inventoryContext?.sku || activeRequest.inventoryContext?.productId || "SKU-N/A"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-bold block text-[10.5px] uppercase">Origin Location:</span>
                    <strong className="text-foreground block mt-0.5">
                      {activeRequest.inventoryContext?.location || activeRequest.executionDetails?.sourceLocation || "Central Warehouse"}
                    </strong>
                  </div>
                  {activeRequest.executionDetails?.destinationLocation && (
                    <div>
                      <span className="text-muted-foreground font-bold block text-[10.5px] uppercase">Destination Location:</span>
                      <strong className="text-foreground block mt-0.5 text-primary font-bold">
                        {activeRequest.executionDetails.destinationLocation}
                      </strong>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground font-bold block text-[10.5px] uppercase">Quantity:</span>
                    <strong className="text-foreground block mt-0.5">
                      {activeRequest.inventoryContext ? `${activeRequest.inventoryContext.quantity} ${activeRequest.inventoryContext.unit}` : "Standard batch"}
                    </strong>
                  </div>
                  {activeRequest.inventoryContext?.batchNo && (
                    <div>
                      <span className="text-muted-foreground font-bold block text-[10.5px] uppercase">Batch No:</span>
                      <strong className="text-foreground font-mono block mt-0.5">
                        {activeRequest.inventoryContext.batchNo}
                      </strong>
                    </div>
                  )}
                  {activeRequest.requestedBy && (
                    <div>
                      <span className="text-muted-foreground font-bold block text-[10.5px] uppercase">Requested By:</span>
                      <strong className="text-foreground block mt-0.5">
                        {activeRequest.requestedBy} ({activeRequest.requestedByRole})
                      </strong>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground font-bold block text-[10.5px] uppercase">Created Date:</span>
                    <strong className="text-foreground block mt-0.5">
                      {activeRequest.createdAt}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Operational Reason / Details */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <span className="text-muted-foreground uppercase text-[10.5px] block font-bold">Operational Context & Reason:</span>
                <p className="font-body text-xs text-foreground leading-relaxed">{activeRequest.reason}</p>
              </div>

              {/* Timeline */}
              {activeRequest.timeline && activeRequest.timeline.length > 0 && (
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2.5">
                  <span className="text-muted-foreground uppercase text-[10.5px] block font-bold">Audit Timeline:</span>
                  <div className="space-y-2">
                    {activeRequest.timeline.map((evt) => (
                      <div key={evt.id} className="text-[11px] border-l-2 border-primary pl-2.5 py-0.5">
                        <div className="flex items-center justify-between text-muted-foreground font-mono">
                          <span className="font-bold text-foreground">{evt.title}</span>
                          <span>{evt.timestamp}</span>
                        </div>
                        <p className="font-body text-foreground mt-0.5">{evt.description}</p>
                        <span className="text-[10px] text-muted-foreground">by {evt.author} ({evt.authorRole})</span>
                      </div>
                    ))}
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
