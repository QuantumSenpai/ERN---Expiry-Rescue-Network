import { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Eye,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { MASTER_PRODUCTS } from "@/data/mockInventory";
import type { Product, StockStatus } from "@/types/inventory";
import ProductDetailModal from "@/components/ProductDetailModal";

const PAGE_SIZE = 8;

const STOCK_STATUS_STYLE: Record<StockStatus, string> = {
  "In Stock": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "Low Stock": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "Out of Stock": "bg-destructive/15 text-destructive",
};

const CATEGORY_BADGE: Record<string, string> = {
  Dairy: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Bakery: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Beverages: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Snacks: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Healthcare: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  Furniture: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  Electronics: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  Stationery: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
};

export default function RetailerProducts() {
  const [products, setProducts] = useState<Product[]>(MASTER_PRODUCTS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [expiryFilter, setExpiryFilter] = useState<"All" | "ON" | "OFF">("All");
  const [stockFilter, setStockFilter] = useState<"All" | StockStatus>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.brand.toLowerCase().includes(q);

      const matchesCat = category === "All" || p.category === category;

      const matchesExpiry =
        expiryFilter === "All" ||
        (expiryFilter === "ON" && p.expiryTrackingEnabled) ||
        (expiryFilter === "OFF" && !p.expiryTrackingEnabled);

      const matchesStock = stockFilter === "All" || p.stockStatus === stockFilter;

      return matchesQuery && matchesCat && matchesExpiry && matchesStock;
    });
  }, [products, search, category, expiryFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string | number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === paginated.length) {
      setSelected([]);
    } else {
      setSelected(paginated.map((p) => p.id));
    }
  };

  const handleDelete = (id: string | number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Stats calculation
  const totalCount = products.length;
  const expiryTrackedCount = products.filter((p) => p.expiryTrackingEnabled).length;
  const nonExpiryCount = products.filter((p) => !p.expiryTrackingEnabled).length;
  const lowStockCount = products.filter((p) => p.stockStatus === "Low Stock").length;

  return (
    <div className="space-y-6 pb-24 font-sans text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Master Product Catalog
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Complete inventory catalog supporting both expiry-sensitive & non-expiry general goods
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/retailer/add-product"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="size-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-mono">Total Catalog Products</p>
            <p className="text-2xl font-bold font-mono text-foreground">{totalCount}</p>
            <p className="text-[10px] text-emerald-600 font-mono">All active SKUs</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-mono">Expiry Tracked</p>
            <p className="text-2xl font-bold font-mono text-foreground">{expiryTrackedCount}</p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">Perishables & Batch Goods</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-mono">Non-Expiry Goods</p>
            <p className="text-2xl font-bold font-mono text-foreground">{nonExpiryCount}</p>
            <p className="text-[10px] text-muted-foreground font-mono">General Inventory & Equipment</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Package className="size-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-mono">Low Stock Alerts</p>
            <p className="text-2xl font-bold font-mono text-foreground">{lowStockCount}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Below min threshold</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm ern-card-glow">
        {/* Filters Bar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, SKU, barcode..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-card text-foreground">
                  Category: {c}
                </option>
              ))}
            </select>

            {/* Expiry Tracking Filter (All / ON / OFF) */}
            <div className="flex items-center rounded-lg bg-secondary/60 border border-border p-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setExpiryFilter("All");
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  expiryFilter === "All"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Tracking
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpiryFilter("ON");
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  expiryFilter === "ON"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Expiry: ON
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpiryFilter("OFF");
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  expiryFilter === "OFF"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Expiry: OFF
              </button>
            </div>

            {/* Stock Status Filter */}
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as "All" | StockStatus);
                setPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-card text-foreground">Stock: All</option>
              <option value="In Stock" className="bg-card text-foreground">In Stock</option>
              <option value="Low Stock" className="bg-card text-foreground">Low Stock</option>
              <option value="Out of Stock" className="bg-card text-foreground">Out of Stock</option>
            </select>
          </div>

          <span className="text-xs font-mono text-muted-foreground">
            Showing {filtered.length} products
          </span>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground font-mono uppercase bg-secondary/20">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.length === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU & Barcode</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Expiry Tracking</th>
                <th className="px-4 py-3 whitespace-nowrap">Stock Status</th>
                <th className="px-4 py-3">Stock Quantity</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3 text-center">Batches</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginated.map((p) => {
                const isChecked = selected.includes(p.id);
                return (
                  <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-border accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-secondary text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight text-xs">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {p.brand} • {p.unit}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <p className="text-foreground font-semibold">{p.sku}</p>
                      <p className="text-[10px] text-muted-foreground">{p.barcode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          CATEGORY_BADGE[p.category] || "bg-secondary text-foreground"
                        }`}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.expiryTrackingEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-mono">
                          <Clock className="size-3" />
                          ON
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-muted-foreground font-mono">
                          OFF
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap inline-flex items-center justify-center ${
                          STOCK_STATUS_STYLE[p.stockStatus]
                        }`}
                      >
                        {p.stockStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-foreground">{p.quantity}</span>{" "}
                      <span className="text-[10px] text-muted-foreground">{p.unit}</span>
                      {p.quantity <= p.minStockLevel && p.quantity > 0 && (
                        <p className="text-[9px] text-amber-600 font-semibold font-mono">
                          Min: {p.minStockLevel}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-foreground">
                      ₹{p.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {p.expiryTrackingEnabled ? (
                        <Link
                          to="/retailer/batches"
                          className="text-xs font-semibold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded"
                        >
                          {p.batchesCount} Batches
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailProduct(p)}
                          className="p-1 rounded hover:bg-secondary text-primary transition-colors cursor-pointer"
                          title="View Product Specs"
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <Link
                          to={`/retailer/inventory`}
                          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          title="View Inventory"
                        >
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({filtered.length} items total)
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

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        item={detailProduct}
      />
    </div>
  );
}
