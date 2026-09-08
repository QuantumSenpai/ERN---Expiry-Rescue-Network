import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Percent,
  Barcode,
  Layers,
  Sparkles,
  X,
  Calendar,
  Download,
  Search,
  Zap,
  Clock3,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useRescueDeals } from "@/context/RescueDealsContext";
import { useAuth } from "@/context/AuthContext";
import { MASTER_PRODUCTS } from "@/data/marketplaceData";

interface ExpiryDecisionBatch {
  id: string;
  productId: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  batchNo: string;
  location: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  stockValue: number;
  mfgDate: string;
  expiryDate: string;
  daysRemaining: number;
  riskLevel: "Critical" | "High Risk" | "Medium" | "Safe" | "Expired";
  recommendedAction: "Rescue" | "Clearance" | "Monitor" | "Mark Expired";
  suggestedDiscount: number;
  suggestedPrice: number;
  estimatedRecovery: number;
  wastePreventedKg: number;
}

const MASTER_EXPIRY_DECISION_BATCHES: ExpiryDecisionBatch[] = [
  {
    id: "batch-1",
    productId: "prod-1",
    name: "Amul Taaza Homogenised Toned Milk 1L",
    sku: "MLK-AMUL-1L",
    brand: "Amul",
    category: "Dairy",
    batchNo: "MILK-0042",
    location: "Central Warehouse",
    quantity: 45,
    unit: "Pcs",
    unitPrice: 42,
    stockValue: 1890,
    mfgDate: "06 Aug 2026",
    expiryDate: "18 Aug 2026",
    daysRemaining: 2,
    riskLevel: "Critical",
    recommendedAction: "Rescue",
    suggestedDiscount: 20,
    suggestedPrice: 34,
    estimatedRecovery: 1512,
    wastePreventedKg: 45,
  },
  {
    id: "batch-2",
    productId: "prod-2",
    name: "Britannia Whole Wheat Bread 400g",
    sku: "BRD-WW-400G",
    brand: "Britannia",
    category: "Bakery & Bread",
    batchNo: "BRD-102",
    location: "Store A",
    quantity: 60,
    unit: "Pcs",
    unitPrice: 50,
    stockValue: 3000,
    mfgDate: "12 Aug 2026",
    expiryDate: "19 Aug 2026",
    daysRemaining: 3,
    riskLevel: "Critical",
    recommendedAction: "Clearance",
    suggestedDiscount: 40,
    suggestedPrice: 30,
    estimatedRecovery: 1800,
    wastePreventedKg: 24,
  },
  {
    id: "batch-3",
    productId: "prod-15",
    name: "FarmFresh Pasteurized Paneer 200g",
    sku: "PNR-FF-200G",
    brand: "FarmFresh",
    category: "Dairy",
    batchNo: "PNR-882",
    location: "Store B",
    quantity: 30,
    unit: "Pcs",
    unitPrice: 90,
    stockValue: 2700,
    mfgDate: "10 Aug 2026",
    expiryDate: "20 Aug 2026",
    daysRemaining: 4,
    riskLevel: "Critical",
    recommendedAction: "Rescue",
    suggestedDiscount: 25,
    suggestedPrice: 68,
    estimatedRecovery: 2040,
    wastePreventedKg: 6,
  },
  {
    id: "batch-4",
    productId: "prod-3",
    name: "Real Fruit Power Mixed Fruit Juice 1L",
    sku: "JUC-REAL-1L",
    brand: "Real",
    category: "Beverages",
    batchNo: "JUC-882",
    location: "Distribution Center",
    quantity: 50,
    unit: "Pcs",
    unitPrice: 110,
    stockValue: 5500,
    mfgDate: "20 May 2026",
    expiryDate: "24 Aug 2026",
    daysRemaining: 8,
    riskLevel: "High Risk",
    recommendedAction: "Rescue",
    suggestedDiscount: 30,
    suggestedPrice: 77,
    estimatedRecovery: 3850,
    wastePreventedKg: 50,
  },
  {
    id: "batch-5",
    productId: "prod-4",
    name: "Mother Dairy Classic Curd 400g",
    sku: "CRD-MD-400G",
    brand: "Mother Dairy",
    category: "Dairy",
    batchNo: "CRD-551",
    location: "Store A",
    quantity: 35,
    unit: "Tubs",
    unitPrice: 35,
    stockValue: 1225,
    mfgDate: "10 Aug 2026",
    expiryDate: "25 Aug 2026",
    daysRemaining: 9,
    riskLevel: "High Risk",
    recommendedAction: "Clearance",
    suggestedDiscount: 35,
    suggestedPrice: 23,
    estimatedRecovery: 796,
    wastePreventedKg: 14,
  },
  {
    id: "batch-6",
    productId: "prod-5",
    name: "Tropicana 100% Orange Juice 1L",
    sku: "JUC-TROP-1L",
    brand: "Tropicana",
    category: "Beverages",
    batchNo: "TRP-202",
    location: "Central Warehouse",
    quantity: 40,
    unit: "Pcs",
    unitPrice: 125,
    stockValue: 5000,
    mfgDate: "25 Jun 2026",
    expiryDate: "27 Aug 2026",
    daysRemaining: 11,
    riskLevel: "High Risk",
    recommendedAction: "Rescue",
    suggestedDiscount: 25,
    suggestedPrice: 94,
    estimatedRecovery: 3750,
    wastePreventedKg: 40,
  },
  {
    id: "batch-7",
    productId: "prod-6",
    name: "English Oven Brown Bread 400g",
    sku: "BRD-EO-400G",
    brand: "English Oven",
    category: "Bakery & Bread",
    batchNo: "EO-404",
    location: "Store B",
    quantity: 25,
    unit: "Pcs",
    unitPrice: 55,
    stockValue: 1375,
    mfgDate: "11 Aug 2026",
    expiryDate: "28 Aug 2026",
    daysRemaining: 12,
    riskLevel: "High Risk",
    recommendedAction: "Rescue",
    suggestedDiscount: 20,
    suggestedPrice: 44,
    estimatedRecovery: 1100,
    wastePreventedKg: 10,
  },
  {
    id: "batch-8",
    productId: "prod-7",
    name: "Epigamia Greek Yogurt Strawberry 120g",
    sku: "YOG-EPI-120G",
    brand: "Epigamia",
    category: "Dairy",
    batchNo: "EPI-112",
    location: "Store A",
    quantity: 50,
    unit: "Cups",
    unitPrice: 60,
    stockValue: 3000,
    mfgDate: "02 Aug 2026",
    expiryDate: "30 Aug 2026",
    daysRemaining: 14,
    riskLevel: "High Risk",
    recommendedAction: "Rescue",
    suggestedDiscount: 20,
    suggestedPrice: 48,
    estimatedRecovery: 2400,
    wastePreventedKg: 6,
  },
  {
    id: "batch-9",
    productId: "prod-8",
    name: "Kellogg's Corn Flakes 500g",
    sku: "CER-KEL-500G",
    brand: "Kellogg's",
    category: "Packaged Foods",
    batchNo: "KEL-993",
    location: "Central Warehouse",
    quantity: 25,
    unit: "Boxes",
    unitPrice: 110,
    stockValue: 2750,
    mfgDate: "01 Feb 2026",
    expiryDate: "02 Sep 2026",
    daysRemaining: 17,
    riskLevel: "Medium",
    recommendedAction: "Monitor",
    suggestedDiscount: 10,
    suggestedPrice: 99,
    estimatedRecovery: 2475,
    wastePreventedKg: 25,
  },
  {
    id: "batch-10",
    productId: "prod-9",
    name: "Dorset Super High Fibre Muesli 500g",
    sku: "MUS-DOR-500G",
    brand: "Dorset",
    category: "Packaged Foods",
    batchNo: "DOR-808",
    location: "Store A",
    quantity: 20,
    unit: "Boxes",
    unitPrice: 380,
    stockValue: 7600,
    mfgDate: "15 May 2026",
    expiryDate: "08 Sep 2026",
    daysRemaining: 23,
    riskLevel: "Medium",
    recommendedAction: "Monitor",
    suggestedDiscount: 10,
    suggestedPrice: 342,
    estimatedRecovery: 6840,
    wastePreventedKg: 10,
  },
  {
    id: "batch-11",
    productId: "prod-10",
    name: "Nandini Fresh Curd Pouch 500g",
    sku: "CRD-NAN-500G",
    brand: "Nandini",
    category: "Dairy",
    batchNo: "NAN-044",
    location: "Store B",
    quantity: 14,
    unit: "Pouches",
    unitPrice: 30,
    stockValue: 420,
    mfgDate: "08 Aug 2026",
    expiryDate: "15 Aug 2026",
    daysRemaining: -1,
    riskLevel: "Expired",
    recommendedAction: "Mark Expired",
    suggestedDiscount: 0,
    suggestedPrice: 0,
    estimatedRecovery: 0,
    wastePreventedKg: 7,
  },
  {
    id: "batch-12",
    productId: "prod-11",
    name: "Harvest Gold Multigrain Bread 350g",
    sku: "BRD-HARV-350G",
    brand: "Harvest Gold",
    category: "Bakery & Bread",
    batchNo: "HARV-091",
    location: "Central Warehouse",
    quantity: 8,
    unit: "Pcs",
    unitPrice: 48,
    stockValue: 384,
    mfgDate: "07 Aug 2026",
    expiryDate: "14 Aug 2026",
    daysRemaining: -2,
    riskLevel: "Expired",
    recommendedAction: "Mark Expired",
    suggestedDiscount: 0,
    suggestedPrice: 0,
    estimatedRecovery: 0,
    wastePreventedKg: 3,
  },
];

type ExpiryTab = "all" | "critical" | "high" | "medium" | "expired";

const LOCATIONS = [
  "All Locations",
  "Central Warehouse",
  "Store A",
  "Store B",
  "Distribution Center",
];

const CATEGORIES = [
  "All Categories",
  "Dairy",
  "Bakery & Bread",
  "Beverages",
  "Packaged Foods",
];

const PRODUCT_IMAGE_MAP: Record<string, string> = Object.fromEntries(
  MASTER_PRODUCTS.map((p) => [p.productId, p.imageUrl])
);

export default function ExpiryIntelligence() {
  const { publishDeal, hasDeal } = useRescueDeals();
  const { user } = useAuth();

  const [batches, setBatches] = useState<ExpiryDecisionBatch[]>(MASTER_EXPIRY_DECISION_BATCHES);
  const [activeTab, setActiveTab] = useState<ExpiryTab>("all");
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [daysFilter, setDaysFilter] = useState("all");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedBatchForDetail, setSelectedBatchForDetail] = useState<ExpiryDecisionBatch | null>(null);
  const [selectedBatchForAction, setSelectedBatchForAction] = useState<{
    batch: ExpiryDecisionBatch;
    actionType: "Rescue" | "Clearance";
  } | null>(null);
  const [isBarcodeScanOpen, setIsBarcodeScanOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [scanResult, setScanResult] = useState<ExpiryDecisionBatch | null>(null);

  const [publishChannels, setPublishChannels] = useState({ marketplace: true, ngo: true });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [editDiscount, setEditDiscount] = useState<number>(20);
  const [editPrice, setEditPrice] = useState<number>(34);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const resetPublishModal = () => {
    setSelectedBatchForAction(null);
    setPublishChannels({ marketplace: true, ngo: true });
    setIsPublishing(false);
    setPublishError(null);
    setEditDiscount(20);
    setEditPrice(34);
  };

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();

    return batches.filter((b) => {
      if (activeTab === "critical" && b.riskLevel !== "Critical") return false;
      if (activeTab === "high" && b.riskLevel !== "High Risk") return false;
      if (activeTab === "medium" && b.riskLevel !== "Medium") return false;
      if (activeTab === "expired" && b.riskLevel !== "Expired") return false;

      if (selectedLocation !== "All Locations" && b.location !== selectedLocation) {
        return false;
      }

      if (selectedCategory !== "All Categories" && b.category !== selectedCategory) {
        return false;
      }

      if (daysFilter === "3" && b.daysRemaining > 3) return false;
      if (daysFilter === "7" && b.daysRemaining > 7) return false;
      if (daysFilter === "14" && b.daysRemaining > 14) return false;
      if (daysFilter === "30" && b.daysRemaining > 30) return false;

      if (
        q &&
        !b.name.toLowerCase().includes(q) &&
        !b.sku.toLowerCase().includes(q) &&
        !b.batchNo.toLowerCase().includes(q) &&
        !b.brand.toLowerCase().includes(q)
      ) {
        return false;
      }

      return true;
    });
  }, [batches, activeTab, search, selectedLocation, selectedCategory, daysFilter]);

  const handleExportCSV = () => {
    const headers = [
      "Product Name",
      "SKU",
      "Batch Number",
      "Location",
      "Category",
      "Quantity",
      "Expiry Date",
      "Days Left",
      "Stock Value (INR)",
      "Risk Level",
      "Recommended Action",
    ];

    const rows = filteredBatches.map((b) => [
      `"${b.name}"`,
      b.sku,
      b.batchNo,
      `"${b.location}"`,
      b.category,
      b.quantity,
      b.expiryDate,
      b.daysRemaining,
      b.stockValue,
      b.riskLevel,
      b.recommendedAction,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ERN_Expiry_Risk_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Exported Expiry Risk Report CSV successfully!");
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = scannedCode.trim().toLowerCase();
    if (!query) return;

    const found = batches.find(
      (b) =>
        b.batchNo.toLowerCase().includes(query) ||
        b.sku.toLowerCase().includes(query) ||
        b.name.toLowerCase().includes(query)
    );

    if (found) {
      setScanResult(found);
      showToast(`Located batch ${found.batchNo} for ${found.name}`);
    } else {
      setScanResult(null);
      showToast("Batch not found for scanned identifier.");
    }
  };

  const handlePublishDeal = async () => {
    if (!selectedBatchForAction) return;
    const { batch } = selectedBatchForAction;

    if (!publishChannels.marketplace && !publishChannels.ngo) {
      setPublishError("Select at least one distribution channel.");
      return;
    }
    if (batch.quantity <= 0) {
      setPublishError("This batch has no stock available.");
      return;
    }
    if (editPrice <= 0) {
      setPublishError("Rescue price must be greater than ₹0.");
      return;
    }
    if (editPrice >= batch.unitPrice) {
      setPublishError("Rescue price must be lower than the original price (₹" + batch.unitPrice + ").");
      return;
    }
    if (editDiscount <= 0 || editDiscount >= 100) {
      setPublishError("Discount must be between 1% and 99%.");
      return;
    }
    if (hasDeal(batch.id)) {
      setPublishError("This batch already has an active rescue deal.");
      return;
    }

    setPublishError(null);
    setIsPublishing(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const imageUrl =
      PRODUCT_IMAGE_MAP[batch.productId] ||
      "/assets/marketplace/milk_bottle.jpg";

    publishDeal({
      batchId: batch.id,
      batchNo: batch.batchNo,
      productId: batch.productId,
      name: batch.name,
      brand: batch.brand,
      category: batch.category,
      imageUrl,
      unit: batch.unit,
      originalPrice: batch.unitPrice,
      rescuePrice: editPrice,
      discountPercent: editDiscount,
      savings: batch.unitPrice - editPrice,
      quantity: batch.quantity,
      expiryDate: batch.expiryDate,
      daysRemaining: batch.daysRemaining,
      location: batch.location,
      channels: publishChannels,
      publishedBy: user?.name || "Operations Staff",
    });

    resetPublishModal();
    showToast(
      `Rescue deal published — ${batch.name.split(" ").slice(0, 4).join(" ")} is now live in marketplace.`
    );
  };

  const openPublishModal = (batch: ExpiryDecisionBatch, actionType: "Rescue" | "Clearance") => {
    setEditDiscount(batch.suggestedDiscount);
    setEditPrice(batch.suggestedPrice);
    setPublishError(null);
    setPublishChannels({ marketplace: true, ngo: true });
    setSelectedBatchForAction({ batch, actionType });
  };

  const handleMonitorBatch = (batch: ExpiryDecisionBatch) => {
    showToast(`Batch ${batch.batchNo} added to Active Watchlist radar.`);
  };

  const handleMarkExpired = (batch: ExpiryDecisionBatch) => {
    setBatches((prev) =>
      prev.map((item) =>
        item.id === batch.id
          ? { ...item, recommendedAction: "Mark Expired", riskLevel: "Expired" }
          : item
      )
    );
    showToast(`Batch ${batch.batchNo} quarantined for safe disposal / bio-fuel processing.`);
  };

  const highValueOpportunities = useMemo(() => {
    return batches.filter((b) => b.riskLevel === "Critical" || b.riskLevel === "High Risk").slice(0, 4);
  }, [batches]);

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
            <span>EXPIRY DECISION ENGINE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            EXPIRY INTELLIGENCE
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Identify expiry risks early and take automated rescue, clearance, or stock rebalancing action.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase">
          <button
            type="button"
            onClick={() => setIsBarcodeScanOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95"
          >
            <Barcode className="size-4" />
            <span>Scan Batch</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card hover:bg-background border border-border text-foreground transition-all cursor-pointer shadow-none"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono">
        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Monitored</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">326</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Active items</p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("critical")}
          className={`p-5 rounded-[24px] bg-background border shadow-none text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ern-card-glow ${
  activeTab === "critical" ? "border-[#2F4156] dark:border-[#2F4156]" : "border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156]"
}`}
        >
          <span className="text-xs uppercase font-bold text-foreground">Critical</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">3</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">0–7 days left</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("high")}
          className={`p-5 rounded-[24px] bg-background border shadow-none text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ern-card-glow ${
  activeTab === "high" ? "border-[#2F4156] dark:border-[#2F4156]" : "border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156]"
}`}
        >
          <span className="text-xs uppercase font-bold text-muted-foreground">High Urgency</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">9</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">8–14 days left</p>
        </button>

        <button
  type="button"
  onClick={() => setActiveTab("all")}
  className="p-5 rounded-[24px] bg-background border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ern-card-glow"
>
          <span className="text-xs uppercase font-bold text-muted-foreground">Rescue Ready</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">12</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Dynamic lots</p>
        </button>

        <Link
  to="/retailer/clearance"
  className="p-5 rounded-[24px] bg-background border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-all duration-200 ern-card-glow"
>
          <span className="text-xs uppercase font-bold text-muted-foreground">Clearance</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">7</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Markdown list</p>
        </Link>

        <button
          type="button"
          onClick={() => setActiveTab("expired")}
          className={`p-5 rounded-[24px] bg-background border shadow-none text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ern-card-glow ${
  activeTab === "expired" ? "border-[#2F4156] dark:border-[#2F4156]" : "border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156]"
}`}
        >
          <span className="text-xs uppercase font-bold text-muted-foreground">Quarantine</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">2</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Expired lots</p>
        </button>
      </div>

      {/* Distribution Strip */}
      <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-3 font-mono transition-colors duration-200 ern-card-glow">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground uppercase">
            Active Expiry Horizon Segmentation
          </span>
          <span className="text-muted-foreground">326 Perishable SKUs</span>
        </div>

        <div className="h-3 w-full rounded-full bg-card border border-border overflow-hidden flex">
          <div style={{ width: "75.2%" }} className="h-full bg-[#2F4156]" title="Safe (>30d): 75.2%" />
          <div style={{ width: "16.9%" }} className="h-full bg-card" title="Medium (15–30d): 16.9%" />
          <div style={{ width: "5.8%" }} className="h-full bg-[#2F4156]" title="High (8–14d): 5.8%" />
          <div style={{ width: "1.5%" }} className="h-full bg-[#2F4156]" title="Critical (0–7d): 1.5%" />
          <div style={{ width: "0.6%" }} className="h-full bg-[#666666]" title="Expired: 0.6%" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 text-muted-foreground">
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span className="size-2 rounded-full bg-[#2F4156] border border-[#2F4156]" />
            <span>SAFE (&gt;30d): 245 (75%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-card border border-border" />
            <span>MEDIUM (15–30d): 55 (17%)</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span className="size-2 rounded-full bg-[#2F4156] border border-[#2F4156]" />
            <span>HIGH (8–14d): 19 (6%)</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span className="size-2 rounded-full bg-[#2F4156]" />
            <span>CRITICAL (0–7d): 5 (2%)</span>
          </span>
        </div>
      </div>

      {/* Smart Rescue Opportunities Cards */}
      <div className="p-6 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-4 font-mono transition-colors duration-200 ern-card-glow">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="font-display font-bold text-xl uppercase text-foreground">
              Smart Rescue Opportunities
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Highest-value perishable lots recommended for immediate dynamic discount publication.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase">
            Top Priority
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highValueOpportunities.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-secondary/50 border border-border flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {item.recommendedAction} Deal
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold whitespace-nowrap inline-flex items-center gap-1">
                    {item.daysRemaining}D LEFT
                  </span>
                </div>

                <h4 className="font-bold text-foreground text-sm font-display uppercase line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Batch: {item.batchNo} · {item.quantity} {item.unit}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background border border-border space-y-1 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Original:</span>
                  <span>₹{item.unitPrice}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Rescue Price:</span>
                  <span className="text-foreground font-bold">₹{item.suggestedPrice}</span>
                </div>
                <div className="flex items-center justify-between text-foreground font-bold pt-1 border-t border-border text-[11px]">
                  <span>Est. Recovery:</span>
                  <span>₹{item.estimatedRecovery}</span>
                </div>
              </div>

              {hasDeal(item.id) ? (
                <div className="w-full py-2.5 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-secondary text-foreground border border-border cursor-default select-none">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>DEAL PUBLISHED ✓</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    openPublishModal(item, item.recommendedAction === "Clearance" ? "Clearance" : "Rescue")
                  }
                  className="w-full py-2.5 rounded-lg font-bold text-xs uppercase cursor-pointer transition-all shadow-none flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                >
                  <span>Publish Deal →</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono transition-colors duration-200 ern-card-glow">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product, SKU or batch..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
            >
              <option value="all">All Horizons</option>
              <option value="3">≤ 3 Days</option>
              <option value="7">≤ 7 Days</option>
              <option value="14">≤ 14 Days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
              <tr>
                <th className="px-4 py-3.5 font-bold uppercase">Product</th>
                <th className="px-4 py-3.5 font-bold uppercase">SKU / Batch</th>
                <th className="px-4 py-3.5 font-bold uppercase">Location</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Quantity</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Days Left</th>
                <th className="px-4 py-3.5 font-bold uppercase text-right">Value</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Risk</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Action</th>
                <th className="px-4 py-3.5 text-right font-bold uppercase">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-foreground font-display uppercase text-sm">
                      {batch.name}
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {batch.brand} · {batch.category}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-foreground">{batch.sku}</span>
                    <span className="text-[10px] text-muted-foreground block">{batch.batchNo}</span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {batch.location}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-foreground">
                    {batch.quantity} {batch.unit}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center gap-1 ${
                        batch.daysRemaining <= 3
                          ? "bg-primary text-primary-foreground"
                          : batch.daysRemaining <= 7
                          ? "bg-primary text-primary-foreground border border-[#2F4156]"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {batch.daysRemaining <= 0 ? "Expired" : `${batch.daysRemaining}D LEFT`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-foreground">
                    ₹{batch.stockValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-card border border-border text-foreground text-[10px] font-bold uppercase">
                      {batch.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                      {batch.recommendedAction}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedBatchForDetail(batch)}
                        className="px-2.5 py-1 rounded-lg bg-card border border-border text-foreground text-xs font-bold uppercase hover:bg-background cursor-pointer"
                      >
                        View
                      </button>
                      {hasDeal(batch.id) ? (
                        <span className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase">
                          Live
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openPublishModal(batch, "Rescue")}
                          className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] cursor-pointer shadow-none"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Details */}
      {selectedBatchForDetail && (
        <div
          onClick={() => setSelectedBatchForDetail(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4"
          >
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-display font-bold text-xl uppercase text-foreground">
                  Batch Intelligence
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Batch ID: {selectedBatchForDetail.batchNo} · {selectedBatchForDetail.sku}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatchForDetail(null)}
                className="p-1 rounded-lg bg-card hover:bg-background cursor-pointer text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
              <span className="font-display uppercase font-bold text-sm text-foreground block">{selectedBatchForDetail.name}</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Location:</span>
                  <strong className="text-foreground">{selectedBatchForDetail.location}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Quantity:</span>
                  <strong className="text-foreground">{selectedBatchForDetail.quantity} {selectedBatchForDetail.unit}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Expiry Date:</span>
                  <strong className="text-foreground">{selectedBatchForDetail.expiryDate}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Stock Value:</span>
                  <strong className="text-foreground">₹{selectedBatchForDetail.stockValue}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedBatchForDetail(null)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  openPublishModal(selectedBatchForDetail, "Rescue");
                  setSelectedBatchForDetail(null);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none"
              >
                Publish Deal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Publish Deal */}
      {selectedBatchForAction && (
        <div
          onClick={() => !isPublishing && resetPublishModal()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-display font-bold text-xl uppercase text-foreground">
                  Publish Rescue Deal
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Post lot directly to customer marketplace
                </p>
              </div>
              <button
                type="button"
                onClick={resetPublishModal}
                className="p-1 rounded-lg bg-card hover:bg-background cursor-pointer text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-1">
              <p className="font-display font-bold uppercase text-foreground text-sm">{selectedBatchForAction.batch.name}</p>
              <p className="text-xs text-muted-foreground">
                Batch: {selectedBatchForAction.batch.batchNo} · {selectedBatchForAction.batch.quantity} {selectedBatchForAction.batch.unit} · {selectedBatchForAction.batch.daysRemaining} days remaining
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-secondary/50 border border-border">
                <span className="text-muted-foreground uppercase text-[10px] block">Discount</span>
                <input
                  type="number"
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(Number(e.target.value))}
                  className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm font-bold text-foreground mt-1 outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-secondary/50 border border-border">
                <span className="text-muted-foreground uppercase text-[10px] block">Rescue Price</span>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm font-bold text-foreground mt-1 outline-none"
                />
              </div>
            </div>

            {publishError && (
              <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold">
                {publishError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={resetPublishModal}
                disabled={isPublishing}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishDeal}
                disabled={isPublishing}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none active:scale-95 flex items-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Deal →</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Scanner */}
      {isBarcodeScanOpen && (
        <div
          onClick={() => setIsBarcodeScanOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-display font-bold text-xl uppercase text-foreground">
                  Barcode Scanner
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Locate batch by code or SKU
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBarcodeScanOpen(false)}
                className="p-1 rounded-lg bg-card hover:bg-background cursor-pointer text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="e.g. MILK-0042, BRD-102"
                className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground font-mono text-xs outline-none focus:border-primary"
              />

              <div className="flex flex-wrap gap-1.5">
                {["MILK-0042", "BRD-102", "JUC-882", "PNR-882"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setScannedCode(code)}
                    className="px-2 py-1 rounded-md bg-card border border-border text-[10.5px] font-mono text-foreground hover:bg-background cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>

              {scanResult && (
                <div className="p-4 rounded-2xl bg-primary text-primary-foreground border border-[#2F4156] space-y-1">
                  <p className="font-bold text-xs uppercase">✓ Batch Located</p>
                  <p className="font-display uppercase font-bold text-sm">{scanResult.name}</p>
                  <p className="text-[11px] text-muted-foreground">Batch: {scanResult.batchNo} · {scanResult.location}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBarcodeScanOpen(false)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none"
                >
                  Locate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
