import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  ShieldCheck,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Percent,
  Download,
  Settings2,
  RefreshCw,
  Zap,
  ArrowRightLeft,
  Package,
  Eye,
  TrendingDown,
  Brain,
  Target,
  ArrowRight,
  CheckCircle2,
  X,
  Check,
  Truck,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import AnimatedNumber from "@/components/AnimatedNumber";
import ProductDetailModal from "@/components/ProductDetailModal";
import { MASTER_PRODUCTS, MASTER_INVENTORY } from "@/data/mockInventory";
import {
  MOCK_CURRENT_DATE,
  EXPIRY_RISK_ITEMS,
  INTELLIGENCE_INSIGHTS,
  RECOMMENDED_ACTIONS,
  REDISTRIBUTION_OPPORTUNITIES,
  getFefoQueue,
  getExpiryTimeline,
  EXPIRY_TREND,
  generateRiskReportCSV,
  generateFefoPlanCSV,
} from "@/data/expiryIntelligenceData";
import type {
  ExpiryRiskItem,
  RedistributionOpportunity,
} from "@/data/expiryIntelligenceData";
import type { Product, InventoryItem } from "@/types/inventory";

const PAGE_SIZE = 8;

const RISK_BADGE_STYLE: Record<string, string> = {
  Critical: "bg-primary text-primary-foreground font-bold",
  "High Risk": "bg-primary text-primary-foreground border border-[#2F4156] font-bold",
  Warning: "bg-card text-foreground border border-border font-medium",
  Safe: "bg-primary text-primary-foreground font-medium",
};

const ACTION_STYLE: Record<string, { bg: string }> = {
  clearance: { bg: "bg-primary text-primary-foreground" },
  redistribute: { bg: "bg-card border border-border text-foreground" },
  fefo: { bg: "bg-card border border-border text-foreground" },
  monitor: { bg: "bg-card border border-border text-foreground" },
  review: { bg: "bg-card border border-border text-foreground" },
};

const CONFIDENCE_STYLE: Record<string, string> = {
  "High (94%)": "bg-primary text-primary-foreground border border-[#2F4156] font-bold",
  "High (91%)": "bg-primary text-primary-foreground border border-[#2F4156] font-bold",
  "Medium (86%)": "bg-primary text-primary-foreground border border-[#2F4156] font-bold",
};

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
      <CheckCircle2 className="size-4 text-foreground shrink-0" />
      <span className="font-bold">{message}</span>
      <button onClick={onClose} className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function FefoPlanModal({
  isOpen,
  onClose,
  isApproved,
  onApprove,
  onExport,
  onOpenProductDetail,
}: {
  isOpen: boolean;
  onClose: () => void;
  isApproved: boolean;
  onApprove: () => void;
  onExport: () => void;
  onOpenProductDetail: (productId: string) => void;
}) {
  const queue = useMemo(() => getFefoQueue(), []);
  const totalUnits = queue.reduce((s, i) => s + i.quantity, 0);
  const totalValue = queue.reduce((s, i) => s + i.stockValue, 0);
  const criticalCount = queue.filter((i) => i.daysLeft <= 7).length;
  const highRiskCount = queue.filter((i) => i.daysLeft > 7 && i.daysLeft <= 14).length;
  const wasteAvoided = queue.reduce((s, i) => s + (i.daysLeft <= 14 ? i.stockValue : 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
      <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] shadow-none w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-foreground">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center font-bold">
              <Zap className="size-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display uppercase text-foreground">
                FEFO CHRONOLOGICAL DISPATCH PLAN
              </h2>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                First-Expiry-First-Out prioritized picking sequence across all facilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 border-b border-border bg-card">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-background border border-border">
              <span className="text-[10.5px] text-muted-foreground uppercase block font-bold">Batches</span>
              <span className="text-lg font-bold font-display uppercase text-foreground">{queue.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-background border border-border">
              <span className="text-[10.5px] text-muted-foreground uppercase block font-bold">Total Units</span>
              <span className="text-lg font-bold font-display uppercase text-foreground">{totalUnits.toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-background border border-border">
              <span className="text-[10.5px] text-muted-foreground uppercase block font-bold">Total Value</span>
              <span className="text-lg font-bold font-display uppercase text-foreground">₹{totalValue.toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-background border border-border">
              <span className="text-[10.5px] text-foreground uppercase block font-bold">Critical</span>
              <span className="text-lg font-bold font-display uppercase text-foreground">{criticalCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-background border border-border">
              <span className="text-[10.5px] text-foreground uppercase block font-bold">High Risk</span>
              <span className="text-lg font-bold font-display uppercase text-foreground">{highRiskCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-background border border-border">
              <span className="text-[10.5px] text-foreground uppercase block font-bold">Protected</span>
              <span className="text-lg font-bold font-display uppercase text-foreground">₹{wasteAvoided.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground uppercase bg-card">
                <th className="px-3 py-3 font-bold w-12 text-center">Rank</th>
                <th className="px-4 py-3 font-bold">Product</th>
                <th className="px-3 py-3 font-bold">Batch</th>
                <th className="px-3 py-3 font-bold">Location</th>
                <th className="px-3 py-3 font-bold">Expiry Date</th>
                <th className="px-3 py-3 font-bold text-center">Countdown</th>
                <th className="px-3 py-3 font-bold text-right">Quantity</th>
                <th className="px-3 py-3 font-bold text-right">Value</th>
                <th className="px-4 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-3 py-3.5 text-center font-bold">
                    <span className="inline-flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => onOpenProductDetail(item.productId)}
                      className="text-left font-bold text-foreground font-display uppercase hover:underline block"
                    >
                      {item.product}
                    </button>
                    <span className="text-xs text-muted-foreground">{item.sku}</span>
                  </td>
                  <td className="px-3 py-3.5 font-bold text-foreground">{item.batchNo}</td>
                  <td className="px-3 py-3.5 text-muted-foreground">{item.location}</td>
                  <td className="px-3 py-3.5 text-foreground">{item.expiryDate}</td>
                  <td className="px-3 py-3.5 text-center font-bold text-foreground whitespace-nowrap">
                    {item.daysLeft}D LEFT
                  </td>
                  <td className="px-3 py-3.5 font-bold text-foreground text-right">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-3 py-3.5 font-bold text-foreground text-right">
                    ₹{item.stockValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase">
                      {item.suggestedAction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="size-4 text-foreground" />
            <span>Strict chronological sequence enforced by ERN algorithm</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onExport}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-foreground text-xs font-bold uppercase hover:border-primary cursor-pointer"
            >
              <Download className="size-3.5" />
              Export FEFO
            </button>
            <button
              onClick={onApprove}
              disabled={isApproved}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all shadow-none cursor-pointer ${
                isApproved
                  ? "bg-primary text-primary-foreground cursor-default font-bold"
                  : "bg-primary text-primary-foreground hover:bg-[#567C8D]"
              }`}
            >
              {isApproved ? "Approved ✓" : "Approve & Dispatch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClearanceCreationModal({
  isOpen,
  onClose,
  initialItem,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialItem: ExpiryRiskItem | null;
  onSuccess: (clearanceId: string, name: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>(initialItem?.id || EXPIRY_RISK_ITEMS[0].id);
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [clearanceQty, setClearanceQty] = useState<number>(initialItem?.quantity || 25);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const currentItem = useMemo(
    () => EXPIRY_RISK_ITEMS.find((i) => i.id === selectedId) || EXPIRY_RISK_ITEMS[0],
    [selectedId]
  );

  if (!isOpen) return null;

  const discountedPrice = Math.round(currentItem.unitPrice * (1 - discountPercent / 100));
  const estimatedRecovery = clearanceQty * discountedPrice;

  const handlePublish = () => {
    const mockId = `CLR-2026-0815-${Math.floor(100 + Math.random() * 900)}`;
    setPublishedId(mockId);
    onSuccess(mockId, currentItem.name);
  };

  const handleReset = () => {
    setPublishedId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
      <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] shadow-none w-full max-w-xl overflow-hidden text-foreground">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display uppercase text-foreground">
              CREATE CLEARANCE LISTING
            </h2>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Flash markdown engine for expiring batches
            </p>
          </div>
          <button onClick={handleReset} className="p-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground">
            <X className="size-4" />
          </button>
        </div>

        {publishedId ? (
          <div className="p-8 text-center space-y-5">
            <div className="size-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto border border-[#2F4156] font-bold">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold uppercase text-foreground">Clearance Published</h3>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Listing is live on ERN Rescue Marketplace with {discountPercent}% markdown.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold uppercase hover:bg-[#567C8D] cursor-pointer shadow-none"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-muted-foreground uppercase font-bold block mb-1">Select Batch</label>
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  const found = EXPIRY_RISK_ITEMS.find((i) => i.id === e.target.value);
                  if (found) setClearanceQty(found.quantity);
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-border text-foreground outline-none focus:border-primary font-mono text-xs"
              >
                {EXPIRY_RISK_ITEMS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.batchNo} · {item.location} ({item.daysLeft}D LEFT)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
                <span className="text-muted-foreground uppercase text-[10px] block">Markdown Discount</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.min(90, Math.max(5, Number(e.target.value))))}
                    className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm font-bold text-foreground outline-none"
                  />
                  <span className="font-bold text-foreground">%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
                <span className="text-muted-foreground uppercase text-[10px] block">Clearance Units</span>
                <input
                  type="number"
                  value={clearanceQty}
                  onChange={(e) => setClearanceQty(Number(e.target.value))}
                  className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm font-bold text-foreground mt-1 outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary text-primary-foreground border border-[#2F4156] space-y-1">
              <div className="flex justify-between">
                <span>Unit Price:</span>
                <span><s>₹{currentItem.unitPrice}</s> → <strong>₹{discountedPrice}</strong></span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Projected Recovery:</span>
                <span>₹{estimatedRecovery.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none active:scale-95"
              >
                Publish Clearance →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RedistributionWorkflowModal({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  opportunity: RedistributionOpportunity | null;
  onSuccess: (orderId: string, product: string) => void;
}) {
  if (!isOpen || !opportunity) return null;

  const handleConfirm = () => {
    const orderId = `TRF-2026-0815-${Math.floor(100 + Math.random() * 900)}`;
    onSuccess(orderId, opportunity.product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
      <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] shadow-none w-full max-w-lg p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-xl font-bold font-display uppercase text-foreground">
              REDISTRIBUTION TRANSFER
            </h2>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Rebalance stock between facilities
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
          <p className="font-display font-bold uppercase text-foreground text-base">{opportunity.product}</p>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span>{opportunity.from}</span>
            <ArrowRight className="size-3.5" />
            <span>{opportunity.to}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <span className="text-muted-foreground block">Transfer Units:</span>
              <strong className="text-foreground">{opportunity.available} {opportunity.unit}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Protected Value:</span>
              <strong className="text-foreground">₹{opportunity.valueProtected.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none active:scale-95"
          >
            Authorize Transfer →
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportReportModal({
  isOpen,
  onClose,
  onDownload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: string, scope: string) => void;
}) {
  const [scope, setScope] = useState<string>("full");
  const [format, setFormat] = useState<string>("csv");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in">
      <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] shadow-none w-full max-w-md p-6 space-y-4 text-foreground">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-xl font-bold font-display uppercase text-foreground">
              EXPORT INTELLIGENCE
            </h2>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Generate audit-ready report
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground uppercase font-bold block mb-1">Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-card border border-border text-foreground outline-none font-mono text-xs"
            >
              <option value="full">Full Expiry Audit (All Batches)</option>
              <option value="critical">Critical & High Urgency Only</option>
            </select>
          </div>

          <div>
            <label className="text-muted-foreground uppercase font-bold block mb-1">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {["csv", "pdf", "xlsx"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-2 rounded-lg font-bold uppercase border text-xs cursor-pointer ${
                    format === fmt
                      ? "bg-primary text-primary-foreground border-[#2F4156]"
                      : "bg-card border-border text-foreground hover:border-primary"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onDownload(format, scope);
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shadow-none active:scale-95"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExpiryMonitor() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState(() => {
    const f = searchParams.get("filter");
    if (f === "critical") return "Critical";
    if (f === "high") return "High Risk";
    return "All";
  });

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f === "critical") {
      setRiskFilter("Critical");
    } else if (f === "high") {
      setRiskFilter("High Risk");
    }
  }, [searchParams]);

  const [locationFilter, setLocationFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expiryWindow, setExpiryWindow] = useState("All");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [trendRange, setTrendRange] = useState<"7D" | "30D">("30D");

  const [fefoModalOpen, setFefoModalOpen] = useState<boolean>(false);
  const [fefoApproved, setFefoApproved] = useState<boolean>(false);
  const [clearanceModalOpen, setClearanceModalOpen] = useState<boolean>(false);
  const [selectedClearanceItem, setSelectedClearanceItem] = useState<ExpiryRiskItem | null>(null);
  const [redistributionModalOpen, setRedistributionModalOpen] = useState<boolean>(false);
  const [selectedRedistributionItem, setSelectedRedistributionItem] = useState<RedistributionOpportunity | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [detailProduct, setDetailProduct] = useState<Product | InventoryItem | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const allItems = EXPIRY_RISK_ITEMS;

  const criticalItems = useMemo(() => allItems.filter((i) => i.riskLevel === "Critical"), [allItems]);
  const highRiskItems = useMemo(() => allItems.filter((i) => i.riskLevel === "High Risk"), [allItems]);
  const warningItems = useMemo(() => allItems.filter((i) => i.riskLevel === "Warning"), [allItems]);
  const safeItems = useMemo(() => allItems.filter((i) => i.riskLevel === "Safe"), [allItems]);

  const criticalValue = useMemo(() => criticalItems.reduce((s, i) => s + i.stockValue, 0), [criticalItems]);
  const highRiskValue = useMemo(() => highRiskItems.reduce((s, i) => s + i.stockValue, 0), [highRiskItems]);
  const warningValue = useMemo(() => warningItems.reduce((s, i) => s + i.stockValue, 0), [warningItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.batchNo.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchRisk = riskFilter === "All" || item.riskLevel === riskFilter;
      const matchLoc = locationFilter === "All" || item.location === locationFilter;
      const matchCat = categoryFilter === "All" || item.category === categoryFilter;

      let matchWindow = true;
      if (expiryWindow === "Today") matchWindow = item.daysLeft <= 1;
      else if (expiryWindow === "3D") matchWindow = item.daysLeft <= 3;
      else if (expiryWindow === "7D") matchWindow = item.daysLeft <= 7;
      else if (expiryWindow === "14D") matchWindow = item.daysLeft <= 14;
      else if (expiryWindow === "30D") matchWindow = item.daysLeft <= 30;

      return matchQ && matchRisk && matchLoc && matchCat && matchWindow;
    });
  }, [allItems, search, riskFilter, locationFilter, categoryFilter, expiryWindow]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const locations = useMemo(() => [...new Set(allItems.map((i) => i.location))], [allItems]);
  const categories = useMemo(() => [...new Set(allItems.map((i) => i.category))], [allItems]);

  const resetFilters = () => {
    setSearch("");
    setRiskFilter("All");
    setLocationFilter("All");
    setCategoryFilter("All");
    setExpiryWindow("All");
    setPage(1);
  };

  const handleRiskCardClick = (risk: string) => {
    setRiskFilter(risk === riskFilter ? "All" : risk);
    setPage(1);
  };

  const openProductDetail = (productIdOrName: string) => {
    const prod =
      MASTER_PRODUCTS.find((p) => String(p.id) === productIdOrName || p.name.toLowerCase().includes(productIdOrName.toLowerCase())) ||
      MASTER_INVENTORY.find((i) => String(i.productId) === productIdOrName || i.name.toLowerCase().includes(productIdOrName.toLowerCase()));

    if (prod) {
      setDetailProduct(prod);
    } else {
      showToast(`Showing details for ${productIdOrName}.`);
    }
  };

  const triggerClientDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const trendData = useMemo(() => {
    if (trendRange === "7D") return EXPIRY_TREND.slice(-4);
    return EXPIRY_TREND;
  }, [trendRange]);

  const timelineData = useMemo(() => getExpiryTimeline(), []);

  return (
    <div className="w-full space-y-6 pb-24 text-foreground font-body">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>PERISHABLE HORIZON</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            EXPIRY MONITOR
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Real-time batch tracking, FEFO dispatch prioritization, and redistribution intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs font-bold uppercase">
          <button
            onClick={() => showToast("Dataset refreshed.")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card hover:bg-background border border-border text-foreground cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95"
          >
            <Download className="size-4" />
            <span>Export Intelligence</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <button
          onClick={() => handleRiskCardClick("Critical")}
          className={`text-left bg-background border rounded-[24px] p-5 shadow-none transition-all cursor-pointer flex flex-col justify-between ${
            riskFilter === "Critical" ? "border-[#2F4156]" : "border-border hover:border-primary"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-foreground">Critical (1–7d)</span>
            <ShieldAlert className="size-4 text-foreground" />
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={criticalItems.length} /> <span className="text-base font-normal">Lots</span>
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">₹{criticalValue.toLocaleString()} at risk</p>
        </button>

        <button
          onClick={() => handleRiskCardClick("High Risk")}
          className={`text-left bg-background border rounded-[24px] p-5 shadow-none transition-all cursor-pointer flex flex-col justify-between ${
            riskFilter === "High Risk" ? "border-[#2F4156]" : "border-border hover:border-primary"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-foreground">High Risk (8–14d)</span>
            <AlertTriangle className="size-4 text-foreground" />
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={highRiskItems.length} /> <span className="text-base font-normal">Lots</span>
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">₹{highRiskValue.toLocaleString()} exposure</p>
        </button>

        <button
          onClick={() => handleRiskCardClick("Warning")}
          className={`text-left bg-background border rounded-[24px] p-5 shadow-none transition-all cursor-pointer flex flex-col justify-between ${
            riskFilter === "Warning" ? "border-[#2F4156]" : "border-border hover:border-primary"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Warning (15–30d)</span>
            <AlertCircle className="size-4 text-foreground" />
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={warningItems.length} /> <span className="text-base font-normal">Lots</span>
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">₹{warningValue.toLocaleString()} monitored</p>
        </button>

        <button
          onClick={() => handleRiskCardClick("Safe")}
          className={`text-left bg-background border rounded-[24px] p-5 shadow-none transition-all cursor-pointer flex flex-col justify-between ${
            riskFilter === "Safe" ? "border-[#2F4156]" : "border-border hover:border-primary"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">Safe (&gt; 30d)</span>
            <ShieldCheck className="size-4 text-foreground" />
          </div>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={safeItems.length} /> <span className="text-base font-normal">Lots</span>
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Healthy shelf-life</p>
        </button>
      </div>

      {/* Intelligence Brief */}
      <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono text-xs">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xl font-bold uppercase text-foreground">
            Intelligence Signals
          </h2>
          <span className="text-xs text-muted-foreground">18 monitored lots</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(28,58,19,0.15)]">
          {INTELLIGENCE_INSIGHTS.map((insight) => (
            <div key={insight.id} className="p-5 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold uppercase text-foreground block mb-1">{insight.title}</span>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
              </div>
              <button
                onClick={() => {
                  if (insight.actionType === "review-transfer") {
                    setSelectedRedistributionItem(REDISTRIBUTION_OPPORTUNITIES[0]);
                    setRedistributionModalOpen(true);
                  } else if (insight.actionType === "view-exposure") {
                    setRiskFilter("Critical");
                    setPage(1);
                  } else {
                    setFefoModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-card hover:bg-background border border-border text-foreground font-bold uppercase text-xs cursor-pointer text-center"
              >
                {insight.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div id="main-expiry-table" className="bg-card border border-border rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono text-xs">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search product, SKU, batch..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
            >
              <option value="All">All Risk</option>
              <option value="Critical">Critical</option>
              <option value="High Risk">High Risk</option>
              <option value="Warning">Warning</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2 rounded-full bg-secondary border border-border text-foreground focus:outline-none cursor-pointer font-mono font-bold"
            >
              <option value="All">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-full border border-border text-foreground hover:bg-secondary/40 transition-colors cursor-pointer font-bold uppercase"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
              <tr>
                <th className="px-4 py-3.5 font-bold uppercase">Product</th>
                <th className="px-4 py-3.5 font-bold uppercase">Batch</th>
                <th className="px-4 py-3.5 font-bold uppercase">Location</th>
                <th className="px-4 py-3.5 font-bold uppercase text-right">Quantity</th>
                <th className="px-4 py-3.5 font-bold uppercase">Expiry Date</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Countdown</th>
                <th className="px-4 py-3.5 font-bold uppercase text-right">Value</th>
                <th className="px-4 py-3.5 font-bold uppercase text-center">Risk</th>
                <th className="px-4 py-3.5 text-right font-bold uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {paginated.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => openProductDetail(item.productId)}
                      className="font-bold text-foreground font-display uppercase text-sm hover:underline block text-left"
                    >
                      {item.name}
                    </button>
                    <span className="text-[10.5px] text-muted-foreground">{item.sku}</span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-foreground">{item.batchNo}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{item.location}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-foreground">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-4 py-3.5 text-foreground">{item.expiryDate}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center gap-1 ${
                        item.daysLeft <= 3
                          ? "bg-primary text-primary-foreground"
                          : item.daysLeft <= 7
                          ? "bg-primary text-primary-foreground border border-[#2F4156]"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {item.daysLeft}D LEFT
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-foreground">
                    ₹{item.stockValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${RISK_BADGE_STYLE[item.riskLevel]}`}>
                      {item.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => {
                        if (item.actionType === "clearance") {
                          setSelectedClearanceItem(item);
                          setClearanceModalOpen(true);
                        } else if (item.actionType === "redistribute") {
                          const opp = REDISTRIBUTION_OPPORTUNITIES.find((o) => o.productId === item.productId) || REDISTRIBUTION_OPPORTUNITIES[0];
                          setSelectedRedistributionItem(opp);
                          setRedistributionModalOpen(true);
                        } else if (item.actionType === "fefo") {
                          setFefoModalOpen(true);
                        } else {
                          openProductDetail(item.productId);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase hover:bg-[#567C8D] transition-all cursor-pointer shadow-none"
                    >
                      {item.recommendedAction}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-card hover:bg-background disabled:opacity-40 text-foreground cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-card hover:bg-background disabled:opacity-40 text-foreground cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="p-5 rounded-[24px] bg-card border border-border shadow-none flex flex-wrap items-center gap-3 font-mono text-xs">
        <span className="font-bold text-foreground uppercase">Quick Actions:</span>
        <button
          onClick={() => {
            setSelectedClearanceItem(EXPIRY_RISK_ITEMS.find((i) => i.batchNo === "BRD-048") || null);
            setClearanceModalOpen(true);
          }}
          className="px-3.5 py-1.5 rounded-lg bg-card hover:bg-background border border-border text-foreground font-bold uppercase cursor-pointer"
        >
          Create Clearance
        </button>
        <button
          onClick={() => {
            setSelectedRedistributionItem(REDISTRIBUTION_OPPORTUNITIES[0]);
            setRedistributionModalOpen(true);
          }}
          className="px-3.5 py-1.5 rounded-lg bg-card hover:bg-background border border-border text-foreground font-bold uppercase cursor-pointer"
        >
          Plan Redistribution
        </button>
        <button
          onClick={() => setFefoModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-card hover:bg-background border border-border text-foreground font-bold uppercase cursor-pointer"
        >
          FEFO Sequence
        </button>
      </div>

      {/* Modals */}
      <FefoPlanModal
        isOpen={fefoModalOpen}
        onClose={() => setFefoModalOpen(false)}
        isApproved={fefoApproved}
        onApprove={() => {
          setFefoApproved(true);
          showToast("FEFO plan approved.");
        }}
        onExport={() => {
          const csv = generateFefoPlanCSV();
          triggerClientDownload(csv, `ERN_FEFO_Plan_${MOCK_CURRENT_DATE.replace(/ /g, "-")}.csv`);
          showToast("Exported FEFO plan.");
        }}
        onOpenProductDetail={(id) => {
          setFefoModalOpen(false);
          openProductDetail(id);
        }}
      />

      <ClearanceCreationModal
        isOpen={clearanceModalOpen}
        onClose={() => setClearanceModalOpen(false)}
        initialItem={selectedClearanceItem}
        onSuccess={(id, name) => {
          showToast(`Clearance ${id} created for ${name}.`);
        }}
      />

      <RedistributionWorkflowModal
        isOpen={redistributionModalOpen}
        onClose={() => setRedistributionModalOpen(false)}
        opportunity={selectedRedistributionItem}
        onSuccess={(id, prod) => {
          showToast(`Transfer ${id} authorized for ${prod}.`);
        }}
      />

      <ExportReportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onDownload={(format, scope) => {
          const itemsToExport =
            scope === "critical"
              ? EXPIRY_RISK_ITEMS.filter((i) => i.riskLevel === "Critical" || i.riskLevel === "High Risk")
              : EXPIRY_RISK_ITEMS;

          const csv = generateRiskReportCSV(itemsToExport);
          triggerClientDownload(csv, `ERN_Expiry_Report_${MOCK_CURRENT_DATE.replace(/ /g, "-")}.${format === "xlsx" ? "csv" : format}`);
          showToast(`Downloaded report.`);
        }}
      />

      <ProductDetailModal
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        item={detailProduct}
      />
    </div>
  );
}
