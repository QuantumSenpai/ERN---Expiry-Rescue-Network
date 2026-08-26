import { useState, useMemo } from "react";
import { Users, Plus, Store, Search, Pencil, Trash2, X, CheckCircle2, ToggleLeft } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

type StaffRole = "Business Owner" | "Store Manager" | "Inventory Manager" | "Sales Executive" | "Cashier Staff";
type StaffStatus = "Active" | "Inactive";

interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  assignedStore: string;
  email: string;
  phone: string;
  permissions: string[];
  status: StaffStatus;
  lastLogin: string;
}

const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  "Business Owner": ["Full System Admin", "Procurement", "Clearance Approver", "Financials"],
  "Store Manager": ["Store Inventory", "Clearance Markdown", "Staff Management"],
  "Inventory Manager": ["Stock Ingestion", "Batch Management", "Expiry Radar"],
  "Sales Executive": ["POS Terminal", "Stock Lookup"],
  "Cashier Staff": ["POS Terminal", "Barcode Scan", "Customer Savings Scan"],
};

const STORES = ["All Stores", "Main Branch", "City Center", "North Outlet", "East Wing Express", "South Store"];
const ALL_ROLES: StaffRole[] = ["Business Owner", "Store Manager", "Inventory Manager", "Sales Executive", "Cashier Staff"];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "st-1",
    name: "Amit Sharma",
    role: "Business Owner",
    assignedStore: "All Stores",
    email: "amit.sharma@ern-retail.in",
    phone: "+91 98450 12345",
    permissions: ROLE_PERMISSIONS["Business Owner"],
    status: "Active",
    lastLogin: "10 mins ago",
  },
  {
    id: "st-2",
    name: "Priya Sundaram",
    role: "Store Manager",
    assignedStore: "City Center",
    email: "priya.s@ern-retail.in",
    phone: "+91 98450 54321",
    permissions: ROLE_PERMISSIONS["Store Manager"],
    status: "Active",
    lastLogin: "1 hour ago",
  },
  {
    id: "st-3",
    name: "Rohan Verma",
    role: "Inventory Manager",
    assignedStore: "North Outlet",
    email: "rohan.v@ern-retail.in",
    phone: "+91 98450 67890",
    permissions: ROLE_PERMISSIONS["Inventory Manager"],
    status: "Active",
    lastLogin: "2 hours ago",
  },
  {
    id: "st-4",
    name: "Ramesh Kumar",
    role: "Cashier Staff",
    assignedStore: "Main Branch",
    email: "ramesh.k@ern-retail.in",
    phone: "+91 98450 11224",
    permissions: ROLE_PERMISSIONS["Cashier Staff"],
    status: "Active",
    lastLogin: "30 mins ago",
  },
  {
    id: "st-5",
    name: "Kiran Patil",
    role: "Sales Executive",
    assignedStore: "East Wing Express",
    email: "kiran.p@ern-retail.in",
    phone: "+91 98450 77665",
    permissions: ROLE_PERMISSIONS["Sales Executive"],
    status: "Active",
    lastLogin: "Yesterday",
  },
];

const BLANK_FORM = {
  name: "",
  role: "Cashier Staff" as StaffRole,
  assignedStore: "Main Branch",
  email: "",
  phone: "",
};

export default function RetailerUsers() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return staff.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.assignedStore.toLowerCase().includes(q);
      const matchRole = roleFilter === "All" || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [staff, searchTerm, roleFilter]);

  const activeCount = staff.filter((m) => m.status === "Active").length;

  const openAdd = () => {
    setForm(BLANK_FORM);
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (m: StaffMember) => {
    setForm({ name: m.name, role: m.role, assignedStore: m.assignedStore, email: m.email, phone: m.phone });
    setEditTarget(m);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editTarget) {
      setStaff((prev) =>
        prev.map((m) =>
          m.id === editTarget.id
            ? { ...m, name: form.name, role: form.role, assignedStore: form.assignedStore, email: form.email, phone: form.phone, permissions: ROLE_PERMISSIONS[form.role] }
            : m
        )
      );
      showToast(`${form.name} updated.`);
    } else {
      const newMember: StaffMember = {
        id: `st-${Date.now()}`,
        name: form.name,
        role: form.role,
        assignedStore: form.assignedStore,
        email: form.email,
        phone: form.phone,
        permissions: ROLE_PERMISSIONS[form.role],
        status: "Active",
        lastLogin: "Just now",
      };
      setStaff((prev) => [...prev, newMember]);
      showToast(`${form.name} added to team.`);
    }
    setModalOpen(false);
  };

  const handleRemove = (id: string, name: string) => {
    setStaff((prev) => prev.filter((m) => m.id !== id));
    showToast(`${name} removed from team.`);
  };

  const toggleStatus = (m: StaffMember) => {
    const next: StaffStatus = m.status === "Active" ? "Inactive" : "Active";
    setStaff((prev) => prev.map((s) => (s.id === m.id ? { ...s, status: next } : s)));
    showToast(`${m.name} set to ${next}.`);
  };

  return (
    <div className="space-y-6 pb-24 font-sans text-foreground">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Team, Roles &amp; Access Control
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Enterprise role-based permissions matrix for store managers, inventory handlers &amp; cashiers
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs">
            <span className="text-muted-foreground uppercase font-bold">Active:</span>
            <span className="font-bold text-foreground">{activeCount}</span>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer ern-shimmer-hover"
          >
            <Plus className="size-4" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-2xl overflow-hidden shadow-sm transition-colors duration-200 ern-card-glow">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff name, email..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-48"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <span className="text-xs font-mono text-muted-foreground">
            {filtered.length} staff account{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground font-mono uppercase bg-secondary/20">
                <th className="px-4 py-3">Team Member</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Branch Location</th>
                <th className="px-4 py-3">System Permissions</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground font-mono text-sm">
                    No staff members found.{" "}
                    <button onClick={openAdd} className="text-primary font-bold underline cursor-pointer">Add one</button>.
                  </td>
                </tr>
              ) : filtered.map((member) => (
                <tr key={member.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {member.name[0]}
                      </div>
                      <div>
                        <p>{member.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-foreground font-mono">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Store className="size-3 text-primary" />
                      {member.assignedStore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {member.permissions.slice(0, 2).map((perm, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] bg-secondary/80 text-foreground font-mono">
                          {perm}
                        </span>
                      ))}
                      {member.permissions.length > 2 && (
                        <span className="text-[9px] text-muted-foreground font-mono">+{member.permissions.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{member.phone}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{member.lastLogin}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${member.status === "Active" ? "bg-emerald-500/15 text-emerald-600" : "bg-secondary text-muted-foreground"}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleStatus(member)}
                        title={member.status === "Active" ? "Deactivate" : "Activate"}
                        className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <ToggleLeft className="size-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(member)}
                        title="Edit member"
                        className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(member.id, member.name)}
                        title="Remove member"
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-7 shadow-none space-y-5 text-foreground ern-card-glow">
            <div className="flex justify-between items-start">
              <h3 className="font-display text-xl font-bold uppercase text-foreground">
                {editTarget ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                  placeholder="e.g. Sneha Kapoor"
                />
              </div>
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                  placeholder="sneha@ern-retail.in"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Branch / Store</label>
                  <select
                    value={form.assignedStore}
                    onChange={(e) => setForm({ ...form, assignedStore: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                  placeholder="+91 98450 XXXXX"
                />
              </div>
              {/* Permissions preview */}
              <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                <p className="text-muted-foreground uppercase font-bold mb-1.5 text-[10px]">Permissions granted for this role:</p>
                <div className="flex flex-wrap gap-1">
                  {ROLE_PERMISSIONS[form.role].map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] font-mono">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono uppercase font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.email.trim()}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold hover:bg-[#567C8D] transition-all cursor-pointer shadow-none disabled:opacity-50"
              >
                {editTarget ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
