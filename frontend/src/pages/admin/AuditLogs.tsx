import { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  ShieldAlert,
  LogIn,
  UserCog,
  Search,
  X,
} from "lucide-react";

type LogSeverity = "Info" | "Warning" | "Critical";

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
  severity: LogSeverity;
  ip: string;
  details?: string;
}

const MOCK_LOGS: AuditLog[] = [
  { id: "LOG-9001", actor: "admin@ern.com", action: "Approved Verification", entity: "GreenLeaf Distributors", timestamp: "2026-08-22 09:14", severity: "Info", ip: "103.21.4.12", details: "Verification VR-1001 approved after document review." },
  { id: "LOG-9002", actor: "priya.k@ern.com", action: "Suspended User", entity: "Arjun Mehta", timestamp: "2026-08-22 08:52", severity: "Warning", ip: "103.21.4.19", details: "User suspended for repeated failed listing violations." },
  { id: "LOG-9003", actor: "system", action: "Failed Login Attempt", entity: "unknown@test.com", timestamp: "2026-08-22 08:40", severity: "Critical", ip: "45.67.12.201", details: "5 consecutive failed attempts, IP flagged." },
  { id: "LOG-9004", actor: "admin@ern.com", action: "Updated Policy", entity: "Expiry Threshold Policy", timestamp: "2026-08-21 18:05", severity: "Info", ip: "103.21.4.12" },
  { id: "LOG-9005", actor: "ravi.s@ern.com", action: "Deleted Listing", entity: "PNR-220 Paneer Batch", timestamp: "2026-08-21 16:22", severity: "Warning", ip: "103.21.4.30", details: "Listing removed after moderation flag." },
  { id: "LOG-9006", actor: "system", action: "Role Permission Changed", entity: "priya.k@ern.com", timestamp: "2026-08-21 11:10", severity: "Critical", ip: "103.21.4.12", details: "Elevated to admin role by system owner." },
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

const SEVERITY_STYLES: Record<LogSeverity, string> = {
  Info: "bg-[#C8D9E6] text-[#2F4156]",
  Warning: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

export default function AdminAuditLogs() {
  const [logs] = useState(MOCK_LOGS);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | "All">("All");
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const counts = useMemo(
    () => ({
      total: logs.length,
      critical: logs.filter((l) => l.severity === "Critical").length,
      warning: logs.filter((l) => l.severity === "Warning").length,
      logins: logs.filter((l) => l.action.toLowerCase().includes("login")).length,
    }),
    [logs]
  );

  const filtered = useMemo(
    () =>
      logs.filter((l) => {
        const matchesSearch =
          l.actor.toLowerCase().includes(search.toLowerCase()) ||
          l.action.toLowerCase().includes(search.toLowerCase()) ||
          l.entity.toLowerCase().includes(search.toLowerCase());
        const matchesSeverity = severityFilter === "All" || l.severity === severityFilter;
        return matchesSearch && matchesSeverity;
      }),
    [logs, search, severityFilter]
  );

  const kpis = [
    { label: "Total Events", value: counts.total, icon: ClipboardList },
    { label: "Critical", value: counts.critical, icon: ShieldAlert },
    { label: "Warnings", value: counts.warning, icon: UserCog },
    { label: "Login Events", value: counts.logins, icon: LogIn },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-[#C8D9E6] text-[#2F4156] text-xs font-mono mb-2">
          GOVERNANCE
        </span>
        <h1 className="font-display text-3xl text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          Track system, admin, and security events across the platform.
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
              placeholder="Search by actor, action, or entity..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-[#2F4156]/20 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#567C8D]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["All", "Info", "Warning", "Critical"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-4 py-2 rounded-full text-xs font-mono transition-colors ${
                  severityFilter === s
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
                <th className="py-2 pr-3">Timestamp</th>
                <th className="py-2 pr-3">Actor</th>
                <th className="py-2 pr-3">Action</th>
                <th className="py-2 pr-3">Entity</th>
                <th className="py-2 pr-3">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => setSelected(l)}
                  className="cursor-pointer border-b border-[#2F4156]/5 hover:bg-[#C8D9E6]/20 transition-colors"
                >
                  <td className="py-3 pr-3 text-muted-foreground font-mono text-xs">{l.timestamp}</td>
                  <td className="py-3 pr-3 text-foreground font-medium">{l.actor}</td>
                  <td className="py-3 pr-3 text-foreground">{l.action}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{l.entity}</td>
                  <td className="py-3 pr-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono ${SEVERITY_STYLES[l.severity]}`}>
                      {l.severity}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No matching events.
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
              <h2 className="font-display text-xl text-foreground">{selected.action}</h2>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono ${SEVERITY_STYLES[selected.severity]}`}>
              {selected.severity}
            </span>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">Actor</span>
                <span className="text-foreground font-medium">{selected.actor}</span>
              </div>
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">Entity</span>
                <span className="text-foreground font-medium">{selected.entity}</span>
              </div>
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">Timestamp</span>
                <span className="text-foreground font-mono text-xs">{selected.timestamp}</span>
              </div>
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">IP Address</span>
                <span className="text-foreground font-mono text-xs">{selected.ip}</span>
              </div>
            </div>

            {selected.details && (
              <div>
                <h3 className="text-xs font-mono text-muted-foreground mb-2">DETAILS</h3>
                <p className="text-sm text-foreground bg-[#C8D9E6]/20 rounded-lg px-3 py-2">
                  {selected.details}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}