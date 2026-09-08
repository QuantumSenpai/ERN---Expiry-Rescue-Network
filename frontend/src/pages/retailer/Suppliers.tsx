import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Upload,
  Download,
  Boxes,
  History,
  X,
  Star,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  FileSpreadsheet,
  Building2,
  Truck,
  Package,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AnimatedNumber from "@/components/AnimatedNumber";

export type PrimaryTab = "directory" | "orders";
export type SupplierStatus = "Preferred" | "Active" | "Under Review" | "On Hold";

export interface Supplier {
  id: string;
  name: string;
  category: string;
  status: SupplierStatus;
  rating: number;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  openOrdersCount: number;
  onTimeDeliveryPct: number;
  performanceScore: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  category: string;
  destinationLocation: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: "In Transit" | "Received" | "Pending Approval" | "Delayed";
  totalUnits: number;
  totalValue: number;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "SUP-001",
    name: "FreshMart Foods & Dairy Federation",
    category: "Dairy & Grocery",
    status: "Preferred",
    rating: 4.9,
    location: "Bengaluru Logistics Hub",
    contactPerson: "Rajesh Kumar",
    phone: "+91 98450 12345",
    email: "orders@freshmartdairy.in",
    openOrdersCount: 2,
    onTimeDeliveryPct: 98,
    performanceScore: 98,
  },
  {
    id: "SUP-002",
    name: "Britannia Distribution Logistics",
    category: "Bakery",
    status: "Active",
    rating: 4.8,
    location: "Peenya Industrial Area",
    contactPerson: "Ananya Iyer",
    phone: "+91 98451 23456",
    email: "supply@britanniadist.in",
    openOrdersCount: 1,
    onTimeDeliveryPct: 95,
    performanceScore: 96,
  },
  {
    id: "SUP-003",
    name: "Tropicana Beverages & Agro",
    category: "Beverages",
    status: "Active",
    rating: 4.6,
    location: "Hosur Road Depot",
    contactPerson: "Vikas Reddy",
    phone: "+91 98452 34567",
    email: "ops@tropicanabeveg.in",
    openOrdersCount: 1,
    onTimeDeliveryPct: 92,
    performanceScore: 94,
  },
  {
    id: "SUP-004",
    name: "Apex Cold Chain & Dairy Solutions",
    category: "Dairy & Grocery",
    status: "Under Review",
    rating: 3.8,
    location: "Bommasandra Hub",
    contactPerson: "Suresh Pillai",
    phone: "+91 98453 45678",
    email: "dispatch@apexcoldchain.in",
    openOrdersCount: 1,
    onTimeDeliveryPct: 76,
    performanceScore: 78,
  },
];

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: "PO-1042",
    supplierId: "SUP-001",
    supplierName: "FreshMart Foods & Dairy Federation",
    category: "Dairy & Grocery",
    destinationLocation: "Central Warehouse",
    orderDate: "14 Aug 2026",
    expectedDeliveryDate: "16 Aug 2026",
    status: "In Transit",
    totalUnits: 150,
    totalValue: 6300,
  },
  {
    id: "PO-1041",
    supplierId: "SUP-002",
    supplierName: "Britannia Distribution Logistics",
    category: "Bakery",
    destinationLocation: "Store A",
    orderDate: "13 Aug 2026",
    expectedDeliveryDate: "15 Aug 2026",
    status: "Received",
    totalUnits: 80,
    totalValue: 2400,
  },
  {
    id: "PO-1040",
    supplierId: "SUP-004",
    supplierName: "Apex Cold Chain & Dairy Solutions",
    category: "Dairy & Grocery",
    destinationLocation: "Store B",
    orderDate: "12 Aug 2026",
    expectedDeliveryDate: "14 Aug 2026",
    status: "Delayed",
    totalUnits: 60,
    totalValue: 3600,
  },
];

export default function RetailerSuppliers() {
  const [activeTab, setActiveTab] = useState<PrimaryTab>("directory");
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [pos, setPos] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        s.category.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q)
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
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>SUPPLY CHAIN PARTNERS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            SUPPLIER NETWORK
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Procurement management, purchase orders, and supplier performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase">
          <button
            onClick={() => showToast("PO created.")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95"
          >
            <Plus className="size-4" />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Active Suppliers</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={suppliers.length} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Verified vendors</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Open Orders</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={pos.filter((p) => p.status === "In Transit" || p.status === "Pending Approval").length} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">In fulfillment</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-muted-foreground">Avg On-Time</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">94.2%</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">SLA reliability</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-xs uppercase font-bold text-foreground">Delayed Orders</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={pos.filter((p) => p.status === "Delayed").length} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Action required</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 rounded-full font-bold uppercase transition-all cursor-pointer ${
            activeTab === "directory"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground border border-border hover:border-primary"
          }`}
        >
          Vendor Directory ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-full font-bold uppercase transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground border border-border hover:border-primary"
          }`}
        >
          Purchase Orders ({pos.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "directory" ? (
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
              <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
                <tr>
                  <th className="px-4 py-3.5 font-bold uppercase">Vendor</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Category</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Contact</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-center">Score</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-center">Status</th>
                  <th className="px-4 py-3.5 text-right font-bold uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground font-display uppercase text-sm">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.id} · {s.location}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{s.category}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground">{s.contactPerson}</p>
                      <p className="text-[10px] text-muted-foreground">{s.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-foreground">{s.performanceScore}%</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${
                          s.status === "Preferred"
                            ? "bg-primary text-primary-foreground"
                            : s.status === "Active"
                            ? "bg-card text-foreground border border-border"
                            : "bg-primary text-primary-foreground border border-[#2F4156]"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedSupplier(s)}
                        className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] cursor-pointer shadow-none"
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
              <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
                <tr>
                  <th className="px-4 py-3.5 font-bold uppercase">PO Code</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Supplier</th>
                  <th className="px-4 py-3.5 font-bold uppercase">Destination</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-right">Units</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-right">Value</th>
                  <th className="px-4 py-3.5 font-bold uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
                {pos.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">{p.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground font-display uppercase">{p.supplierName}</p>
                      <p className="text-[10px] text-muted-foreground">Expected: {p.expectedDeliveryDate}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{p.destinationLocation}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">{p.totalUnits}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground">₹{p.totalValue.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${
                          p.status === "Received"
                            ? "bg-primary text-primary-foreground"
                            : p.status === "In Transit"
                            ? "bg-card text-foreground border border-border"
                            : "bg-primary text-primary-foreground border border-[#2F4156]"
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
          <div className="bg-background border-l border-border shadow-none w-full max-w-lg h-full flex flex-col overflow-hidden text-foreground">
            <div className="px-6 py-5 border-b border-border flex items-start justify-between">
              <div>
                <span className="font-bold text-xs uppercase text-muted-foreground block">{selectedSupplier.id} · {selectedSupplier.category}</span>
                <h2 className="text-xl font-display font-bold uppercase text-foreground mt-1">{selectedSupplier.name}</h2>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <span className="text-muted-foreground uppercase text-[10.5px] font-bold block">Contact Information</span>
                <p className="font-bold text-foreground">{selectedSupplier.contactPerson}</p>
                <p className="text-xs text-muted-foreground">{selectedSupplier.phone}</p>
                <p className="text-xs text-muted-foreground">{selectedSupplier.email}</p>
                <p className="text-xs text-muted-foreground">📍 {selectedSupplier.location}</p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Performance Score:</span>
                  <strong className="text-foreground">{selectedSupplier.performanceScore}%</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">On-Time Delivery:</span>
                  <strong className="text-foreground">{selectedSupplier.onTimeDeliveryPct}%</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Open Orders:</span>
                  <strong className="text-foreground">{selectedSupplier.openOrdersCount}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Rating:</span>
                  <strong className="text-foreground">★ {selectedSupplier.rating}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
