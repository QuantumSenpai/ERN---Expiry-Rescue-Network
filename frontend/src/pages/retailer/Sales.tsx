import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Receipt,
  ShoppingCart,
  Search,
  Store,
} from "lucide-react";
import { MASTER_SALES } from "@/data/mockInventory";
import type { SaleTransaction } from "@/types/inventory";
import { STORES_DATA } from "@/data/storesData";

export default function Sales() {
  const [sales] = useState<SaleTransaction[]>(MASTER_SALES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const filtered = sales.filter((t) => {
    const matchSearch =
      t.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStore =
      selectedStore === "all" ||
      t.store.toLowerCase().includes(selectedStore.toLowerCase());

    return matchSearch && matchStore;
  });

  const totalRevenue = sales.reduce((acc, curr) => acc + curr.discountedTotal, 0);
  const totalCustomerSavings = sales.reduce((acc, curr) => acc + curr.savings, 0);

  return (
    <div className="space-y-6 pb-24 font-sans text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Sales, POS & Cashier Registers
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Universal transaction logs for mixed general merchandise, electronics, stationery & clearance perishables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/retailer/clearance"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Clearance Rules
          </Link>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono">Today's Transactions</p>
            <p className="text-2xl font-bold font-mono text-foreground">{sales.length}</p>
            <p className="text-[10px] text-emerald-600 font-mono">Mixed multi-item bills</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono">Total Sales Revenue</p>
            <p className="text-2xl font-bold font-mono text-foreground">
              ₹{totalRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-600 font-mono">Net collected today</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm ern-card-glow">
          <div className="size-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <ShoppingCart className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono">Dynamic Clearance Savings</p>
            <p className="text-2xl font-bold font-mono text-foreground">
              ₹{totalCustomerSavings.toLocaleString()}
            </p>
            <p className="text-[10px] text-purple-600 font-mono">Customer markdown value</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm ern-card-glow">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search receipt, cashier, product..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-64"
              />
            </div>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Store Locations</option>
              {STORES_DATA.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.area})
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-mono text-muted-foreground">
            Showing {filtered.length} recent sales records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground font-mono uppercase bg-secondary/20">
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Store Location</th>
                <th className="px-4 py-3">Items Purchased</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Original MRP</th>
                <th className="px-4 py-3">Discounted Total</th>
                <th className="px-4 py-3">Customer Saved</th>
                <th className="px-4 py-3">Cashier</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((t) => {
                const isExpanded = expandedTx === t.id;
                return (
                  <div key={t.id} style={{ display: "contents" }}>
                    <tr
                      onClick={() => setExpandedTx(isExpanded ? null : t.id)}
                      className="hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        {t.receiptNo}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{t.time}</td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Store className="size-3 text-primary" />
                          {t.store}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="font-bold text-foreground">{t.itemsCount} units</span>{" "}
                        <span className="text-[10px] text-muted-foreground">
                          ({t.items.length} SKUs)
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[10px]">
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono line-through text-muted-foreground">
                        ₹{t.originalTotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{t.discountedTotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-primary">
                        {t.savings > 0 ? `₹${t.savings}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{t.cashier}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-primary font-semibold text-[11px]">
                          {isExpanded ? "Hide" : "View Items"}
                        </span>
                      </td>
                    </tr>

                    {/* Expandable Order Items Breakdown */}
                    {isExpanded && (
                      <tr className="bg-secondary/15">
                        <td colSpan={10} className="px-6 py-3">
                          <div className="space-y-2">
                            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
                              Transaction Itemized Breakdown:
                            </span>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {t.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-lg bg-card border border-border text-xs space-y-1"
                                >
                                  <div className="flex justify-between font-semibold text-foreground">
                                    <span className="truncate">{item.productName}</span>
                                    <span>₹{item.subtotal}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                                    <span>
                                      {item.quantity}x @ ₹{item.unitPrice} ({item.category})
                                    </span>
                                    {item.expiryTrackingEnabled ? (
                                      <span className="text-primary font-bold">
                                        Batch {item.batchNo}{" "}
                                        {item.discountPercent && `(${item.discountPercent}% OFF)`}
                                      </span>
                                    ) : (
                                      <span>Non-Expiry Item</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </div>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
