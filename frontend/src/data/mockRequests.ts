// ─── ERN REQUESTS & OPERATIONS MOCK DATA ───────────────────────────────────
// Single source of truth for the Requests & Operations workflow module.
// Anchored to ERN timeline date: 15 Aug 2026.

export type RequestType =
  | "Clearance"
  | "Redistribution"
  | "FEFO Dispatch"
  | "Stock Adjustment"
  | "Procurement"
  | "Critical Expiry Intervention"
  | "Operational Support";

export type RequestStatus =
  | "Draft"
  | "Pending Review"
  | "Approved"
  | "Rejected"
  | "Assigned"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type RequestPriority = "Critical" | "High" | "Medium" | "Low";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  authorRole: string;
  title: string;
  description: string;
  type: "created" | "approved" | "rejected" | "assigned" | "status_change" | "comment" | "completed";
}

export interface InventoryContext {
  productId: string;
  productName: string;
  sku: string;
  batchNo?: string;
  category: string;
  brand: string;
  location: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  stockValue: number;
  expiryDate?: string;
  daysLeft?: number;
  riskLevel?: "Critical" | "High Risk" | "Warning" | "Safe" | "Not Applicable";
}

export interface RecommendationContext {
  recommendationTitle: string;
  actionSummary: string;
  estimatedValueProtected: number;
  estimatedWasteAvoided: number;
  confidence: "High" | "Medium" | "Low";
}

export interface ExecutionDetails {
  sourceLocation?: string;
  destinationLocation?: string;
  transferQuantity?: number;
  discountPercent?: number;
  clearanceQuantity?: number;
  validityDate?: string;
  adjustmentType?: "Damage" | "Loss" | "Found Stock" | "Audit Count" | "Return";
  adjustmentQuantity?: number;
  fefoPriorityRank?: number;
  poNumber?: string;
  supplierName?: string;
}

export interface OperationRequest {
  id: string;
  type: RequestType;
  title: string;
  reason: string;
  priority: RequestPriority;
  status: RequestStatus;
  requestedBy: string;
  requestedByRole: string;
  assignedTo: string;
  assignedToRole: string;
  createdAt: string;
  dueDate: string;
  sourceModule: "Expiry Intelligence" | "Inventory Management" | "Purchase Orders" | "Store Operations" | "Automated Policy";
  sourceReferenceId?: string;
  inventoryContext?: InventoryContext;
  recommendation?: RecommendationContext;
  executionDetails?: ExecutionDetails;
  rejectionReason?: string;
  timeline: TimelineEvent[];
}

// ─── INITIAL REQUESTS DATASET (ANCHORED TO 15 AUG 2026) ─────────────────────

export const INITIAL_REQUESTS: OperationRequest[] = [
  {
    id: "REQ-2026-031",
    type: "Clearance",
    title: "Urgent Clearance Markdown: Amul Taaza Milk 1L",
    reason: "25 units reaching expiry in 2 days. 30% markdown recommended for immediate shelf turnover.",
    priority: "Critical",
    status: "Pending Review",
    requestedBy: "Ramesh Sharma",
    requestedByRole: "Store Manager",
    assignedTo: "Amit Sharma",
    assignedToRole: "Operations Admin",
    createdAt: "15 Aug 2026, 09:30 AM",
    dueDate: "17 Aug 2026",
    sourceModule: "Expiry Intelligence",
    sourceReferenceId: "Batch MLK-042",
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
      expiryDate: "17 Aug 2026",
      daysLeft: 2,
      riskLevel: "Critical",
    },
    recommendation: {
      recommendationTitle: "Dynamic Flash Markdown",
      actionSummary: "Apply 30% discount on 25 units at Central Warehouse before 17 Aug.",
      estimatedValueProtected: 1050,
      estimatedWasteAvoided: 1500,
      confidence: "High",
    },
    executionDetails: {
      clearanceQuantity: 25,
      discountPercent: 30,
      validityDate: "17 Aug 2026",
    },
    timeline: [
      {
        id: "tl-1",
        timestamp: "15 Aug 2026, 09:30 AM",
        author: "Ramesh Sharma",
        authorRole: "Store Manager",
        title: "Request Created",
        description: "Initiated clearance request based on Expiry Intelligence signal.",
        type: "created",
      },
      {
        id: "tl-2",
        timestamp: "15 Aug 2026, 09:35 AM",
        author: "ERN Intelligence Engine",
        authorRole: "System",
        title: "Priority Tagged Critical",
        description: "Shelf-life algorithm flagged countdown <= 2 days.",
        type: "status_change",
      },
    ],
  },
  {
    id: "REQ-2026-032",
    type: "Redistribution",
    title: "Stock Transfer: Britannia Whole Wheat Bread",
    reason: "Store A holds excess inventory while Distribution Center is running below safety stock.",
    priority: "High",
    status: "Approved",
    requestedBy: "Priya Patel",
    requestedByRole: "Inventory Manager",
    assignedTo: "Vikram Malhotra",
    assignedToRole: "Logistics Manager",
    createdAt: "15 Aug 2026, 08:15 AM",
    dueDate: "20 Aug 2026",
    sourceModule: "Expiry Intelligence",
    sourceReferenceId: "Batch BRD-048",
    inventoryContext: {
      productId: "prod-2",
      productName: "Britannia Whole Wheat Bread 400g",
      sku: "BRD-001",
      batchNo: "BRD-048",
      category: "Bakery",
      brand: "Britannia",
      location: "Store A",
      quantity: 60,
      unit: "Pcs",
      unitPrice: 45,
      stockValue: 2700,
      expiryDate: "20 Aug 2026",
      daysLeft: 5,
      riskLevel: "Critical",
    },
    recommendation: {
      recommendationTitle: "Facility Stock Balancing",
      actionSummary: "Transfer 20 units from Store A to Distribution Center to satisfy demand.",
      estimatedValueProtected: 900,
      estimatedWasteAvoided: 900,
      confidence: "High",
    },
    executionDetails: {
      sourceLocation: "Store A",
      destinationLocation: "Distribution Center",
      transferQuantity: 20,
    },
    timeline: [
      {
        id: "tl-3",
        timestamp: "15 Aug 2026, 08:15 AM",
        author: "Priya Patel",
        authorRole: "Inventory Manager",
        title: "Request Created",
        description: "Drafted transfer order for 20 units.",
        type: "created",
      },
      {
        id: "tl-4",
        timestamp: "15 Aug 2026, 10:00 AM",
        author: "Amit Sharma",
        authorRole: "Operations Admin",
        title: "Request Approved",
        description: "Approved transfer routing and assigned to Logistics team.",
        type: "approved",
      },
    ],
  },
  {
    id: "REQ-2026-033",
    type: "FEFO Dispatch",
    title: "FEFO Dispatch Wave #1: Tropicana Orange Juice",
    reason: "First-expiry-first-out dispatch priority required for 30 units at Store B.",
    priority: "High",
    status: "In Progress",
    requestedBy: "ERN Intelligence Engine",
    requestedByRole: "System Automated",
    assignedTo: "Vikram Malhotra",
    assignedToRole: "Logistics Manager",
    createdAt: "14 Aug 2026, 04:00 PM",
    dueDate: "25 Aug 2026",
    sourceModule: "Expiry Intelligence",
    sourceReferenceId: "Batch JUC-078",
    inventoryContext: {
      productId: "prod-3",
      productName: "Tropicana Orange Juice 1L",
      sku: "JUC-001",
      batchNo: "JUC-078",
      category: "Beverages",
      brand: "Tropicana",
      location: "Store B",
      quantity: 30,
      unit: "Pcs",
      unitPrice: 120,
      stockValue: 3600,
      expiryDate: "25 Aug 2026",
      daysLeft: 10,
      riskLevel: "High Risk",
    },
    recommendation: {
      recommendationTitle: "FEFO Queue Prioritization",
      actionSummary: "Dispatch Batch JUC-078 ahead of later lots to protect shelf turnover.",
      estimatedValueProtected: 3600,
      estimatedWasteAvoided: 3600,
      confidence: "High",
    },
    executionDetails: {
      fefoPriorityRank: 6,
      transferQuantity: 30,
    },
    timeline: [
      {
        id: "tl-5",
        timestamp: "14 Aug 2026, 04:00 PM",
        author: "ERN Intelligence Engine",
        authorRole: "System",
        title: "Automated FEFO Request Generated",
        description: "Triggered from nightly shelf-life sequence analysis.",
        type: "created",
      },
      {
        id: "tl-6",
        timestamp: "15 Aug 2026, 07:30 AM",
        author: "Vikram Malhotra",
        authorRole: "Logistics Manager",
        title: "Dispatch Pick-List In Progress",
        description: "Warehouse pickers allocated to Chiller Bay C1.",
        type: "status_change",
      },
    ],
  },
  {
    id: "REQ-2026-034",
    type: "Critical Expiry Intervention",
    title: "Emergency Dahi Rescue: Amul Masti Dahi 400g",
    reason: "18 units at Store B expiring in 3 days. Flash discount or staff pantry donation needed.",
    priority: "Critical",
    status: "Pending Review",
    requestedBy: "Kavita Rao",
    requestedByRole: "Store B Supervisor",
    assignedTo: "Amit Sharma",
    assignedToRole: "Operations Admin",
    createdAt: "15 Aug 2026, 11:00 AM",
    dueDate: "18 Aug 2026",
    sourceModule: "Expiry Intelligence",
    sourceReferenceId: "Batch DAH-091",
    inventoryContext: {
      productId: "prod-5",
      productName: "Amul Masti Dahi 400g",
      sku: "CRD-001",
      batchNo: "DAH-091",
      category: "Dairy",
      brand: "Amul",
      location: "Store B",
      quantity: 18,
      unit: "Pcs",
      unitPrice: 35,
      stockValue: 630,
      expiryDate: "18 Aug 2026",
      daysLeft: 3,
      riskLevel: "Critical",
    },
    recommendation: {
      recommendationTitle: "Immediate Flash Sale",
      actionSummary: "Set 40% markdown or authorize local verified NGO donation pick-up.",
      estimatedValueProtected: 380,
      estimatedWasteAvoided: 630,
      confidence: "High",
    },
    executionDetails: {
      discountPercent: 40,
      clearanceQuantity: 18,
      validityDate: "18 Aug 2026",
    },
    timeline: [
      {
        id: "tl-7",
        timestamp: "15 Aug 2026, 11:00 AM",
        author: "Kavita Rao",
        authorRole: "Store B Supervisor",
        title: "Emergency Intervention Raised",
        description: "Batch DAH-091 approaching 72-hour hard threshold.",
        type: "created",
      },
    ],
  },
  {
    id: "REQ-2026-035",
    type: "Stock Adjustment",
    title: "Damaged Package Write-off: Lays Classic Salted",
    reason: "5 bags punctured during shelf restocking at Store A. Quarantine and removal required.",
    priority: "Medium",
    status: "Completed",
    requestedBy: "Sunil Verma",
    requestedByRole: "Store Clerk",
    assignedTo: "Priya Patel",
    assignedToRole: "Inventory Manager",
    createdAt: "14 Aug 2026, 02:20 PM",
    dueDate: "16 Aug 2026",
    sourceModule: "Inventory Management",
    sourceReferenceId: "INV-LOG-882",
    inventoryContext: {
      productId: "prod-6",
      productName: "Lays Classic Salted 52g",
      sku: "LAY-001",
      batchNo: "LAY-201",
      category: "Snacks",
      brand: "FritoLay",
      location: "Store A",
      quantity: 120,
      unit: "Pcs",
      unitPrice: 20,
      stockValue: 2400,
      expiryDate: "31 Aug 2026",
      daysLeft: 16,
      riskLevel: "Warning",
    },
    executionDetails: {
      adjustmentType: "Damage",
      adjustmentQuantity: -5,
    },
    timeline: [
      {
        id: "tl-8",
        timestamp: "14 Aug 2026, 02:20 PM",
        author: "Sunil Verma",
        authorRole: "Store Clerk",
        title: "Stock Adjustment Created",
        description: "Reported 5 damaged bags in snack bay.",
        type: "created",
      },
      {
        id: "tl-9",
        timestamp: "14 Aug 2026, 03:00 PM",
        author: "Priya Patel",
        authorRole: "Inventory Manager",
        title: "Adjustment Approved & Reconciled",
        description: "Stock balance reduced by 5 units. Written off to damaged ledger.",
        type: "approved",
      },
    ],
  },
  {
    id: "REQ-2026-036",
    type: "Procurement",
    title: "Supplier Return Credit: Paracetamol 500mg (10 Tabs)",
    reason: "Batch MED-902 approaching 14-day threshold. Return credit request eligible with Cipla.",
    priority: "Low",
    status: "In Progress",
    requestedBy: "Ananya Deshmukh",
    requestedByRole: "Procurement Lead",
    assignedTo: "Ananya Deshmukh",
    assignedToRole: "Procurement Lead",
    createdAt: "13 Aug 2026, 11:45 AM",
    dueDate: "29 Aug 2026",
    sourceModule: "Purchase Orders",
    sourceReferenceId: "PO-1042",
    inventoryContext: {
      productId: "prod-4",
      productName: "Paracetamol 500mg (10 Tabs)",
      sku: "MED-001",
      batchNo: "MED-902",
      category: "Healthcare",
      brand: "Cipla",
      location: "Distribution Center",
      quantity: 85,
      unit: "Strips",
      unitPrice: 35,
      stockValue: 2975,
      expiryDate: "29 Aug 2026",
      daysLeft: 14,
      riskLevel: "High Risk",
    },
    executionDetails: {
      poNumber: "PO-1042",
      supplierName: "Cipla Healthcare Distributors",
      transferQuantity: 85,
    },
    timeline: [
      {
        id: "tl-10",
        timestamp: "13 Aug 2026, 11:45 AM",
        author: "Ananya Deshmukh",
        authorRole: "Procurement Lead",
        title: "Supplier Credit Request Initiated",
        description: "Return authorization form submitted to vendor portal.",
        type: "created",
      },
    ],
  },
  {
    id: "REQ-2026-037",
    type: "Redistribution",
    title: "Inter-Store Balancing: Tropicana Juice 1L",
    reason: "Central Warehouse holds 22 units of Batch JUC-079. Store A needs 12 units for weekend surge.",
    priority: "Medium",
    status: "Pending Review",
    requestedBy: "Priya Patel",
    requestedByRole: "Inventory Manager",
    assignedTo: "Vikram Malhotra",
    assignedToRole: "Logistics Manager",
    createdAt: "15 Aug 2026, 10:15 AM",
    dueDate: "26 Aug 2026",
    sourceModule: "Expiry Intelligence",
    sourceReferenceId: "Batch JUC-079",
    inventoryContext: {
      productId: "prod-3",
      productName: "Tropicana Orange Juice 1L",
      sku: "JUC-001",
      batchNo: "JUC-079",
      category: "Beverages",
      brand: "Tropicana",
      location: "Central Warehouse",
      quantity: 22,
      unit: "Pcs",
      unitPrice: 120,
      stockValue: 2640,
      expiryDate: "26 Aug 2026",
      daysLeft: 11,
      riskLevel: "High Risk",
    },
    recommendation: {
      recommendationTitle: "Surge Rebalancing",
      actionSummary: "Dispatch 12 units from Central Warehouse to Store A.",
      estimatedValueProtected: 1440,
      estimatedWasteAvoided: 1440,
      confidence: "High",
    },
    executionDetails: {
      sourceLocation: "Central Warehouse",
      destinationLocation: "Store A",
      transferQuantity: 12,
    },
    timeline: [
      {
        id: "tl-11",
        timestamp: "15 Aug 2026, 10:15 AM",
        author: "Priya Patel",
        authorRole: "Inventory Manager",
        title: "Request Created",
        description: "Redistribution plan drafted for Store A demand.",
        type: "created",
      },
    ],
  },
  {
    id: "REQ-2026-038",
    type: "FEFO Dispatch",
    title: "Pharmacy Dispatch Sequencing: Paracetamol 500mg",
    reason: "Batch MED-904 (120 strips) scheduled for standard FEFO replenishment.",
    priority: "Low",
    status: "Completed",
    requestedBy: "ERN Intelligence Engine",
    requestedByRole: "System Automated",
    assignedTo: "Vikram Malhotra",
    assignedToRole: "Logistics Manager",
    createdAt: "12 Aug 2026, 09:00 AM",
    dueDate: "15 Oct 2026",
    sourceModule: "Expiry Intelligence",
    sourceReferenceId: "Batch MED-904",
    inventoryContext: {
      productId: "prod-4",
      productName: "Paracetamol 500mg (10 Tabs)",
      sku: "MED-001",
      batchNo: "MED-904",
      category: "Healthcare",
      brand: "Cipla",
      location: "Central Warehouse",
      quantity: 120,
      unit: "Strips",
      unitPrice: 35,
      stockValue: 4200,
      expiryDate: "15 Oct 2026",
      daysLeft: 61,
      riskLevel: "Safe",
    },
    executionDetails: {
      fefoPriorityRank: 18,
      transferQuantity: 120,
    },
    timeline: [
      {
        id: "tl-12",
        timestamp: "12 Aug 2026, 09:00 AM",
        author: "ERN Intelligence Engine",
        authorRole: "System",
        title: "Scheduled FEFO Order",
        description: "Batch queued in standard dispatch rotation.",
        type: "created",
      },
      {
        id: "tl-13",
        timestamp: "13 Aug 2026, 05:00 PM",
        author: "Vikram Malhotra",
        authorRole: "Logistics Manager",
        title: "Dispatch Completed",
        description: "120 strips routed to regional dispensary hubs.",
        type: "status_change",
      },
    ],
  },
  {
    id: "REQ-2026-039",
    type: "Clearance",
    title: "Bakery Markdown: Britannia Bread (Store B)",
    reason: "Batch BRD-049 (35 pcs) at Store B has 8 days remaining. 25% discount recommended.",
    priority: "High",
    status: "Approved",
    requestedBy: "Kavita Rao",
    requestedByRole: "Store B Supervisor",
    assignedTo: "Amit Sharma",
    assignedToRole: "Operations Admin",
    createdAt: "15 Aug 2026, 01:20 PM",
    dueDate: "23 Aug 2026",
    sourceModule: "Expiry Intelligence",
    sourceReferenceId: "Batch BRD-049",
    inventoryContext: {
      productId: "prod-2",
      productName: "Britannia Whole Wheat Bread 400g",
      sku: "BRD-001",
      batchNo: "BRD-049",
      category: "Bakery",
      brand: "Britannia",
      location: "Store B",
      quantity: 35,
      unit: "Pcs",
      unitPrice: 45,
      stockValue: 1575,
      expiryDate: "23 Aug 2026",
      daysLeft: 8,
      riskLevel: "High Risk",
    },
    recommendation: {
      recommendationTitle: "Pre-emptive Clearance Campaign",
      actionSummary: "Publish 25% markdown on Store B digital signage and app.",
      estimatedValueProtected: 1180,
      estimatedWasteAvoided: 1575,
      confidence: "High",
    },
    executionDetails: {
      discountPercent: 25,
      clearanceQuantity: 35,
      validityDate: "23 Aug 2026",
    },
    timeline: [
      {
        id: "tl-14",
        timestamp: "15 Aug 2026, 01:20 PM",
        author: "Kavita Rao",
        authorRole: "Store B Supervisor",
        title: "Request Created",
        description: "Clearance request submitted.",
        type: "created",
      },
      {
        id: "tl-15",
        timestamp: "15 Aug 2026, 02:00 PM",
        author: "Amit Sharma",
        authorRole: "Operations Admin",
        title: "Approved by Admin",
        description: "Campaign active on POS terminals.",
        type: "approved",
      },
    ],
  },
  {
    id: "REQ-2026-040",
    type: "Stock Adjustment",
    title: "Audit Variance Adjustment: Office Chairs",
    reason: "Annual physical inventory cycle count discovered 2 additional unrecorded units in Warehouse Bay F2.",
    priority: "Low",
    status: "Completed",
    requestedBy: "Priya Patel",
    requestedByRole: "Inventory Manager",
    assignedTo: "Priya Patel",
    assignedToRole: "Inventory Manager",
    createdAt: "13 Aug 2026, 04:30 PM",
    dueDate: "15 Aug 2026",
    sourceModule: "Inventory Management",
    sourceReferenceId: "AUD-2026-90",
    inventoryContext: {
      productId: "prod-7",
      productName: "Ergonomic Office Chair Mesh Pro",
      sku: "CHR-001",
      category: "Furniture",
      brand: "Featherlite",
      location: "Central Warehouse",
      quantity: 50,
      unit: "Units",
      unitPrice: 6500,
      stockValue: 325000,
      riskLevel: "Not Applicable",
    },
    executionDetails: {
      adjustmentType: "Found Stock",
      adjustmentQuantity: 2,
    },
    timeline: [
      {
        id: "tl-16",
        timestamp: "13 Aug 2026, 04:30 PM",
        author: "Priya Patel",
        authorRole: "Inventory Manager",
        title: "Audit Surplus Noted",
        description: "Discrepancy resolved and added to master count.",
        type: "completed",
      },
    ],
  },
  {
    id: "REQ-2026-041",
    type: "Critical Expiry Intervention",
    title: "Store A Milk Batch Priority Escalation",
    reason: "20 units of Batch MLK-043 reaching 7 days remaining. Prioritize morning dispatch.",
    priority: "Critical",
    status: "Pending Review",
    requestedBy: "Ramesh Sharma",
    requestedByRole: "Store Manager",
    assignedTo: "Amit Sharma",
    assignedToRole: "Operations Admin",
    createdAt: "15 Aug 2026, 02:45 PM",
    dueDate: "22 Aug 2026",
    sourceModule: "Expiry Intelligence",
    sourceReferenceId: "Batch MLK-043",
    inventoryContext: {
      productId: "prod-1",
      productName: "Amul Taaza Milk 1L",
      sku: "MILK-001",
      batchNo: "MLK-043",
      category: "Dairy",
      brand: "Amul",
      location: "Store A",
      quantity: 20,
      unit: "Pcs",
      unitPrice: 60,
      stockValue: 1200,
      expiryDate: "22 Aug 2026",
      daysLeft: 7,
      riskLevel: "Critical",
    },
    recommendation: {
      recommendationTitle: "FEFO Acceleration",
      actionSummary: "Place at checkout chiller display to ensure 100% sale within 48h.",
      estimatedValueProtected: 1200,
      estimatedWasteAvoided: 1200,
      confidence: "High",
    },
    executionDetails: {
      clearanceQuantity: 20,
      validityDate: "22 Aug 2026",
    },
    timeline: [
      {
        id: "tl-17",
        timestamp: "15 Aug 2026, 02:45 PM",
        author: "Ramesh Sharma",
        authorRole: "Store Manager",
        title: "Intervention Escalated",
        description: "Requested front-of-store checkout placement approval.",
        type: "created",
      },
    ],
  },
  {
    id: "REQ-2026-042",
    type: "Procurement",
    title: "Reorder Drafting: HP LaserJet Pro Printers",
    reason: "Stock level dropped to 8 units (Threshold: 10 units). Auto PO drafted for 15 units.",
    priority: "Medium",
    status: "In Progress",
    requestedBy: "ERN Stock Level Policy",
    requestedByRole: "System Automated",
    assignedTo: "Ananya Deshmukh",
    assignedToRole: "Procurement Lead",
    createdAt: "14 Aug 2026, 06:10 PM",
    dueDate: "21 Aug 2026",
    sourceModule: "Purchase Orders",
    sourceReferenceId: "PO-DRAFT-109",
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
      riskLevel: "Not Applicable",
    },
    executionDetails: {
      poNumber: "PO-1049",
      supplierName: "HP Official Distribution",
      transferQuantity: 15,
    },
    timeline: [
      {
        id: "tl-18",
        timestamp: "14 Aug 2026, 06:10 PM",
        author: "ERN Stock Level Policy",
        authorRole: "System",
        title: "Automated Reorder Triggered",
        description: "Stock below 10-unit buffer.",
        type: "created",
      },
      {
        id: "tl-19",
        timestamp: "15 Aug 2026, 09:15 AM",
        author: "Ananya Deshmukh",
        authorRole: "Procurement Lead",
        title: "Supplier Quote Requested",
        description: "Sent PO draft to HP account representative.",
        type: "status_change",
      },
    ],
  },
];

// ─── ASSIGNEE LIST ──────────────────────────────────────────────────────────

export const ASSIGNEES = [
  { id: "u-1", name: "Amit Sharma", role: "Operations Admin", email: "amit.admin@ern.org" },
  { id: "u-2", name: "Priya Patel", role: "Inventory Manager", email: "priya.p@ern.org" },
  { id: "u-3", name: "Vikram Malhotra", role: "Logistics Manager", email: "vikram.m@ern.org" },
  { id: "u-4", name: "Ramesh Sharma", role: "Store Manager", email: "ramesh.s@ern.org" },
  { id: "u-5", name: "Ananya Deshmukh", role: "Procurement Lead", email: "ananya.d@ern.org" },
  { id: "u-6", name: "Kavita Rao", role: "Store B Supervisor", email: "kavita.r@ern.org" },
  { id: "u-7", name: "Operations Staff", role: "Fulfillment Team", email: "ops.team@ern.org" },
];

// ─── CSV EXPORT UTILITY FOR REQUESTS ────────────────────────────────────────

export function generateRequestsCSV(requests: OperationRequest[]): string {
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

  const rows = requests.map((r) => [
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
