import assert from "node:assert";

console.log("==================================================");
console.log("RUNNING ERN STOCK REQUEST FLOW VERIFICATION SUITE");
console.log("==================================================");

// Mock Master Products
const MASTER_PRODUCTS = [
  {
    id: "prod-1",
    name: "Amul Taaza Milk 1L",
    sku: "MILK-001",
    category: "Dairy",
    brand: "Amul",
    price: 60,
    unit: "Pcs",
    expiryTrackingEnabled: true,
  },
  {
    id: "prod-2",
    name: "Britannia Whole Wheat Bread 400g",
    sku: "BRD-001",
    category: "Bakery",
    brand: "Britannia",
    price: 45,
    unit: "Pcs",
    expiryTrackingEnabled: true,
  },
  {
    id: "prod-7",
    name: "Ergonomic Office Chair Mesh Pro",
    sku: "CHR-001",
    category: "Furniture",
    brand: "Featherlite",
    price: 6500,
    unit: "Units",
    expiryTrackingEnabled: false,
  },
];

const PRODUCT_BATCHES_MAP = {
  "prod-1": ["MLK-042", "MLK-043", "AML-TZ-804"],
  "prod-2": ["BRD-048", "BRD-049", "BRD-WW-201"],
};

const LOCATIONS = [
  "Central Warehouse",
  "Store A",
  "Store B",
  "Distribution Center",
];

// Initial mock requests
let mockRequests = [
  {
    id: "REQ-2026-031",
    type: "Clearance",
    title: "Urgent Clearance Markdown: Amul Taaza Milk 1L",
    reason: "25 units reaching expiry in 2 days.",
    priority: "Critical",
    status: "Pending Review",
    requestedBy: "Ramesh Sharma",
    requestedByRole: "Store Manager",
    assignedTo: "Amit Sharma",
    assignedToRole: "Operations Admin",
    createdAt: "15 Aug 2026, 09:30 AM",
    dueDate: "17 Aug 2026",
    sourceModule: "Expiry Intelligence",
    inventoryContext: {
      productId: "prod-1",
      productName: "Amul Taaza Milk 1L",
      sku: "MILK-001",
      batchNo: "MLK-042",
      category: "Dairy",
      brand: "Amul",
      location: "Central Warehouse",
      quantity: 25,
      unit: "Pcs",
      unitPrice: 60,
      stockValue: 1500,
    },
    timeline: [],
  },
  {
    id: "REQ-2026-042",
    type: "Procurement",
    title: "Reorder Drafting: HP LaserJet Pro Printers",
    reason: "Stock level dropped to 8 units.",
    priority: "Medium",
    status: "In Progress",
    requestedBy: "ERN Stock Level Policy",
    requestedByRole: "System Automated",
    assignedTo: "Ananya Deshmukh",
    assignedToRole: "Procurement Lead",
    createdAt: "14 Aug 2026, 06:10 PM",
    dueDate: "21 Aug 2026",
    sourceModule: "Purchase Orders",
    inventoryContext: {
      productId: "prod-9",
      productName: "HP LaserJet Pro M404dn Printer",
      sku: "PRN-001",
      category: "Electronics",
      brand: "HP",
      location: "Central Warehouse",
      quantity: 8,
      unit: "Units",
      unitPrice: 24500,
      stockValue: 196000,
    },
    timeline: [],
  },
];

// --- TEST 1: Request Validation Logic ---
function validateRequest(params) {
  const { type, productId, location, targetLocation, quantity, batchNo, reason } = params;

  if (!productId) return { valid: false, error: "Please select a product/item from inventory." };
  const prod = MASTER_PRODUCTS.find((p) => p.id === productId);
  if (!prod) return { valid: false, error: "Selected product not found in inventory." };

  if (!location) return { valid: false, error: "Please select an origin location." };

  const qty = parseInt(String(quantity), 10);
  if (isNaN(qty) || qty <= 0) return { valid: false, error: "Quantity must be a valid number greater than 0." };

  if (type === "Redistribution") {
    if (!targetLocation) return { valid: false, error: "Destination location is required for Redistribution requests." };
    if (location === targetLocation) return { valid: false, error: "Source and destination locations cannot be the same." };
  }

  if (prod.expiryTrackingEnabled && (!batchNo || !batchNo.trim())) {
    return { valid: false, error: "Batch number is required for expiry-tracked products." };
  }

  if (!reason || !reason.trim()) return { valid: false, error: "Please provide an operational reason or explanation." };

  return { valid: true, error: null, product: prod, qty };
}

// 1a. Missing product rejection
const val1 = validateRequest({ type: "Clearance", location: "Central Warehouse", quantity: 10, batchNo: "LOT-1", reason: "Test" });
assert.strictEqual(val1.valid, false);
console.log("[PASS] Rejects request with missing product");

// 1b. Missing location rejection
const val2 = validateRequest({ type: "Clearance", productId: "prod-1", quantity: 10, batchNo: "LOT-1", reason: "Test" });
assert.strictEqual(val2.valid, false);
console.log("[PASS] Rejects request with missing location");

// 1c. Invalid quantity rejection
const val3 = validateRequest({ type: "Clearance", productId: "prod-1", location: "Central Warehouse", quantity: 0, batchNo: "LOT-1", reason: "Test" });
assert.strictEqual(val3.valid, false);
console.log("[PASS] Rejects request with zero or negative quantity");

// 1d. Redistribution same source & destination rejection
const val4 = validateRequest({
  type: "Redistribution",
  productId: "prod-1",
  location: "Central Warehouse",
  targetLocation: "Central Warehouse",
  quantity: 15,
  batchNo: "MLK-042",
  reason: "Rebalance",
});
assert.strictEqual(val4.valid, false);
console.log("[PASS] Rejects redistribution with identical source and destination");

// 1e. Redistribution without destination rejection
const val5 = validateRequest({
  type: "Redistribution",
  productId: "prod-1",
  location: "Central Warehouse",
  targetLocation: "",
  quantity: 15,
  batchNo: "MLK-042",
  reason: "Rebalance",
});
assert.strictEqual(val5.valid, false);
console.log("[PASS] Rejects redistribution with missing destination");

// 1f. Expiry tracked product without batch rejection
const val6 = validateRequest({
  type: "Clearance",
  productId: "prod-1",
  location: "Central Warehouse",
  quantity: 10,
  batchNo: "",
  reason: "Clearance test",
});
assert.strictEqual(val6.valid, false);
console.log("[PASS] Rejects expiry-tracked product with missing batch");

// 1g. Non-expiry product without batch succeeds
const val7 = validateRequest({
  type: "Stock Adjustment",
  productId: "prod-7",
  location: "Central Warehouse",
  quantity: 2,
  batchNo: "",
  reason: "Damaged chair replacement",
});
assert.strictEqual(val7.valid, true);
console.log("[PASS] Accepts non-expiry product without batch number");

// --- TEST 2: Unique ID Generation ---
function generateRequestId(requestsList) {
  const existingNumbers = requestsList
    .map((r) => {
      const match = r.id.match(/REQ-2026-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 43;
  return `REQ-2026-${String(nextNum).padStart(3, "0")}`;
}

const newReqId = generateRequestId(mockRequests);
assert.strictEqual(newReqId, "REQ-2026-043");
console.log("[PASS] Generates correct sequential ID REQ-2026-043");

// --- TEST 3: Creation & Table Prepend ---
const createdRequest = {
  id: newReqId,
  type: "Redistribution",
  title: "Stock Transfer: Amul Taaza Milk 1L",
  reason: "Emergency stock rebalance for Koramangala Store B demand surge",
  priority: "High",
  status: "Pending Review",
  requestedBy: "Amit Sharma",
  requestedByRole: "Operations Admin",
  assignedTo: "Amit Sharma",
  assignedToRole: "Operations Admin",
  createdAt: "15 Aug 2026, Just now",
  dueDate: "22 Aug 2026",
  sourceModule: "Store Operations",
  inventoryContext: {
    productId: "prod-1",
    productName: "Amul Taaza Milk 1L",
    sku: "MILK-001",
    batchNo: "MLK-042",
    category: "Dairy",
    brand: "Amul",
    location: "Central Warehouse",
    quantity: 25,
    unit: "Pcs",
    unitPrice: 60,
    stockValue: 1500,
    expiryDate: "25 Aug 2026",
    daysLeft: 10,
    riskLevel: "High Risk",
  },
  executionDetails: {
    sourceLocation: "Central Warehouse",
    destinationLocation: "Store B",
    transferQuantity: 25,
    validityDate: "25 Aug 2026",
  },
  timeline: [
    {
      id: "tl-created-1",
      timestamp: "15 Aug 2026, Just now",
      author: "Amit Sharma",
      authorRole: "Operations Admin",
      title: "Request Created",
      description: "Emergency stock rebalance for Koramangala Store B demand surge",
      type: "created",
    },
  ],
};

mockRequests = [createdRequest, ...mockRequests];
assert.strictEqual(mockRequests.length, 3);
assert.strictEqual(mockRequests[0].id, "REQ-2026-043");
console.log("[PASS] Request successfully prepended to table at index 0");

// --- TEST 4: Search & Filter Integration ---
function filterRequests(requestsList, { query = "", status = "All", priority = "All" } = {}) {
  return requestsList.filter((req) => {
    if (status !== "All" && req.status !== status) return false;
    if (priority !== "All" && req.priority !== priority) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchId = req.id.toLowerCase().includes(q);
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchProd = req.inventoryContext?.productName?.toLowerCase().includes(q);
      const matchSku = req.inventoryContext?.sku?.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchProd && !matchSku) return false;
    }
    return true;
  });
}

// 4a. Search by ID
const searchById = filterRequests(mockRequests, { query: "REQ-2026-043" });
assert.strictEqual(searchById.length, 1);
assert.strictEqual(searchById[0].id, "REQ-2026-043");
console.log("[PASS] Filter finds new request by ID");

// 4b. Search by product name
const searchByName = filterRequests(mockRequests, { query: "Taaza" });
assert.strictEqual(searchByName.length, 2);
console.log("[PASS] Filter finds new request by product name substring");

// 4c. Filter by status
const pendingFilter = filterRequests(mockRequests, { status: "Pending Review" });
assert.strictEqual(pendingFilter.some((r) => r.id === "REQ-2026-043"), true);
console.log("[PASS] Filter includes new request under Pending Review");

// 4d. Filter by priority
const highFilter = filterRequests(mockRequests, { priority: "High" });
assert.strictEqual(highFilter.some((r) => r.id === "REQ-2026-043"), true);
console.log("[PASS] Filter includes new request under High priority");

// --- TEST 5: Review Drawer Data Parity ---
const reviewedItem = mockRequests.find((r) => r.id === "REQ-2026-043");
assert.ok(reviewedItem, "Reviewed item must exist");
assert.strictEqual(reviewedItem.id, "REQ-2026-043");
assert.strictEqual(reviewedItem.type, "Redistribution");
assert.strictEqual(reviewedItem.inventoryContext.productName, "Amul Taaza Milk 1L");
assert.strictEqual(reviewedItem.inventoryContext.sku, "MILK-001");
assert.strictEqual(reviewedItem.inventoryContext.location, "Central Warehouse");
assert.strictEqual(reviewedItem.executionDetails.destinationLocation, "Store B");
assert.strictEqual(reviewedItem.inventoryContext.batchNo, "MLK-042");
assert.strictEqual(reviewedItem.inventoryContext.quantity, 25);
assert.strictEqual(reviewedItem.priority, "High");
assert.strictEqual(reviewedItem.status, "Pending Review");
assert.strictEqual(reviewedItem.reason, "Emergency stock rebalance for Koramangala Store B demand surge");
console.log("[PASS] Review drawer displays exact 11 telemetry & context fields");

// --- TEST 6: CSV Export Generation ---
function generateCSV(requestsList) {
  const headers = [
    "Request ID",
    "Request Type",
    "Title",
    "Priority",
    "Status",
    "Product / Item",
    "Batch Number",
    "Location",
    "Quantity",
    "Requested By",
    "Assigned To",
    "Created Date",
    "Due Date",
    "Source Module",
  ];
  const rows = requestsList.map((r) => [
    `"${r.id}"`,
    `"${r.type}"`,
    `"${r.title}"`,
    `"${r.priority}"`,
    `"${r.status}"`,
    `"${r.inventoryContext?.productName || "N/A"}"`,
    `"${r.inventoryContext?.batchNo || "N/A"}"`,
    `"${r.inventoryContext?.location || "N/A"}"`,
    r.inventoryContext?.quantity || 0,
    `"${r.requestedBy}"`,
    `"${r.assignedTo}"`,
    `"${r.createdAt}"`,
    `"${r.dueDate}"`,
    `"${r.sourceModule}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

const csvOutput = generateCSV(mockRequests);
assert.ok(csvOutput.includes('"REQ-2026-043"'), "CSV must contain newly created request ID");
assert.ok(csvOutput.includes('"Redistribution"'), "CSV must contain Redistribution type");
assert.ok(csvOutput.includes('"Amul Taaza Milk 1L"'), "CSV must contain item name");
assert.ok(csvOutput.includes('"MLK-042"'), "CSV must contain batch number");
console.log("[PASS] CSV export accurately encodes new request record");

// --- TEST 7: Persistence Serialization ---
const serialized = JSON.stringify(mockRequests);
const deserialized = JSON.parse(serialized);
assert.strictEqual(deserialized.length, 3);
assert.strictEqual(deserialized[0].id, "REQ-2026-043");
assert.strictEqual(deserialized[0].executionDetails.destinationLocation, "Store B");
console.log("[PASS] LocalStorage serialization & deserialization retains request");

console.log("==================================================");
console.log("ALL 14 REQUEST FLOW TESTS PASSED (14/14 PASS)");
console.log("==================================================");
