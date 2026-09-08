import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Percent,
} from "lucide-react";
import { inventoryStore, INVENTORY_UPDATE_EVENT } from "@/lib/inventoryStore";
import type { BatchItem, ExpiryStatus } from "@/types/inventory";
import StoreLocationModal from "@/components/StoreLocationModal";

const PAGE_SIZE = 8;

const EXPIRY_STATUS_STYLE: Record<ExpiryStatus, string> = {
  "Not Applicable": "bg-secondary text-muted-foreground font-semibold border border-border",
  Safe: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold border border-emerald-500/30",
  Warning: "bg-sky-100 text-sky-800 dark:bg-blue-500/15 dark:text-blue-400 font-bold border border-sky-500/30",
  "High Risk": "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 font-bold border border-amber-500/30",
  Critical: "bg-rose-100 text-rose-800 dark:bg-destructive/15 dark:text-destructive font-bold border border-destructive/30 animate-pulse",
  Expired: "bg-muted text-muted-foreground font-bold border border-border",
};

export default function RetailerBatches() {
  const [batches, setBatches] = useState<BatchItem[]>(() => inventoryStore.getStoreBatches());

  useEffect(() => {
    const handleUpdate = () => {
      setBatches(inventoryStore.getStoreBatches());
    };
    window.addEventListener(INVENTORY_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(INVENTORY_UPDATE_EVENT, handleUpdate);
  }, []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [storeFilter, setStoreFilter] = useState("All Stores");
  const [page, setPage] = useState(1);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return batches.filter((b) => {
      const matchQ =
        !q ||
        b.productName.toLowerCase().includes(q) ||
        b.batchNo.toLowerCase().includes(q) ||
        b.sku.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "All" || b.expiryStatus === statusFilter;

      const matchStore =
        storeFilter === "All Stores" ||
        b.store === "All Stores" ||
        b.store === storeFilter;

      return matchQ && matchStatus && matchStore;
    });
  }, [batches, search, statusFilter, storeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Batch Summary Numbers
  const totalBatchesCount = batches.length;
  const criticalCount = batches.filter((b) => b.expiryStatus === "Critical").length;
  const highRiskCount = batches.filter((b) => b.expiryStatus === "High Risk").length;
  const safeCount = batches.filter((b) => b.expiryStatus === "Safe" || b.expiryStatus === "Warning").length;

  return (
    <div className="space-y-6 pb-24 font-sans text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Batch & Manufacturing Lot Tracker
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            FEFO (First-Expired-First-Out) batch management for expiry-sensitive inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/retailer/add-product"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="size-4" />
            Ingest New Batch
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-mono">Active Batches</p>
            <p className="text-2xl font-bold font-mono text-foreground">{totalBatchesCount}</p>
            <p className="text-[10px] text-emerald-600 font-mono">Monitored across shelves</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-mono">Critical (&lt; 7 Days)</p>
            <p className="text-2xl font-bold font-mono text-destructive">{criticalCount}</p>
            <p className="text-[10px] text-destructive font-mono">Flash clearance required</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-mono">High Risk (8-14 Days)</p>
            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{highRiskCount}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Discount tier active</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-mono">Safe Stock (&gt; 15 Days)</p>
            <p className="text-2xl font-bold font-mono text-foreground">{safeCount}</p>
            <p className="text-[10px] text-emerald-600 font-mono">Standard shelf turnover</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm ern-card-glow">
        {/* Filter controls */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search batch code, product name, SKU..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none cursor-pointer"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical (&lt; 7 Days)</option>
              <option value="High Risk">High Risk (8-14 Days)</option>
              <option value="Warning">Warning (15-30 Days)</option>
              <option value="Safe">Safe (&gt; 30 Days)</option>
            </select>

            <select
              value={storeFilter}
              onChange={(e) => {
                setStoreFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none cursor-pointer"
            >
              <option value="All Stores">All Stores</option>
              <option value="Main Branch">Main Branch</option>
              <option value="City Center">City Center</option>
            </select>
          </div>

          <span className="text-xs font-mono text-muted-foreground">
            Showing {filtered.length} batches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground font-mono uppercase bg-secondary/20">
                <th className="px-4 py-3">Batch No</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Store Location</th>
                <th className="px-4 py-3">Mfg Date</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3">Days Remaining</th>
                <th className="px-4 py-3">Stock Units</th>
                <th className="px-4 py-3">Risk Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginated.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {b.batchNo}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    <Link
                      to="/retailer/products"
                      className="hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {b.productName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{b.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setIsLocationModalOpen(true)}
                      className="hover:underline text-primary flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <MapPin className="size-3" />
                      {b.store}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{b.mfgDate}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">
                    {b.expiryDate}
                  </td>
                  <td className="px-4 py-3 font-mono whitespace-nowrap">
                    <span
                      className={`font-bold whitespace-nowrap inline-flex items-center gap-1 ${
                        (b.daysRemaining || 0) <= 3
                          ? "text-destructive"
                          : (b.daysRemaining || 0) <= 7
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {b.daysRemaining}D LEFT
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className="font-bold text-foreground">{b.qtyLeft}</span> / {b.qtyTotal}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap inline-flex items-center justify-center ${
                        EXPIRY_STATUS_STYLE[b.expiryStatus]
                      }`}
                    >
                      {b.expiryStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {b.expiryStatus === "Critical" ? (
                      <Link
                        to="/retailer/clearance"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold hover:bg-primary/90 transition-colors shadow-xs"
                      >
                        <Percent className="size-3" />
                        Flash Clearance
                      </Link>
                    ) : (
                      <Link
                        to="/retailer/expiry"
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors inline-block"
                        title="View Expiry Radar"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({filtered.length} total batches)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-secondary transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="font-mono px-2">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-secondary transition-colors cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <StoreLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedStoreId="all"
        onSelectStore={(_, name) => setStoreFilter(name)}
      />
    </div>
  );
}
