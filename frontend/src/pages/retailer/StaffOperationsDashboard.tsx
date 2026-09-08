import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Percent,
  ChevronRight,
  Barcode,
  Package,
  Plus,
  TrendingDown,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Inbox,
  X,
  Calendar,
  CheckCircle,
  Clock3,
} from "lucide-react";
import { MASTER_INVENTORY } from "@/data/mockInventory";
import type { InventoryItem } from "@/types/inventory";
import ProductDetailModal from "@/components/ProductDetailModal";

export default function StaffOperationsDashboard() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isBarcodeScanOpen, setIsBarcodeScanOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);

  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scanResult, setScanResult] = useState<InventoryItem | null>(null);

  const [receiveForm, setReceiveForm] = useState(() => ({
    productName: "Amul Taaza Homogenised Toned Milk 1L",
    sku: "MLK-AMUL-1L",
    batchNo: `BATCH-${Date.now().toString().slice(-4)}`,
    quantity: "50",
    location: "Central Warehouse",
    expiryDate: "2026-08-25",
    supplier: "Gujarat Cooperative Milk Federation",
  }));

  const [queueItems, setQueueItems] = useState([
    {
      id: "q-1",
      title: "Pending Stock Receiving",
      subtitle: "50 Cases Amul Milk & Dairy Dispatch (PO-8841)",
      location: "Dock 2 · Central Warehouse",
      priority: "High",
      time: "09:30 AM",
      actionText: "Receive Stock",
      actionType: "receive",
    },
    {
      id: "q-2",
      title: "Orders to Pick",
      subtitle: "Order #ERN-82802 · 6 rescue deal line items",
      location: "Aisle 4 · Store A",
      priority: "Urgent",
      time: "10:15 AM",
      actionText: "Pick Items",
      actionType: "pick",
    },
    {
      id: "q-3",
      title: "Orders to Pack & Seal",
      subtitle: "Order #ERN-10482 · 3 grocery batches",
      location: "Packing Station B",
      priority: "Normal",
      time: "11:00 AM",
      actionText: "Pack Order",
      actionType: "pack",
    },
    {
      id: "q-4",
      title: "Orders Ready for Dispatch",
      subtitle: "Order #ERN-79104 · Assigned to BlueDart Fleet",
      location: "Outbound Bay 1",
      priority: "Normal",
      time: "12:30 PM",
      actionText: "Dispatch",
      actionType: "dispatch",
    },
  ]);

  const handleQueueAction = (id: string, actionType: string) => {
    setQueueItems((prev) => prev.filter((item) => item.id !== id));
    showToast(`Task marked completed: ${actionType.toUpperCase()}`);
  };

  const expiryRescueItems = useMemo(() => {
    return [
      {
        id: "exp-1",
        name: "Amul Taaza Homogenised Milk 1L",
        batchNo: "MILK-0042",
        sku: "MLK-AMUL-1L",
        store: "Store A (Indiranagar)",
        expiryDate: "2026-08-21",
        daysRemaining: 3,
        expiryStatus: "Critical",
        quantity: 45,
        suggestedAction: "Create Rescue Deal",
      },
      {
        id: "exp-2",
        name: "Britannia Whole Wheat Bread 400g",
        batchNo: "BRD-102",
        sku: "BRD-WW-400G",
        store: "Store A (Indiranagar)",
        expiryDate: "2026-08-20",
        daysRemaining: 2,
        expiryStatus: "Critical",
        quantity: 32,
        suggestedAction: "Create Clearance",
      },
      {
        id: "exp-3",
        name: "Tropicana 100% Orange Juice 1L",
        batchNo: "JUC-882",
        sku: "JUC-ORG-1L",
        store: "Central Warehouse",
        expiryDate: "2026-08-23",
        daysRemaining: 5,
        expiryStatus: "High Risk",
        quantity: 60,
        suggestedAction: "Create Rescue Deal",
      },
    ];
  }, []);

  const lowStockItems = useMemo(() => {
    return [
      {
        id: "ls-1",
        name: "Fortune Sunlite Sunflower Oil 1L",
        sku: "OIL-FORT-1L",
        store: "Store B (Koramangala)",
        currentStock: 8,
        reorderLevel: 25,
        unit: "units",
        supplier: "Adani Wilmar Ltd.",
      },
      {
        id: "ls-2",
        name: "Tata Salt Vacuum Evaporated 1kg",
        sku: "SLT-TATA-1KG",
        store: "Central Warehouse",
        currentStock: 12,
        reorderLevel: 50,
        unit: "bags",
        supplier: "Tata Consumer Products",
      },
    ];
  }, []);

  const [recentActivities] = useState([
    {
      id: "act-1",
      time: "10:42 AM",
      activity: "Batch Received",
      product: "Amul Taaza Milk 1L",
      batch: "MILK-0042",
      details: "120 units checked in at Central Warehouse Dock 2 by Ramesh K.",
      status: "Completed",
      statusColor: "bg-primary text-primary-foreground",
    },
    {
      id: "act-2",
      time: "10:31 AM",
      activity: "Rescue Deal Created",
      product: "Tropicana Orange Juice 1L",
      batch: "JUC-882",
      details: "30% dynamic rescue pricing applied (5 days remaining shelf life)",
      status: "Active",
      statusColor: "bg-destructive text-destructive-foreground",
    },
    {
      id: "act-3",
      time: "10:18 AM",
      activity: "Order Packed & Verified",
      product: "Order #ERN-10482",
      batch: "3 Batches",
      details: "Sealed and staged for BlueDart express fulfillment fleet",
      status: "Ready",
      statusColor: "bg-accent text-accent-foreground",
    },
    {
      id: "act-4",
      time: "09:55 AM",
      activity: "Stock Adjustment Approved",
      product: "FarmFresh Paneer Lot",
      batch: "PNR-882",
      details: "-2 units damaged packaging reconciled at Store B dock",
      status: "Approved",
      statusColor: "bg-secondary text-foreground",
    },
  ]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = scannedBarcode.trim();
    if (!query) return;

    const found = MASTER_INVENTORY.find(
      (item) =>
        item.barcode === query ||
        item.sku.toLowerCase().includes(query.toLowerCase()) ||
        item.name.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setScanResult(found);
      showToast(`Scanned product: ${found.name}`);
    } else {
      setScanResult(null);
      showToast("Product not found for scanned barcode.");
    }
  };

  const handleReceiveStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddStockOpen(false);
    showToast(`Received ${receiveForm.quantity} units for batch ${receiveForm.batchNo}!`);
  };

  return (
    <div className="space-y-6 pb-24 text-foreground font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-card border border-border shadow-none text-foreground text-xs font-mono font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 1. STAFF HERO */}
      <div className="w-full p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors duration-200 ern-card-glow">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase">
              <span>STAFF OPERATIONS CONSOLE</span>
            </div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            OPERATIONS WORKBENCH
          </h1>

          <p className="text-sm text-muted-foreground font-body max-w-2xl">
            Real-time fulfillment, batch expiry governance, and warehouse lot check-in telemetry.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground font-bold">
              <MapPin className="size-3.5 text-foreground" />
              <span>Central Warehouse · Dock 4</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground font-bold">
              <Calendar className="size-3.5 text-foreground" />
              <span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 font-mono">
          <button
            type="button"
            onClick={() => setIsBarcodeScanOpen(true)}
            className="px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-none ern-shimmer-hover"
          >
            <Barcode className="size-4 text-foreground" />
            <span>Scan Barcode</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddStockOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#2F4156] hover:bg-[#567C8D] text-primary-foreground font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-none ern-shimmer-hover"
          >
            <Plus className="size-4" />
            <span>Receive Lot</span>
          </button>
        </div>
      </div>

      {/* 2. SIX KPI CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
        {/* Card 1 */}
        <Link
  to="/retailer/inventory"
  className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-3 transition-colors duration-200 ern-card-hover ern-card-glow"
>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total SKUs</span>
            <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Boxes className="size-3.5" />
            </div>
          </div>
          <div>
            <span className="font-bold text-2xl font-display uppercase text-foreground block">1,248</span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-1">Assigned hubs</span>
          </div>
        </Link>

        {/* Card 2 */}
        <Link
  to="/retailer/inventory"
  className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-3 transition-colors duration-200 ern-card-hover ern-card-glow"
>
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase font-bold text-muted-foreground">Stock Value</span>
            <div className="size-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
              <TrendingDown className="size-3.5" />
            </div>
          </div>
          <div>
            <span className="font-bold text-2xl font-display uppercase text-foreground block">₹22.37L</span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-1">Valuation</span>
          </div>
        </Link>

        {/* Card 3 */}
        <Link
  to="/retailer/expiry-intelligence"
  className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-3 transition-colors duration-200 ern-card-hover ern-card-glow"
>
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase font-bold text-muted-foreground">Tracked</span>
            <div className="size-7 rounded-full bg-secondary text-foreground flex items-center justify-center font-bold">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div>
            <span className="font-bold text-2xl font-display uppercase text-foreground block">326</span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-1">Active radar</span>
          </div>
        </Link>

        {/* Card 4 */}
        <Link
  to="/retailer/expiry-intelligence"
  className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-3 transition-colors duration-200 ern-card-hover ern-card-glow"
>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-foreground">Critical</span>
            <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <AlertTriangle className="size-3.5" />
            </div>
          </div>
          <div>
            <span className="font-bold text-2xl font-display uppercase text-foreground block">3 Lots</span>
            <span className="text-[10px] text-foreground font-mono block mt-1">≤ 7 days</span>
          </div>
        </Link>

        {/* Card 5 */}
        <Link
  to="/retailer/inventory"
  className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-3 transition-colors duration-200 ern-card-hover ern-card-glow"
>
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase font-bold text-muted-foreground">Low Stock</span>
            <div className="size-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
              <Package className="size-3.5" />
            </div>
          </div>
          <div>
            <span className="font-bold text-2xl font-display uppercase text-foreground block">9 Items</span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-1">Reorder alert</span>
          </div>
        </Link>

        {/* Card 6 */}
        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-3 transition-colors duration-200 ern-card-hover ern-card-glow">
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase font-bold text-muted-foreground">Pending</span>
            <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Activity className="size-3.5" />
            </div>
          </div>
          <div>
            <span className="font-bold text-2xl font-display uppercase text-foreground block">12 Tasks</span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-1">In queue</span>
          </div>
        </div>
      </section>

      {/* 3. HEALTH STRIP */}
      <div className="w-full p-6 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-3 transition-colors duration-200 ern-card-glow">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-foreground" />
            <span className="font-bold uppercase text-foreground text-xs">Overall Inventory Health Distribution</span>
          </div>
          <span className="text-muted-foreground text-xs">1,248 Total Tracked SKUs</span>
        </div>

        {/* Bar */}
        <div className="h-3 w-full rounded-full bg-secondary overflow-hidden flex gap-0.5 p-0.5">
          <div style={{ width: "82%" }} className="h-full bg-[#2F4156] rounded-l-full" title="Safe (82%)" />
          <div style={{ width: "11%" }} className="h-full bg-[#757C5D]" title="Warning (11%)" />
          <div style={{ width: "5%" }} className="h-full bg-destructive" title="High Risk (5%)" />
          <div style={{ width: "2%" }} className="h-full bg-[#666666] rounded-r-full" title="Critical (2%)" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-1">
          <span className="flex items-center gap-1.5 text-foreground font-bold uppercase">
            <span className="size-2 rounded-full bg-[#2F4156]" />
            <span>Safe: 1,023 (82%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-foreground font-bold uppercase">
            <span className="size-2 rounded-full bg-[#757C5D]" />
            <span>Warning: 138 (11%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-foreground font-bold uppercase">
            <span className="size-2 rounded-full bg-destructive" />
            <span>High Risk: 62 (5%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-foreground font-bold uppercase">
            <span className="size-2 rounded-full bg-[#666666]" />
            <span>Critical: 25 (2%)</span>
          </span>
        </div>
      </div>

      {/* 4. PRIMARY OPERATIONAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left: EXPIRY & RESCUE INTELLIGENCE */}
        <div className="p-6 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-4 transition-colors duration-200 ern-card-glow">
  <div>
    <div className="flex items-center justify-between pb-3.5 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <AlertTriangle className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold uppercase text-lg text-foreground">
                    Expiry & Rescue Radar
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Prioritized batches requiring markdown action
                  </p>
                </div>
              </div>

              <Link
                to="/retailer/expiry-intelligence"
                className="text-xs font-mono font-bold uppercase text-foreground hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Radar</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {/* List */}
            <div className="divide-y divide-[rgba(28,58,19,0.15)] text-xs font-mono mt-3">
              {expiryRescueItems.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 first:pt-2.5 last:pb-0 flex items-center justify-between gap-3 group px-2 rounded-xl ern-row-hover"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full bg-secondary border border-border text-foreground flex items-center justify-center font-bold text-xs shrink-0">
                      {item.name[0]}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-bold uppercase text-foreground truncate text-xs sm:text-sm">
                          {item.name}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                            item.expiryStatus === "Critical"
                              ? "bg-primary text-primary-foreground"
                              : "bg-destructive text-destructive-foreground"
                          }`}
                        >
                          {item.expiryStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        Batch: <strong className="text-foreground">{item.batchNo}</strong> &bull; {item.store} &bull;{" "}
                        <span className="font-bold text-foreground">{item.quantity} units</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 shrink-0 font-mono">
                    <div className="text-right">
                      <span className="font-bold text-foreground text-xs block uppercase whitespace-nowrap">
                        {item.daysRemaining}D LEFT
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.expiryDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={item.suggestedAction === "Create Clearance" ? "/retailer/clearance" : "/retailer/expiry-intelligence"}
                        className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold shadow-none flex items-center gap-1 ern-btn-hover"
                      >
                        <Percent className="size-3" />
                        <span>{item.suggestedAction === "Create Clearance" ? "Clear" : "Rescue"}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>3 batches under high risk radar</span>
            <Link to="/retailer/expiry-intelligence" className="text-foreground hover:underline font-bold uppercase">
              Open Radar →
            </Link>
          </div>
        </div>

        {/* Right: TODAY'S OPERATIONAL QUEUE */}
        <div className="p-6 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-4 transition-colors duration-200 ern-card-glow">
  <div>
    <div className="flex items-center justify-between pb-3.5 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
          <Activity className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold uppercase text-lg text-foreground">
                    Operational Queue
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {queueItems.length} actions pending warehouse fulfillment
                  </p>
                </div>
              </div>

              <span className="px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase">
                Live
              </span>
            </div>

            {/* Queue items list */}
            <div className="divide-y divide-[rgba(28,58,19,0.15)] text-xs font-mono mt-3">
              {queueItems.map((q) => (
                <div
                  key={q.id}
                  className="py-3 first:pt-2.5 last:pb-0 flex items-center justify-between gap-3 group px-2 rounded-xl ern-row-hover"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold uppercase text-foreground text-xs sm:text-sm">{q.title}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                          q.priority === "Urgent"
                            ? "bg-primary text-primary-foreground"
                            : q.priority === "High"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {q.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-body truncate">
                      {q.subtitle} &bull; <span className="font-mono font-bold text-foreground">{q.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 font-mono">
                    <button
                      type="button"
                      onClick={() => handleQueueAction(q.id, q.actionType)}
                      className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold cursor-pointer shadow-none ern-btn-hover"
                    >
                      {q.actionText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Synchronized with logistics hub</span>
            <Link to="/retailer/requests" className="text-foreground hover:underline font-bold uppercase">
              View Requisitions →
            </Link>
          </div>
        </div>
      </div>

      {/* 5. SECONDARY OPERATIONAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left: LOW STOCK INTELLIGENCE */}
        <div className="p-6 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-4 transition-colors duration-200 ern-card-glow">
  <div>
    <div className="flex items-center justify-between pb-3.5 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
          <Package className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold uppercase text-lg text-foreground">
                    Low Stock Alerts
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Replenishment alerts below threshold
                  </p>
                </div>
              </div>

              <Link
                to="/retailer/inventory"
                className="text-xs font-mono font-bold uppercase text-foreground hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Stock</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[rgba(28,58,19,0.15)] text-xs font-mono mt-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 first:pt-2.5 last:pb-0 flex items-center justify-between gap-3 group px-2 rounded-xl transition-colors hover:bg-secondary/50"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-display font-bold uppercase text-foreground text-xs sm:text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      {item.store} &bull; Supplier: <span className="text-foreground font-bold">{item.supplier}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3.5 shrink-0 font-mono">
                    <div className="text-right">
                      <span className="font-bold text-foreground text-xs block uppercase">
                        {item.currentStock} {item.unit} left
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Min: {item.reorderLevel}
                      </span>
                    </div>

                    <Link
                      to="/retailer/requests"
                      className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs uppercase cursor-pointer transition-all"
                    >
                      Reorder
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Replenishment safety monitored</span>
            <Link to="/retailer/suppliers" className="text-foreground hover:underline font-bold uppercase">
              Manage Suppliers →
            </Link>
          </div>
        </div>

        {/* Right: OPERATIONS QUICK ACTIONS */}
        <div className="p-6 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between space-y-4 transition-colors duration-200 ern-card-glow">
  <div>
    <div className="flex items-center justify-between pb-3.5 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold uppercase text-lg text-foreground">
                    Execution Shortcuts
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Instant access to warehouse execution modules
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs font-mono pt-3">
              <button
                type="button"
                onClick={() => setIsBarcodeScanOpen(true)}
                className="p-3.5 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-foreground font-bold text-left flex items-center gap-3 cursor-pointer transition-all shadow-none group"
              >
                <div className="size-8.5 rounded-full bg-card border border-border text-foreground flex items-center justify-center shrink-0 font-bold">
                  <Barcode className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-bold text-xs uppercase">Scan Barcode</span>
                  <span className="block text-[10px] text-muted-foreground font-mono truncate">SKU Reader</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsAddStockOpen(true)}
                className="p-3.5 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-foreground font-bold text-left flex items-center gap-3 cursor-pointer transition-all shadow-none group"
              >
                <div className="size-8.5 rounded-full bg-card border border-border text-foreground flex items-center justify-center shrink-0 font-bold">
                  <Package className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-bold text-xs uppercase">Receive Lot</span>
                  <span className="block text-[10px] text-muted-foreground font-mono truncate">Check-in</span>
                </div>
              </button>

              <Link
                to="/retailer/inventory"
                className="p-3.5 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-foreground font-bold text-left flex items-center gap-3 cursor-pointer transition-all shadow-none group"
              >
                <div className="size-8.5 rounded-full bg-card border border-border text-foreground flex items-center justify-center shrink-0 font-bold">
                  <Layers className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-bold text-xs uppercase">Inventory</span>
                  <span className="block text-[10px] text-muted-foreground font-mono truncate">Full Catalog</span>
                </div>
              </Link>

              <Link
                to="/retailer/expiry-intelligence"
                className="p-3.5 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-foreground font-bold text-left flex items-center gap-3 cursor-pointer transition-all shadow-none group"
              >
                <div className="size-8.5 rounded-full bg-card border border-border text-foreground flex items-center justify-center shrink-0 font-bold">
                  <Percent className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-bold text-xs uppercase">Rescue Deal</span>
                  <span className="block text-[10px] text-muted-foreground font-mono truncate">Markdown</span>
                </div>
              </Link>

              <Link
                to="/retailer/clearance"
                className="p-3.5 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-foreground font-bold text-left flex items-center gap-3 cursor-pointer transition-all shadow-none group"
              >
                <div className="size-8.5 rounded-full bg-card border border-border text-foreground flex items-center justify-center shrink-0 font-bold">
                  <TrendingDown className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-bold text-xs uppercase">Clearance</span>
                  <span className="block text-[10px] text-muted-foreground font-mono truncate">Liquidation</span>
                </div>
              </Link>

              <Link
                to="/retailer/requests"
                className="p-3.5 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border text-foreground font-bold text-left flex items-center gap-3 cursor-pointer transition-all shadow-none group"
              >
                <div className="size-8.5 rounded-full bg-card border border-border text-foreground flex items-center justify-center shrink-0 font-bold">
                  <Inbox className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-bold text-xs uppercase">Fulfillment</span>
                  <span className="block text-[10px] text-muted-foreground font-mono truncate">Pick & Pack</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6. AUDIT LOG */}
      <div className="w-full p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-4 transition-colors duration-200 ern-card-glow">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <FileText className="size-4" />
            </div>
            <div>
              <h3 className="font-display font-bold uppercase text-lg text-foreground">
                Staff Activity Audit Log
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Chronological timeline of inventory and batch events
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-border text-foreground uppercase text-[10.5px] bg-secondary h-9">
                <th className="px-3.5 py-2.5 text-left font-bold">Time</th>
                <th className="px-3.5 py-2.5 text-left font-bold">Activity</th>
                <th className="px-3.5 py-2.5 text-left font-bold">Product / Batch</th>
                <th className="px-3.5 py-2.5 text-left font-bold">Details</th>
                <th className="px-3.5 py-2.5 text-right font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {recentActivities.map((act) => (
                <tr key={act.id} className="hover:bg-secondary/40 transition-colors h-12">
                  <td className="px-3.5 py-2.5 text-muted-foreground font-bold whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="size-3.5 text-muted-foreground" />
                      <span>{act.time}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 font-bold uppercase text-foreground whitespace-nowrap">
                    {act.activity}
                  </td>
                  <td className="px-3.5 py-2.5 text-foreground font-body">
                    <span className="font-bold block text-xs uppercase">{act.product}</span>
                    <span className="text-[10.5px] text-muted-foreground font-mono font-bold">{act.batch}</span>
                  </td>
                  <td className="px-3.5 py-2.5 text-muted-foreground font-body text-xs">
                    {act.details}
                  </td>
                  <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${act.statusColor}`}>
                      <CheckCircle className="size-3" />
                      <span>{act.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Modal */}
      {isBarcodeScanOpen && (
        <div
          onClick={() => setIsBarcodeScanOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-[24px] sm:rounded-[32px] p-7 shadow-none text-foreground space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Barcode className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold uppercase text-lg text-foreground">
                    Barcode Scanner
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Scan or enter EAN-13 / SKU barcode
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBarcodeScanOpen(false)}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleBarcodeSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase font-bold text-muted-foreground">
                  Scan / Type Barcode or SKU
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={scannedBarcode}
                    onChange={(e) => setScannedBarcode(e.target.value)}
                    placeholder="e.g. 8901234567890 or MLK-AMUL-1L"
                    autoFocus
                    required
                    className="w-full pl-3 pr-16 py-2.5 rounded-lg bg-background border border-border text-foreground font-mono text-xs outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase cursor-pointer"
                  >
                    Scan
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                  Quick Barcodes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["8901234567890", "MLK-AMUL-1L", "BRD-WW-400G", "JUC-ORG-1L"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setScannedBarcode(code)}
                      className="px-2.5 py-1 rounded-full bg-secondary border border-border text-[10.5px] font-mono font-bold text-foreground hover:border-primary cursor-pointer"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {scanResult && (
                <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border space-y-2">
                  <span className="text-[10px] font-mono font-bold text-foreground uppercase block">
                    ✓ Product Found
                  </span>
                  <p className="font-display font-bold uppercase text-foreground text-sm">{scanResult.name}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    SKU: {scanResult.sku} &bull; Qty: {scanResult.quantity} {scanResult.unit}
                  </p>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBarcodeScanOpen(false);
                        setIsAddStockOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-mono uppercase font-bold text-xs cursor-pointer hover:bg-[#567C8D]"
                    >
                      Receive Units
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsBarcodeScanOpen(false)}
                  className="px-4 py-2 rounded-full bg-secondary text-foreground text-xs font-mono uppercase font-bold hover:bg-secondary/80 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {isAddStockOpen && (
        <div
          onClick={() => setIsAddStockOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-7 shadow-none text-foreground space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Package className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold uppercase text-lg text-foreground">
                    Receive Stock Batch
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Check-in new inventory lots into warehouse bay
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddStockOpen(false)}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleReceiveStockSubmit} className="space-y-3.5 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                  Product Name
                </label>
                <input
                  type="text"
                  value={receiveForm.productName}
                  onChange={(e) => setReceiveForm({ ...receiveForm, productName: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-lg bg-background border border-border text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={receiveForm.sku}
                    onChange={(e) => setReceiveForm({ ...receiveForm, sku: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={receiveForm.batchNo}
                    onChange={(e) => setReceiveForm({ ...receiveForm, batchNo: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                    Units Received
                  </label>
                  <input
                    type="number"
                    value={receiveForm.quantity}
                    onChange={(e) => setReceiveForm({ ...receiveForm, quantity: e.target.value })}
                    required
                    min="1"
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={receiveForm.expiryDate}
                    onChange={(e) => setReceiveForm({ ...receiveForm, expiryDate: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddStockOpen(false)}
                  className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-mono uppercase text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-mono uppercase font-bold text-xs cursor-pointer hover:bg-[#567C8D]"
                >
                  Confirm Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={detailItem}
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
      />
    </div>
  );
}
