import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Printer,
  Clock,
  MapPin,
  TrendingUp,
  ArrowRight,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import AnimatedNumber from "@/components/AnimatedNumber";

export type DateRangePeriod = "today" | "7d" | "30d" | "90d";

export type ReportType =
  | "Executive Summary"
  | "Inventory Report"
  | "Expiry Risk Report"
  | "Rescue Performance"
  | "Clearance Performance"
  | "Supplier Performance"
  | "Waste Prevention"
  | "Location Performance";

export interface CategoryMetric {
  category: string;
  inventoryUnits: number;
  expiryRiskValue: number;
  rescuedUnits: number;
  clearanceUnits: number;
  wastePreventedKg: number;
  recoveryValue: number;
}

export interface LocationMetric {
  location: string;
  inventoryValue: number;
  expiryRiskValue: number;
  rescueCount: number;
  clearanceCount: number;
  wastePreventedKg: number;
  recoveryValue: number;
}

const PERIOD_KPIS: Record<
  DateRangePeriod,
  {
    inventoryValue: number;
    expiryRiskValue: number;
    productsRescued: number;
    clearanceSold: number;
    recoveryValue: number;
    wastePreventedKg: number;
  }
> = {
  today: {
    inventoryValue: 2237000,
    expiryRiskValue: 68450,
    productsRescued: 24,
    clearanceSold: 12,
    recoveryValue: 4890,
    wastePreventedKg: 18,
  },
  "7d": {
    inventoryValue: 2237000,
    expiryRiskValue: 68450,
    productsRescued: 142,
    clearanceSold: 64,
    recoveryValue: 22450,
    wastePreventedKg: 86,
  },
  "30d": {
    inventoryValue: 2237000,
    expiryRiskValue: 68450,
    productsRescued: 486,
    clearanceSold: 198,
    recoveryValue: 84650,
    wastePreventedKg: 342,
  },
  "90d": {
    inventoryValue: 2237000,
    expiryRiskValue: 68450,
    productsRescued: 1350,
    clearanceSold: 580,
    recoveryValue: 245600,
    wastePreventedKg: 980,
  },
};

const EXPIRY_TREND_PERIODS: Record<DateRangePeriod, { label: string; critical: number; rescued: number }[]> = {
  today: [
    { label: "09:00", critical: 8, rescued: 4 },
    { label: "12:00", critical: 12, rescued: 8 },
    { label: "15:00", critical: 14, rescued: 18 },
    { label: "18:00", critical: 11, rescued: 24 },
  ],
  "7d": [
    { label: "Mon", critical: 24, rescued: 18 },
    { label: "Tue", critical: 28, rescued: 22 },
    { label: "Wed", critical: 20, rescued: 32 },
    { label: "Thu", critical: 35, rescued: 40 },
    { label: "Fri", critical: 42, rescued: 48 },
    { label: "Sat", critical: 50, rescued: 62 },
    { label: "Sun", critical: 30, rescued: 45 },
  ],
  "30d": [
    { label: "W1", critical: 120, rescued: 95 },
    { label: "W2", critical: 140, rescued: 125 },
    { label: "W3", critical: 110, rescued: 140 },
    { label: "W4", critical: 95, rescued: 160 },
  ],
  "90d": [
    { label: "Month 1", critical: 480, rescued: 390 },
    { label: "Month 2", critical: 420, rescued: 460 },
    { label: "Month 3", critical: 380, rescued: 500 },
  ],
};

const CATEGORY_PERFORMANCE: CategoryMetric[] = [
  {
    category: "Dairy & Grocery",
    inventoryUnits: 326,
    expiryRiskValue: 18400,
    rescuedUnits: 84,
    clearanceUnits: 28,
    wastePreventedKg: 42,
    recoveryValue: 12400,
  },
  {
    category: "Bakery",
    inventoryUnits: 180,
    expiryRiskValue: 12600,
    rescuedUnits: 62,
    clearanceUnits: 18,
    wastePreventedKg: 28,
    recoveryValue: 8900,
  },
  {
    category: "Beverages",
    inventoryUnits: 210,
    expiryRiskValue: 10400,
    rescuedUnits: 45,
    clearanceUnits: 15,
    wastePreventedKg: 24,
    recoveryValue: 7600,
  },
];

const LOCATION_PERFORMANCE: LocationMetric[] = [
  {
    location: "Central Warehouse",
    inventoryValue: 1150000,
    expiryRiskValue: 28640,
    rescueCount: 148,
    clearanceCount: 42,
    wastePreventedKg: 68,
    recoveryValue: 24800,
  },
  {
    location: "Store A",
    inventoryValue: 480000,
    expiryRiskValue: 18450,
    rescueCount: 94,
    clearanceCount: 32,
    wastePreventedKg: 44,
    recoveryValue: 14600,
  },
  {
    location: "Store B",
    inventoryValue: 360000,
    expiryRiskValue: 12500,
    rescueCount: 52,
    clearanceCount: 18,
    wastePreventedKg: 22,
    recoveryValue: 8100,
  },
  {
    location: "Distribution Center",
    inventoryValue: 247000,
    expiryRiskValue: 8860,
    rescueCount: 32,
    clearanceCount: 12,
    wastePreventedKg: 14,
    recoveryValue: 3838,
  },
];

export default function Reports() {
  const [datePeriod, setDatePeriod] = useState<DateRangePeriod>("30d");
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentKPIs = PERIOD_KPIS[datePeriod];
  const expiryTrend = EXPIRY_TREND_PERIODS[datePeriod];

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
            <span>AUDIT & ANALYTICS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            REPORTS & INTELLIGENCE
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Comprehensive audit reports, recovery velocity analytics, and ESG waste metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase">
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95"
          >
            <Download className="size-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
        {[
          { label: "Today", value: "today" },
          { label: "Last 7 Days", value: "7d" },
          { label: "Last 30 Days", value: "30d" },
          { label: "Last 90 Days", value: "90d" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setDatePeriod(t.value as DateRangePeriod)}
            className={`px-4 py-2 rounded-full font-bold uppercase transition-all cursor-pointer ${
              datePeriod === t.value
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground border border-border hover:border-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono">
        <div className="p-4 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
          <span className="text-[11px] uppercase font-bold text-muted-foreground">Total Inventory</span>
          <p className="text-2xl font-bold font-display uppercase text-foreground mt-2">
            ₹{(currentKPIs.inventoryValue / 100000).toFixed(1)}L
          </p>
          <p className="text-[10px] text-muted-foreground font-body">All facilities</p>
        </div>

        <div className="p-4 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-[11px] uppercase font-bold text-foreground">Expiry Exposure</span>
          <p className="text-2xl font-bold font-display uppercase text-foreground mt-2">
            ₹{(currentKPIs.expiryRiskValue / 1000).toFixed(1)}k
          </p>
          <p className="text-[10px] text-muted-foreground font-body">At risk</p>
        </div>

        <div className="p-4 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-[11px] uppercase font-bold text-muted-foreground">Rescued</span>
          <p className="text-2xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={currentKPIs.productsRescued} />
          </p>
          <p className="text-[10px] text-muted-foreground font-body">Units sold</p>
        </div>



        <div className="p-4 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-[11px] uppercase font-bold text-muted-foreground">Clearance</span>
          <p className="text-2xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={currentKPIs.clearanceSold} />
          </p>
          <p className="text-[10px] text-muted-foreground font-body">Flash units</p>
        </div>

        <div className="p-4 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-[11px] uppercase font-bold text-muted-foreground">Recovery</span>
          <p className="text-2xl font-bold font-display uppercase text-foreground mt-2">
            ₹{(currentKPIs.recoveryValue / 1000).toFixed(1)}k
          </p>
          <p className="text-[10px] text-muted-foreground font-body">Realized value</p>
        </div>




        <div className="p-4 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between transition-colors duration-200 ern-card-glow">
  <span className="text-[11px] uppercase font-bold text-foreground">Waste Prevented</span>
          <p className="text-2xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={currentKPIs.wastePreventedKg} /> kg
          </p>
          <p className="text-[10px] text-muted-foreground font-body">ESG Impact</p>
        </div>
      </div>




      {/* Chart Section */}
      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] p-6 shadow-none font-mono text-xs space-y-4 transition-colors duration-200 ern-card-glow">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold uppercase text-foreground">
            Expiry Risk vs Rescue Velocity
          </h2>
          <span className="text-muted-foreground text-xs">Real-time telemetry</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={expiryTrend}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F4156" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2F4156" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rescueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F4156" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2F4156" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,58,19,0.15)" vertical={false} />
              <XAxis dataKey="label" stroke="#757C5D" fontSize={10} tickLine={false} />
              <YAxis stroke="#757C5D" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FCFCF7",
                  borderColor: "rgba(28,58,19,0.15)",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#2F4156",
                }}
              />
              <Area type="monotone" dataKey="critical" stroke="#2F4156" strokeWidth={2} fill="url(#riskGrad)" name="At Risk Lots" />
              <Area type="monotone" dataKey="rescued" stroke="#2F4156" strokeWidth={2} fill="url(#rescueGrad)" name="Rescued Lots" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2 Grids: Category Performance & Location Performance */}
      <div className="grid lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Category Performance */}
        <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none transition-colors duration-200 ern-card-glow">
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-bold text-xl uppercase text-foreground">
              Category Breakdown
            </h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold uppercase">Category</th>
                <th className="px-4 py-3 font-bold uppercase text-right">Units</th>
                <th className="px-4 py-3 font-bold uppercase text-right">Rescued</th>
                <th className="px-4 py-3 font-bold uppercase text-right">Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {CATEGORY_PERFORMANCE.map((c) => (
                <tr key={c.category} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground font-display uppercase">{c.category}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c.inventoryUnits}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">{c.rescuedUnits}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">₹{c.recoveryValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Location Performance */}
        <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none transition-colors duration-200 ern-card-glow">
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-bold text-xl uppercase text-foreground">
              Facility Performance
            </h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold uppercase">Location</th>
                <th className="px-4 py-3 font-bold uppercase text-right">Inventory</th>
                <th className="px-4 py-3 font-bold uppercase text-right">Rescues</th>
                <th className="px-4 py-3 font-bold uppercase text-right">Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {LOCATION_PERFORMANCE.map((l) => (
                <tr key={l.location} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground font-display uppercase">{l.location}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">₹{(l.inventoryValue / 1000).toFixed(0)}k</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">{l.rescueCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">₹{l.recoveryValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Modal */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-bold text-xl uppercase text-foreground">Generate Report</h3>
              <button onClick={() => setGenerateModalOpen(false)} className="p-1 text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Report Scope</label>
                <select className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-mono text-xs outline-none">
                  <option>Executive Summary</option>
                  <option>Inventory & Expiry Audit</option>
                  <option>ESG Waste Prevention Report</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setGenerateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setGenerateModalOpen(false);
                  showToast("Report generated and downloaded.");
                }}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none active:scale-95"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
