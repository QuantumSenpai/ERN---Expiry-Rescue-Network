// ─── EXPIRY INTELLIGENCE — SINGLE SOURCE OF TRUTH MOCK DATA ─────────────────
// All dates anchored to ERN mock "today": 15 Aug 2026
// All values are deterministic, mathematically linked, and internally consistent.

export const MOCK_CURRENT_DATE = "15 Aug 2026";

export interface ExpiryRiskItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  batchNo: string;
  location: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  stockValue: number;
  expiryDate: string;
  daysLeft: number;
  riskLevel: "Critical" | "High Risk" | "Warning" | "Safe";
  recommendedAction: string;
  actionType: "redistribute" | "clearance" | "fefo" | "monitor" | "review";
}

export interface IntelligenceInsight {
  id: string;
  severity: "critical" | "high" | "redistribution" | "fefo";
  title: string;
  description: string;
  actionLabel: string;
  actionType: "review-batch" | "view-exposure" | "review-transfer" | "fefo-plan";
}

export interface RecommendedAction {
  id: string;
  priority: number;
  title: string;
  subtitle: string;
  detail: string;
  impact: string;
  actionLabel: string;
  actionType: "transfer" | "clearance" | "fefo" | "supplier";
  productId?: string;
  batchNo?: string;
}

export interface RedistributionOpportunity {
  id: string;
  productId: string;
  product: string;
  batchNo: string;
  from: string;
  to: string;
  available: number;
  needed: number;
  unit: string;
  daysLeft: number;
  unitPrice: number;
  valueProtected: number;
  confidence: "High" | "Medium" | "Low";
}

export interface FefoEntry {
  priority: number;
  id: string;
  productId: string;
  product: string;
  sku: string;
  batchNo: string;
  location: string;
  expiryDate: string;
  daysLeft: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  stockValue: number;
  suggestedAction: "Dispatch First" | "Dispatch Next" | "Prioritize" | "Queue" | "Standard";
  riskLevel: "Critical" | "High Risk" | "Warning" | "Safe";
}

export interface TimelinePoint {
  label: string;
  items: number;
  value: number;
}

export interface TrendPoint {
  day: string;
  atRisk: number;
  critical: number;
  recovered: number;
}

// ─── COMPLETE 18-BATCH MONITORED DATASET ────────────────────────────────────
// Classification:
//   1–7 days   -> Critical  (4 batches)
//   8–14 days  -> High Risk (5 batches)
//   15–30 days -> Warning   (5 batches)
//   31+ days   -> Safe      (4 batches)
// TOTAL: 18 batches

export const EXPIRY_RISK_ITEMS: ExpiryRiskItem[] = [
  // ── CRITICAL (1-7 days) — 4 Batches ──
  {
    id: "er-1",
    productId: "prod-1",
    name: "Amul Taaza Milk 1L",
    sku: "MILK-001",
    category: "Dairy",
    brand: "Amul",
    batchNo: "MLK-042",
    location: "Central Warehouse",
    quantity: 25,
    unit: "Pcs",
    unitPrice: 60,
    stockValue: 1500,
    expiryDate: "17 Aug 2026",
    daysLeft: 2,
    riskLevel: "Critical",
    recommendedAction: "Redistribute",
    actionType: "redistribute",
  },
  {
    id: "er-2",
    productId: "prod-5",
    name: "Amul Masti Dahi 400g",
    sku: "CRD-001",
    category: "Dairy",
    brand: "Amul",
    batchNo: "DAH-091",
    location: "Store B",
    quantity: 18,
    unit: "Pcs",
    unitPrice: 35,
    stockValue: 630,
    expiryDate: "18 Aug 2026",
    daysLeft: 3,
    riskLevel: "Critical",
    recommendedAction: "Clearance",
    actionType: "clearance",
  },
  {
    id: "er-3",
    productId: "prod-2",
    name: "Britannia Whole Wheat Bread 400g",
    sku: "BRD-001",
    category: "Bakery",
    brand: "Britannia",
    batchNo: "BRD-048",
    location: "Store A",
    quantity: 60,
    unit: "Pcs",
    unitPrice: 45,
    stockValue: 2700,
    expiryDate: "20 Aug 2026",
    daysLeft: 5,
    riskLevel: "Critical",
    recommendedAction: "Create Clearance",
    actionType: "clearance",
  },
  {
    id: "er-4",
    productId: "prod-1",
    name: "Amul Taaza Milk 1L",
    sku: "MILK-001",
    category: "Dairy",
    brand: "Amul",
    batchNo: "MLK-043",
    location: "Store A",
    quantity: 20,
    unit: "Pcs",
    unitPrice: 60,
    stockValue: 1200,
    expiryDate: "22 Aug 2026",
    daysLeft: 7,
    riskLevel: "Critical",
    recommendedAction: "FEFO Priority",
    actionType: "fefo",
  },

  // ── HIGH RISK (8-14 days) — 5 Batches ──
  {
    id: "er-5",
    productId: "prod-2",
    name: "Britannia Whole Wheat Bread 400g",
    sku: "BRD-001",
    category: "Bakery",
    brand: "Britannia",
    batchNo: "BRD-049",
    location: "Store B",
    quantity: 35,
    unit: "Pcs",
    unitPrice: 45,
    stockValue: 1575,
    expiryDate: "23 Aug 2026",
    daysLeft: 8,
    riskLevel: "High Risk",
    recommendedAction: "Clearance",
    actionType: "clearance",
  },
  {
    id: "er-6",
    productId: "prod-3",
    name: "Tropicana Orange Juice 1L",
    sku: "JUC-001",
    category: "Beverages",
    brand: "Tropicana",
    batchNo: "JUC-078",
    location: "Store B",
    quantity: 30,
    unit: "Pcs",
    unitPrice: 120,
    stockValue: 3600,
    expiryDate: "25 Aug 2026",
    daysLeft: 10,
    riskLevel: "High Risk",
    recommendedAction: "FEFO Priority",
    actionType: "fefo",
  },
  {
    id: "er-7",
    productId: "prod-3",
    name: "Tropicana Orange Juice 1L",
    sku: "JUC-001",
    category: "Beverages",
    brand: "Tropicana",
    batchNo: "JUC-079",
    location: "Central Warehouse",
    quantity: 22,
    unit: "Pcs",
    unitPrice: 120,
    stockValue: 2640,
    expiryDate: "26 Aug 2026",
    daysLeft: 11,
    riskLevel: "High Risk",
    recommendedAction: "Redistribute",
    actionType: "redistribute",
  },
  {
    id: "er-8",
    productId: "prod-5",
    name: "Amul Masti Dahi 400g",
    sku: "CRD-001",
    category: "Dairy",
    brand: "Amul",
    batchNo: "DAH-092",
    location: "Central Warehouse",
    quantity: 25,
    unit: "Pcs",
    unitPrice: 35,
    stockValue: 875,
    expiryDate: "27 Aug 2026",
    daysLeft: 12,
    riskLevel: "High Risk",
    recommendedAction: "FEFO Priority",
    actionType: "fefo",
  },
  {
    id: "er-9",
    productId: "prod-4",
    name: "Paracetamol 500mg (10 Tabs)",
    sku: "MED-001",
    category: "Healthcare",
    brand: "Cipla",
    batchNo: "MED-902",
    location: "Distribution Center",
    quantity: 85,
    unit: "Strips",
    unitPrice: 35,
    stockValue: 2975,
    expiryDate: "29 Aug 2026",
    daysLeft: 14,
    riskLevel: "High Risk",
    recommendedAction: "FEFO Priority",
    actionType: "fefo",
  },

  // ── WARNING (15-30 days) — 5 Batches ──
  {
    id: "er-10",
    productId: "prod-6",
    name: "Lays Classic Salted 52g",
    sku: "LAY-001",
    category: "Snacks",
    brand: "FritoLay",
    batchNo: "LAY-201",
    location: "Store A",
    quantity: 120,
    unit: "Pcs",
    unitPrice: 20,
    stockValue: 2400,
    expiryDate: "31 Aug 2026",
    daysLeft: 16,
    riskLevel: "Warning",
    recommendedAction: "Monitor",
    actionType: "monitor",
  },
  {
    id: "er-11",
    productId: "prod-5",
    name: "Amul Masti Dahi 400g",
    sku: "CRD-001",
    category: "Dairy",
    brand: "Amul",
    batchNo: "DAH-093",
    location: "Store A",
    quantity: 30,
    unit: "Pcs",
    unitPrice: 35,
    stockValue: 1050,
    expiryDate: "02 Sep 2026",
    daysLeft: 18,
    riskLevel: "Warning",
    recommendedAction: "Monitor",
    actionType: "monitor",
  },
  {
    id: "er-12",
    productId: "prod-4",
    name: "Paracetamol 500mg (10 Tabs)",
    sku: "MED-001",
    category: "Healthcare",
    brand: "Cipla",
    batchNo: "MED-903",
    location: "Store A",
    quantity: 40,
    unit: "Strips",
    unitPrice: 35,
    stockValue: 1400,
    expiryDate: "04 Sep 2026",
    daysLeft: 20,
    riskLevel: "Warning",
    recommendedAction: "Monitor",
    actionType: "monitor",
  },
  {
    id: "er-13",
    productId: "prod-1",
    name: "Amul Taaza Milk 1L",
    sku: "MILK-001",
    category: "Dairy",
    brand: "Amul",
    batchNo: "MLK-044",
    location: "Distribution Center",
    quantity: 50,
    unit: "Pcs",
    unitPrice: 60,
    stockValue: 3000,
    expiryDate: "08 Sep 2026",
    daysLeft: 24,
    riskLevel: "Warning",
    recommendedAction: "Monitor",
    actionType: "monitor",
  },
  {
    id: "er-14",
    productId: "prod-6",
    name: "Lays Classic Salted 52g",
    sku: "LAY-001",
    category: "Snacks",
    brand: "FritoLay",
    batchNo: "LAY-202",
    location: "Central Warehouse",
    quantity: 90,
    unit: "Pcs",
    unitPrice: 20,
    stockValue: 1800,
    expiryDate: "10 Sep 2026",
    daysLeft: 26,
    riskLevel: "Warning",
    recommendedAction: "Monitor",
    actionType: "monitor",
  },

  // ── SAFE (>30 days) — 4 Batches ──
  {
    id: "er-15",
    productId: "prod-3",
    name: "Tropicana Orange Juice 1L",
    sku: "JUC-001",
    category: "Beverages",
    brand: "Tropicana",
    batchNo: "JUC-080",
    location: "Distribution Center",
    quantity: 45,
    unit: "Pcs",
    unitPrice: 120,
    stockValue: 5400,
    expiryDate: "20 Sep 2026",
    daysLeft: 36,
    riskLevel: "Safe",
    recommendedAction: "No Action",
    actionType: "monitor",
  },
  {
    id: "er-16",
    productId: "prod-2",
    name: "Britannia Whole Wheat Bread 400g",
    sku: "BRD-001",
    category: "Bakery",
    brand: "Britannia",
    batchNo: "BRD-050",
    location: "Distribution Center",
    quantity: 40,
    unit: "Pcs",
    unitPrice: 45,
    stockValue: 1800,
    expiryDate: "25 Sep 2026",
    daysLeft: 41,
    riskLevel: "Safe",
    recommendedAction: "No Action",
    actionType: "monitor",
  },
  {
    id: "er-17",
    productId: "prod-6",
    name: "Lays Classic Salted 52g",
    sku: "LAY-001",
    category: "Snacks",
    brand: "FritoLay",
    batchNo: "LAY-203",
    location: "Store B",
    quantity: 80,
    unit: "Pcs",
    unitPrice: 20,
    stockValue: 1600,
    expiryDate: "30 Sep 2026",
    daysLeft: 46,
    riskLevel: "Safe",
    recommendedAction: "No Action",
    actionType: "monitor",
  },
  {
    id: "er-18",
    productId: "prod-4",
    name: "Paracetamol 500mg (10 Tabs)",
    sku: "MED-001",
    category: "Healthcare",
    brand: "Cipla",
    batchNo: "MED-904",
    location: "Central Warehouse",
    quantity: 120,
    unit: "Strips",
    unitPrice: 35,
    stockValue: 4200,
    expiryDate: "15 Oct 2026",
    daysLeft: 61,
    riskLevel: "Safe",
    recommendedAction: "No Action",
    actionType: "monitor",
  },
];

// ─── INTELLIGENCE INSIGHTS (DERIVED FROM DATASET) ───────────────────────────

export const INTELLIGENCE_INSIGHTS: IntelligenceInsight[] = [
  {
    id: "ins-1",
    severity: "critical",
    title: "CRITICAL",
    description:
      "Milk 1L batch MLK-042 reaches expiry in 2 days. 25 units are currently held at Central Warehouse.",
    actionLabel: "Review Batch",
    actionType: "review-batch",
  },
  {
    id: "ins-2",
    severity: "high",
    title: "HIGH IMPACT",
    description:
      "₹6,030 inventory value is exposed within the next 7 days across 4 critical batches.",
    actionLabel: "View Exposure",
    actionType: "view-exposure",
  },
  {
    id: "ins-3",
    severity: "redistribution",
    title: "REDISTRIBUTION",
    description:
      "Distribution Center has low Milk 1L stock while Central Warehouse holds 25 excess units expiring in 2 days.",
    actionLabel: "Review Transfer",
    actionType: "review-transfer",
  },
  {
    id: "ins-4",
    severity: "fefo",
    title: "FEFO",
    description:
      "18 batches prioritized for first-expiry-first-out dispatch across 4 locations.",
    actionLabel: "View FEFO Plan",
    actionType: "fefo-plan",
  },
];

// ─── RECOMMENDED ACTIONS (DATA-DRIVEN) ──────────────────────────────────────

export const RECOMMENDED_ACTIONS: RecommendedAction[] = [
  {
    id: "ra-1",
    priority: 1,
    title: "Redistribute Inventory",
    subtitle: "Amul Taaza Milk 1L",
    detail: "Central Warehouse → Distribution Center · 25 units · 2 days left",
    impact: "Potential value protected: ₹1,500",
    actionLabel: "Review Transfer",
    actionType: "transfer",
    productId: "prod-1",
    batchNo: "MLK-042",
  },
  {
    id: "ra-2",
    priority: 2,
    title: "Create Clearance",
    subtitle: "Britannia Whole Wheat Bread 400g",
    detail: "Store A · 60 units · 5 days left",
    impact: "Estimated recoverable value: ₹2,100",
    actionLabel: "Create Clearance",
    actionType: "clearance",
    productId: "prod-2",
    batchNo: "BRD-048",
  },
  {
    id: "ra-3",
    priority: 3,
    title: "Prioritize FEFO Dispatch",
    subtitle: "18 batches across 4 locations",
    detail: "First-expiry-first-out sequencing recommended",
    impact: "Prevents ₹17,695 potential stock loss",
    actionLabel: "Generate FEFO Plan",
    actionType: "fefo",
  },
  {
    id: "ra-4",
    priority: 4,
    title: "Review Supplier Options",
    subtitle: "3 products approaching expiry",
    detail: "Potential return / credit review with GreenLeaf Foods",
    impact: "Possible credit recovery opportunity",
    actionLabel: "Review Suppliers",
    actionType: "supplier",
    productId: "prod-3",
  },
];

// ─── REDISTRIBUTION OPPORTUNITIES ───────────────────────────────────────────

export const REDISTRIBUTION_OPPORTUNITIES: RedistributionOpportunity[] = [
  {
    id: "rd-1",
    productId: "prod-1",
    product: "Amul Taaza Milk 1L",
    batchNo: "MLK-042",
    from: "Central Warehouse",
    to: "Distribution Center",
    available: 25,
    needed: 15,
    unit: "Pcs",
    daysLeft: 2,
    unitPrice: 60,
    valueProtected: 900,
    confidence: "High",
  },
  {
    id: "rd-2",
    productId: "prod-3",
    product: "Tropicana Orange Juice 1L",
    batchNo: "JUC-079",
    from: "Central Warehouse",
    to: "Store A",
    available: 22,
    needed: 12,
    unit: "Pcs",
    daysLeft: 11,
    unitPrice: 120,
    valueProtected: 1440,
    confidence: "High",
  },
  {
    id: "rd-3",
    productId: "prod-5",
    product: "Amul Masti Dahi 400g",
    batchNo: "DAH-091",
    from: "Store B",
    to: "Store A",
    available: 18,
    needed: 10,
    unit: "Pcs",
    daysLeft: 3,
    unitPrice: 35,
    valueProtected: 350,
    confidence: "Medium",
  },
  {
    id: "rd-4",
    productId: "prod-2",
    product: "Britannia Whole Wheat Bread 400g",
    batchNo: "BRD-048",
    from: "Store A",
    to: "Distribution Center",
    available: 60,
    needed: 20,
    unit: "Pcs",
    daysLeft: 5,
    unitPrice: 45,
    valueProtected: 900,
    confidence: "Medium",
  },
];

// ─── DYNAMIC FEFO PRIORITY QUEUE GENERATOR ──────────────────────────────────

export function getFefoQueue(): FefoEntry[] {
  return EXPIRY_RISK_ITEMS.slice()
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .map((item, idx) => {
      let suggestedAction: "Dispatch First" | "Dispatch Next" | "Prioritize" | "Queue" | "Standard" = "Standard";
      if (item.daysLeft <= 3) suggestedAction = "Dispatch First";
      else if (item.daysLeft <= 7) suggestedAction = "Dispatch Next";
      else if (item.daysLeft <= 14) suggestedAction = "Prioritize";
      else if (item.daysLeft <= 30) suggestedAction = "Queue";

      return {
        priority: idx + 1,
        id: item.id,
        productId: item.productId,
        product: item.name,
        sku: item.sku,
        batchNo: item.batchNo,
        location: item.location,
        expiryDate: item.expiryDate,
        daysLeft: item.daysLeft,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        stockValue: item.stockValue,
        suggestedAction,
        riskLevel: item.riskLevel,
      };
    });
}

export const FEFO_QUEUE = getFefoQueue();

// ─── DYNAMIC EXPIRY RISK TIMELINE GENERATOR ─────────────────────────────────

export function getExpiryTimeline(): TimelinePoint[] {
  const points = [
    { label: "Today", maxDays: 1 },
    { label: "3D", maxDays: 3 },
    { label: "7D", maxDays: 7 },
    { label: "14D", maxDays: 14 },
    { label: "30D", maxDays: 30 },
    { label: "60D", maxDays: 60 },
    { label: "90D", maxDays: 90 },
  ];

  return points.map((p) => {
    const matching = EXPIRY_RISK_ITEMS.filter((i) => i.daysLeft <= p.maxDays);
    const count = matching.length;
    const value = matching.reduce((s, i) => s + i.stockValue, 0);
    return {
      label: p.label,
      items: count,
      value,
    };
  });
}

export const EXPIRY_TIMELINE = getExpiryTimeline();

// ─── EXPIRY RISK TREND (HISTORICAL 30-DAY ANCHORED DATA) ────────────────────

export const EXPIRY_TREND: TrendPoint[] = [
  { day: "Jul 17", atRisk: 22, critical: 8, recovered: 31000 },
  { day: "Jul 20", atRisk: 24, critical: 9, recovered: 34000 },
  { day: "Jul 23", atRisk: 21, critical: 7, recovered: 38000 },
  { day: "Jul 26", atRisk: 19, critical: 6, recovered: 42000 },
  { day: "Jul 29", atRisk: 23, critical: 8, recovered: 45000 },
  { day: "Aug 01", atRisk: 20, critical: 7, recovered: 48000 },
  { day: "Aug 04", atRisk: 18, critical: 5, recovered: 52000 },
  { day: "Aug 07", atRisk: 16, critical: 4, recovered: 56000 },
  { day: "Aug 10", atRisk: 15, critical: 4, recovered: 59000 },
  { day: "Aug 13", atRisk: 14, critical: 4, recovered: 62000 },
  { day: "Aug 15", atRisk: 14, critical: 4, recovered: 64000 },
];

// ─── CSV EXPORT UTILITIES ───────────────────────────────────────────────────

export function generateRiskReportCSV(items: ExpiryRiskItem[] = EXPIRY_RISK_ITEMS): string {
  const headers = [
    "Product Name",
    "SKU",
    "Batch Number",
    "Location",
    "Category",
    "Quantity",
    "Unit",
    "Unit Price (INR)",
    "Stock Value (INR)",
    "Expiry Date",
    "Days Remaining",
    "Risk Classification",
    "Recommended Action",
  ];

  const rows = items.map((i) => [
    `"${i.name}"`,
    `"${i.sku}"`,
    `"${i.batchNo}"`,
    `"${i.location}"`,
    `"${i.category}"`,
    i.quantity,
    `"${i.unit}"`,
    i.unitPrice,
    i.stockValue,
    `"${i.expiryDate}"`,
    i.daysLeft,
    `"${i.riskLevel}"`,
    `"${i.recommendedAction}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function generateFefoPlanCSV(): string {
  const headers = [
    "Priority Rank",
    "Product Name",
    "SKU",
    "Batch Number",
    "Location",
    "Expiry Date",
    "Days Left",
    "Quantity",
    "Unit",
    "Unit Price (INR)",
    "Stock Value (INR)",
    "Suggested Dispatch Action",
    "Risk Level",
  ];

  const queue = getFefoQueue();
  const rows = queue.map((i) => [
    i.priority,
    `"${i.product}"`,
    `"${i.sku}"`,
    `"${i.batchNo}"`,
    `"${i.location}"`,
    `"${i.expiryDate}"`,
    i.daysLeft,
    i.quantity,
    `"${i.unit}"`,
    i.unitPrice,
    i.stockValue,
    `"${i.suggestedAction}"`,
    `"${i.riskLevel}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
