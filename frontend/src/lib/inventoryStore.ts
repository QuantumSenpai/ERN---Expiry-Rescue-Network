import { useState, useEffect, useCallback } from "react";
import type { InventoryItem, BatchItem, ExpiryStatus, StockStatus } from "@/types/inventory";
import {
  MASTER_PRODUCTS,
  type MarketplaceProduct,
  type ProductOffer,
} from "@/data/marketplaceData";
import { calculateExpiryStatus, getRelativeIsoDate } from "@/lib/expiryService";
import { calculatePricing } from "@/lib/pricingService";

const INVENTORY_STORAGE_KEY = "ern_store_inventory_v2";
export const INVENTORY_UPDATE_EVENT = "ern-inventory-updated";

export interface InventoryStoreItem extends InventoryItem {
  storeId: string;
  rescuePrice?: number;
}

// ─── INITIAL STORE SEED DATA ──────────────────────────────────────────────────
// Initial inventory items distributed across authentic ERN network stores
const INITIAL_INVENTORY_ITEMS: InventoryStoreItem[] = [
  // ── 1. MAIN BRANCH (Indiranagar Hub) ──
  {
    id: "inv-mb-1",
    storeId: "main-branch",
    productId: "PRD-AML-01",
    name: "Amul Taaza Toned Milk 1L",
    sku: "MILK-001",
    barcode: "8901030700032",
    category: "Dairy & Eggs",
    brand: "Amul",
    store: "Main Branch",
    quantity: 18,
    minStockLevel: 10,
    unit: "1L",
    unitPrice: 54,
    rescuePrice: 36,
    stockValue: 54 * 18,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "AML-TZ-804",
    mfgDate: getRelativeIsoDate(-10),
    expiryDate: getRelativeIsoDate(4),
    daysRemaining: 4,
    expiryStatus: "Warning",
    aisleLocation: "Chiller Bay 3",
  },
  {
    id: "inv-mb-2",
    storeId: "main-branch",
    productId: "PRD-AML-01",
    name: "Amul Taaza Toned Milk 1L",
    sku: "MILK-001-F",
    barcode: "8901030700032",
    category: "Dairy & Eggs",
    brand: "Amul",
    store: "Main Branch",
    quantity: 45,
    minStockLevel: 15,
    unit: "1L",
    unitPrice: 54,
    rescuePrice: 54,
    stockValue: 54 * 45,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "AML-TZ-910",
    mfgDate: getRelativeIsoDate(-2),
    expiryDate: getRelativeIsoDate(90),
    daysRemaining: 90,
    expiryStatus: "Safe",
    aisleLocation: "Chiller Bay 3",
  },
  {
    id: "inv-mb-3",
    storeId: "main-branch",
    productId: "PRD-BRD-01",
    name: "Britannia 100% Whole Wheat Bread 400g",
    sku: "BRD-001",
    barcode: "8901063312001",
    category: "Bakery & Breads",
    brand: "Britannia",
    store: "Main Branch",
    quantity: 12,
    minStockLevel: 10,
    unit: "400g",
    unitPrice: 50,
    rescuePrice: 25,
    stockValue: 50 * 12,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "BRD-WW-301",
    mfgDate: getRelativeIsoDate(-4),
    expiryDate: getRelativeIsoDate(2),
    daysRemaining: 2,
    expiryStatus: "Critical",
    aisleLocation: "Bakery Aisle 1",
  },
  {
    id: "inv-mb-4",
    storeId: "main-branch",
    productId: "PRD-CRD-01",
    name: "Amul Masti Dahi 400g Pouch",
    sku: "CRD-001",
    barcode: "8901023156789",
    category: "Dairy & Eggs",
    brand: "Amul",
    store: "Main Branch",
    quantity: 24,
    minStockLevel: 10,
    unit: "400g",
    unitPrice: 35,
    rescuePrice: 24,
    stockValue: 35 * 24,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "CRD-MST-102",
    mfgDate: getRelativeIsoDate(-5),
    expiryDate: getRelativeIsoDate(5),
    daysRemaining: 5,
    expiryStatus: "Warning",
    aisleLocation: "Chiller Bay 4",
  },
  {
    id: "inv-mb-5",
    storeId: "main-branch",
    productId: "PRD-JUC-01",
    name: "Tropicana 100% Orange Juice 1L",
    sku: "JUC-001",
    barcode: "8901056201550",
    category: "Tea, Coffee & Juices",
    brand: "Tropicana",
    store: "Main Branch",
    quantity: 15,
    minStockLevel: 8,
    unit: "1L",
    unitPrice: 140,
    rescuePrice: 77,
    stockValue: 140 * 15,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "TPC-OJ-440",
    mfgDate: getRelativeIsoDate(-30),
    expiryDate: getRelativeIsoDate(6),
    daysRemaining: 6,
    expiryStatus: "Warning",
    aisleLocation: "Beverage Rack B",
  },
  {
    id: "inv-mb-6",
    storeId: "main-branch",
    productId: "PRD-ATT-01",
    name: "Aashirvaad Superior MP Sharbati Atta 5kg",
    sku: "ATT-001",
    barcode: "8901030383341",
    category: "Atta, Rice & Dals",
    brand: "Aashirvaad",
    store: "Main Branch",
    quantity: 30,
    minStockLevel: 10,
    unit: "5kg",
    unitPrice: 295,
    rescuePrice: 215,
    stockValue: 295 * 30,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "ASH-AT-112",
    mfgDate: getRelativeIsoDate(-60),
    expiryDate: getRelativeIsoDate(22),
    daysRemaining: 22,
    expiryStatus: "Safe",
    aisleLocation: "Staples Aisle 4",
  },
  {
    id: "inv-mb-7",
    storeId: "main-branch",
    productId: "PRD-OIL-01",
    name: "Fortune Sunlite Refined Sunflower Oil 1L",
    sku: "OIL-001",
    barcode: "8906007280014",
    category: "Edible Oils & Ghee",
    brand: "Fortune",
    store: "Main Branch",
    quantity: 40,
    minStockLevel: 12,
    unit: "1L Pouch",
    unitPrice: 145,
    rescuePrice: 108,
    stockValue: 145 * 40,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "FTN-SO-901",
    mfgDate: getRelativeIsoDate(-45),
    expiryDate: getRelativeIsoDate(18),
    daysRemaining: 18,
    expiryStatus: "Safe",
    aisleLocation: "Oil Bay C",
  },
  {
    id: "inv-mb-8",
    storeId: "main-branch",
    productId: "PRD-LAY-01",
    name: "Lay's Classic Salted Potato Chips 52g",
    sku: "LAY-001",
    barcode: "8901491101235",
    category: "Snacks & Munchies",
    brand: "Lay's",
    store: "Main Branch",
    quantity: 50,
    minStockLevel: 15,
    unit: "52g",
    unitPrice: 20,
    rescuePrice: 13,
    stockValue: 20 * 50,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "LAY-CS-221",
    mfgDate: getRelativeIsoDate(-25),
    expiryDate: getRelativeIsoDate(15),
    daysRemaining: 15,
    expiryStatus: "Warning",
    aisleLocation: "Snacks Gondola 1",
  },

  // ── 2. CITY CENTER (MG Road) ──
  {
    id: "inv-cc-1",
    storeId: "city-center",
    productId: "PRD-AML-01",
    name: "Amul Taaza Toned Milk 1L",
    sku: "MILK-001-CC",
    barcode: "8901030700032",
    category: "Dairy & Eggs",
    brand: "Amul",
    store: "City Center",
    quantity: 14,
    minStockLevel: 8,
    unit: "1L",
    unitPrice: 54,
    rescuePrice: 38,
    stockValue: 54 * 14,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "AML-TZ-CC-1",
    mfgDate: getRelativeIsoDate(-8),
    expiryDate: getRelativeIsoDate(5),
    daysRemaining: 5,
    expiryStatus: "Warning",
    aisleLocation: "Chiller Bay 1",
  },
  {
    id: "inv-cc-2",
    storeId: "city-center",
    productId: "PRD-JUC-01",
    name: "Tropicana 100% Orange Juice 1L",
    sku: "JUC-001-CC",
    barcode: "8901056201550",
    category: "Tea, Coffee & Juices",
    brand: "Tropicana",
    store: "City Center",
    quantity: 20,
    minStockLevel: 5,
    unit: "1L",
    unitPrice: 140,
    rescuePrice: 84,
    stockValue: 140 * 20,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "TPC-OJ-CC-2",
    mfgDate: getRelativeIsoDate(-20),
    expiryDate: getRelativeIsoDate(10),
    daysRemaining: 10,
    expiryStatus: "Warning",
    aisleLocation: "Beverages C",
  },
  {
    id: "inv-cc-3",
    storeId: "city-center",
    productId: "PRD-BRD-01",
    name: "Britannia 100% Whole Wheat Bread 400g",
    sku: "BRD-001-CC",
    barcode: "8901063312001",
    category: "Bakery & Breads",
    brand: "Britannia",
    store: "City Center",
    quantity: 8,
    minStockLevel: 5,
    unit: "400g",
    unitPrice: 50,
    rescuePrice: 30,
    stockValue: 50 * 8,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "BRD-WW-CC-3",
    mfgDate: getRelativeIsoDate(-3),
    expiryDate: getRelativeIsoDate(3),
    daysRemaining: 3,
    expiryStatus: "Critical",
    aisleLocation: "Bakery Shelf 1",
  },

  // ── 3. NORTH OUTLET (Koramangala) ──
  {
    id: "inv-no-1",
    storeId: "north-outlet",
    productId: "PRD-AML-01",
    name: "Amul Taaza Toned Milk 1L",
    sku: "MILK-001-NO",
    barcode: "8901030700032",
    category: "Dairy & Eggs",
    brand: "Amul",
    store: "North Outlet",
    quantity: 25,
    minStockLevel: 10,
    unit: "1L",
    unitPrice: 54,
    rescuePrice: 35,
    stockValue: 54 * 25,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "AML-TZ-NO-1",
    mfgDate: getRelativeIsoDate(-9),
    expiryDate: getRelativeIsoDate(3),
    daysRemaining: 3,
    expiryStatus: "Critical",
    aisleLocation: "Chiller Bay North",
  },
  {
    id: "inv-no-2",
    storeId: "north-outlet",
    productId: "PRD-ATT-01",
    name: "Aashirvaad Superior MP Sharbati Atta 5kg",
    sku: "ATT-001-NO",
    barcode: "8901030383341",
    category: "Atta, Rice & Dals",
    brand: "Aashirvaad",
    store: "North Outlet",
    quantity: 16,
    minStockLevel: 6,
    unit: "5kg",
    unitPrice: 295,
    rescuePrice: 220,
    stockValue: 295 * 16,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "ASH-AT-NO-2",
    mfgDate: getRelativeIsoDate(-40),
    expiryDate: getRelativeIsoDate(30),
    daysRemaining: 30,
    expiryStatus: "Safe",
    aisleLocation: "Staples Gondola",
  },

  // ── 4. EAST WING EXPRESS (Whitefield) ──
  {
    id: "inv-ew-1",
    storeId: "east-wing",
    productId: "PRD-AML-01",
    name: "Amul Taaza Toned Milk 1L",
    sku: "MILK-001-EW",
    barcode: "8901030700032",
    category: "Dairy & Eggs",
    brand: "Amul",
    store: "East Wing Express",
    quantity: 30,
    minStockLevel: 10,
    unit: "1L",
    unitPrice: 54,
    rescuePrice: 40,
    stockValue: 54 * 30,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "AML-TZ-EW-1",
    mfgDate: getRelativeIsoDate(-6),
    expiryDate: getRelativeIsoDate(7),
    daysRemaining: 7,
    expiryStatus: "Warning",
    aisleLocation: "Chiller 1",
  },
  {
    id: "inv-ew-2",
    storeId: "east-wing",
    productId: "PRD-OIL-01",
    name: "Fortune Sunlite Refined Sunflower Oil 1L",
    sku: "OIL-001-EW",
    barcode: "8906007280014",
    category: "Edible Oils & Ghee",
    brand: "Fortune",
    store: "East Wing Express",
    quantity: 22,
    minStockLevel: 8,
    unit: "1L Pouch",
    unitPrice: 145,
    rescuePrice: 110,
    stockValue: 145 * 22,
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    batchNo: "FTN-SO-EW-2",
    mfgDate: getRelativeIsoDate(-30),
    expiryDate: getRelativeIsoDate(25),
    daysRemaining: 25,
    expiryStatus: "Safe",
    aisleLocation: "Oil Rack 2",
  },
];

// ─── HELPER: MAP STORE NAMES TO NORMALIZED STORE ID ───────────────────────────
export function normalizeStoreId(storeOrId?: string): string {
  if (!storeOrId) return "main-branch";
  const s = storeOrId.toLowerCase();
  if (s.includes("main") || s.includes("indiranagar") || s.includes("central hub") || s.includes("wh-001")) {
    return "main-branch";
  }
  if (s.includes("city") || s.includes("mg road") || s.includes("cc-02") || s.includes("str-001") || s.includes("store a")) {
    return "city-center";
  }
  if (s.includes("north") || s.includes("koramangala") || s.includes("no-03") || s.includes("store b")) {
    return "north-outlet";
  }
  if (s.includes("east") || s.includes("whitefield") || s.includes("ew-04")) {
    return "east-wing";
  }
  if (s.includes("south") || s.includes("jayanagar")) {
    return "south-bangalore";
  }
  return storeOrId;
}

export function getStoreDisplayName(storeId?: string): string {
  const norm = normalizeStoreId(storeId);
  switch (norm) {
    case "main-branch":
      return "Main Branch (Indiranagar)";
    case "city-center":
      return "City Center Store (MG Road)";
    case "north-outlet":
      return "North Outlet (Koramangala)";
    case "east-wing":
      return "East Wing Express (Whitefield)";
    case "south-bangalore":
      return "South Bangalore Hub (Jayanagar)";
    default:
      return "Main Branch (Indiranagar)";
  }
}

// ─── INVENTORY STORE CLASS / SERVICE ──────────────────────────────────────────
class InventoryStore {
  private getStorage(): InventoryStoreItem[] {
    try {
      const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("[InventoryStore] Failed to read from localStorage:", e);
    }
    // Seed and persist initial inventory
    this.setStorage(INITIAL_INVENTORY_ITEMS);
    return INITIAL_INVENTORY_ITEMS;
  }

  private setStorage(items: InventoryStoreItem[]): void {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event(INVENTORY_UPDATE_EVENT));
    } catch (e) {
      console.error("[InventoryStore] Failed to write to localStorage:", e);
    }
  }

  /**
   * Retrieves all inventory items, optionally filtered by storeId or store name.
   */
  public getStoreInventory(storeIdOrName?: string): InventoryStoreItem[] {
    const all = this.getStorage();
    if (!storeIdOrName || storeIdOrName === "All" || storeOrIdMatchesAll(storeIdOrName)) {
      return all;
    }
    const targetStoreId = normalizeStoreId(storeIdOrName);
    return all.filter(
      (item) =>
        normalizeStoreId(item.storeId) === targetStoreId ||
        normalizeStoreId(item.store) === targetStoreId
    );
  }

  /**
   * Retrieves batch items formatted for retailer batch views.
   */
  public getStoreBatches(storeIdOrName?: string): BatchItem[] {
    const inventory = this.getStoreInventory(storeIdOrName);
    return inventory
      .filter((i) => i.expiryTrackingEnabled && i.batchNo)
      .map((item) => {
        const expiry = calculateExpiryStatus(item.expiryDate || new Date().toISOString());
        return {
          id: item.batchNo || String(item.id),
          productId: item.productId,
          productName: item.name,
          category: item.category,
          sku: item.sku,
          barcode: item.barcode,
          store: item.store,
          batchNo: item.batchNo || "BATCH-01",
          mfgDate: item.mfgDate || new Date().toISOString().split("T")[0],
          expiryDate: item.expiryDate || new Date().toISOString().split("T")[0],
          daysRemaining: expiry.daysRemaining,
          qtyTotal: item.quantity + 20, // Estimated initial ingested
          qtyLeft: item.quantity,
          expiryStatus: (expiry.tier === "Expired" ? "Expired" : item.expiryStatus) as ExpiryStatus,
          status: item.quantity <= 0 ? "Depleted" : expiry.isExpired ? "Quarantined" : "Active",
        };
      });
  }

  /**
   * Construct dynamic MarketplaceProduct catalog for a store.
   * If a store has inventory for a product:
   * - Derives all unexpired, stock > 0 batches as ProductOffer entries.
   * - Uses existing pricing & expiry services.
   * - Falls back to master product baseline if no store is selected.
   */
  public getMarketplaceCatalog(storeIdOrName?: string): MarketplaceProduct[] {
    const storeInventory = this.getStoreInventory(storeIdOrName);
    const targetStoreId = storeIdOrName ? normalizeStoreId(storeIdOrName) : "main-branch";
    const storeDisplayName = getStoreDisplayName(targetStoreId);

    return MASTER_PRODUCTS.map((master) => {
      // Find matching inventory items for this master product in this store
      const matchingItems = storeInventory.filter(
        (inv) =>
          inv.productId === master.productId ||
          inv.productId === master.id ||
          inv.name.toLowerCase() === master.name.toLowerCase() ||
          (inv.sku && master.productId && inv.sku.toLowerCase().includes(master.productId.toLowerCase()))
      );

      if (matchingItems.length === 0) {
        // Fallback: Use master product default offers tagged to this store
        return {
          ...master,
          allOffers: master.allOffers.map((o) => ({
            ...o,
            storeId: targetStoreId,
            storeName: storeDisplayName,
          })),
          defaultOffer: {
            ...master.defaultOffer,
            storeId: targetStoreId,
            storeName: storeDisplayName,
          },
        };
      }

      // Convert matching inventory items into dynamic ProductOffers
      const dynamicOffers: ProductOffer[] = [];

      for (const item of matchingItems) {
        const expiryIso = item.expiryDate ? new Date(item.expiryDate).toISOString() : getRelativeIsoDate(30);
        const expiryInfo = calculateExpiryStatus(expiryIso);

        // Determine price
        let sellingPrice = item.rescuePrice || item.unitPrice;
        if (!item.rescuePrice) {
          if (expiryInfo.tier === "Clearance") {
            sellingPrice = Math.round(item.unitPrice * 0.5);
          } else if (expiryInfo.tier === "Rescue Deal") {
            sellingPrice = Math.round(item.unitPrice * 0.75);
          } else {
            sellingPrice = item.unitPrice;
          }
        }

        const pricing = calculatePricing(item.unitPrice || master.mrp, { sellingPrice });

        dynamicOffers.push({
          id: `off-${item.id}-${item.batchNo || "std"}`,
          batchNumber: item.batchNo || `LOT-${item.id}`,
          type: expiryInfo.tier,
          mrp: pricing.mrp,
          price: pricing.sellingPrice,
          discountPercent: pricing.discountPercent,
          savings: pricing.savings,
          expiryDate: expiryIso,
          expiryText: expiryInfo.expiryText,
          daysRemaining: expiryInfo.daysRemaining,
          availability: item.quantity,
          tagline: `${pricing.discountBadge ? pricing.discountBadge + " • " : ""}${expiryInfo.expiryText}`,
          storeId: targetStoreId,
          storeName: storeDisplayName,
        });
      }

      // Sort offers: Active unexpired with stock first, rescue/clearance deals prioritized
      dynamicOffers.sort((a, b) => {
        if (a.availability <= 0 && b.availability > 0) return 1;
        if (a.availability > 0 && b.availability <= 0) return -1;
        return a.price - b.price;
      });

      const bestOffer = dynamicOffers[0] || master.defaultOffer;

      return {
        ...master,
        mrp: bestOffer.mrp,
        defaultOffer: bestOffer,
        allOffers: dynamicOffers.length > 0 ? dynamicOffers : master.allOffers,
        isRescueDeal: dynamicOffers.some((o) => o.type === "Rescue Deal" || o.type === "Clearance"),
        isClearance: dynamicOffers.some((o) => o.type === "Clearance"),
      };
    });
  }

  /**
   * Save or update an inventory item
   */
  public saveInventoryItem(item: InventoryStoreItem): void {
    const all = this.getStorage();
    const existingIdx = all.findIndex((i) => String(i.id) === String(item.id));

    let updated: InventoryStoreItem[];
    if (existingIdx >= 0) {
      updated = [...all];
      updated[existingIdx] = { ...updated[existingIdx], ...item };
    } else {
      updated = [
        {
          ...item,
          id: item.id || `inv-${Date.now()}`,
          storeId: normalizeStoreId(item.storeId || item.store),
          stockValue: (item.quantity || 0) * (item.unitPrice || 0),
          stockStatus: (item.quantity <= 0 ? "Out of Stock" : item.quantity <= item.minStockLevel ? "Low Stock" : "In Stock") as StockStatus,
        },
        ...all,
      ];
    }

    this.setStorage(updated);
  }

  /**
   * Add / Ingest Stock for a product in a store
   */
  public addStockToProduct(params: {
    store: string;
    productId: string;
    name?: string;
    brand?: string;
    category?: string;
    quantity: number;
    batchNo?: string;
    mfgDate?: string;
    expiryDate?: string;
    unitPrice?: number;
    rescuePrice?: number;
    unit?: string;
  }): void {
    const all = this.getStorage();
    const targetStoreId = normalizeStoreId(params.store);

    // Look for existing batch record
    const existingIdx = all.findIndex(
      (item) =>
        normalizeStoreId(item.storeId) === targetStoreId &&
        item.productId === params.productId &&
        item.batchNo === params.batchNo
    );

    if (existingIdx >= 0) {
      const existing = all[existingIdx];
      const newQty = existing.quantity + params.quantity;
      const updatedItem: InventoryStoreItem = {
        ...existing,
        quantity: newQty,
        stockValue: newQty * existing.unitPrice,
        stockStatus: (newQty <= 0 ? "Out of Stock" : newQty <= existing.minStockLevel ? "Low Stock" : "In Stock") as StockStatus,
        expiryDate: params.expiryDate || existing.expiryDate,
        unitPrice: params.unitPrice || existing.unitPrice,
        rescuePrice: params.rescuePrice || existing.rescuePrice,
      };
      const updated = [...all];
      updated[existingIdx] = updatedItem;
      this.setStorage(updated);
    } else {
      // Find master product info if available
      const master = MASTER_PRODUCTS.find(
        (p) => p.productId === params.productId || p.id === params.productId
      );

      const newItem: InventoryStoreItem = {
        id: `inv-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        storeId: targetStoreId,
        productId: params.productId,
        name: params.name || master?.name || "Ingested Grocery Item",
        sku: `${params.productId.replace("PRD-", "")}-${Math.floor(100 + Math.random() * 900)}`,
        barcode: "890" + Math.floor(1000000000 + Math.random() * 9000000000),
        category: params.category || master?.category || "Grocery",
        brand: params.brand || master?.brand || "Brand",
        store: params.store,
        quantity: params.quantity,
        minStockLevel: 10,
        unit: params.unit || master?.unit || "Pcs",
        unitPrice: params.unitPrice || master?.mrp || 100,
        rescuePrice: params.rescuePrice,
        stockValue: params.quantity * (params.unitPrice || master?.mrp || 100),
        stockStatus: (params.quantity <= 0 ? "Out of Stock" : "In Stock") as StockStatus,
        expiryTrackingEnabled: true,
        batchNo: params.batchNo || `LOT-${Math.floor(100 + Math.random() * 900)}`,
        mfgDate: params.mfgDate || new Date().toISOString().split("T")[0],
        expiryDate: params.expiryDate || getRelativeIsoDate(15),
        daysRemaining: 15,
        expiryStatus: "Warning",
        aisleLocation: "Main Clearance Bay",
      };

      this.setStorage([newItem, ...all]);
    }
  }

  /**
   * Adjusts stock quantity for a product batch in a given store.
   * Supports: "Add", "Remove", "Correction"
   * Enforces non-negative stock and validates quantities.
   */
  public adjustStock(params: {
    store: string;
    productId: string;
    batchNo?: string;
    adjustmentType: "Add" | "Remove" | "Correction";
    quantity: number;
    reason: string;
  }): { success: boolean; message: string } {
    if (params.quantity <= 0) {
      return { success: false, message: "Adjustment quantity must be greater than 0." };
    }
    if (!params.reason.trim()) {
      return { success: false, message: "An adjustment reason is required." };
    }

    const all = this.getStorage();
    const targetStoreId = normalizeStoreId(params.store);

    // Find the item
    let targetIdx = all.findIndex(
      (item) =>
        normalizeStoreId(item.storeId) === targetStoreId &&
        (item.productId === params.productId || String(item.id) === params.productId) &&
        (!params.batchNo || item.batchNo === params.batchNo)
    );

    // Fallback: match by ID directly if store name was formatted differently
    if (targetIdx < 0) {
      targetIdx = all.findIndex(
        (item) =>
          String(item.id) === params.productId &&
          (!params.batchNo || item.batchNo === params.batchNo)
      );
    }

    // Fallback: match by productId and batch
    if (targetIdx < 0) {
      targetIdx = all.findIndex(
        (item) =>
          item.productId === params.productId &&
          (!params.batchNo || item.batchNo === params.batchNo)
      );
    }

    if (targetIdx < 0) {
      return { success: false, message: "Target product record not found for this location." };
    }

    const current = all[targetIdx];
    let newQty = current.quantity;

    if (params.adjustmentType === "Add") {
      newQty = current.quantity + params.quantity;
    } else if (params.adjustmentType === "Remove") {
      if (params.quantity > current.quantity) {
        return {
          success: false,
          message: `Cannot remove ${params.quantity} units. Only ${current.quantity} units available.`,
        };
      }
      newQty = current.quantity - params.quantity;
    } else if (params.adjustmentType === "Correction") {
      newQty = params.quantity;
    }

    const newStatus: StockStatus =
      newQty <= 0
        ? "Out of Stock"
        : newQty <= current.minStockLevel
        ? "Low Stock"
        : "In Stock";

    const updatedItem: InventoryStoreItem = {
      ...current,
      quantity: newQty,
      stockValue: newQty * current.unitPrice,
      stockStatus: newStatus,
    };

    const updated = [...all];
    updated[targetIdx] = updatedItem;
    this.setStorage(updated);

    return {
      success: true,
      message: `Stock successfully adjusted for ${current.name}. New quantity: ${newQty} ${current.unit}.`,
    };
  }

  /**
   * Transfers stock between two different facilities.
   * Decrements source stock and increments/creates stock in destination.
   * Preserves batch number, expiry date, unit price, and metadata.
   */
  public transferStock(params: {
    sourceStore: string;
    destinationStore: string;
    productId: string;
    batchNo?: string;
    quantity: number;
  }): { success: boolean; message: string } {
    const normSource = normalizeStoreId(params.sourceStore);
    const normDest = normalizeStoreId(params.destinationStore);

    if (normSource === normDest) {
      return {
        success: false,
        message: "Source and destination facilities cannot be the same.",
      };
    }

    if (params.quantity <= 0) {
      return {
        success: false,
        message: "Transfer quantity must be greater than 0.",
      };
    }

    const all = this.getStorage();

    // Find in source store
    const sourceIdx = all.findIndex(
      (item) =>
        normalizeStoreId(item.storeId) === normSource &&
        (item.productId === params.productId || String(item.id) === params.productId) &&
        (!params.batchNo || item.batchNo === params.batchNo)
    );

    if (sourceIdx < 0) {
      return {
        success: false,
        message: "Source stock record not found for this facility.",
      };
    }

    const sourceItem = all[sourceIdx];
    if (params.quantity > sourceItem.quantity) {
      return {
        success: false,
        message: `Transfer quantity (${params.quantity}) exceeds available stock (${sourceItem.quantity}).`,
      };
    }

    // Decrement source
    const updatedSourceQty = sourceItem.quantity - params.quantity;
    const updatedSourceItem: InventoryStoreItem = {
      ...sourceItem,
      quantity: updatedSourceQty,
      stockValue: updatedSourceQty * sourceItem.unitPrice,
      stockStatus:
        updatedSourceQty <= 0
          ? "Out of Stock"
          : updatedSourceQty <= sourceItem.minStockLevel
          ? "Low Stock"
          : "In Stock",
    };

    // Increment / Add to destination
    const destIdx = all.findIndex(
      (item) =>
        normalizeStoreId(item.storeId) === normDest &&
        item.productId === sourceItem.productId &&
        item.batchNo === sourceItem.batchNo
    );

    const updatedList = [...all];
    updatedList[sourceIdx] = updatedSourceItem;

    if (destIdx >= 0) {
      const destItem = updatedList[destIdx];
      const updatedDestQty = destItem.quantity + params.quantity;
      updatedList[destIdx] = {
        ...destItem,
        quantity: updatedDestQty,
        stockValue: updatedDestQty * destItem.unitPrice,
        stockStatus:
          updatedDestQty <= 0
            ? "Out of Stock"
            : updatedDestQty <= destItem.minStockLevel
            ? "Low Stock"
            : "In Stock",
      };
    } else {
      const newDestItem: InventoryStoreItem = {
        ...sourceItem,
        id: `inv-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        storeId: normDest,
        store: getStoreDisplayName(normDest),
        quantity: params.quantity,
        stockValue: params.quantity * sourceItem.unitPrice,
        stockStatus:
          params.quantity <= 0
            ? "Out of Stock"
            : params.quantity <= sourceItem.minStockLevel
            ? "Low Stock"
            : "In Stock",
      };
      updatedList.unshift(newDestItem);
    }

    this.setStorage(updatedList);

    return {
      success: true,
      message: `Transferred ${params.quantity} ${sourceItem.unit} of ${sourceItem.name} to ${getStoreDisplayName(normDest)}.`,
    };
  }

  /**
   * Decrements stock for a specific batch upon order placement.
   * Decreases ONLY the exact matching batch in that store.
   */
  public decrementBatchStock(
    storeIdOrName: string | undefined,
    productId: string,
    batchNo: string | undefined,
    quantity: number
  ): boolean {
    const all = this.getStorage();
    const targetStoreId = normalizeStoreId(storeIdOrName);

    // Find the exact item
    let targetIdx = all.findIndex(
      (item) =>
        normalizeStoreId(item.storeId) === targetStoreId &&
        (item.productId === productId || item.id === productId) &&
        (!batchNo || item.batchNo === batchNo)
    );

    // Fallback: search without store constraint if store was ambiguous
    if (targetIdx < 0) {
      targetIdx = all.findIndex(
        (item) =>
          (item.productId === productId || item.id === productId) &&
          (!batchNo || item.batchNo === batchNo)
      );
    }

    if (targetIdx >= 0) {
      const current = all[targetIdx];
      const newQty = Math.max(0, current.quantity - quantity);
      const newStatus: StockStatus = newQty === 0 ? "Out of Stock" : newQty <= current.minStockLevel ? "Low Stock" : "In Stock";

      const updated = [...all];
      updated[targetIdx] = {
        ...current,
        quantity: newQty,
        stockValue: newQty * current.unitPrice,
        stockStatus: newStatus,
      };

      this.setStorage(updated);
      return true;
    }

    console.warn(`[InventoryStore] Target item not found for deduction: Product=${productId}, Batch=${batchNo}, Store=${targetStoreId}`);
    return false;
  }

  /**
   * Pre-checkout validation of batch stock and expiry
   */
  public validateBatchStock(
    storeIdOrName: string | undefined,
    productId: string,
    batchNo: string | undefined,
    requestedQty: number
  ): { valid: boolean; availableQty: number; isExpired: boolean; price: number; reason?: string } {
    const all = this.getStorage();
    const targetStoreId = normalizeStoreId(storeIdOrName);

    const item = all.find(
      (it) =>
        normalizeStoreId(it.storeId) === targetStoreId &&
        (it.productId === productId || it.id === productId) &&
        (!batchNo || it.batchNo === batchNo)
    ) || all.find((it) => (it.productId === productId || it.id === productId) && (!batchNo || it.batchNo === batchNo));

    if (!item) {
      return {
        valid: true,
        availableQty: 99,
        isExpired: false,
        price: 50,
      };
    }

    const expiry = calculateExpiryStatus(item.expiryDate || new Date().toISOString());
    if (expiry.isExpired) {
      return {
        valid: false,
        availableQty: 0,
        isExpired: true,
        price: item.unitPrice,
        reason: `Batch ${item.batchNo || ""} has expired and cannot be purchased.`,
      };
    }

    if (item.quantity <= 0) {
      return {
        valid: false,
        availableQty: 0,
        isExpired: false,
        price: item.unitPrice,
        reason: `Batch ${item.batchNo || ""} is out of stock.`,
      };
    }

    if (requestedQty > item.quantity) {
      return {
        valid: false,
        availableQty: item.quantity,
        isExpired: false,
        price: item.unitPrice,
        reason: `Only ${item.quantity} units available in Batch ${item.batchNo || ""}.`,
      };
    }

    return {
      valid: true,
      availableQty: item.quantity,
      isExpired: false,
      price: item.rescuePrice || item.unitPrice,
    };
  }

  /**
   * Reset store to initial seed data (useful for test resets)
   */
  public resetToSeed(): void {
    this.setStorage(INITIAL_INVENTORY_ITEMS);
  }
}

function storeOrIdMatchesAll(s: string): boolean {
  const low = s.toLowerCase();
  return low === "all" || low === "all stores" || low === "all locations";
}

export const inventoryStore = new InventoryStore();

// ─── REACTIVE HOOKS FOR MARKETPLACE AND RETAILER MODULES ─────────────────────

export function useSelectedStore() {
  const [storeId, setStoreId] = useState<string>(() => {
    try {
      return localStorage.getItem("ern_selected_store_id") || "main-branch";
    } catch {
      return "main-branch";
    }
  });

  const changeStore = useCallback((newStoreIdOrName: string) => {
    const norm = normalizeStoreId(newStoreIdOrName);
    setStoreId(norm);
    try {
      localStorage.setItem("ern_selected_store_id", norm);
      window.dispatchEvent(new Event(INVENTORY_UPDATE_EVENT));
    } catch (e) {
      console.error(e);
    }
  }, []);

  return {
    storeId,
    storeName: getStoreDisplayName(storeId),
    changeStore,
  };
}

export function useStoreCatalog(storeIdOverride?: string) {
  const { storeId } = useSelectedStore();
  const effectiveStoreId = storeIdOverride || storeId;

  const [catalog, setCatalog] = useState<MarketplaceProduct[]>(() =>
    inventoryStore.getMarketplaceCatalog(effectiveStoreId)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setCatalog(inventoryStore.getMarketplaceCatalog(effectiveStoreId));
    };

    handleUpdate();
    window.addEventListener(INVENTORY_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(INVENTORY_UPDATE_EVENT, handleUpdate);
  }, [effectiveStoreId]);

  return {
    catalog,
    storeId: effectiveStoreId,
    storeName: getStoreDisplayName(effectiveStoreId),
  };
}

export function useLiveInventory(storeIdOrName?: string) {
  const [inventory, setInventory] = useState<InventoryStoreItem[]>(() =>
    inventoryStore.getStoreInventory(storeIdOrName)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setInventory(inventoryStore.getStoreInventory(storeIdOrName));
    };

    handleUpdate();
    window.addEventListener(INVENTORY_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(INVENTORY_UPDATE_EVENT, handleUpdate);
  }, [storeIdOrName]);

  return {
    inventory,
    saveItem: (item: InventoryStoreItem) => inventoryStore.saveInventoryItem(item),
    addStock: (params: Parameters<typeof inventoryStore.addStockToProduct>[0]) =>
      inventoryStore.addStockToProduct(params),
    adjustStock: (params: Parameters<typeof inventoryStore.adjustStock>[0]) =>
      inventoryStore.adjustStock(params),
    transferStock: (params: Parameters<typeof inventoryStore.transferStock>[0]) =>
      inventoryStore.transferStock(params),
  };
}
