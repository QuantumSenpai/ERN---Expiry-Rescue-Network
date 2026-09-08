import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Tag,
  Percent,
  ShoppingCart,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  ArrowUpRight,
  ShoppingBag,
  Store,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import StoreLocationModal from "@/components/StoreLocationModal";
import CreateCampaignModal, { type NewCampaignData } from "@/components/CreateCampaignModal";
import QuickDiscountModal from "@/components/QuickDiscountModal";
import { STORES_DATA } from "@/data/storesData";
import AnimatedNumber from "@/components/AnimatedNumber";

interface Campaign {
  id: number;
  name: string;
  category: string;
  type: "Category" | "Product";
  itemsCount: number;
  store: string;
  startDate: string;
  endDate: string;
  daysRemaining: string;
  isExpired?: boolean;
  discount: string;
  status: "Active" | "Completed";
  revenue: number;
  progress: number;
}

interface DiscountedItem {
  id: number;
  product: string;
  category: string;
  batchNo: string;
  store: string;
  expiryDate: string;
  daysLeft: number;
  mrp: number;
  discount: number;
  salePrice: number;
  status: "Active" | "Pending";
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: "Milk Products Clearance",
    category: "Dairy",
    type: "Category",
    itemsCount: 12,
    store: "All Stores",
    startDate: "10 May 2024",
    endDate: "20 May 2024",
    daysRemaining: "3 days left",
    discount: "20% OFF",
    status: "Active",
    revenue: 45230,
    progress: 60,
  },
  {
    id: 2,
    name: "Bread & Bakery Sale",
    category: "Bakery",
    type: "Category",
    itemsCount: 8,
    store: "Main Branch",
    startDate: "08 May 2024",
    endDate: "18 May 2024",
    daysRemaining: "1 day left",
    discount: "25% OFF",
    status: "Active",
    revenue: 32450,
    progress: 75,
  },
  {
    id: 3,
    name: "Tropicana Orange Flash Markdown",
    category: "Beverages",
    type: "Product",
    itemsCount: 45,
    store: "Central Warehouse",
    startDate: "14 May 2024",
    endDate: "16 May 2024",
    daysRemaining: "2 days left",
    discount: "35% OFF",
    status: "Active",
    revenue: 1890,
    progress: 40,
  },
];

const INITIAL_DISCOUNTED_ITEMS: DiscountedItem[] = [
  {
    id: 1,
    product: "Amul Taaza Milk 1L",
    category: "Dairy",
    batchNo: "MLK-042",
    store: "Central Warehouse",
    expiryDate: "18 Aug 2026",
    daysLeft: 2,
    mrp: 42.0,
    discount: 40,
    salePrice: 25.2,
    status: "Active",
  },
  {
    id: 2,
    product: "Britannia Whole Wheat Bread 400g",
    category: "Bakery",
    batchNo: "BRD-101",
    store: "Store A",
    expiryDate: "19 Aug 2026",
    daysLeft: 3,
    mrp: 30.0,
    discount: 30,
    salePrice: 21.0,
    status: "Active",
  },
  {
    id: 3,
    product: "FarmFresh Pasteurized Paneer 200g",
    category: "Dairy",
    batchNo: "PNR-882",
    store: "Store B",
    expiryDate: "20 Aug 2026",
    daysLeft: 4,
    mrp: 95.0,
    discount: 25,
    salePrice: 71.25,
    status: "Active",
  },
  {
    id: 4,
    product: "Tropicana Valencia Orange Juice 1L",
    category: "Beverages",
    batchNo: "JUC-882",
    store: "Store B",
    expiryDate: "24 Aug 2026",
    daysLeft: 8,
    mrp: 110.0,
    discount: 20,
    salePrice: 88.0,
    status: "Active",
  },
];

const INITIAL_HIGH_PRIORITY = [
  {
    id: "hp-1",
    product: "Amul Taaza Milk 1L",
    batch: "Batch: MLK-042",
    expiry: "Expires on 18 Aug 2026",
    days: "2 days left",
    discount: "40% OFF",
    category: "Dairy",
    discountRate: 40,
    store: "Central Warehouse",
  },
  {
    id: "hp-2",
    product: "Britannia Bread 400g",
    batch: "Batch: BRD-101",
    expiry: "Expires on 19 Aug 2026",
    days: "3 days left",
    discount: "30% OFF",
    category: "Bakery",
    discountRate: 30,
    store: "Store A",
  },
  {
    id: "hp-3",
    product: "FarmFresh Paneer 200g",
    batch: "Batch: PNR-882",
    expiry: "Expires on 20 Aug 2026",
    days: "4 days left",
    discount: "25% OFF",
    category: "Dairy",
    discountRate: 25,
    store: "Store B",
  },
];

const PERFORMANCE_DATA = [
  { day: "11 May", value: 18000 },
  { day: "12 May", value: 38000 },
  { day: "13 May", value: 32000 },
  { day: "14 May", value: 42000 },
  { day: "15 May", value: 48000 },
  { day: "16 May", value: 74000 },
  { day: "17 May", value: 58000 },
];

const FILTER_TABS = [
  { label: "All", value: "all", count: 156 },
  { label: "Dairy", value: "Dairy", count: 28 },
  { label: "Bakery", value: "Bakery", count: 32 },
  { label: "Beverages", value: "Beverages", count: 24 },
];

export default function Clearance() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [discountedItems] = useState<DiscountedItem[]>(INITIAL_DISCOUNTED_ITEMS);
  const [highPriority] = useState(INITIAL_HIGH_PRIORITY);

  const [campaignSearch, setCampaignSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStoreFilter, setSelectedStoreFilter] = useState("All Stores");
  const [selectedStoreId, setSelectedStoreId] = useState("all");
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuickDiscountOpen, setIsQuickDiscountOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateCampaign = (data: NewCampaignData) => {
    const newCamp: Campaign = {
      id: Date.now(),
      name: data.name,
      category: data.category,
      type: data.type,
      itemsCount: data.itemsCount,
      store: data.store,
      startDate: data.startDate,
      endDate: data.endDate,
      daysRemaining: "7 days left",
      discount: data.discount,
      status: "Active",
      revenue: 0,
      progress: 0,
    };
    setCampaigns([newCamp, ...campaigns]);
    showToast(`Campaign "${data.name}" launched.`);
  };

  const filteredCampaigns = useMemo(() => {
    const q = campaignSearch.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.store.toLowerCase().includes(q);
      const matchStore =
        selectedStoreFilter === "All Stores" ||
        c.store === "All Stores" ||
        c.store === selectedStoreFilter;
      return matchQ && matchStore;
    });
  }, [campaigns, campaignSearch, selectedStoreFilter]);

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return discountedItems.filter((item) => {
      const matchQ =
        !q ||
        item.product.toLowerCase().includes(q) ||
        item.batchNo.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchTab = activeTab === "all" || item.category === activeTab;
      const matchStore =
        selectedStoreFilter === "All Stores" ||
        item.store === "All Stores" ||
        item.store === selectedStoreFilter;
      return matchQ && matchTab && matchStore;
    });
  }, [discountedItems, itemSearch, activeTab, selectedStoreFilter]);

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
            <span>DISCOUNT & CLEARANCE ENGINE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            CLEARANCE & DISCOUNTS
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Execute dynamic flash markdowns, manage clearance campaigns, and protect inventory value.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95"
          >
            <Plus className="size-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-mono">
        <div className="p-5 rounded-[24px] bg-card border border-border shadow-none flex flex-col justify-between ern-card-glow">
          <span className="text-xs uppercase font-bold text-muted-foreground">Active Campaigns</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={campaigns.length} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Live on marketplace</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-border shadow-none flex flex-col justify-between ern-card-glow">
          <span className="text-xs uppercase font-bold text-muted-foreground">Discounted Items</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={156} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Marked down lots</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-border shadow-none flex flex-col justify-between ern-card-glow">
          <span className="text-xs uppercase font-bold text-muted-foreground">Units Sold</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={3256} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Through clearance</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-border shadow-none flex flex-col justify-between ern-card-glow">
          <span className="text-xs uppercase font-bold text-muted-foreground">Recovery Value</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">₹2.45L</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Revenue generated</p>
        </div>

        <div className="p-5 rounded-[24px] bg-card border border-border shadow-none col-span-2 sm:col-span-1 flex flex-col justify-between ern-card-glow">
          <span className="text-xs uppercase font-bold text-foreground">Protected Loss</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">₹8.92L</p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Waste avoided</p>
        </div>
      </div>

      {/* Main Grid: Tables + Sidebar */}
      <div className="grid lg:grid-cols-12 gap-6 items-start font-mono text-xs">
        {/* Left Column: Tables */}
        <div className="lg:col-span-8 space-y-6">
          {/* Table 1: Active Clearance Campaigns */}
          <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none ern-card-glow">
            <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-display font-bold text-xl uppercase text-foreground">
                Active Campaigns
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-48 font-sans"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase">Campaign Name</th>
                    <th className="px-4 py-3 font-bold uppercase">Category</th>
                    <th className="px-4 py-3 font-bold uppercase">Store</th>
                    <th className="px-4 py-3 font-bold uppercase">Discount</th>
                    <th className="px-4 py-3 font-bold uppercase">Status</th>
                    <th className="px-4 py-3 font-bold uppercase text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
                  {filteredCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-foreground font-display uppercase text-sm">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.daysRemaining}</p>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{c.category}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{c.store}</td>
                      <td className="px-4 py-3.5 font-bold text-foreground">{c.discount}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center bg-primary text-primary-foreground">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-foreground">
                        ₹{c.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Discounted Items */}
          <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none ern-card-glow">
            <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-display font-bold text-xl uppercase text-foreground">
                Discounted Lots
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search lots..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-48 font-sans"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase">Product</th>
                    <th className="px-4 py-3 font-bold uppercase">Batch</th>
                    <th className="px-4 py-3 font-bold uppercase">Expiry</th>
                    <th className="px-4 py-3 font-bold uppercase">Original</th>
                    <th className="px-4 py-3 font-bold uppercase">Discount</th>
                    <th className="px-4 py-3 font-bold uppercase">Sale Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-foreground font-display uppercase">{item.product}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{item.batchNo}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{item.expiryDate}</td>
                      <td className="px-4 py-3.5 text-muted-foreground line-through">₹{item.mrp.toFixed(2)}</td>
                      <td className="px-4 py-3.5 font-bold text-foreground">{item.discount}% OFF</td>
                      <td className="px-4 py-3.5 font-bold text-foreground">₹{item.salePrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: High Priority + Trend */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] p-5 shadow-none space-y-4 ern-card-glow">
            <h3 className="font-display font-bold text-lg uppercase text-foreground">
              High Priority Flash Markdowns
            </h3>
            <div className="divide-y divide-[rgba(28,58,19,0.15)]">
              {highPriority.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground uppercase font-display text-sm">{item.product}</p>
                    <p className="text-[10.5px] text-muted-foreground">{item.days} · {item.store}</p>
                  </div>
                  <button
                    onClick={() => showToast(`Applied ${item.discount} to ${item.product}`)}
                    className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] cursor-pointer"
                  >
                    {item.discount}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] p-5 shadow-none space-y-3 ern-card-glow">
            <h3 className="font-display font-bold text-lg uppercase text-foreground">
              Clearance Velocity
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="clrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F4156" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2F4156" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,58,19,0.15)" vertical={false} />
                  <XAxis dataKey="day" stroke="#757C5D" fontSize={10} tickLine={false} />
                  <YAxis stroke="#757C5D" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FCFCF7",
                      borderColor: "rgba(28,58,19,0.15)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#2F4156",
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#2F4156" strokeWidth={2} fill="url(#clrGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <StoreLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectStore={(id, name) => {
          setSelectedStoreId(id);
          setSelectedStoreFilter(name);
          showToast(`Filtered for ${name}`);
        }}
        selectedStoreId={selectedStoreId}
      />

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCampaign}
      />

      <QuickDiscountModal
        isOpen={isQuickDiscountOpen}
        onClose={() => setIsQuickDiscountOpen(false)}
        onApply={(data) => showToast(`Applied discount to ${data.target}`)}
        initialType="Product"
      />
    </div>
  );
}
