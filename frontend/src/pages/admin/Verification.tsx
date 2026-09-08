import { useState, useEffect, useMemo, useCallback } from "react";
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
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { api, type PendingUser } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import SkeletonLoader from "@/components/SkeletonLoader";
import AnimatedNumber from "@/components/AnimatedNumber";

export default function AdminVerification() {
  const { showToast } = useToast();

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.admin.pendingUsers();
      setPendingUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load pending registrations.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleVerify = async (user: PendingUser) => {
    setProcessingId(user.id);
    try {
      await api.admin.verifyUser(user.id);
      showToast(`Approved registration for ${user.name}. Portal access activated.`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Verification failed.", "error");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (user: PendingUser) => {
    if (!window.confirm(`Reject and delete registration for "${user.name}"?`)) {
      return;
    }

    setProcessingId(user.id);
    try {
      await api.admin.rejectUser(user.id);
      showToast(`Rejected registration for ${user.name}.`, "info");
      setPendingUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Rejection failed.", "error");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return pendingUsers.filter(
      (u) =>
        q === "" ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [pendingUsers, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-foreground font-body">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>ADMINISTRATIVE GOVERNANCE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-[350] text-foreground leading-[1.08] tracking-[-0.025em]">
            User & Entity Verification
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Review incoming store retailers, individual rescuers, and bulk NGO procurement credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-mono text-xs font-bold uppercase transition-all cursor-pointer min-h-[44px]"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono uppercase font-bold">Pending Approval</span>
            <Clock className="size-4" />
          </div>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={pendingUsers.length} />
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">Awaiting review</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono uppercase font-bold">Store Retailers</span>
            <Store className="size-4" />
          </div>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={pendingUsers.filter((u) => u.role === "donor" || u.role === "retailer").length} />
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">Commercial donors</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono uppercase font-bold">Buyers & NGOs</span>
            <Building2 className="size-4" />
          </div>
          <div className="font-display text-3xl font-bold text-foreground">
            <AnimatedNumber value={pendingUsers.filter((u) => u.role === "buyer" || u.role === "customer").length} />
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">Rescue organizations</div>
        </div>
      </div>

      
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4 font-mono text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or entity..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-border bg-background text-foreground text-xs outline-none focus:border-primary"
          />
        </div>
        <span className="text-muted-foreground hidden sm:inline">
          Queue: {filtered.length} account{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      
      {isLoading ? (
        <SkeletonLoader type="text" count={4} />
      ) : error ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
          <AlertTriangle className="size-8 text-destructive mx-auto" />
          <p className="text-sm font-sans text-foreground">{error}</p>
          <button
            type="button"
            onClick={fetchPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3 font-mono text-xs">
          <CheckCircle2 className="size-10 text-foreground mx-auto" />
          <h3 className="font-display font-medium text-lg text-foreground">Queue Clear</h3>
          <p className="text-muted-foreground font-sans max-w-sm mx-auto">
            All user registrations and institutional procurement applicants have been reviewed and verified.
          </p>
        </div>
      ) : (
        <>
          
          <div className="hidden md:block rounded-2xl bg-card border border-border overflow-hidden font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[11px]">
                  <th className="py-3.5 px-4 font-bold">Applicant / Entity</th>
                  <th className="py-3.5 px-4 font-bold">Email</th>
                  <th className="py-3.5 px-4 font-bold">Requested Role</th>
                  <th className="py-3.5 px-4 font-bold">Registration Date</th>
                  <th className="py-3.5 px-4 font-bold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-bold text-foreground text-sm">{user.name}</div>
                      <span className="text-[10px] text-muted-foreground font-mono">ID #{user.id}</span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground">{user.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-bold uppercase">
                        {user.role} {user.buyer_type ? `(${user.buyer_type})` : ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleReject(user)}
                        disabled={processingId === user.id}
                        className="px-3.5 py-1.5 rounded-full border border-border text-destructive hover:bg-destructive/10 text-xs font-mono font-bold uppercase transition-colors cursor-pointer min-h-[44px]"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerify(user)}
                        disabled={processingId === user.id}
                        className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-xs font-mono font-bold uppercase transition-colors cursor-pointer min-h-[44px]"
                      >
                        Verify & Activate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          
          <div className="md:hidden space-y-3 font-mono text-xs">
            {filtered.map((user) => (
              <div key={user.id} className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-sans font-bold text-foreground text-sm">{user.name}</h4>
                    <span className="text-[10px] text-muted-foreground">{user.email}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-bold uppercase shrink-0">
                    {user.role}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30 text-xs flex justify-between">
                  <span className="text-muted-foreground">Registered:</span>
                  <span className="text-foreground">
                    {new Date(user.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleReject(user)}
                    disabled={processingId === user.id}
                    className="flex-1 py-2 rounded-full border border-border text-destructive hover:bg-destructive/10 text-xs font-bold uppercase min-h-[44px]"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify(user)}
                    disabled={processingId === user.id}
                    className="flex-1 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase min-h-[44px]"
                  >
                    Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}