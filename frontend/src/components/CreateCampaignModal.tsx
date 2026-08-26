import { useState } from "react";
import { STORES_DATA } from "@/data/storesData";
import {
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface NewCampaignData {
  name: string;
  category: string;
  type: "Category" | "Product";
  itemsCount: number;
  store: string;
  startDate: string;
  endDate: string;
  discount: string;
}

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: NewCampaignData) => void;
}

const CATEGORIES = ["Dairy", "Bakery", "Beverages", "Snacks", "Grocery", "Personal Care"];

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onCreate,
}: CreateCampaignModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"Category" | "Product">("Category");
  const [category, setCategory] = useState("Dairy");
  const [store, setStore] = useState("All Stores");
  const [itemsCount, setItemsCount] = useState<number>(10);
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a campaign name.");
      return;
    }

    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    onCreate({
      name: name.trim(),
      category,
      type,
      itemsCount: Number(itemsCount) || 1,
      store,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      discount: `${discountPercent}% OFF`,
    });

    setName("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Create Clearance Campaign
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Launch automated dynamic discounts across near-expiry stock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
              Campaign Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekend Dairy Flash Clearance"
              className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Type Toggle: Category vs Product */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
                Discount Scope
              </label>
              <div className="flex rounded-xl bg-secondary/40 border border-border p-1">
                <button
                  type="button"
                  onClick={() => setType("Category")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    type === "Category"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Category
                </button>
                <button
                  type="button"
                  onClick={() => setType("Product")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    type === "Product"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Specific Product
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
                Target Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-secondary/40 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Store Branch & Item Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
                Store Location
              </label>
              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-secondary/40 border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All Stores" className="bg-card text-foreground">
                  🏬 All Stores
                </option>
                {STORES_DATA.map((s) => (
                  <option key={s.id} value={s.name} className="bg-card text-foreground">
                    📍 {s.name} ({s.area})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
                Estimated Items Included
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={itemsCount}
                onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-foreground text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Discount Percentage Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase text-foreground">
                Discount Percentage
              </label>
              <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                {discountPercent}% OFF
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="70"
              step="5"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
              <span>5% (Light)</span>
              <span>25% (Standard)</span>
              <span>50% (Urgent)</span>
              <span>70% (Flash)</span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-secondary/40 border border-border text-foreground text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
                End Date (Expiry)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-secondary/40 border border-border text-foreground text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              Launch Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
