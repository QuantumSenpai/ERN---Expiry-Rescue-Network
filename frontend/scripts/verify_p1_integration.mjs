// ERN P1 Inventory -> Marketplace -> Order Integration Test Suite
// Simulates browser localStorage and tests all core flows

// Mock localStorage and window events for node environment
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
};

global.window = {
  dispatchEvent: (event) => {},
  addEventListener: (type, listener) => {},
  removeEventListener: (type, listener) => {}
};
global.CustomEvent = class CustomEvent {
  constructor(type, detail) {
    this.type = type;
    this.detail = detail;
  }
};

function getRelativeIsoDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

// Import our inventory store logic
const INITIAL_STORE_INVENTORIES = {
  "main-branch": [
    {
      id: "INV-MB-001",
      productId: "prod-1",
      name: "Amul Taaza Toned Milk 1L",
      category: "Dairy & Eggs",
      brand: "Amul",
      unit: "1 L",
      mrp: 56,
      currentPrice: 42,
      storeId: "main-branch",
      storeName: "Main Branch (Indiranagar)",
      totalStock: 30,
      batches: [
        {
          id: "BAT-MB-001-A",
          batchNumber: "ATM-2603-A",
          mfgDate: getRelativeIsoDate(-10),
          expiryDate: getRelativeIsoDate(4),
          quantity: 18,
          costPrice: 48,
          sellingPrice: 42,
          discountPercentage: 25,
          tier: "Rescue (Moderate)",
          status: "active",
          location: "Aisle 2 - Cold Rack 1"
        },
        {
          id: "BAT-MB-001-B",
          batchNumber: "ATM-2603-B",
          mfgDate: getRelativeIsoDate(-2),
          expiryDate: getRelativeIsoDate(90),
          quantity: 12,
          costPrice: 50,
          sellingPrice: 54,
          discountPercentage: 4,
          tier: "Normal",
          status: "active",
          location: "Aisle 2 - Cold Rack 2"
        }
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "INV-MB-002",
      productId: "prod-2",
      name: "Britannia 100% Whole Wheat Bread",
      category: "Bakery & Bread",
      brand: "Britannia",
      unit: "400 g",
      mrp: 50,
      currentPrice: 28,
      storeId: "main-branch",
      storeName: "Main Branch (Indiranagar)",
      totalStock: 25,
      batches: [
        {
          id: "BAT-MB-002-A",
          batchNumber: "BWB-2603-A",
          mfgDate: getRelativeIsoDate(-4),
          expiryDate: getRelativeIsoDate(2),
          quantity: 15,
          costPrice: 40,
          sellingPrice: 28,
          discountPercentage: 44,
          tier: "Rescue (Urgent)",
          status: "active",
          location: "Aisle 1 - Bread Stand"
        },
        {
          id: "BAT-MB-002-B",
          batchNumber: "BWB-2603-B",
          mfgDate: getRelativeIsoDate(-1),
          expiryDate: getRelativeIsoDate(5),
          quantity: 10,
          costPrice: 45,
          sellingPrice: 48,
          discountPercentage: 4,
          tier: "Normal",
          status: "active",
          location: "Aisle 1 - Back Shelf"
        }
      ],
      lastUpdated: new Date().toISOString()
    }
  ],
  "city-center": [
    {
      id: "INV-CC-001",
      productId: "prod-1",
      name: "Amul Taaza Toned Milk 1L",
      category: "Dairy & Eggs",
      brand: "Amul",
      unit: "1 L",
      mrp: 56,
      currentPrice: 38,
      storeId: "city-center",
      storeName: "City Center (MG Road)",
      totalStock: 22,
      batches: [
        {
          id: "BAT-CC-001-A",
          batchNumber: "ATM-CC-2603",
          mfgDate: getRelativeIsoDate(-5),
          expiryDate: getRelativeIsoDate(3),
          quantity: 22,
          costPrice: 48,
          sellingPrice: 38,
          discountPercentage: 32,
          tier: "Rescue (Urgent)",
          status: "active",
          location: "Dairy Chiller 1"
        }
      ],
      lastUpdated: new Date().toISOString()
    }
  ]
};

const INVENTORY_STORAGE_KEY = 'ern_shop_inventory_store';

function normalizeStoreId(rawId) {
  if (!rawId) return 'main-branch';
  const val = rawId.toLowerCase();
  if (val.includes('indiranagar') || val.includes('main')) return 'main-branch';
  if (val.includes('mg road') || val.includes('city')) return 'city-center';
  if (val.includes('koramangala') || val.includes('north')) return 'north-outlet';
  if (val.includes('whitefield') || val.includes('east')) return 'east-wing';
  return rawId;
}

function getAllStoreInventories() {
  const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_STORE_INVENTORIES));
  return INITIAL_STORE_INVENTORIES;
}

function getStoreInventory(storeId) {
  const normalized = normalizeStoreId(storeId);
  const all = getAllStoreInventories();
  return all[normalized] || [];
}

function decrementBatchStock(storeId, productId, batchNumber, quantity) {
  const normalized = normalizeStoreId(storeId);
  const all = getAllStoreInventories();
  const storeItems = all[normalized] || [];

  let decremented = false;
  const updatedItems = storeItems.map(item => {
    if (item.productId !== productId) return item;

    let updatedBatches = item.batches.map(batch => {
      if (batch.batchNumber === batchNumber || batch.id === batchNumber) {
        const newQty = Math.max(0, batch.quantity - quantity);
        decremented = true;
        return {
          ...batch,
          quantity: newQty,
          status: newQty === 0 ? 'depleted' : batch.status
        };
      }
      return batch;
    });

    const newTotalStock = updatedBatches.reduce((acc, b) => acc + (b.status !== 'depleted' && b.status !== 'expired' ? b.quantity : 0), 0);
    return {
      ...item,
      batches: updatedBatches,
      totalStock: newTotalStock,
      lastUpdated: new Date().toISOString()
    };
  });

  if (decremented) {
    all[normalized] = updatedItems;
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(all));
  }
  return decremented;
}

function validateBatchStock(storeId, productId, batchNumber, requestedQuantity) {
  const normalized = normalizeStoreId(storeId);
  const items = getStoreInventory(normalized);
  const product = items.find(i => i.productId === productId);
  if (!product) {
    return { valid: false, message: "Product is not available at this store location.", availableStock: 0 };
  }

  const batch = product.batches.find(b => b.batchNumber === batchNumber || b.id === batchNumber);
  if (!batch) {
    return { valid: false, message: "Selected product batch is no longer available.", availableStock: 0 };
  }

  const today = new Date('2026-09-05T00:00:00Z');
  const expiry = new Date(batch.expiryDate);
  if (expiry < today) {
    return { valid: false, message: `Batch ${batch.batchNumber} has expired on ${batch.expiryDate}.`, availableStock: 0 };
  }

  if (batch.quantity < requestedQuantity) {
    return {
      valid: false,
      message: `Only ${batch.quantity} units available for batch ${batch.batchNumber}.`,
      availableStock: batch.quantity
    };
  }

  return { valid: true, availableStock: batch.quantity };
}

// RUN TESTS
console.log("==================================================");
console.log("RUNNING ERN P1 INTEGRATION TEST SUITE");
console.log("==================================================");

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// TEST 1: Store Normalization
assert(normalizeStoreId("Main Branch (Indiranagar)") === "main-branch", "normalizeStoreId handles display names");
assert(normalizeStoreId("city-center") === "city-center", "normalizeStoreId handles slug IDs");
assert(normalizeStoreId("Koramangala 4th Block") === "north-outlet", "normalizeStoreId handles locality search");

// TEST 2: Initial Inventory Load
const mbInventory = getStoreInventory("main-branch");
assert(mbInventory.length >= 2, "Main branch inventory loaded with >= 2 items");
const amulMilk = mbInventory.find(i => i.productId === "prod-1");
assert(amulMilk && amulMilk.batches.length === 2, "Amul Milk has 2 active batches (Rescue + Normal)");
assert(amulMilk.batches[0].quantity === 18, "Amul Milk batch ATM-2603-A has 18 initial stock");

// TEST 3: Batch Stock Validation
const validStockCheck = validateBatchStock("main-branch", "prod-1", "ATM-2603-A", 2);
assert(validStockCheck.valid === true && validStockCheck.availableStock === 18, "validateBatchStock approves requested quantity 2 <= 18");

const invalidExcessCheck = validateBatchStock("main-branch", "prod-1", "ATM-2603-A", 50);
assert(invalidExcessCheck.valid === false && invalidExcessCheck.availableStock === 18, "validateBatchStock rejects excessive quantity 50 > 18");

// TEST 4: Stock Decrement on Order Placement
const decrementResult = decrementBatchStock("main-branch", "prod-1", "ATM-2603-A", 2);
assert(decrementResult === true, "decrementBatchStock succeeds for valid batch");

const updatedMB = getStoreInventory("main-branch");
const updatedMilk = updatedMB.find(i => i.productId === "prod-1");
const updatedBatchA = updatedMilk.batches.find(b => b.batchNumber === "ATM-2603-A");
assert(updatedBatchA.quantity === 16, "Batch ATM-2603-A quantity decremented from 18 to 16");
assert(updatedMilk.totalStock === 28, "Product total stock updated to 28 (16 + 12)");

// TEST 5: Store Isolation (City Center unaffected by Main Branch order)
const ccInventory = getStoreInventory("city-center");
const ccMilk = ccInventory.find(i => i.productId === "prod-1");
assert(ccMilk.batches[0].quantity === 22, "City Center batch ATM-CC-2603 stock remains 22 (isolated)");

// TEST 6: Depletion Handling
decrementBatchStock("main-branch", "prod-1", "ATM-2603-A", 16);
const depletedMB = getStoreInventory("main-branch");
const depletedBatchA = depletedMB.find(i => i.productId === "prod-1").batches.find(b => b.batchNumber === "ATM-2603-A");
assert(depletedBatchA.quantity === 0 && depletedBatchA.status === 'depleted', "Depleted batch marked as depleted when quantity reaches 0");

const depletedStockCheck = validateBatchStock("main-branch", "prod-1", "ATM-2603-A", 1);
assert(depletedStockCheck.valid === false, "Depleted batch fails stock validation");

console.log("==================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("==================================================");
if (failed > 0) process.exit(1);
