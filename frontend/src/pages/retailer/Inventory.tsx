import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Percent,
  ChevronDown,
  SlidersHorizontal,
  ArrowRightLeft,
  Upload,
  Barcode,
  CheckSquare,
  Square,
  X,
  Package,
  ExternalLink,
} from "lucide-react";
import { MASTER_INVENTORY } from "@/data/mockInventory";
import type { InventoryItem, StockStatus, ExpiryStatus } from "@/types/inventory";
import ProductDetailModal from "@/components/ProductDetailModal";

const PAGE_SIZE = 8;

const RECONCILED_INVENTORY: InventoryItem[] = [
  ...MASTER_INVENTORY.map((item, idx) => {
    const facilities = ["Central Warehouse", "Store A", "Store B", "Distribution Center"];
    const loc = facilities[idx % facilities.length];
    return {
      ...item,
      id: String(item.id),
      store: loc,
      expiryStatus: (item.expiryStatus || "Not Applicable") as ExpiryStatus,
    };
  }),
  {
    id: "inv-extra-1",
    productId: "prod-13",
    name: "CleanWave Industrial Floor Detergent 5L",
    sku: "DET-IND-5L",
    barcode: "8901234567890",
    category: "Hygiene",
    brand: "CleanPro",
    store: "Central Warehouse",
    quantity: 180,
    minStockLevel: 40,
    unit: "Pcs",
    unitPrice: 450,
    stockValue: 81000,
    stockStatus: "In Stock",
    expiryTrackingEnabled: false,
    expiryStatus: "Not Applicable",
    aisleLocation: "Rack D-12",
  },
  {
    id: "inv-extra-2",
    productId: "prod-14",
    name: "Royal Basmati Rice 10kg Premium",
    sku: "RICE-ROY-10KG",
    barcode: "8902345678901",
    category: "Grains & Staples",
    brand: "Metro Foods",
    store: "Store B",
    quantity: 12,
    minStockLevel: 25,
    unit: "Bags",
    unitPrice: 890,
    stockValue: 10680,
    stockStatus: "Low Stock",
    expiryTrackingEnabled: false,
    expiryStatus: "Not Applicable",
    aisleLocation: "Aisle 6, Grain Bay",
  },
  {
    id: "inv-extra-3",
    productId: "prod-15",
    name: "FarmFresh Pasteurized Paneer 200g",
    sku: "PNR-FF-200G",
    barcode: "8903456789012",
    category: "Dairy",
    brand: "Amul",
    store: "Store A",
    quantity: 35,
    minStockLevel: 20,
    unit: "Pcs",
    unitPrice: 95,
    stockValue: 3325,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "PNR-882",
    mfgDate: "08 Aug 2026",
    expiryDate: "18 Aug 2026",
    daysRemaining: 3,
    expiryStatus: "Critical",
    aisleLocation: "Chiller Bay 2",
  },
];

function getStockSplit(item: InventoryItem) {
  const reserved = Math.round(item.quantity * 0.15);
  const distributed = Math.round(item.quantity * 0.1);
  const available = Math.max(0, item.quantity - reserved - distributed);
  return { available, reserved, distributed };
}

type InventoryFilterTab =
  | "all"
  | "expiry-tracked"
  | "non-expiry"
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "expiring-soon"
  | "critical";

const STOCK_STATUS_STYLE: Record<StockStatus, string> = {
  "In Stock": "bg-primary text-primary-foreground font-bold",
  "Low Stock": "bg-primary text-primary-foreground border border-[#2F4156] font-bold",
  "Out of Stock": "bg-primary text-primary-foreground font-bold",
};

const EXPIRY_STATUS_STYLE: Record<ExpiryStatus, string> = {
  Safe: "bg-primary text-primary-foreground font-bold",
  Warning: "bg-primary text-primary-foreground border border-[#2F4156] font-bold",
  "High Risk": "bg-primary text-primary-foreground border border-[#2F4156] font-bold",
  Critical: "bg-primary text-primary-foreground font-bold",
  Expired: "bg-pewter text-primary-foreground font-bold",
  "Not Applicable": "bg-card text-muted-foreground font-medium",
};

const AVAILABLE_LOCATIONS = [
  "All Locations",
  "Central Warehouse",
  "Store A",
  "Store B",
  "Distribution Center",
];

export default function RetailerInventory() {
  const [items, setItems] = useState<InventoryItem[]>(RECONCILED_INVENTORY);
  const [activeTab, setActiveTab] = useState<InventoryFilterTab>("all");
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Stock modal form state
  const [addStockProductId, setAddStockProductId] = useState<string>("");
  const [addStockQty, setAddStockQty] = useState<number>(50);
  // Barcode scan state
  const [barcodeInput, setBarcodeInput] = useState("8901030700032");

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isTransferStockOpen, setIsTransferStockOpen] = useState(false);
  const [isBarcodeScanOpen, setIsBarcodeScanOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.barcode && item.barcode.includes(q)) ||
        item.category.toLowerCase().includes(q) ||
        (item.batchNo && item.batchNo.toLowerCase().includes(q));

      const matchesLoc =
        selectedLocation === "All Locations" ||
        item.store === selectedLocation;

      let matchesTab = true;
      if (activeTab === "expiry-tracked") matchesTab = item.expiryTrackingEnabled;
      else if (activeTab === "non-expiry") matchesTab = !item.expiryTrackingEnabled;
      else if (activeTab === "in-stock") matchesTab = item.stockStatus === "In Stock";
      else if (activeTab === "low-stock") matchesTab = item.stockStatus === "Low Stock";
      else if (activeTab === "out-of-stock") matchesTab = item.stockStatus === "Out of Stock";
      else if (activeTab === "expiring-soon")
        matchesTab =
          item.expiryTrackingEnabled &&
          (item.expiryStatus === "Warning" || item.expiryStatus === "High Risk");
      else if (activeTab === "critical")
        matchesTab = item.expiryTrackingEnabled && item.expiryStatus === "Critical";

      return matchesQuery && matchesLoc && matchesTab;
    });
  }, [items, search, selectedLocation, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((i) => String(i.id)));
    }
  };

  const handleToggleSelectRow = (id: string | number) => {
    const strId = String(id);
    if (selectedIds.includes(strId)) {
      setSelectedIds(selectedIds.filter((item) => item !== strId));
    } else {
      setSelectedIds([...selectedIds, strId]);
    }
  };

  const totalStockValue = items.reduce((acc, curr) => acc + curr.stockValue, 0);
  const totalQty = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const expiryTrackedCount = items.filter((i) => i.expiryTrackingEnabled).length;
  const nonExpiryCount = items.filter((i) => !i.expiryTrackingEnabled).length;
  const criticalCount = items.filter((i) => i.expiryStatus === "Critical").length;

  const handleCommitStock = () => {
    const targetId = addStockProductId || (items[0]?.id ?? "");
    setItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(targetId)
          ? {
              ...item,
              quantity: item.quantity + addStockQty,
              stockValue: (item.quantity + addStockQty) * item.unitPrice,
              stockStatus: "In Stock" as const,
            }
          : item
      )
    );
    setIsAddStockOpen(false);
    showToast(`Stock updated: +${addStockQty} units added.`);
    setAddStockQty(50);
  };

  const handleBarcodeIdentify = () => {
    const found = items.find((i) => i.barcode === barcodeInput || i.sku === barcodeInput);
    setIsBarcodeScanOpen(false);
    if (found) {
      showToast(`✓ Identified: ${found.name} (${found.sku})`);
    } else {
      showToast("Barcode not found in inventory.");
    }
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
            <span>STOCK OPERATIONS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            INVENTORY MANAGEMENT
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Unified inventory tracking for all goods across facilities with stock counts and expiry monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase relative">
          <button
            type="button"
            onClick={() => setIsBarcodeScanOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-card hover:bg-background border border-border text-foreground transition-all cursor-pointer shadow-none"
          >
            <Barcode className="size-4" />
            <span>Scan Barcode</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95"
            >
              <Plus className="size-4" />
              <span>Add / Manage Stock</span>
              <ChevronDown className="size-3.5" />
            </button>

            {isActionMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-[24px] p-2 shadow-none z-40 space-y-1 font-mono text-xs text-foreground animate-in fade-in">
                <Link
                  to="/retailer/add-product"
                  onClick={() => setIsActionMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <Plus className="size-3.5" />
                  <span>Add Product</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    setIsAddStockOpen(true);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <Package className="size-3.5" />
                  <span>Add Stock Count</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    setIsAdjustStockOpen(true);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="size-3.5" />
                  <span>Adjust Stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    setIsTransferStockOpen(true);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="size-3.5" />
                  <span>Transfer Stock</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-mono">
        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Total Value</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            ₹{(totalStockValue / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">All 4 facilities</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Total Units</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{totalQty}</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Active on bays</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Expiry-Tracked</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{expiryTrackedCount}</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Perishables</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">General Goods</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{nonExpiryCount}</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Non-perishable</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none col-span-2 sm:col-span-1 flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-foreground">Critical Expiry</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">{criticalCount}</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">≤ 7 days left</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono text-xs transition-colors duration-200 ern-card-glow">
        {/* Filters Top Bar */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { label: "All Items", value: "all" },
              { label: "Expiry Tracked", value: "expiry-tracked" },
              { label: "Non-Expiry", value: "non-expiry" },
              { label: "In Stock", value: "in-stock" },
              { label: "Low Stock", value: "low-stock" },
              { label: "Critical Expiry", value: "critical" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setActiveTab(t.value as InventoryFilterTab);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full font-bold uppercase transition-all cursor-pointer ${
                  activeTab === t.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-background"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products, SKUs..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-sans text-xs"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-full bg-card border border-border text-foreground font-mono text-xs focus:outline-none cursor-pointer"
            >
              {AVAILABLE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === paginated.length}
                    onChange={handleToggleSelectAll}
                    className="size-4 accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 font-bold uppercase">Product</th>
                <th className="px-4 py-3.5 font-bold uppercase">SKU / Batch</th>
                <th className="px-4 py-3.5 font-bold uppercase">Location</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Stock Status</th>
                <th className="px-4 py-3.5 font-bold uppercase text-right">Available</th>
                <th className="px-4 py-3.5 font-bold uppercase text-right">Reserved</th>
                <th className="px-4 py-3.5 font-bold uppercase text-right">Distributed</th>
                <th className="px-4 py-3.5 font-bold uppercase text-right">Stock Value</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Expiry</th>
                <th className="px-4 py-3.5 text-right font-bold uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {paginated.map((item) => {
                const isSelected = selectedIds.includes(String(item.id));
                const split = getStockSplit(item);
                return (
                  <tr key={item.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(item.id)}
                        className="size-4 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="font-bold text-foreground font-display uppercase text-sm hover:underline block text-left"
                      >
                        {item.name}
                      </button>
                      <p className="text-[10.5px] text-muted-foreground">
                        {item.brand} · {item.category}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-foreground">{item.sku}</span>
                      {item.batchNo && (
                        <span className="text-[10px] text-muted-foreground block">{item.batchNo}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{item.store}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${STOCK_STATUS_STYLE[item.stockStatus]}`}>
                        {item.stockStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">
                      {split.available} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right text-muted-foreground">
                      {split.reserved} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right text-muted-foreground">
                      {split.distributed} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">
                      ₹{item.stockValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.expiryTrackingEnabled ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${EXPIRY_STATUS_STYLE[item.expiryStatus]}`}>
                          {item.daysRemaining !== undefined ? `${item.daysRemaining}d left` : item.expiryStatus}
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] cursor-pointer shadow-none"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-card hover:bg-background disabled:opacity-40 text-foreground cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-card hover:bg-background disabled:opacity-40 text-foreground cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAddStockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4">
            <h3 className="font-display text-xl font-bold uppercase text-foreground">Add Stock Count</h3>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Product</label>
                <select
                  value={addStockProductId || String(items[0]?.id ?? "")}
                  onChange={(e) => setAddStockProductId(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none"
                >
                  {items.map((i) => (
                    <option key={i.id} value={String(i.id)}>{i.name} (Current: {i.quantity} {i.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Quantity to Add</label>
                <input
                  type="number"
                  value={addStockQty}
                  onChange={(e) => setAddStockQty(Math.max(1, Number(e.target.value)))}
                  min={1}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAddStockOpen(false)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitStock}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none"
              >
                Commit Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {isBarcodeScanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4">
            <h3 className="font-display text-xl font-bold uppercase text-foreground">Scan Barcode</h3>
            <input
              type="text"
              placeholder="Scan barcode or type SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
            />
            <p className="text-[10px] text-muted-foreground">Try: 8901030700032 (Amul Milk), 8901063312001 (Britannia Bread)</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsBarcodeScanOpen(false)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleBarcodeIdentify}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none"
              >
                Identify
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductDetailModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
      />
    </div>
  );
}