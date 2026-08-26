// ─── CORE INVENTORY & EXPIRY INTELLIGENCE TYPES ─────────────────────────────

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type ExpiryStatus =
  | "Not Applicable"
  | "Safe"
  | "Warning"
  | "High Risk"
  | "Critical"
  | "Expired";

export type ProductType =
  | "Physical Goods"
  | "Perishable"
  | "Electronics"
  | "Office & Furniture"
  | "Healthcare"
  | "Stationery"
  | "Packaged Goods";

export interface Product {
  id: string | number;
  name: string;
  subtitle?: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  productType: ProductType;
  expiryTrackingEnabled: boolean;
  quantity: number;
  minStockLevel: number;
  price: number;
  unit: string;
  stockStatus: StockStatus;
  batchesCount: number;
  store: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string | number;
  productId: string | number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  store: string;
  quantity: number;
  minStockLevel: number;
  unit: string;
  unitPrice: number;
  stockValue: number;
  stockStatus: StockStatus;
  expiryTrackingEnabled: boolean;
  batchNo?: string;
  mfgDate?: string;
  expiryDate?: string;
  daysRemaining?: number | null;
  expiryStatus: ExpiryStatus;
  aisleLocation?: string;
  supplier?: string;
  reorderLevel?: number;
  suggestedReorder?: number;
  operationalStatus?: "Normal" | "Low Stock" | "At Risk" | "Overstock" | "Expired";
  overstockAmount?: number;
  locationDistribution?: { location: string; quantity: number }[];
}

export interface BatchItem {
  id: string;
  productId: string | number;
  productName: string;
  category: string;
  sku: string;
  barcode: string;
  store: string;
  batchNo: string;
  mfgDate: string;
  expiryDate: string;
  daysRemaining: number | null;
  qtyTotal: number;
  qtyLeft: number;
  expiryStatus: ExpiryStatus;
  status: "Active" | "Quarantined" | "Depleted";
}

export type AlertType =
  | "Expiry Alert"
  | "Low Stock"
  | "Out of Stock"
  | "Supplier Update"
  | "Sales Milestone"
  | "System";

export type AlertSeverity = "Critical" | "High" | "Medium" | "Low" | "Info" | "Resolved";

export interface AlertItem {
  id: string | number;
  title: string;
  type: AlertType;
  severity: AlertSeverity;
  productName?: string;
  batchNo?: string;
  store: string;
  category?: string;
  detail: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
  expiryTrackingEnabled: boolean;
  link?: string;
  linkText?: string;
}

export interface SaleItem {
  productId: string | number;
  productName: string;
  category: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  expiryTrackingEnabled: boolean;
  batchNo?: string;
  discountPercent?: number;
}

export interface SaleTransaction {
  id: string;
  receiptNo: string;
  time: string;
  itemsCount: number;
  items: SaleItem[];
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  store: string;
  paymentMethod: "UPI" | "Card" | "Cash";
  status: "Completed" | "Refunded";
  cashier: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStockUnits: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiryTrackedCount: number;
  nonExpiryCount: number;
  expiringSoonCount: number;
  criticalExpiryCount: number;
  expiredCount: number;
  potentialLossAvoided: number;
}
