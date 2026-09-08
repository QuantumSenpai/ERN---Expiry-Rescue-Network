import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ChevronDown,
  SlidersHorizontal,
  ArrowRightLeft,
  Barcode,
  X,
  Package,
} from "lucide-react";
import { useLiveInventory } from "@/lib/inventoryStore";
import type { InventoryItem, ExpiryStatus } from "@/types/inventory";
import ProductDetailModal from "@/components/ProductDetailModal";

const PAGE_SIZE = 8;

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

const STOCK_STATUS_STYLE: Record<string, string> = {
  "In Stock": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold",
  "Low Stock": "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold",
  "Out of Stock": "bg-destructive/15 text-destructive dark:text-rose-300 border border-destructive/30 font-bold",
  "Reserved": "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-bold",
  "In Transit": "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold",
};

const getStockBadgeStyle = (status: string) => {
  return (
    STOCK_STATUS_STYLE[status] ||
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold"
  );
};

const EXPIRY_STATUS_STYLE: Record<ExpiryStatus, string> = {
  Safe: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold",
  Warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold",
  "High Risk": "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30 font-bold",
  Critical: "bg-destructive/15 text-destructive dark:text-rose-300 border border-destructive/30 font-bold",
  Expired: "bg-muted text-muted-foreground font-bold",
  "Not Applicable": "bg-card text-muted-foreground font-medium border border-border",
};

const AVAILABLE_LOCATIONS = [
  "All Locations",
  "Main Branch",
  "City Center",
  "North Outlet",
  "East Wing Express",
];

export default function RetailerInventory() {
  const location = useLocation();
  const { inventory: items, addStock, adjustStock, transferStock } = useLiveInventory();
  const [activeTab, setActiveTab] = useState<InventoryFilterTab>(() => {
    const params = new URLSearchParams(location.search);
    const f = params.get("filter");
    if (
      f &&
      [
        "all",
        "expiry-tracked",
        "non-expiry",
        "in-stock",
        "low-stock",
        "out-of-stock",
        "expiring-soon",
        "critical",
      ].includes(f)
    ) {
      return f as InventoryFilterTab;
    }
    return "all";
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const f = params.get("filter");
    if (
      f &&
      [
        "all",
        "critical",
        "low-stock",
        "healthy",
        "dairy",
        "bakery",
        "meat",
        "produce",
      ].includes(f)
    ) {
      queueMicrotask(() => {
        setActiveTab(f as InventoryFilterTab);
      });
    }
  }, [location.search]);

  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Stock Count Modal state
  const [addStockProductId, setAddStockProductId] = useState<string>("");
  const [addStockLocation, setAddStockLocation] = useState<string>("Main Branch");
  const [addStockBatch, setAddStockBatch] = useState<string>("");
  const [addStockQty, setAddStockQty] = useState<number>(50);
  const [addStockExpiry, setAddStockExpiry] = useState<string>(() =>
    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [addStockCost, setAddStockCost] = useState<string>("");
  const [addStockError, setAddStockError] = useState<string>("");

  // Adjust Stock Modal state
  const [adjustProductId, setAdjustProductId] = useState<string>("");
  const [adjustLocation, setAdjustLocation] = useState<string>("Main Branch");
  const [adjustType, setAdjustType] = useState<"Add" | "Remove" | "Correction">("Add");
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>("Physical audit count");
  const [adjustError, setAdjustError] = useState<string>("");

  // Transfer Stock Modal state
  const [transferSource, setTransferSource] = useState<string>("Main Branch");
  const [transferDest, setTransferDest] = useState<string>("City Center");
  const [transferProductId, setTransferProductId] = useState<string>("");
  const [transferQty, setTransferQty] = useState<number>(10);
  const [transferError, setTransferError] = useState<string>("");

  // Barcode scan state
  const [barcodeInput, setBarcodeInput] = useState("8901030700032");

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isTransferStockOpen, setIsTransferStockOpen] = useState(false);
  const [isBarcodeScanOpen, setIsBarcodeScanOpen] = useState(false);
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
        item.store.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        selectedLocation.toLowerCase().includes(item.store.toLowerCase());

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
    setAddStockError("");
    const targetId = addStockProductId || (items[0]?.id ?? "");
    const target = items.find((i) => String(i.id) === String(targetId) || i.productId === targetId);
    if (!target) {
      setAddStockError("Please select a valid product.");
      return;
    }
    if (addStockQty <= 0) {
      setAddStockError("Quantity must be greater than 0.");
      return;
    }
    if (target.expiryTrackingEnabled && !addStockBatch.trim()) {
      setAddStockError("Batch number is required for expiry-tracked items.");
      return;
    }

    addStock({
      store: addStockLocation,
      productId: String(target.productId || target.id),
      name: target.name,
      brand: target.brand,
      category: target.category,
      quantity: addStockQty,
      batchNo: addStockBatch.trim() || undefined,
      expiryDate: target.expiryTrackingEnabled ? addStockExpiry : undefined,
      unitPrice: addStockCost ? parseFloat(addStockCost) : target.unitPrice,
      unit: target.unit,
    });

    setIsAddStockOpen(false);
    showToast(`Stock updated: +${addStockQty} units added to ${addStockLocation}.`);
    setAddStockQty(50);
    setAddStockBatch("");
    setAddStockError("");
  };

  const handleAdjustStock = () => {
    setAdjustError("");
    const targetId = adjustProductId || (items[0]?.id ?? "");
    const target = items.find((i) => String(i.id) === String(targetId) || String(i.productId) === String(targetId));
    if (!target) {
      setAdjustError("Please select a valid product.");
      return;
    }
    if (adjustQty <= 0) {
      setAdjustError("Adjustment quantity must be greater than 0.");
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustError("Reason for adjustment is required.");
      return;
    }

    const res = adjustStock({
      productId: String(target.productId || target.id),
      store: target.store || adjustLocation,
      batchNo: target.batchNo,
      adjustmentType: adjustType,
      quantity: adjustQty,
      reason: adjustReason.trim(),
    });

    if (res.success) {
      showToast(res.message);
      setIsAdjustStockOpen(false);
      setAdjustError("");
    } else {
      setAdjustError(res.message);
    }
  };

  const handleTransferStock = () => {
    setTransferError("");
    if (transferSource === transferDest) {
      setTransferError("Source and destination facilities cannot be the same.");
      return;
    }
    const targetId = transferProductId || (items[0]?.id ?? "");
    const target = items.find(
      (i) =>
        (String(i.id) === String(targetId) || String(i.productId) === String(targetId)) &&
        (i.store.toLowerCase().includes(transferSource.toLowerCase()) ||
          transferSource.toLowerCase().includes(i.store.toLowerCase()))
    ) || items.find((i) => String(i.id) === String(targetId) || String(i.productId) === String(targetId));

    if (!target) {
      setTransferError("Please select a product with available stock in the source location.");
      return;
    }
    if (transferQty <= 0) {
      setTransferError("Transfer quantity must be greater than 0.");
      return;
    }
    if (transferQty > target.quantity) {
      setTransferError(`Transfer quantity exceeds available stock (${target.quantity} ${target.unit}).`);
      return;
    }

    const res = transferStock({
      sourceStore: transferSource,
      destinationStore: transferDest,
      productId: String(target.productId || target.id),
      batchNo: target.batchNo,
      quantity: transferQty,
    });

    if (res.success) {
      showToast(res.message);
      setIsTransferStockOpen(false);
      setTransferError("");
    } else {
      setTransferError(res.message);
    }
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
                  to={location.pathname.startsWith("/admin") ? "/admin/add-product" : "/retailer/add-product"}
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
                <th className="px-4 py-3.5 font-bold uppercase text-center whitespace-nowrap min-w-[120px]">Stock Status</th>
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
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${getStockBadgeStyle(
                          item.stockStatus
                        )}`}
                      >
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
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center gap-1 ${EXPIRY_STATUS_STYLE[item.expiryStatus]}`}>
                          {item.daysRemaining !== undefined ? `${item.daysRemaining}D LEFT` : item.expiryStatus}
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
      {/* Add Stock Count Modal */}
      {isAddStockOpen && (() => {
        const selectedProd = items.find((i) => String(i.id) === String(addStockProductId || items[0]?.id));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 shadow-none text-foreground space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Add Stock Count</h3>
                <button
                  type="button"
                  onClick={() => setIsAddStockOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {addStockError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
                  {addStockError}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Product *</label>
                  <select
                    value={addStockProductId || String(items[0]?.id ?? "")}
                    onChange={(e) => setAddStockProductId(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={String(i.id)}>
                        {i.name} ({i.sku}) — Current: {i.quantity} {i.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">Facility / Location *</label>
                    <select
                      value={addStockLocation}
                      onChange={(e) => setAddStockLocation(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    >
                      {AVAILABLE_LOCATIONS.filter((l) => l !== "All Locations").map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">Quantity to Ingest *</label>
                    <input
                      type="number"
                      value={addStockQty}
                      onChange={(e) => setAddStockQty(Math.max(1, Number(e.target.value)))}
                      min={1}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">
                      Batch Number {selectedProd?.expiryTrackingEnabled ? "*" : "(Optional)"}
                    </label>
                    <input
                      type="text"
                      placeholder={selectedProd?.expiryTrackingEnabled ? "e.g. LOT-2026-X9" : "e.g. BATCH-01"}
                      value={addStockBatch}
                      onChange={(e) => setAddStockBatch(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">Unit Cost (₹)</label>
                    <input
                      type="number"
                      placeholder={selectedProd ? String(selectedProd.unitPrice) : "100"}
                      value={addStockCost}
                      onChange={(e) => setAddStockCost(e.target.value)}
                      min={1}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {selectedProd?.expiryTrackingEnabled && (
                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      value={addStockExpiry}
                      onChange={(e) => setAddStockExpiry(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
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
        );
      })()}

      {/* Adjust Stock Modal */}
      {isAdjustStockOpen && (() => {
        const selectedProd = items.find((i) => String(i.id) === String(adjustProductId || items[0]?.id));
        const currentQty = selectedProd?.quantity || 0;
        const currentUnit = selectedProd?.unit || "Pcs";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 shadow-none text-foreground space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-foreground">Adjust Stock</h3>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Reconcile inventory discrepancies, record shrink, or correct inventory counts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdjustStockOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {adjustError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
                  {adjustError}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Target Product *</label>
                  <select
                    value={adjustProductId || String(items[0]?.id ?? "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAdjustProductId(val);
                      const sel = items.find((i) => String(i.id) === val || String(i.productId) === val);
                      if (sel?.store) {
                        setAdjustLocation(sel.store);
                      }
                    }}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={String(i.id)}>
                        {i.name} ({i.store}) — Available: {i.quantity} {i.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between">
                  <span className="text-muted-foreground uppercase font-bold">Current Recorded Stock:</span>
                  <span className="font-bold text-foreground text-sm">
                    {currentQty} {currentUnit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">Location *</label>
                    <select
                      value={adjustLocation}
                      onChange={(e) => setAdjustLocation(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    >
                      {AVAILABLE_LOCATIONS.filter((l) => l !== "All Locations").map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">Adjustment Type *</label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value as "Add" | "Remove" | "Correction")}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary font-bold"
                    >
                      <option value="Add">+ Add Stock (Inflow / Found)</option>
                      <option value="Remove">- Remove Stock (Damage / Expiry / Loss)</option>
                      <option value="Correction">= Absolute Count (Audit Override)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    {adjustType === "Correction" ? "New Total Count *" : "Units to Adjust *"}
                  </label>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                    min={1}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  />
                  {adjustType === "Remove" && (
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Maximum allowable reduction: {currentQty} units.
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Reason for Adjustment *</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Physical stock take discrepancy, broken packaging..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAdjustStockOpen(false)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdjustStock}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none"
                >
                  Confirm Adjustment
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Transfer Stock Modal */}
      {isTransferStockOpen && (() => {
        const sourceProducts = items.filter(
          (i) =>
            i.quantity > 0 &&
            (i.store.toLowerCase().includes(transferSource.toLowerCase()) ||
              transferSource.toLowerCase().includes(i.store.toLowerCase()))
        );
        const effectiveProdList = sourceProducts.length > 0 ? sourceProducts : items.filter((i) => i.quantity > 0);
        const selectedProd = effectiveProdList.find((i) => String(i.id) === String(transferProductId || effectiveProdList[0]?.id));
        const availQty = selectedProd?.quantity || 0;
        const currentUnit = selectedProd?.unit || "Pcs";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 shadow-none text-foreground space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-foreground">Transfer Stock</h3>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Move stock across network facilities while maintaining lot traceability.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTransferStockOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {transferError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
                  {transferError}
                </div>
              )}

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">Source Facility *</label>
                    <select
                      value={transferSource}
                      onChange={(e) => setTransferSource(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    >
                      {AVAILABLE_LOCATIONS.filter((l) => l !== "All Locations").map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">Destination Facility *</label>
                    <select
                      value={transferDest}
                      onChange={(e) => setTransferDest(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    >
                      {AVAILABLE_LOCATIONS.filter((l) => l !== "All Locations").map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Product to Transfer *</label>
                  <select
                    value={transferProductId || String(effectiveProdList[0]?.id ?? "")}
                    onChange={(e) => setTransferProductId(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  >
                    {effectiveProdList.map((i) => (
                      <option key={i.id} value={String(i.id)}>
                        {i.name} — In Stock: {i.quantity} {i.unit} (Batch: {i.batchNo || "Standard"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between">
                  <span className="text-muted-foreground uppercase font-bold">Source Stock Available:</span>
                  <span className="font-bold text-foreground text-sm">
                    {availQty} {currentUnit}
                  </span>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Transfer Quantity *</label>
                  <input
                    type="number"
                    value={transferQty}
                    onChange={(e) => setTransferQty(Math.max(1, Number(e.target.value)))}
                    min={1}
                    max={availQty || 1}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Available: {availQty} {currentUnit}. Preserves batch number and expiration date across nodes.
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsTransferStockOpen(false)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTransferStock}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none"
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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