import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Sliders,
  Check,
  X,
  Truck,
} from "lucide-react";
import { api, type ApiRequest } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useDebounce } from "@/lib/useDebounce";
import SkeletonLoader from "@/components/SkeletonLoader";
import AnimatedNumber from "@/components/AnimatedNumber";

export default function AdminRequests() {
  const { showToast } = useToast();

  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState("All");

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.admin.allRequests();
      setRequests(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load platform requests.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = async (
    requestId: number,
    nextStatus: "pending" | "approved" | "completed" | "cancelled"
  ) => {
    setUpdatingId(requestId);
    try {
      await api.admin.updateRequestStatus(requestId, nextStatus);
      showToast(`Request REQ-${requestId} transitioned to ${nextStatus}.`);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: nextStatus } : r))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Status transition failed.", "error");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return requests.filter((r) => {
      const matchSearch =
        q === "" ||
        r.item_name.toLowerCase().includes(q) ||
        (r.buyer_name && r.buyer_name.toLowerCase().includes(q)) ||
        (r.donor_name && r.donor_name.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === "All" || r.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [requests, debouncedSearch, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-foreground font-body">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>OPERATIONAL DISPATCH</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground leading-[1.08] tracking-[-0.025em]">
            Stock & Claim Requests
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Monitor and advance rescue claims from buyer placement through counter verification and final delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRequests}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-mono text-xs font-bold uppercase transition-all cursor-pointer min-h-[44px]"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground font-bold">Total Requests</span>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={requests.length} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">All claims</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground font-bold">Pending Review</span>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={requests.filter((r) => r.status === "pending").length} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">Requires action</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground font-bold">Approved</span>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={requests.filter((r) => r.status === "approved").length} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">Ready for pickup</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground font-bold">Completed</span>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={requests.filter((r) => r.status === "completed").length} />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">Successfully fulfilled</span>
        </div>
      </div>

      
      <div className="p-4 rounded-2xl bg-card border border-border shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {["All", "Pending", "Approved", "Completed", "Cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full font-medium uppercase transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search claims..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-background border border-border focus:border-primary text-foreground placeholder:text-muted-foreground font-sans text-xs outline-none"
          />
        </div>
      </div>

      
      {isLoading ? (
        <SkeletonLoader type="text" count={6} />
      ) : error ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
          <AlertTriangle className="size-8 text-destructive mx-auto" />
          <p className="text-sm font-sans text-foreground">{error}</p>
          <button
            type="button"
            onClick={fetchRequests}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3 font-mono text-xs">
          <Inbox className="size-10 text-muted-foreground mx-auto" />
          <h3 className="font-display font-medium text-lg text-foreground">No Claims Matching Filter</h3>
          <p className="text-muted-foreground font-sans max-w-sm mx-auto">
            All requests have been addressed or no claims exist in this lifecycle stage.
          </p>
        </div>
      ) : (
        <>
          
          <div className="hidden md:block rounded-2xl bg-card border border-border overflow-hidden font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[11px]">
                  <th className="py-3.5 px-4 font-bold">Request / Item</th>
                  <th className="py-3.5 px-4 font-bold">Buyer & Entity</th>
                  <th className="py-3.5 px-4 font-bold">Store Partner</th>
                  <th className="py-3.5 px-4 font-bold">Date Placed</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-bold text-foreground text-sm">{req.item_name}</div>
                      <span className="text-[10px] text-muted-foreground font-mono">REQ-{req.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-foreground font-medium">{req.buyer_name || `Buyer #${req.buyer_id}`}</div>
                      <span className="text-[10px] text-muted-foreground uppercase">{req.buyer_type || "individual"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground">
                      {req.donor_name || "Partner Store"}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(req.requested_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        req.status === "approved"
                          ? "bg-primary text-primary-foreground"
                          : req.status === "completed"
                          ? "bg-secondary text-foreground"
                          : req.status === "pending"
                          ? "bg-accent text-accent-foreground font-bold"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {req.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req.id, "approved")}
                          disabled={updatingId === req.id}
                          className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold uppercase transition-colors cursor-pointer min-h-[44px]"
                        >
                          Approve
                        </button>
                      )}
                      {req.status === "approved" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req.id, "completed")}
                          disabled={updatingId === req.id}
                          className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase transition-colors cursor-pointer min-h-[44px]"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {req.status !== "completed" && req.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req.id, "cancelled")}
                          disabled={updatingId === req.id}
                          className="px-3 py-1.5 rounded-full border border-border text-destructive hover:bg-destructive/10 text-xs font-mono font-bold uppercase transition-colors cursor-pointer min-h-[44px]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          
          <div className="md:hidden space-y-3 font-mono text-xs">
            {filtered.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-sans font-bold text-foreground text-sm">{req.item_name}</h4>
                    <span className="text-[10px] text-muted-foreground">
                      REQ-{req.id} · {req.buyer_name || `Buyer #${req.buyer_id}`} ({req.buyer_type || "individual"})
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    req.status === "approved"
                      ? "bg-primary text-primary-foreground"
                      : req.status === "completed"
                      ? "bg-secondary text-foreground"
                      : req.status === "pending"
                      ? "bg-accent text-accent-foreground font-bold"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30 text-xs flex justify-between">
                  <span className="text-muted-foreground">Store: {req.donor_name || "Partner Store"}</span>
                  <span className="text-foreground">
                    {new Date(req.requested_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {req.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(req.id, "approved")}
                      disabled={updatingId === req.id}
                      className="flex-1 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase min-h-[44px]"
                    >
                      Approve
                    </button>
                  )}
                  {req.status === "approved" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(req.id, "completed")}
                      disabled={updatingId === req.id}
                      className="flex-1 py-2 rounded-full bg-secondary text-foreground text-xs font-bold uppercase min-h-[44px]"
                    >
                      Delivered
                    </button>
                  )}
                  {req.status !== "completed" && req.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(req.id, "cancelled")}
                      disabled={updatingId === req.id}
                      className="py-2 px-4 rounded-full border border-border text-destructive hover:bg-destructive/10 text-xs font-bold uppercase min-h-[44px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
