import { useState } from "react";
import Footer from "@/components/Footer";
import ItemCard, { type ItemCardProps } from "@/components/ItemCard";
import Hero from "./Hero";
import HowItWorks from "@/components/StartCard";
import StatsBand from "@/components/StatsBand";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import FinalCta from "@/components/FinalCta";
import TeamSection from "@/components/TeamSection";
import ScrollReveal from "@/components/ScrollReveal";
import BulkActionsModal from "@/components/BulkActionsModal";
import { Sparkles, Search } from "lucide-react";

const MASTER_HOME_INVENTORY: ItemCardProps[] = [
  {
    id: "inv-1",
    name: "Amul Taaza Whole Milk (1L)",
    category: "Food & Beverage",
    location: "Main Cold Depot • Bay D-04",
    sku: "MILK-001",
    batchNo: "MLK-042",
    quantity: 120,
    unit: "Pcs",
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    expiryDate: "17 Aug 2026",
    daysRemaining: 2,
    expiryStatus: "Critical",
    price: 60,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    brand: "Amul",
  },
  {
    id: "inv-2",
    name: "Britannia Artisanal Whole Wheat Toast",
    category: "Food & Beverage",
    location: "Store A • Bay B-01",
    sku: "BRD-001",
    batchNo: "BRD-101",
    quantity: 80,
    unit: "Pcs",
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    expiryDate: "18 Aug 2026",
    daysRemaining: 3,
    expiryStatus: "Critical",
    price: 45,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    brand: "Britannia",
  },
  {
    id: "inv-3",
    name: "Paracetamol 500mg Fast Relief (10 Tabs)",
    category: "Healthcare",
    location: "Central Warehouse • Bay H-09",
    sku: "MED-001",
    batchNo: "MED-902",
    quantity: 350,
    unit: "Strips",
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    expiryDate: "15 Sep 2026",
    daysRemaining: 31,
    expiryStatus: "Safe",
    price: 32,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    brand: "Cipla",
  },
  {
    id: "inv-4",
    name: "Aashirvaad Superior Sharbati Atta (5kg)",
    category: "Food & Beverage",
    location: "Main Depot • Bay G-12",
    sku: "ATA-001",
    batchNo: "ATA-501",
    quantity: 200,
    unit: "Pcs",
    stockStatus: "In Stock",
    expiryTrackingEnabled: true,
    expiryDate: "30 Aug 2026",
    daysRemaining: 15,
    expiryStatus: "Warning",
    price: 245,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    brand: "ITC",
  },
  {
    id: "inv-5",
    name: "BriteCare Microfiber Floor Mop Set",
    category: "Household",
    location: "Store B • Aisle 4",
    sku: "MOP-001",
    batchNo: "MOP-110",
    quantity: 45,
    unit: "Pcs",
    stockStatus: "In Stock",
    expiryTrackingEnabled: false,
    price: 399,
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    brand: "BriteCare",
  },
  {
    id: "inv-6",
    name: "DuraSteel Insulated Stainless Thermos 1L",
    category: "Household",
    location: "Central Warehouse • Bay K-02",
    sku: "BOT-001",
    batchNo: "BOT-889",
    quantity: 90,
    unit: "Pcs",
    stockStatus: "In Stock",
    expiryTrackingEnabled: false,
    price: 650,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    brand: "DuraSteel",
  },
];

export default function Home() {
  const [items] = useState<ItemCardProps[]>(MASTER_HOME_INVENTORY);
  const [filter, setFilter] = useState<"all" | "expiry" | "non-expiry">("all");
  const [search, setSearch] = useState("");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "expiry"
        ? item.expiryTrackingEnabled
        : !item.expiryTrackingEnabled;

    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200 selection:bg-primary selection:text-primary-foreground">
      {/* ─── 1. HERO SECTION (Includes 3D Floating Isometric Artifact) ─── */}
      <Hero />

      {/* ─── 2. STATS & IMPACT BAND ─── */}
      <StatsBand />

      {/* ─── 3. HOW IT WORKS ─── */}
      <HowItWorks />

      {/* ─── 4. LIVE INVENTORY INTELLIGENCE SHOWCASE ─── */}
      <section id="solutions" className="py-20 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-card text-foreground text-xs font-mono mb-3 font-semibold uppercase shadow-none border border-[#2F4156]/25">
              <Sparkles className="size-3 text-foreground" />
              LIVE INVENTORY RADAR
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-[1.15] tracking-[-0.02em]">
              <span className="font-sans block">Unified inventory</span>
              <span className="font-script text-4xl sm:text-5xl md:text-6xl text-foreground block font-bold mt-1">
                radar showcase.
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base font-sans font-normal leading-relaxed">
              Experience ERN's unified architecture: monitor expiry-sensitive goods alongside durable catalog lines.
            </p>
          </div>
        </ScrollReveal>

        {/* Toolbar & Filter controls */}
        <ScrollReveal direction="up" delay={100}>
          <div className="p-4 rounded-2xl bg-card border border-[#2F4156]/20 dark:border-[#F0E9D3]/18 shadow-none mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-card text-xs font-mono w-full sm:w-auto">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-full transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground font-semibold shadow-none"
                    : "text-muted-foreground  hover:text-foreground"
                }`}
              >
                All Inventory ({items.length})
              </button>
              <button
                onClick={() => setFilter("expiry")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-full transition-all cursor-pointer ${
                  filter === "expiry"
                    ? "bg-primary text-primary-foreground font-semibold shadow-none"
                    : "text-muted-foreground  hover:text-foreground"
                }`}
              >
                Expiry-Tracked (4)
              </button>
              <button
                onClick={() => setFilter("non-expiry")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-full transition-all cursor-pointer ${
                  filter === "non-expiry"
                    ? "bg-primary text-primary-foreground font-semibold shadow-none"
                    : "text-muted-foreground  hover:text-foreground"
                }`}
              >
                Non-Expiry (2)
              </button>
            </div>

            {/* Live Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog, SKU, bay..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-full bg-card/60 border border-[#2F4156]/20 dark:border-[#F0E9D3]/18 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Live Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <ScrollReveal key={item.id} direction="up" delay={idx * 50} className="h-full">
              <ItemCard {...item} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── 5. TESTIMONIALS ─── */}
      <TestimonialCarousel />

      {/* ─── 6. TEAM ─── */}
      <TeamSection />

      {/* ─── 7. FINAL CTA BANNER ─── */}
      <FinalCta />

      {/* ─── 8. FOOTER ─── */}
      <Footer />

      {/* External Modals */}
      <BulkActionsModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </div>
  );
}