import { useState } from "react";
import ItemCard from "@/components/ItemCard";
import { Search, Building2, Check, X } from "lucide-react";

const browseItems = [
  {
    id: 1,
    name: "Artisan Whole Wheat Toast Loaf",
    store: "Metro Supermarket • Indiranagar",
    batchNo: "B-9842",
    originalPrice: 120,
    discountedPrice: 48,
    discountPercent: 60,
    expiresIn: "3 days left",
    freshness: 25,
    category: "Bakery & Bread",
    isBulkEligible: true,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Farm Fresh Pasteurized Milk (5L Crate)",
    store: "City Mart Superstore • Koramangala",
    batchNo: "MLK-402",
    originalPrice: 350,
    discountedPrice: 175,
    discountPercent: 50,
    expiresIn: "4 days left",
    freshness: 38,
    category: "Dairy & Eggs",
    isBulkEligible: true,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Organic Valencia Orange Juice (1L)",
    store: "Green Planet Grocers • HSR Layout",
    batchNo: "JUC-882",
    originalPrice: 180,
    discountedPrice: 90,
    discountPercent: 50,
    expiresIn: "6 days left",
    freshness: 50,
    category: "Beverages",
    isBulkEligible: false,
    imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Roasted Hazelnut Chocolate Spread",
    store: "Gourmet Plaza • Whitefield",
    batchNo: "SP-1104",
    originalPrice: 420,
    discountedPrice: 210,
    discountPercent: 50,
    expiresIn: "12 days left",
    freshness: 65,
    category: "Packaged Foods",
    isBulkEligible: true,
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Classic Granola Breakfast Cereal (1kg)",
    store: "Reliance Fresh • BTM",
    batchNo: "CR-772",
    originalPrice: 480,
    discountedPrice: 192,
    discountPercent: 60,
    expiresIn: "14 days left",
    freshness: 45,
    category: "Packaged Foods",
    isBulkEligible: true,
    imageUrl: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "Gourmet Greek Dip & Olive Trio",
    store: "Nature's Basket • MG Road",
    batchNo: "DP-309",
    originalPrice: 290,
    discountedPrice: 116,
    discountPercent: 60,
    expiresIn: "2 days left",
    freshness: 18,
    category: "Deli & Snacks",
    isBulkEligible: false,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Browse() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [bulkOnly, setBulkOnly] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSubmitted, setBulkSubmitted] = useState(false);

  const categories = ["All", "Bakery & Bread", "Dairy & Eggs", "Packaged Foods", "Beverages", "Deli & Snacks"];

  const filtered = browseItems.filter((item) => {
    const matchCat = category === "All" || item.category === category;
    const matchSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.store.toLowerCase().includes(search.toLowerCase());
    const matchBulk = !bulkOnly || item.isBulkEligible;
    return matchCat && matchSearch && matchBulk;
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
              <span>MARKETPLACE CATALOG</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground leading-[1.08] tracking-[-0.025em]">
              Browse & Rescue
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-2">
              Explore verified perishable lots, near-expiry clearance items, and commercial surplus.
            </p>
          </div>

          <button
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all font-mono text-xs font-medium uppercase shadow-none cursor-pointer"
          >
            <Building2 className="size-4" />
            <span>Commercial Bulk Buy</span>
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full font-medium uppercase transition-all cursor-pointer ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search + Bulk filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-card border border-transparent focus:border-primary text-foreground placeholder:text-muted-foreground font-sans text-xs outline-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 font-body text-xs text-foreground">
              <input
                type="checkbox"
                checked={bulkOnly}
                onChange={(e) => setBulkOnly(e.target.checked)}
                className="size-4 rounded border-border bg-card text-foreground focus:ring-primary accent-primary"
              />
              <span>Bulk Lots Only</span>
            </label>
          </div>
        </div>

        {/* Grid of Items */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-background border border-border text-muted-foreground font-mono text-xs">
            No products match your active search filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filtered.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>

      {/* Bulk Buy Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-[350] text-xl uppercase text-foreground">Commercial Bulk Inquiry</h3>
              <button onClick={() => setBulkModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            {bulkSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <Check className="size-10 text-foreground mx-auto" />
                <h4 className="font-display font-[350] text-lg text-foreground">Inquiry Dispatched</h4>
                <p className="text-xs text-muted-foreground font-body">An enterprise liquidation officer will contact you within 2 business hours.</p>
                <button
                  onClick={() => {
                    setBulkSubmitted(false);
                    setBulkModalOpen(false);
                  }}
                  className="mt-4 px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-medium"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setBulkSubmitted(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-muted-foreground uppercase font-medium block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Hospitality Group"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-transparent focus:border-primary text-foreground font-sans text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-medium block mb-1">Volume Requirement (Units / Tons)</label>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-transparent focus:border-primary text-foreground font-mono text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-card hover:bg-[#c4c7c4]/40 text-foreground uppercase font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-medium hover:bg-[#567C8D] cursor-pointer shadow-none"
                  >
                    Submit Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
