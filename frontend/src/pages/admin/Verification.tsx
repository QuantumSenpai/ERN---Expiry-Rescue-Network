import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Clock,
  Eye,
  XCircle,
  CheckCircle2,
  Building2,
  User,
  Store,
  Search,
  X,
} from "lucide-react";

type EntityType = "User" | "Supplier" | "Organization";
type VStatus = "Pending" | "Under Review" | "Verified" | "Rejected";

interface VerificationEntry {
  id: string;
  type: EntityType;
  name: string;
  contact: string;
  submittedDate: string;
  status: VStatus;
  documents: string[];
  notes?: string;
}

const MOCK_VERIFICATIONS: VerificationEntry[] = [
  { id: "VR-1001", type: "Supplier", name: "GreenLeaf Distributors", contact: "ops@greenleaf.com", submittedDate: "2026-08-15", status: "Pending", documents: ["GST Certificate", "FSSAI License", "Bank Proof"] },
  { id: "VR-1002", type: "User", name: "Ritika Sen", contact: "ritika.sen@mail.com", submittedDate: "2026-08-14", status: "Under Review", documents: ["Govt ID"] },
  { id: "VR-1003", type: "Organization", name: "Kolkata Food Bank Trust", contact: "contact@kfbtrust.org", submittedDate: "2026-08-12", status: "Verified", documents: ["Registration Cert", "PAN", "Trust Deed"], notes: "All documents verified against registry." },
  { id: "VR-1004", type: "Supplier", name: "Daily Fresh Mart", contact: "admin@dailyfresh.in", submittedDate: "2026-08-11", status: "Rejected", documents: ["GST Certificate"], notes: "FSSAI license expired, resubmission required." },
  { id: "VR-1005", type: "User", name: "Arjun Mehta", contact: "arjun.m@mail.com", submittedDate: "2026-08-10", status: "Pending", documents: ["Govt ID", "Address Proof"] },
  { id: "VR-1006", type: "Organization", name: "Hope & Harvest NGO", contact: "info@hopeharvest.org", submittedDate: "2026-08-08", status: "Under Review", documents: ["Registration Cert"] },
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

const STATUS_STYLES: Record<VStatus, string> = {
  Pending: "bg-[#C8D9E6] text-[#2F4156]",
  "Under Review": "bg-[#567C8D] text-white",
  Verified: "bg-[#2F4156] text-white",
  Rejected: "bg-red-100 text-red-700",
};

const TYPE_ICON: Record<EntityType, typeof User> = {
  User: User,
  Supplier: Store,
  Organization: Building2,
};

export default function AdminVerification() {
  const [entries, setEntries] = useState(MOCK_VERIFICATIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VStatus | "All">("All");
  const [selected, setSelected] = useState<VerificationEntry | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const counts = useMemo(
    () => ({
      Pending: entries.filter((e) => e.status === "Pending").length,
      "Under Review": entries.filter((e) => e.status === "Under Review").length,
      Verified: entries.filter((e) => e.status === "Verified").length,
      Rejected: entries.filter((e) => e.status === "Rejected").length,
    }),
    [entries]
  );

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        const matchesSearch =
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.contact.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [entries, search, statusFilter]
  );

  const updateStatus = (id: string, status: VStatus) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status, notes: noteDraft || e.notes } : e))
    );
    setSelected((prev) => (prev ? { ...prev, status, notes: noteDraft || prev.notes } : prev));
  };

  const kpis: { label: string; value: number; icon: typeof Clock }[] = [
    { label: "Pending", value: counts.Pending, icon: Clock },
    { label: "Under Review", value: counts["Under Review"], icon: Eye },
    { label: "Verified", value: counts.Verified, icon: CheckCircle2 },
    { label: "Rejected", value: counts.Rejected, icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-[#C8D9E6] text-[#2F4156] text-xs font-mono mb-2">
          OPERATIONS
        </span>
        <h1 className="font-display text-3xl text-foreground">Verification</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve pending users, suppliers, and organizations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-[24px] ern-card-glow border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] bg-card p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <k.icon className="w-5 h-5 text-[#567C8D]" />
            </div>
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
              placeholder="Search by name or contact..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-[#2F4156]/20 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#567C8D]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["All", "Pending", "Under Review", "Verified", "Rejected"] as const).map((s) => (
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
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Contact</th>
                <th className="py-2 pr-3">Submitted</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const Icon = TYPE_ICON[e.type];
                return (
                  <tr
                    key={e.id}
                    onClick={() => {
                      setSelected(e);
                      setNoteDraft(e.notes || "");
                    }}
                    className="cursor-pointer border-b border-[#2F4156]/5 hover:bg-[#C8D9E6]/20 transition-colors"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2 text-[#567C8D]">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{e.type}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-foreground font-medium">{e.name}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{e.contact}</td>
                    <td className="py-3 pr-3 text-muted-foreground font-mono text-xs">
                      {e.submittedDate}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-mono ${STATUS_STYLES[e.status]}`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No matching records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-md h-full bg-card border-l border-[#2F4156] p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-foreground">{selected.name}</h2>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-1">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono ${STATUS_STYLES[selected.status]}`}
              >
                {selected.status}
              </span>
              <p className="text-sm text-muted-foreground">{selected.type} · {selected.contact}</p>
              <p className="text-xs font-mono text-muted-foreground">Submitted {selected.submittedDate}</p>
            </div>

            <div>
              <h3 className="text-xs font-mono text-muted-foreground mb-2">DOCUMENTS</h3>
              <ul className="space-y-1.5">
                {selected.documents.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-center gap-2 text-sm text-foreground bg-[#C8D9E6]/20 rounded-lg px-3 py-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#567C8D]" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-mono text-muted-foreground mb-2">NOTES</h3>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Add a note for this decision..."
                className="w-full rounded-xl border border-[#2F4156]/20 bg-background p-3 text-sm text-foreground min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#567C8D]"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => updateStatus(selected.id, "Verified")}
                className="w-full py-2.5 rounded-full bg-[#2F4156] text-white text-sm font-medium hover:bg-[#567C8D] active:scale-97 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(selected.id, "Rejected")}
                className="w-full py-2.5 rounded-full border border-red-500 text-red-600 text-sm font-medium hover:bg-red-50 active:scale-97 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => updateStatus(selected.id, "Under Review")}
                className="w-full py-2.5 rounded-full border border-[#2F4156]/30 text-[#2F4156] text-sm font-medium hover:bg-[#C8D9E6]/30 active:scale-97 transition-colors"
              >
                Request More Info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}