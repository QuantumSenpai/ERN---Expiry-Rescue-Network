import { useState, useEffect, useMemo } from "react";
import {
  Flag,
  Search,
  X,
  AlertOctagon,
  CheckCircle2,
  ArrowUpCircle,
  MessageSquareWarning,
} from "lucide-react";

type CaseStatus = "Open" | "Under Investigation" | "Resolved" | "Escalated";
type CaseType = "Listing Dispute" | "User Report" | "Fraud Flag" | "Quality Complaint";

interface ModerationCase {
  id: string;
  type: CaseType;
  subject: string;
  reportedBy: string;
  filedDate: string;
  status: CaseStatus;
  description: string;
  resolution?: string;
}

const MOCK_CASES: ModerationCase[] = [
  { id: "MD-501", type: "Listing Dispute", subject: "MILK-0042 Batch Mislabeled", reportedBy: "Ritika Sen", filedDate: "2026-08-20", status: "Open", description: "Buyer claims expiry date on listing didn't match delivered batch." },
  { id: "MD-502", type: "User Report", subject: "Arjun Mehta", reportedBy: "Daily Fresh Mart", filedDate: "2026-08-19", status: "Under Investigation", description: "Repeated no-shows for confirmed pickup requests." },
  { id: "MD-503", type: "Fraud Flag", subject: "GreenLeaf Distributors", reportedBy: "system", filedDate: "2026-08-18", status: "Escalated", description: "Unusual pattern of duplicate listings across multiple accounts." },
  { id: "MD-504", type: "Quality Complaint", subject: "BRD-102 Batch", reportedBy: "Kolkata Food Bank Trust", filedDate: "2026-08-17", status: "Resolved", description: "Bread batch received in poor condition, below listed quality grade.", resolution: "Supplier issued refund, listing flagged for quality re-check." },
  { id: "MD-505", type: "Listing Dispute", subject: "JUC-882 Batch Quantity", reportedBy: "Ravi Sharma", filedDate: "2026-08-16", status: "Open", description: "Delivered quantity less than listed amount." },
  { id: "MD-506", type: "User Report", subject: "Priya Kapoor", reportedBy: "Hope & Harvest NGO", filedDate: "2026-08-14", status: "Resolved", description: "Miscommunication over pickup time, resolved directly between parties.", resolution: "Both parties confirmed resolution, no action needed." },
];

function useAnimatedNumber(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function AnimatedNumber({ value }: { value: number }) {
  return <>{useAnimatedNumber(value)}</>;
}

const STATUS_STYLES: Record<CaseStatus, string> = {
  Open: "bg-[#C8D9E6] text-[#2F4156]",
  "Under Investigation": "bg-amber-100 text-amber-700",
  Resolved: "bg-[#2F4156] text-white",
  Escalated: "bg-red-100 text-red-700",
};

export default function AdminModeration() {
  const [cases, setCases] = useState(MOCK_CASES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "All">("All");
  const [selected, setSelected] = useState<ModerationCase | null>(null);
  const [resolutionDraft, setResolutionDraft] = useState("");

  const counts = useMemo(
    () => ({
      Open: cases.filter((c) => c.status === "Open").length,
      "Under Investigation": cases.filter((c) => c.status === "Under Investigation").length,
      Resolved: cases.filter((c) => c.status === "Resolved").length,
      Escalated: cases.filter((c) => c.status === "Escalated").length,
    }),
    [cases]
  );

  const filtered = useMemo(
    () =>
      cases.filter((c) => {
        const matchesSearch =
          c.subject.toLowerCase().includes(search.toLowerCase()) ||
          c.reportedBy.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [cases, search, statusFilter]
  );

  const updateStatus = (id: string, status: CaseStatus) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status, resolution: resolutionDraft || c.resolution } : c
      )
    );
    setSelected((prev) =>
      prev ? { ...prev, status, resolution: resolutionDraft || prev.resolution } : prev
    );
  };

  const kpis = [
    { label: "Open", value: counts.Open, icon: Flag },
    { label: "Under Investigation", value: counts["Under Investigation"], icon: MessageSquareWarning },
    { label: "Resolved", value: counts.Resolved, icon: CheckCircle2 },
    { label: "Escalated", value: counts.Escalated, icon: AlertOctagon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-[#C8D9E6] text-[#2F4156] text-xs font-mono mb-2">
          OPERATIONS
        </span>
        <h1 className="font-display text-3xl text-foreground">Moderation & Disputes</h1>
        <p className="text-muted-foreground mt-1">
          Review flagged listings, user reports, and disputes.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-[24px] ern-card-glow border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] bg-card p-5"
          >
            <k.icon className="w-5 h-5 text-[#567C8D] mb-2" />
            <div className="font-display text-2xl text-foreground">
              <AnimatedNumber value={k.value} />
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] ern-card-glow border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject or reporter..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-[#2F4156]/20 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#567C8D]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["All", "Open", "Under Investigation", "Resolved", "Escalated"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-xs font-mono transition-colors ${
                  statusFilter === s
                    ? "bg-[#2F4156] text-white"
                    : "bg-transparent text-[#2F4156] border border-[#2F4156]/20 hover:bg-[#567C8D] hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-mono text-muted-foreground border-b border-[#2F4156]/10">
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Subject</th>
                <th className="py-2 pr-3">Reported By</th>
                <th className="py-2 pr-3">Filed</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => {
                    setSelected(c);
                    setResolutionDraft(c.resolution || "");
                  }}
                  className="cursor-pointer border-b border-[#2F4156]/5 hover:bg-[#C8D9E6]/20 transition-colors"
                >
                  <td className="py-3 pr-3 text-muted-foreground text-xs">{c.type}</td>
                  <td className="py-3 pr-3 text-foreground font-medium">{c.subject}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{c.reportedBy}</td>
                  <td className="py-3 pr-3 text-muted-foreground font-mono text-xs">{c.filedDate}</td>
                  <td className="py-3 pr-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No matching cases.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md h-full bg-card border-l border-[#2F4156] p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-foreground">{selected.subject}</h2>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono ${STATUS_STYLES[selected.status]}`}>
              {selected.status}
            </span>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground font-medium">{selected.type}</span>
              </div>
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">Reported By</span>
                <span className="text-foreground font-medium">{selected.reportedBy}</span>
              </div>
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">Filed</span>
                <span className="text-foreground font-mono text-xs">{selected.filedDate}</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono text-muted-foreground mb-2">DESCRIPTION</h3>
              <p className="text-sm text-foreground bg-[#C8D9E6]/20 rounded-lg px-3 py-2">
                {selected.description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-mono text-muted-foreground mb-2">RESOLUTION NOTES</h3>
              <textarea
                value={resolutionDraft}
                onChange={(e) => setResolutionDraft(e.target.value)}
                placeholder="Add resolution notes..."
                className="w-full rounded-xl border border-[#2F4156]/20 bg-background p-3 text-sm text-foreground min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#567C8D]"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => updateStatus(selected.id, "Resolved")}
                className="w-full py-2.5 rounded-full bg-[#2F4156] text-white text-sm font-medium hover:bg-[#567C8D] active:scale-97 transition-colors"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => updateStatus(selected.id, "Escalated")}
                className="w-full py-2.5 rounded-full border border-red-500 text-red-600 text-sm font-medium hover:bg-red-50 active:scale-97 transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowUpCircle className="w-4 h-4" /> Escalate
              </button>
              <button
                onClick={() => updateStatus(selected.id, "Under Investigation")}
                className="w-full py-2.5 rounded-full border border-[#2F4156]/30 text-[#2F4156] text-sm font-medium hover:bg-[#C8D9E6]/30 active:scale-97 transition-colors"
              >
                Mark Under Investigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}