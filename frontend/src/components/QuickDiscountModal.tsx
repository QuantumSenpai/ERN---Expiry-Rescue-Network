import { useState } from "react";
import { STORES_DATA } from "@/data/storesData";
import {
  Tag,
  Layers,
  X,
  Sparkles,
} from "lucide-react";

interface QuickDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "Product" | "Category";
  onApply: (data: {
    target: string;
    type: "Product" | "Category";
    discount: number;
    store: string;
  }) => void;
}

const SAMPLE_PRODUCTS = [
  "Amul Taaza Milk 1L",
  "Britannia Whole Wheat Bread 400g",
  "Tropicana 100% Orange Juice 1L",
  "Amul Masti Dahi 400g",
  "Lays Classic Salted 52g",
  "Epigamia Greek Yogurt Strawberry 100g",
  "Mother Dairy Paneer 200g",
  "Harvest Gold Multigrain Bread 450g",
];

const CATEGORIES = ["Dairy", "Bakery", "Beverages", "Snacks", "Grocery", "Personal Care"];

export default function QuickDiscountModal({
  isOpen,
  onClose,
  initialType = "Product",
  onApply,
}: QuickDiscountModalProps) {
  const [type, setType] = useState<"Product" | "Category">(initialType);
  const [selectedProduct, setSelectedProduct] = useState(SAMPLE_PRODUCTS[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [discount, setDiscount] = useState<number>(20);
  const [store, setStore] = useState("All Stores");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      target: type === "Product" ? selectedProduct : selectedCategory,
      type,
      discount,
      store,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {type === "Product" ? <Tag className="size-5" /> : <Layers className="size-5" />}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Apply Quick {type} Discount
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Instantly adjust retail selling price across shelves
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Discount Type Selector */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
              Discount Target
            </label>
            <div className="flex rounded-xl bg-secondary/40 border border-border p-1">
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
              <button
                type="button"
                onClick={() => setType("Category")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  type === "Category"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Entire Category
              </button>
            </div>
          </div>

          {/* Target Select */}
          {type === "Product" ? (
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
                Select Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-foreground text-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                {SAMPLE_PRODUCTS.map((p) => (
                  <option key={p} value={p} className="bg-card text-foreground">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-foreground text-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Store Branch */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-foreground mb-1.5">
              Target Store Location
            </label>
            <select
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-secondary/40 border border-border text-foreground text-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="All Stores" className="bg-card text-foreground">
                🏬 All Stores (Global Network)
              </option>
              {STORES_DATA.map((s) => (
                <option key={s.id} value={s.name} className="bg-card text-foreground">
                  📍 {s.name} ({s.area})
                </option>
              ))}
            </select>
          </div>

          {/* Discount Rate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase text-foreground">
                Clearance Discount Rate
              </label>
              <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                {discount}% OFF
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[10, 15, 20, 25, 40].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setDiscount(rate)}
                  className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    discount === rate
                      ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                      : "bg-secondary/40 border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3 rounded-xl bg-secondary/30 border border-border text-xs space-y-1">
            <div className="flex justify-between font-mono">
              <span className="text-muted-foreground">Scope:</span>
              <span className="font-semibold text-foreground">
                {type === "Product" ? selectedProduct : `${selectedCategory} Category`}
              </span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-semibold text-foreground">{store}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-muted-foreground">Applied Price:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {discount}% Dynamic Clearance
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
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
              <Sparkles className="size-4" />
              Apply Discount Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
