import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  PieChart,
  Boxes,
  Clock,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportGenerated?: (reportName: string) => void;
}

const REPORT_TYPES = [
  { id: "overview", name: "Inventory Overview", desc: "Complete stock list, quantities & valuations", icon: Boxes },
  { id: "expiry", name: "Expiry Risk & Shelf Life", desc: "Critical, high & medium risk expiry tiers", icon: Clock },
  { id: "valuation", name: "Inventory Valuation", desc: "Category capital valuation & asset breakdown", icon: TrendingUp },
  { id: "location", name: "Multi-Location Summary", desc: "Store & warehouse distribution audit", icon: MapPin },
  { id: "low-stock", name: "Low Stock & Reorder Forecast", desc: "Products below reorder threshold", icon: PieChart },
  { id: "recovery", name: "Recovery & Action Summary", desc: "Operational review queue and resolution logs", icon: FileText },
];

export default function GenerateReportModal({
  isOpen,
  onClose,
  onReportGenerated,
}: GenerateReportModalProps) {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [format, setFormat] = useState<"pdf" | "csv" | "xlsx">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setDownloadSuccess(true);
      const chosen = REPORT_TYPES.find((r) => r.id === selectedReport)?.name || "Inventory Report";
      onReportGenerated?.(`${chosen} (${format.toUpperCase()})`);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2F4156]/60 backdrop-blur-xs"
        />

        <div className="min-h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/80 flex items-start justify-between bg-secondary/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] font-mono font-bold">
                    REPORT GENERATOR
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Export Engine</span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mt-1">
                  Generate Operational Report
                </h2>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Export structured summaries derived directly from live inventory datasets.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Report Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-muted-foreground">
                  Select Report Type:
                </label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {REPORT_TYPES.map((rep) => {
                    const Icon = rep.icon;
                    const isSelected = selectedReport === rep.id;
                    return (
                      <div
                        key={rep.id}
                        onClick={() => setSelectedReport(rep.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "bg-primary/10 border-primary shadow-xs"
                            : "bg-secondary/20 border-border/80 hover:bg-secondary/40"
                        }`}
                      >
                        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
                        }`}>
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground font-sans">{rep.name}</p>
                          <p className="text-[10.5px] text-muted-foreground font-sans mt-0.5 leading-tight">{rep.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Format Options */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-muted-foreground">
                  Export File Format:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["pdf", "csv", "xlsx"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        format === fmt
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {fmt.toUpperCase()} {fmt === "pdf" ? "Document" : fmt === "csv" ? "Data" : "Workbook"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border bg-secondary/20 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground font-mono text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || downloadSuccess}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-300" />
                    <span>Report Downloaded!</span>
                  </>
                ) : isGenerating ? (
                  <span>Generating Report...</span>
                ) : (
                  <>
                    <Download className="size-3.5" />
                    <span>Download Report</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
