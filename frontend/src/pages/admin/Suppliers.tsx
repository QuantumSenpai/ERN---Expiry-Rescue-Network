import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Download,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  Building2,
  Truck,
  History,
  Boxes,
  MapPin,
  Barcode,
} from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

export type SupplierStatus = "Active" | "Pending Review" | "Inactive" | "Suspended";
export type POStatus =
  | "Draft"
  | "Submitted"
  | "Confirmed"
  | "In Transit"
  | "Received"
  | "Cancelled"
  | "Overdue";

export interface Supplier {
  id: string;
  code: string;
  name: string;
  category: string;
  status: SupplierStatus;
  primaryContact: string;
  email: string;
  phone: string;
  address: string;
  totalProducts: number;
  lastOrderDate: string;
  performance: {
    totalOrders: number;
    onTimeDelivery: number;
    fillRate: number;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierCode: string;
  locationName: string;
  orderDate: string;
  expectedDelivery: string;
  status: POStatus;
  totalQuantity: number;
  totalReceived: number;
  totalValue: number;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    code: "SUP-001",
    name: "FreshMart Foods & Dairy Federation",
    category: "Dairy & Grocery",
    status: "Active",
    primaryContact: "Rajesh Kumar",
    email: "orders@freshmartdairy.in",
    phone: "+91 98450 12345",
    address: "Plot 12, Bengaluru Logistics Hub",
    totalProducts: 42,
    lastOrderDate: "14 Aug 2026",
    performance: {
      totalOrders: 38,
      onTimeDelivery: 98,
      fillRate: 99,
    },
  },
  {
    id: "sup-2",
    code: "SUP-002",
    name: "Britannia Distribution Logistics",
    category: "Bakery",
    status: "Active",
    primaryContact: "Ananya Iyer",
    email: "supply@britanniadist.in",
    phone: "+91 98451 23456",
    address: "Peenya Industrial Area Phase 2",
    totalProducts: 28,
    lastOrderDate: "13 Aug 2026",
    performance: {
      totalOrders: 24,
      onTimeDelivery: 95,
      fillRate: 97,
    },
  },
  {
    id: "sup-3",
    code: "SUP-003",
    name: "Tropicana Beverages & Agro",
    category: "Beverages",
    status: "Active",
    primaryContact: "Vikas Reddy",
    email: "ops@tropicanabeveg.in",
    phone: "+91 98452 34567",
    address: "Hosur Road Depot 4",
    totalProducts: 18,
    lastOrderDate: "10 Aug 2026",
    performance: {
      totalOrders: 16,
      onTimeDelivery: 92,
      fillRate: 95,
    },
  },
  {
    id: "sup-4",
    code: "SUP-004",
    name: "Apex Cold Chain & Dairy Solutions",
    category: "Dairy & Grocery",
    status: "Pending Review",
    primaryContact: "Suresh Pillai",
    email: "dispatch@apexcoldchain.in",
    phone: "+91 98453 45678",
    address: "Bommasandra Industrial Area",
    totalProducts: 12,
    lastOrderDate: "05 Aug 2026",
    performance: {
      totalOrders: 8,
      onTimeDelivery: 76,
      fillRate: 85,
    },
  },
];

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-2026-1042",
    supplierName: "FreshMart Foods & Dairy Federation",
    supplierCode: "SUP-001",
    locationName: "Central Warehouse",
    orderDate: "14 Aug 2026",
    expectedDelivery: "16 Aug 2026",
    status: "In Transit",
    totalQuantity: 150,
    totalReceived: 0,
    totalValue: 6300,
  },
  {
    id: "po-2",
    poNumber: "PO-2026-1041",
    supplierName: "Britannia Distribution Logistics",
    supplierCode: "SUP-002",
    locationName: "Store A",
    orderDate: "13 Aug 2026",
    expectedDelivery: "15 Aug 2026",
    status: "Received",
    totalQuantity: 80,
    totalReceived: 80,
    totalValue: 2400,
  },
  {
    id: "po-3",
    poNumber: "PO-2026-1040",
    supplierName: "Apex Cold Chain & Dairy Solutions",
    supplierCode: "SUP-004",
    locationName: "Store B",
    orderDate: "12 Aug 2026",
    expectedDelivery: "14 Aug 2026",
    status: "Overdue",
    totalQuantity: 60,
    totalReceived: 0,
    totalValue: 3600,
  },
];

export default function AdminSuppliers() {
  const [activeTab, setActiveTab] = useState<"suppliers" | "orders">("suppliers");
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [pos, setPos] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Controlled Add Supplier Form State
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [newSupplierCategory, setNewSupplierCategory] = useState("Dairy & Grocery");
  const [newSupplierContact, setNewSupplierContact] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierAddress, setNewSupplierAddress] = useState("");
  const [addSupplierError, setAddSupplierError] = useState("");

  const handleOpenAddModal = () => {
    setNewSupplierName("");
    setNewSupplierEmail("");
    setNewSupplierCategory("Dairy & Grocery");
    setNewSupplierContact("");
    setNewSupplierPhone("");
    setNewSupplierAddress("");
    setAddSupplierError("");
    setIsAddModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    setAddSupplierError("");
    const name = newSupplierName.trim();
    const email = newSupplierEmail.trim();

    if (!name) {
      setAddSupplierError("Company name is required.");
      return;
    }
    if (!email || !email.includes("@") || !email.includes(".")) {
      setAddSupplierError("A valid primary contact email is required.");
      return;
    }

    const nextCodeNum = suppliers.length + 1;
    const code = `SUP-${String(nextCodeNum).padStart(3, "0")}`;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      code,
      name,
      category: newSupplierCategory,
      status: "Active",
      primaryContact: newSupplierContact.trim() || "Operations Lead",
      email,
      phone: newSupplierPhone.trim() || "+91 80 4000 1200",
      address: newSupplierAddress.trim() || "Industrial Area, Bengaluru",
      totalProducts: 12,
      lastOrderDate: "Just now",
      performance: {
        totalOrders: 1,
        onTimeDelivery: 98.5,
        fillRate: 99.0,
      },
    };

    setSuppliers((prev) => [newSup, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Supplier ${name} (${code}) added to active directory.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredSuppliers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.primaryContact.toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  return (
    <div className="space-y-6 pb-24 text-foreground font-body">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase mb-2">
            <span>PROCUREMENT & VENDOR GOVERNANCE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            SUPPLIER NETWORK
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Manage vendor contracts, purchase order fulfillment, and logistics performance audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95"
          >
            <Plus className="size-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
  <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
    <span className="text-xs uppercase font-bold text-muted-foreground">Total Suppliers</span>
    <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
      <AnimatedNumber value={suppliers.length} />
    </p>
    <p className="text-[11px] text-muted-foreground font-body mt-0.5">Active vendors</p>
  </div>

  <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
    <span className="text-xs uppercase font-bold text-muted-foreground">Open Orders</span>
    <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
      <AnimatedNumber value={pos.filter((p) => p.status === "In Transit").length} />
    </p>
    <p className="text-[11px] text-muted-foreground font-body mt-0.5">In fulfillment</p>
  </div>

  <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
    <span className="text-xs uppercase font-bold text-muted-foreground">Avg On-Time</span>
    <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">95.0%</p>
    <p className="text-[11px] text-muted-foreground font-body mt-0.5">SLA reliability</p>
  </div>

  <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
    <span className="text-xs uppercase font-bold text-foreground">Overdue Shipments</span>
    <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
      <AnimatedNumber value={pos.filter((p) => p.status === "Overdue").length} />
    </p>
    <p className="text-[11px] text-muted-foreground font-body mt-0.5">SLA breach</p>
  </div>
</div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-4 py-2 rounded-full font-bold uppercase transition-all cursor-pointer ${
            activeTab === "suppliers"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          Vendor Directory ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-full font-bold uppercase transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          Purchase Orders ({pos.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "suppliers" ? (
        <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono text-xs transition-colors duration-200 ern-card-glow">
          <div className="p-5 border-b border-border flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-sans text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary text-[10.5px] uppercase text-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3.5 font-bold uppercase">Vendor</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Category</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Primary Contact</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-right">Products</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-center">On-Time SLA</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-center">Status</th>
                  <th className="px-4 py-3.5 text-right font-bold uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground font-display uppercase text-sm">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold">{s.code} · {s.address}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-bold">{s.category}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground">{s.primaryContact}</p>
                      <p className="text-[10px] text-muted-foreground font-bold">{s.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">{s.totalProducts}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-foreground">{s.performance.onTimeDelivery}%</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${
                          s.status === "Active"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedSupplier(s)}
                        className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] cursor-pointer shadow-none"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono text-xs ern-card-glow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary text-[10.5px] uppercase text-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3.5 font-bold uppercase">PO Code</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Supplier</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Facility</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-right">Units</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-right">Value</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
                {pos.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">{p.poNumber}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground font-display uppercase">{p.supplierName}</p>
                      <p className="text-[10px] text-muted-foreground font-bold">Expected: {p.expectedDelivery}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-bold">{p.locationName}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">{p.totalQuantity}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">₹{p.totalValue.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${
                          p.status === "Received"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-accent dark:text-accent-foreground font-bold border border-emerald-300 dark:border-transparent"
                            : p.status === "In Transit"
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-800/40"
                            : "bg-primary text-primary-foreground font-bold"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="bg-card border-l border-border shadow-none w-full max-w-lg h-full flex flex-col overflow-hidden text-foreground">
            <div className="px-6 py-5 border-b border-border flex items-start justify-between">
              <div>
                <span className="font-bold text-xs uppercase text-muted-foreground block">{selectedSupplier.code} · {selectedSupplier.category}</span>
                <h2 className="text-xl font-display font-bold uppercase text-foreground mt-1">{selectedSupplier.name}</h2>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <span className="text-muted-foreground uppercase text-[10.5px] font-bold block">Vendor Overview</span>
                <p className="font-bold text-foreground">{selectedSupplier.primaryContact}</p>
                <p className="text-xs text-muted-foreground font-bold">{selectedSupplier.email}</p>
                <p className="text-xs text-muted-foreground font-bold">{selectedSupplier.phone}</p>
                <p className="text-xs text-muted-foreground font-bold">📍 {selectedSupplier.address}</p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground font-bold block">Total Orders:</span>
                  <strong className="text-foreground">{selectedSupplier.performance.totalOrders}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold block">On-Time SLA:</span>
                  <strong className="text-foreground">{selectedSupplier.performance.onTimeDelivery}%</strong>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold block">Fill Rate:</span>
                  <strong className="text-foreground">{selectedSupplier.performance.fillRate}%</strong>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold block">Products Supplied:</span>
                  <strong className="text-foreground">{selectedSupplier.totalProducts} SKUs</strong>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-bold text-xl uppercase text-foreground">New Supplier</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-foreground hover:bg-secondary rounded-lg"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              {addSupplierError && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
                  {addSupplierError}
                </div>
              )}

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="e.g. Amul Dairy Federation"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-sans text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Primary Contact Email *</label>
                <input
                  type="email"
                  required
                  value={newSupplierEmail}
                  onChange={(e) => setNewSupplierEmail(e.target.value)}
                  placeholder="orders@amul.in"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-mono text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Category</label>
                  <select
                    value={newSupplierCategory}
                    onChange={(e) => setNewSupplierCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-mono text-xs outline-none focus:border-primary"
                  >
                    <option value="Dairy & Grocery">Dairy & Grocery</option>
                    <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                    <option value="Beverages & Juices">Beverages & Juices</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Frozen & Cold Chain">Frozen & Cold Chain</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newSupplierContact}
                    onChange={(e) => setNewSupplierContact(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-sans text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none active:scale-95"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
