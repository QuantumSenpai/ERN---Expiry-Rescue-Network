import { useState, useMemo } from "react";
import {
  Building2,
  Store,
  Warehouse,
  Boxes,
  Truck,
  Plus,
  Search,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  X,
  Phone,
  History,
  HeartPulse,
  Edit2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AnimatedNumber from "@/components/AnimatedNumber";
import TransferReviewModal from "@/components/TransferReviewModal";

export type LocationType = "Store" | "Warehouse" | "Distribution Center" | "Facility";
export type LocationStatus = "Active" | "Inactive" | "Pending Setup";

export interface OrgLocation {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  manager: string;
  managerEmail: string;
  address: string;
  city: string;
  region: string;
  country: string;
  phone?: string;
  status: LocationStatus;
  totalProducts: number;
  expiryTracked: number;
  nonExpiry: number;
  expiryRiskCount: number;
  needsAttention: number;
  inventoryValue: number;
  assignedUsersCount: number;
  lastUpdated: string;
  expiryBreakdown: {
    critical: number;
    high: number;
    medium: number;
    safe: number;
  };
  recentActivity?: {
    action: string;
    time: string;
  }[];
}

const INITIAL_LOCATIONS: OrgLocation[] = [
  {
    id: "loc-1",
    code: "WH-001",
    name: "Central Warehouse",
    type: "Warehouse",
    manager: "Krishnendu Adak",
    managerEmail: "krishnendu@ern-network.com",
    address: "Plot 44, Industrial Logistics Zone, Sector 62",
    city: "Noida",
    region: "NCR / Uttar Pradesh",
    country: "India",
    phone: "+91 120 456 7890",
    status: "Active",
    totalProducts: 498,
    expiryTracked: 132,
    nonExpiry: 366,
    expiryRiskCount: 42,
    needsAttention: 12,
    inventoryValue: 542000,
    assignedUsersCount: 6,
    lastUpdated: "2 min ago",
    expiryBreakdown: {
      critical: 3,
      high: 12,
      medium: 27,
      safe: 90,
    },
    recentActivity: [
      { action: "248 products bulk imported into central inventory", time: "Today · 11:42 AM" },
      { action: "Dispatched 20 units stock transfer to Store B", time: "Today · 10:18 AM" },
    ],
  },
  {
    id: "loc-2",
    code: "STR-001",
    name: "Store A (Metro)",
    type: "Store",
    manager: "Priya Sharma",
    managerEmail: "priya.s@greenleaf.com",
    address: "100 Feet Road, HAL 2nd Stage, Indiranagar",
    city: "Bengaluru",
    region: "Karnataka",
    country: "India",
    phone: "+91 80 2345 6789",
    status: "Active",
    totalProducts: 342,
    expiryTracked: 88,
    nonExpiry: 254,
    expiryRiskCount: 18,
    needsAttention: 4,
    inventoryValue: 318000,
    assignedUsersCount: 5,
    lastUpdated: "15 min ago",
    expiryBreakdown: {
      critical: 2,
      high: 6,
      medium: 10,
      safe: 70,
    },
    recentActivity: [
      { action: "Reconciled morning dairy expiry sweep", time: "Today · 09:30 AM" },
    ],
  },
  {
    id: "loc-3",
    code: "STR-002",
    name: "Store B (Express)",
    type: "Store",
    manager: "Vikram Patel",
    managerEmail: "vikram.p@greenleaf.com",
    address: "80 Feet Main Road, 4th Block, Koramangala",
    city: "Bengaluru",
    region: "Karnataka",
    country: "India",
    phone: "+91 80 9876 5432",
    status: "Active",
    totalProducts: 268,
    expiryTracked: 74,
    nonExpiry: 194,
    expiryRiskCount: 16,
    needsAttention: 3,
    inventoryValue: 245000,
    assignedUsersCount: 4,
    lastUpdated: "35 min ago",
    expiryBreakdown: {
      critical: 1,
      high: 5,
      medium: 10,
      safe: 58,
    },
    recentActivity: [
      { action: "Created clearance batch for whole wheat bread", time: "Today · 10:45 AM" },
    ],
  },
  {
    id: "loc-4",
    code: "DC-001",
    name: "Distribution Center",
    type: "Distribution Center",
    manager: "Rajesh Nair",
    managerEmail: "rajesh.nair@outlook.com",
    address: "National Highway 48, Logistics Corridor, Nelamangala",
    city: "Bengaluru",
    region: "Karnataka",
    country: "India",
    phone: "+91 80 5555 1234",
    status: "Active",
    totalProducts: 140,
    expiryTracked: 32,
    nonExpiry: 108,
    expiryRiskCount: 6,
    needsAttention: 2,
    inventoryValue: 128000,
    assignedUsersCount: 3,
    lastUpdated: "1 hour ago",
    expiryBreakdown: {
      critical: 0,
      high: 2,
      medium: 4,
      safe: 26,
    },
    recentActivity: [
      { action: "Completed inter-warehouse freight inbound check", time: "Today · 08:15 AM" },
    ],
  },
];

const MANAGERS_LIST = [
  { name: "Krishnendu Adak", email: "krishnendu@ern-network.com" },
  { name: "Priya Sharma", email: "priya.s@greenleaf.com" },
  { name: "Vikram Patel", email: "vikram.p@greenleaf.com" },
  { name: "Rajesh Nair", email: "rajesh.nair@outlook.com" },
  { name: "Ananya Roy", email: "ananya.roy@greenleaf.com" },
];

export default function Locations() {
  const navigate = useNavigate();

  const [locationsList, setLocationsList] = useState<OrgLocation[]>(INITIAL_LOCATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [sortField, setSortField] = useState<keyof OrgLocation>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const [selectedLocation, setSelectedLocation] = useState<OrgLocation | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    variant: "danger" | "primary";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    actionLabel: "",
    variant: "primary",
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "Store" as LocationType,
    manager: "Ananya Roy",
    address: "",
    city: "",
    region: "",
    country: "India",
    phone: "",
    status: "Active" as LocationStatus,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalLocations = locationsList.length;
  const activeLocations = locationsList.filter((l) => l.status === "Active").length;
  const storeCount = locationsList.filter((l) => l.type === "Store").length;
  const warehouseCount = locationsList.filter((l) => l.type === "Warehouse").length;
  const dcCount = locationsList.filter((l) => l.type === "Distribution Center").length;

  const isFiltered = searchQuery.trim() !== "" || typeFilter !== "All" || statusFilter !== "All";

  const filteredLocations = useMemo(() => {
    return locationsList
      .filter((loc) => {
        if (typeFilter !== "All" && loc.type !== typeFilter) return false;
        if (statusFilter !== "All" && loc.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            loc.name.toLowerCase().includes(q) ||
            loc.code.toLowerCase().includes(q) ||
            loc.manager.toLowerCase().includes(q) ||
            loc.city.toLowerCase().includes(q) ||
            loc.address.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = (a[sortField] ?? "").toString().toLowerCase();
        const valB = (b[sortField] ?? "").toString().toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [locationsList, typeFilter, statusFilter, searchQuery, sortField, sortAsc]);

  const handleSort = (field: keyof OrgLocation) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  const handleOpenDetail = (loc: OrgLocation) => {
    setSelectedLocation(loc);
    setIsDetailDrawerOpen(true);
  };

  const handleOpenEdit = (loc: OrgLocation) => {
    setSelectedLocation(loc);
    setFormData({
      name: loc.name,
      code: loc.code,
      type: loc.type,
      manager: loc.manager,
      address: loc.address,
      city: loc.city,
      region: loc.region,
      country: loc.country,
      phone: loc.phone || "",
      status: loc.status,
    });
    setIsEditLocationModalOpen(true);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const codeTrim = formData.code.trim().toUpperCase();

    if (locationsList.some((l) => l.code.toUpperCase() === codeTrim)) {
      showToast("Validation Error: Location code already exists.");
      return;
    }

    const selectedMgr = MANAGERS_LIST.find((m) => m.name === formData.manager) || MANAGERS_LIST[0];

    const newLoc: OrgLocation = {
      id: `loc-${Date.now()}`,
      code: codeTrim,
      name: formData.name.trim(),
      type: formData.type,
      manager: selectedMgr.name,
      managerEmail: selectedMgr.email,
      address: formData.address.trim(),
      city: formData.city.trim(),
      region: formData.region.trim(),
      country: formData.country.trim(),
      phone: formData.phone.trim() || undefined,
      status: formData.status,
      totalProducts: 0,
      expiryTracked: 0,
      nonExpiry: 0,
      expiryRiskCount: 0,
      needsAttention: 0,
      inventoryValue: 0,
      assignedUsersCount: 1,
      lastUpdated: "Just now",
      expiryBreakdown: { critical: 0, high: 0, medium: 0, safe: 0 },
      recentActivity: [{ action: "Facility registered in ERN workspace", time: "Just now" }],
    };

    setLocationsList((prev) => [...prev, newLoc]);
    setIsAddLocationModalOpen(false);
    showToast(`Location ${newLoc.name} (${newLoc.code}) created successfully.`);
  };

  const handleSaveLocationEdit = () => {
    if (!selectedLocation) return;
    const selectedMgr = MANAGERS_LIST.find((m) => m.name === formData.manager) || MANAGERS_LIST[0];

    setLocationsList((prev) =>
      prev.map((l) =>
        l.id === selectedLocation.id
          ? {
              ...l,
              name: formData.name,
              type: formData.type,
              manager: selectedMgr.name,
              managerEmail: selectedMgr.email,
              address: formData.address,
              city: formData.city,
              region: formData.region,
              country: formData.country,
              phone: formData.phone,
              status: formData.status,
              lastUpdated: "Just now",
            }
          : l
      )
    );

    if (selectedLocation) {
      setSelectedLocation({
        ...selectedLocation,
        name: formData.name,
        type: formData.type,
        manager: selectedMgr.name,
        managerEmail: selectedMgr.email,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        country: formData.country,
        phone: formData.phone,
        status: formData.status,
        lastUpdated: "Just now",
      });
    }

    setIsEditLocationModalOpen(false);
    showToast(`Location ${formData.name} updated successfully.`);
  };

  const handleConfirmDeactivate = (loc: OrgLocation) => {
    setConfirmDialog({
      isOpen: true,
      title: `Deactivate ${loc.name}?`,
      message: `This location currently contains ${loc.totalProducts} products and ${loc.assignedUsersCount} assigned users.`,
      actionLabel: "Deactivate Location",
      variant: "danger",
      onConfirm: () => {
        setLocationsList((prev) =>
          prev.map((l) => (l.id === loc.id ? { ...l, status: "Inactive" } : l))
        );
        if (selectedLocation?.id === loc.id) {
          setSelectedLocation({ ...selectedLocation, status: "Inactive" });
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`Location ${loc.name} deactivated.`);
      },
    });
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Code,Name,Type,Manager,Address,City,Region,Status,Total Products,Expiry Tracked,Non Expiry,Inventory Value"]
        .concat(
          filteredLocations.map(
            (l) =>
              `"${l.code}","${l.name}","${l.type}","${l.manager}","${l.address}","${l.city}","${l.region}","${l.status}",${l.totalProducts},${l.expiryTracked},${l.nonExpiry},${l.inventoryValue}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ern_locations_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredLocations.length} locations to CSV.`);
  };

  return (
    <div className="space-y-6 max-w-[1400px] pb-24 text-foreground font-body">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>FACILITY NETWORK</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            LOCATIONS & FACILITIES
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Manage stores, warehouses, distribution centers, and regional hubs.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap font-mono">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-bold uppercase px-4 py-2.5 rounded-lg bg-card hover:bg-background border border-border text-foreground transition-all cursor-pointer shadow-none"
            title="Export manifest"
          >
            <Download className="size-3.5 text-foreground" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                name: "",
                code: `FAC-00${locationsList.length + 1}`,
                type: "Store",
                manager: "Ananya Roy",
                address: "",
                city: "",
                region: "",
                country: "India",
                phone: "",
                status: "Active",
              });
              setIsAddLocationModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs font-bold uppercase px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all shadow-none cursor-pointer active:scale-95"
          >
            <Plus className="size-4" />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-mono">
        <div
          onClick={() => {
            setTypeFilter("All");
            setStatusFilter("All");
            showToast("Showing all locations");
          }}
          className={`p-5 rounded-[24px] bg-background border border-border hover:border-primary cursor-pointer shadow-none flex flex-col justify-between transition-all ern-card-glow ${
  typeFilter === "All" && statusFilter === "All" ? "border-[#2F4156]" : ""
}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Total Nodes</span>
            <Building2 className="size-4 text-foreground" />
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={totalLocations} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Operated sites</p>
        </div>

        <div
          onClick={() => {
            setStatusFilter("Active");
            showToast("Filtered active facilities");
          }}
          className={`p-5 rounded-[24px] bg-background border border-border hover:border-primary cursor-pointer shadow-none flex flex-col justify-between transition-all ern-card-glow ${
  statusFilter === "Active" ? "border-[#2F4156]" : ""
}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Active</span>
            <CheckCircle2 className="size-4 text-foreground" />
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={activeLocations} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Operational</p>
        </div>

        <div
          onClick={() => {
            setTypeFilter("Store");
            showToast("Filtered Stores");
          }}
          className={`p-5 rounded-[24px] bg-background border border-border hover:border-primary cursor-pointer shadow-none flex flex-col justify-between transition-all ern-card-glow ${
  typeFilter === "Store" ? "border-[#2F4156]" : ""
}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Stores</span>
            <Store className="size-4 text-foreground" />
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={storeCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Retail aisles</p>
        </div>

        <div
          onClick={() => {
            setTypeFilter("Warehouse");
            showToast("Filtered Warehouses");
          }}
          className={`p-5 rounded-[24px] bg-background border border-border hover:border-primary cursor-pointer shadow-none flex flex-col justify-between transition-all ern-card-glow ${
  typeFilter === "Warehouse" ? "border-[#2F4156]" : ""
}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Warehouses</span>
            <Warehouse className="size-4 text-foreground" />
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={warehouseCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Central hubs</p>
        </div>

        <div
          onClick={() => {
            setTypeFilter("Distribution Center");
            showToast("Filtered DCs");
          }}
          className={`p-5 rounded-[24px] bg-background border border-border hover:border-primary cursor-pointer shadow-none flex flex-col justify-between transition-all col-span-2 sm:col-span-1 ern-card-glow ${
  typeFilter === "Distribution Center" ? "border-[#2F4156]" : ""
}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Logistics DCs</span>
            <Truck className="size-4 text-foreground" />
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={dcCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Regional hubs</p>
        </div>
      </div>

      {/* Redistribution Strip */}
      <div className="grid lg:grid-cols-3 gap-4 font-mono">
        <div className="lg:col-span-2 p-5 rounded-[24px] bg-background border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none ern-card-glow transition-colors duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase">
            <Boxes className="size-4 text-foreground" />
            <span>Operations Radar:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => navigate("/admin/inventory")}
              className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-bold flex items-center gap-1.5 cursor-pointer shadow-none"
            >
              <span className="size-1.5 rounded-full bg-primary-foreground" />
              <span>21 attention items</span>
            </button>

            <button
              onClick={() => navigate("/admin/inventory")}
              className="px-3 py-1 rounded-full bg-secondary border border-border text-foreground font-bold flex items-center gap-1.5 cursor-pointer shadow-none"
            >
              <span>6 expiry risk lots</span>
            </button>
          </div>
        </div>

        <div
          onClick={() => setTransferModalOpen(true)}
          className="p-5 rounded-[24px] bg-background border border-border hover:border-primary transition-all cursor-pointer shadow-none flex items-center justify-between group ern-card-glow"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Truck className="size-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-foreground">Redistribution</p>
              <p className="text-xs font-bold text-foreground font-display uppercase mt-0.5">Transfer Lots</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-foreground uppercase">Review →</span>
        </div>
      </div>
      {/* Toolbar */}
      <div className={`p-5 rounded-[24px] bg-background border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] cursor-pointer shadow-none flex flex-col justify-between transition-all duration-200 ern-card-glow ${
  statusFilter === "Active" ? "border-[#2F4156]" : ""
}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations by name, code, manager, or address..."
              className="w-full bg-card border border-border rounded-full pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <span className="text-muted-foreground uppercase">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Store">Store</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Distribution Center">Distribution Center</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
              <span className="text-muted-foreground uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 rounded-full text-xs font-mono uppercase font-bold text-foreground hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Locations Table */}
      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono transition-colors duration-200 ern-card-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="py-4 px-5 cursor-pointer hover:text-foreground font-bold uppercase min-w-[300px] group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Location & Code</span>
                    {sortField === "name" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("type")}
                  className="py-4 px-4 cursor-pointer hover:text-foreground font-bold uppercase group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Type</span>
                    {sortField === "type" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("manager")}
                  className="py-4 px-4 cursor-pointer hover:text-foreground font-bold uppercase group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Manager</span>
                    {sortField === "manager" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("totalProducts")}
                  className="py-4 px-4 cursor-pointer hover:text-foreground font-bold uppercase group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Inventory</span>
                    {sortField === "totalProducts" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("expiryRiskCount")}
                  className="py-4 px-4 cursor-pointer hover:text-foreground font-bold uppercase group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Units</span>
                    {sortField === "expiryRiskCount" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("status")}
                  className="py-4 px-4 cursor-pointer hover:text-foreground font-bold uppercase group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === "status" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th className="py-4 px-5 text-right font-bold uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <tr
                    key={loc.id}
                    onClick={() => handleOpenDetail(loc)}
                    className="hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-5 min-w-[300px]">
                      <div className="flex items-center gap-3.5">
                        <div className="size-9 rounded-full bg-card border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                          {loc.type === "Warehouse" ? (
                            <Warehouse className="size-4" />
                          ) : (
                            <Store className="size-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold font-display uppercase text-foreground text-sm whitespace-nowrap">
                              {loc.name}
                            </p>
                            <span className="px-2 py-0.5 rounded-full bg-card text-[10px] font-mono font-bold text-foreground border border-border">
                              {loc.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {loc.city}, {loc.region}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-card border border-border text-foreground">
                        {loc.type}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-foreground text-xs font-sans">{loc.manager}</p>
                      <p className="text-[10.5px] text-muted-foreground font-mono">{loc.managerEmail}</p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-foreground text-xs">{loc.totalProducts} SKUs</p>
                      <p className="text-[10.5px] text-muted-foreground">{loc.expiryTracked} tracked</p>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          loc.expiryRiskCount > 10
                            ? "bg-primary text-primary-foreground"
                            : loc.expiryRiskCount > 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {loc.expiryRiskCount} at risk
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          loc.status === "Active"
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {loc.status}
                      </span>
                    </td>

                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="py-4 px-5 text-right"
                    >
                      <button
                        onClick={() => handleOpenDetail(loc)}
                        title={`View details for ${loc.name}`}
                        aria-label={`View details for ${loc.name}`}
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs uppercase font-bold hover:bg-[#567C8D] transition-all cursor-pointer shadow-none"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground font-mono text-xs">
                    No facilities match filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Location Modal */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-card border border-border rounded-[24px] sm:rounded-[32px] p-7 shadow-none space-y-5 text-foreground font-mono text-xs">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Register Facility</h3>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  Add a store, warehouse, or regional depot.
                </p>
              </div>
              <button
                onClick={() => setIsAddLocationModalOpen(false)}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground uppercase block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Store C"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground uppercase block mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="STR-003"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-card border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground uppercase block mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LocationType })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  >
                    <option value="Store">Store</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Distribution Center">Distribution Center</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase block mb-1">Manager</label>
                  <select
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  >
                    {MANAGERS_LIST.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground uppercase block mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street & Area"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground uppercase block mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground uppercase block mb-1">Region / State</label>
                  <input
                    type="text"
                    required
                    placeholder="Karnataka"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddLocationModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs uppercase font-bold hover:bg-[#567C8D]"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      <TransferReviewModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onConfirmTransfer={(data) => {
          showToast(`Transfer order initiated: ${data.product} (${data.qty} units)`);
        }}
      />

      {/* Location Detail Modal */}
      {isDetailDrawerOpen && selectedLocation && (
        <div
          onClick={() => setIsDetailDrawerOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in"
          role="dialog"
          aria-label={`Location details for ${selectedLocation.name}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 shadow-none text-foreground space-y-5 ern-card-glow max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-foreground shrink-0">
                  {selectedLocation.type === "Warehouse" ? (
                    <Warehouse className="size-5" />
                  ) : (
                    <Store className="size-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-xl uppercase text-foreground">
                      {selectedLocation.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary text-[10px] font-mono font-bold text-foreground border border-border">
                      {selectedLocation.code}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5">
                    {selectedLocation.address}, {selectedLocation.city}, {selectedLocation.region}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer transition-colors"
                aria-label="Close location detail modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground text-[10.5px] uppercase font-bold block">Type</span>
                <span className="font-bold text-foreground text-sm uppercase mt-0.5 block">{selectedLocation.type}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground text-[10.5px] uppercase font-bold block">Status</span>
                <span className="font-bold text-foreground text-sm uppercase mt-0.5 block">{selectedLocation.status}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground text-[10.5px] uppercase font-bold block">Manager</span>
                <span className="font-bold text-foreground text-sm uppercase mt-0.5 block truncate">{selectedLocation.manager}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground text-[10.5px] uppercase font-bold block">Staff</span>
                <span className="font-bold text-foreground text-sm uppercase mt-0.5 block">{selectedLocation.assignedUsersCount} Members</span>
              </div>
            </div>

            {/* Inventory & Expiry Metrics */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3">
              <span className="font-bold uppercase text-foreground text-xs block">Inventory & Expiry Snapshot</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <span className="text-muted-foreground text-[10.5px] block">Total Stock:</span>
                  <strong className="text-foreground text-sm">{selectedLocation.totalProducts} SKUs</strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10.5px] block">Inventory Value:</span>
                  <strong className="text-foreground text-sm">₹{selectedLocation.inventoryValue.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10.5px] block">Capacity Used:</span>
                  <strong className="text-foreground text-sm">
                    {Math.min(100, Math.round((selectedLocation.totalProducts / (selectedLocation.type === "Warehouse" ? 800 : 500)) * 100))}%
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10.5px] block">Tracked Perishables:</span>
                  <strong className="text-foreground text-sm">{selectedLocation.expiryTracked} SKUs</strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10.5px] block">Expiry Risk Lots:</span>
                  <strong className="text-destructive text-sm">{selectedLocation.expiryRiskCount} Lots</strong>
                </div>
              </div>

              {/* Expiry Breakdown Bar */}
              {selectedLocation.expiryBreakdown && (
                <div className="pt-2 border-t border-border space-y-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Perishable Horizon Breakdown</span>
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-bold">
                      Critical: {selectedLocation.expiryBreakdown.critical}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                      High: {selectedLocation.expiryBreakdown.high}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground font-bold">
                      Medium: {selectedLocation.expiryBreakdown.medium}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                      Safe: {selectedLocation.expiryBreakdown.safe}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Manager Contact & Location Meta */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2">
              <span className="font-bold uppercase text-foreground text-xs block">Site Contact & Telemetry</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10.5px]">Manager Email:</span>
                  <span className="text-foreground font-bold">{selectedLocation.managerEmail}</span>
                </div>
                {selectedLocation.phone && (
                  <div>
                    <span className="text-muted-foreground block text-[10.5px]">Facility Phone:</span>
                    <span className="text-foreground font-bold">{selectedLocation.phone}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground block text-[10.5px]">Last Reconciled:</span>
                  <span className="text-foreground font-bold">{selectedLocation.lastUpdated}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10.5px]">Country / Region:</span>
                  <span className="text-foreground font-bold">{selectedLocation.country} · {selectedLocation.region}</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  handleOpenEdit(selectedLocation);
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer transition-colors"
              >
                Edit Facility
              </button>
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-primary/90 cursor-pointer shadow-none transition-colors"
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
