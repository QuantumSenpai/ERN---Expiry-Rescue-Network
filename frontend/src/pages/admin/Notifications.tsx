import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Search,
  X,
  Send,
  Users2,
  CheckCircle2,
  Clock,
} from "lucide-react";

type NotifStatus = "Sent" | "Scheduled" | "Draft";
type NotifAudience = "All Users" | "Retailers" | "Customers" | "Organizations";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  audience: NotifAudience;
  status: NotifStatus;
  sentDate: string;
  reach: number;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: "NT-201", title: "New Rescue Deals Available", message: "Check out fresh clearance listings near you before they expire.", audience: "Customers", status: "Sent", sentDate: "2026-08-21", reach: 4820 },
  { id: "NT-202", title: "Policy Update: Expiry Thresholds", message: "Updated expiry threshold policy takes effect next week.", audience: "Retailers", status: "Sent", sentDate: "2026-08-20", reach: 312 },
  { id: "NT-203", title: "Platform Maintenance Window", message: "Scheduled maintenance Sunday 2-4 AM, brief downtime expected.", audience: "All Users", status: "Scheduled", sentDate: "2026-08-24", reach: 5640 },
  { id: "NT-204", title: "Verification Reminder", message: "Complete your organization verification to unlock full features.", audience: "Organizations", status: "Draft", sentDate: "—", reach: 0 },
  { id: "NT-205", title: "Weekly Impact Report", message: "See how much food waste your rescues prevented this week.", audience: "All Users", status: "Sent", sentDate: "2026-08-18", reach: 5640 },
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

const STATUS_STYLES: Record<NotifStatus, string> = {
  Sent: "bg-[#2F4156] text-white",
  Scheduled: "bg-amber-100 text-amber-700",
  Draft: "bg-[#C8D9E6] text-[#2F4156]",
};

export default function AdminNotifications() {
  const [items] = useState(MOCK_NOTIFICATIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NotifStatus | "All">("All");
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  const counts = useMemo(
    () => ({
      total: items.length,
      sent: items.filter((n) => n.status === "Sent").length,
      scheduled: items.filter((n) => n.status === "Scheduled").length,
      reach: items.reduce((sum, n) => sum + n.reach, 0),
    }),
    [items]
  );

  const filtered = useMemo(
    () =>
      items.filter((n) => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || n.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [items, search, statusFilter]
  );

  const kpis = [
    { label: "Total Notifications", value: counts.total, icon: Bell },
    { label: "Sent", value: counts.sent, icon: CheckCircle2 },
    { label: "Scheduled", value: counts.scheduled, icon: Clock },
    { label: "Total Reach", value: counts.reach, icon: Users2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#C8D9E6] text-[#2F4156] text-xs font-mono mb-2">
            SYSTEM
          </span>
          <h1 className="font-display text-3xl text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Broadcast announcements and manage notification history.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2F4156] text-white text-sm font-medium hover:bg-[#567C8D] active:scale-97 transition-colors">
          <Send className="w-4 h-4" /> New Notification
        </button>
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
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-[#2F4156]/20 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#567C8D]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["All", "Sent", "Scheduled", "Draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-xs font-mono transition-colors whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-card text-foreground border border-border hover:bg-secondary hover:text-foreground font-medium"
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
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Audience</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Reach</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => setSelected(n)}
                  className="cursor-pointer border-b border-[#2F4156]/5 hover:bg-[#C8D9E6]/20 transition-colors"
                >
                  <td className="py-3 pr-3 text-foreground font-medium">{n.title}</td>
                  <td className="py-3 pr-3 text-muted-foreground text-xs">{n.audience}</td>
                  <td className="py-3 pr-3 text-muted-foreground font-mono text-xs">{n.sentDate}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{n.reach.toLocaleString()}</td>
                  <td className="py-3 pr-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono whitespace-nowrap inline-flex items-center justify-center ${STATUS_STYLES[n.status]}`}>
                      {n.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No matching notifications.
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
              <h2 className="font-display text-xl text-foreground">{selected.title}</h2>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono ${STATUS_STYLES[selected.status]}`}>
              {selected.status}
            </span>

            <div>
              <h3 className="text-xs font-mono text-muted-foreground mb-2">MESSAGE</h3>
              <p className="text-sm text-foreground bg-[#C8D9E6]/20 rounded-lg px-3 py-2">
                {selected.message}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">Audience</span>
                <span className="text-foreground font-medium">{selected.audience}</span>
              </div>
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground font-mono text-xs">{selected.sentDate}</span>
              </div>
              <div className="flex justify-between border-b border-[#2F4156]/10 pb-2">
                <span className="text-muted-foreground">Reach</span>
                <span className="text-foreground font-medium">{selected.reach.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}