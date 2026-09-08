import { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  X,
} from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

type TransferStatus =
  | "Pending"
  | "Accepted"
  | "Pickup Scheduled"
  | "Picked Up"
  | "In Transit"
  | "Delivered"
  | "Cancelled";

interface Transfer {
  id: string;
  source: string;
  destination: string;
  product: string;
  quantity: string;
  assignedTo: string;
  status: TransferStatus;
  createdDate: string;
  expectedDelivery: string;
  completedDate?: string;
}

const MOCK_TRANSFERS: Transfer[] = [
  { id: "TRF-1001", source: "Central Warehouse", destination: "Hope Foundation", product: "Rice (25kg bags)", quantity: "120 kg", assignedTo: "Amit Sharma", status: "Delivered", createdDate: "10 Aug 2026", expectedDelivery: "12 Aug 2026", completedDate: "12 Aug 2026" },
  { id: "TRF-1002", source: "North Depot", destination: "Sunrise Shelter", product: "Canned Vegetables", quantity: "80 units", assignedTo: "Priya Nair", status: "In Transit", createdDate: "14 Aug 2026", expectedDelivery: "16 Aug 2026" },
  { id: "TRF-1003", source: "Central Warehouse", destination: "City Food Bank", product: "Bread Loaves", quantity: "200 units", assignedTo: "Ravi Kumar", status: "Picked Up", createdDate: "15 Aug 2026", expectedDelivery: "17 Aug 2026" },
  { id: "TRF-1004", source: "South Depot", destination: "Green Valley NGO", product: "Milk Packets", quantity: "150 L", assignedTo: "Amit Sharma", status: "Pickup Scheduled", createdDate: "16 Aug 2026", expectedDelivery: "18 Aug 2026" },
  { id: "TRF-1005", source: "Central Warehouse", destination: "Hope Foundation", product: "Medicine Kits", quantity: "40 kits", assignedTo: "Priya Nair", status: "Accepted", createdDate: "17 Aug 2026", expectedDelivery: "19 Aug 2026" },
  { id: "TRF-1006", source: "North Depot", destination: "City Food Bank", product: "Wheat Flour", quantity: "300 kg", assignedTo: "Ravi Kumar", status: "Pending", createdDate: "18 Aug 2026", expectedDelivery: "20 Aug 2026" },
  { id: "TRF-1007", source: "Central Warehouse", destination: "Sunrise Shelter", product: "Cooking Oil", quantity: "60 L", assignedTo: "Amit Sharma", status: "Cancelled", createdDate: "11 Aug 2026", expectedDelivery: "13 Aug 2026" },
];

const STATUS_STYLE: Record<TransferStatus, string> = {
  Pending: "bg-secondary text-foreground font-semibold border border-border",
  Accepted: "bg-accent text-accent-foreground font-bold",
  "Pickup Scheduled": "bg-sky-100 text-sky-800 dark:bg-secondary dark:text-foreground font-bold border border-sky-300 dark:border-border",
  "Picked Up": "bg-accent text-accent-foreground font-bold",
  "In Transit": "bg-primary text-primary-foreground font-bold",
  Delivered: "bg-emerald-100 text-emerald-800 dark:bg-primary dark:text-primary-foreground font-bold border border-emerald-300 dark:border-transparent",
  Cancelled: "bg-destructive/15 text-destructive font-bold border border-destructive/30",
};

export default function AdminTransfers() {
  const [transfers] = useState<Transfer[]>(MOCK_TRANSFERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTransfer, setActiveTransfer] = useState<Transfer | null>(null);

  const totalCount = transfers.length;
  const inTransitCount = transfers.filter((t) => t.status === "In Transit" || t.status === "Picked Up").length;
  const deliveredCount = transfers.filter((t) => t.status === "Delivered").length;
  const pendingCount = transfers.filter((t) => t.status === "Pending" || t.status === "Accepted").length;

  const filtered = useMemo(() => {
    return transfers.filter((t) => {
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !t.id.toLowerCase().includes(q) &&
          !t.product.toLowerCase().includes(q) &&
          !t.destination.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [transfers, statusFilter, search]);

  return (
    <div className="w-full space-y-6 pb-24 text-foreground font-body">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
          <span>NETWORK MOVEMENT</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
          TRANSFERS
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-2">
          Track where rescued stock is going — from pickup to delivery.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono">
        <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] p-5 shadow-none flex flex-col justify-between ern-card-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Total Transfers</span>
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <ArrowLeftRight className="size-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={totalCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">All time</p>
        </div>

        <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] p-5 shadow-none flex flex-col justify-between ern-card-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">On the Way</span>
            <div className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
              <Truck className="size-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={inTransitCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Picked up / in transit</p>
        </div>

        <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] p-5 shadow-none flex flex-col justify-between ern-card-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Delivered</span>
            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={deliveredCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Completed</p>
        </div>

        <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] p-5 shadow-none flex flex-col justify-between ern-card-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Not Started</span>
            <div className="size-8 rounded-full bg-secondary text-foreground flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={pendingCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Waiting to move</p>
        </div>
      </div>

      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono transition-colors duration-200 ern-card-glow">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col lg:flex-row items-stretch lg:items-center gap-3 font-mono text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transfer ID, product, destination..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Pickup Scheduled">Pickup Scheduled</option>
            <option value="Picked Up">Picked Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3.5 font-bold uppercase">Transfer ID</th>
                <th className="px-4 py-3.5 font-bold uppercase">Product</th>
                <th className="px-4 py-3.5 font-bold uppercase">From → To</th>
                <th className="px-4 py-3.5 font-bold uppercase">Assigned</th>
                <th className="px-4 py-3.5 font-bold uppercase">Status</th>
                <th className="px-4 py-3.5 text-right font-bold uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setActiveTransfer(t)}
                  className="hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5 font-bold text-foreground">{t.id}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-foreground font-display uppercase text-sm">{t.product}</p>
                    <p className="text-[10.5px] text-muted-foreground font-bold">{t.quantity}</p>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground font-bold">
                    {t.source} → {t.destination}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground font-bold">{t.assignedTo}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center ${STATUS_STYLE[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()} className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setActiveTransfer(t)}
                      className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] transition-all cursor-pointer shadow-none"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No transfers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in duration-200">
          <div className="bg-card border-l border-border shadow-none w-full max-w-xl h-full flex flex-col overflow-hidden text-foreground">
            <div className="px-6 py-5 border-b border-border flex items-start justify-between">
              <div>
                <span className="font-bold text-xs uppercase text-muted-foreground block">{activeTransfer.id}</span>
                <h2 className="text-xl font-display font-bold uppercase text-foreground mt-1">{activeTransfer.product}</h2>
              </div>
              <button
                onClick={() => setActiveTransfer(null)}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <span className="text-muted-foreground uppercase text-[10.5px] block font-bold">Route:</span>
                <p className="font-body text-sm text-foreground font-bold">
                  {activeTransfer.source} → {activeTransfer.destination}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground font-bold block">Quantity</span>
                  <strong className="text-foreground">{activeTransfer.quantity}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold block">Assigned To</span>
                  <strong className="text-foreground">{activeTransfer.assignedTo}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold block">Created</span>
                  <strong className="text-foreground">{activeTransfer.createdDate}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold block">Expected Delivery</span>
                  <strong className="text-foreground">{activeTransfer.expectedDelivery}</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                <span className="text-muted-foreground uppercase text-[10.5px] block font-bold mb-1.5">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[activeTransfer.status]}`}>
                  {activeTransfer.status}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setActiveTransfer(null)}
                className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
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