import { useState, useMemo } from "react";
import { Search, Clock, Plus, Pencil, Trash2, X, CheckCircle2, ToggleLeft } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import type { Listing, ListingStatus } from "@/context/AppDataContext";
import AnimatedNumber from "@/components/AnimatedNumber";

const CATEGORIES = ["Bakery", "Produce", "Dairy", "Beverages", "Snacks", "Grocery", "Prepared Foods"];
const STATUS_OPTIONS: ListingStatus[] = ["Active", "Urgent", "Paused", "Expired"];

const STATUS_STYLE: Record<ListingStatus, string> = {
  Active: "bg-primary text-primary-foreground",
  Urgent: "bg-[#2F4156] border border-[#2F4156] text-foreground",
  Paused: "bg-secondary text-muted-foreground",
  Expired: "bg-destructive/20 text-destructive",
};

const BLANK_FORM = { name: "", donor: "", category: "Bakery", price: 0, discount: 50, status: "Active" as ListingStatus, expires: "4h 00m" };

export default function AdminListings() {
  const { listings, addListing, updateListing, deleteListing, toast, showToast } = useAppData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Listing | null>(null);
  const [form, setForm] = useState(BLANK_FORM);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return listings.filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(q) || l.donor.toLowerCase().includes(q) || l.category.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [listings, search, statusFilter]);

  const totalCount = listings.length;
  const activeCount = listings.filter((l) => l.status === "Active").length;
  const urgentCount = listings.filter((l) => l.status === "Urgent").length;

  const openAdd = () => {
    setForm(BLANK_FORM);
    setEditTarget(null);
    setAddModalOpen(true);
  };

  const openEdit = (l: Listing) => {
    setForm({ name: l.name, donor: l.donor, category: l.category, price: l.price, discount: l.discount, status: l.status, expires: l.expires });
    setEditTarget(l);
    setAddModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.donor.trim()) return;
    if (editTarget) {
      updateListing(editTarget.id, form);
      showToast("Listing updated successfully.");
    } else {
      addListing(form);
      showToast("Listing created successfully.");
    }
    setAddModalOpen(false);
  };

  const handleDelete = (id: number, name: string) => {
    deleteListing(id);
    showToast(`"${name}" removed from listings.`);
  };

  const toggleStatus = (l: Listing) => {
    const next: ListingStatus = l.status === "Active" ? "Paused" : "Active";
    updateListing(l.id, { status: next });
    showToast(`${l.name} set to ${next}.`);
  };

  return (
    <div className="space-y-6 max-w-[1400px] pb-24 text-foreground font-body">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>MARKETPLACE CATALOG</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            GLOBAL LISTINGS
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Monitor all active rescue listings and dynamic discount curves across the network.
          </p>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all cursor-pointer shadow-none active:scale-95 ern-shimmer-hover"
          >
            <Plus className="size-4" />
            <span>Add Listing</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 font-mono">
        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between ern-card-glow transition-colors duration-200">
          <span className="text-xs uppercase font-bold text-muted-foreground">Total Listings</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={totalCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">In catalog</p>
        </div>
        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between ern-card-glow transition-colors duration-200">
          <span className="text-xs uppercase font-bold text-muted-foreground">Active Now</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={activeCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Live on marketplace</p>
        </div>
        <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none flex flex-col justify-between ern-card-glow transition-colors duration-200">
          <span className="text-xs uppercase font-bold text-foreground">Urgent / Expiring</span>
          <p className="text-3xl font-bold font-display uppercase text-foreground mt-2">
            <AnimatedNumber value={urgentCount} />
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">Need attention</p>
        </div>
      </div>
      {/* Search + Filter */}
      <div className="p-5 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none ern-card-glow transition-colors duration-200 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, donor, category..."
            className="w-full bg-card border border-border rounded-full pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
          />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border font-mono text-xs">
          <span className="text-muted-foreground uppercase font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="All">All</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none font-mono ern-card-glow transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground font-bold border-b border-border">
              <tr>
                <th className="py-4 px-5 font-bold uppercase">Item</th>
                <th className="py-4 px-4 font-bold uppercase">Donor Partner</th>
                <th className="py-4 px-4 font-bold uppercase">Category</th>
                <th className="py-4 px-4 font-bold uppercase">Price / Discount</th>
                <th className="py-4 px-4 font-bold uppercase">Expires In</th>
                <th className="py-4 px-4 font-bold uppercase">Status</th>
                <th className="py-4 px-5 text-right font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground font-mono text-sm">
                    No listings found. Try adjusting filters or{" "}
                    <button onClick={openAdd} className="text-primary font-bold underline cursor-pointer">add a new one</button>.
                  </td>
                </tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="py-4 px-5 font-bold font-display uppercase text-foreground text-sm">{l.name}</td>
                  <td className="py-4 px-4 text-xs font-mono text-muted-foreground">{l.donor}</td>
                  <td className="py-4 px-4 text-xs font-mono text-muted-foreground">{l.category}</td>
                  <td className="py-4 px-4 font-mono font-bold text-foreground">
                    ₹{l.price} <span className="text-muted-foreground">(-{l.discount}%)</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono flex items-center gap-1.5 text-foreground">
                    <Clock className="size-3.5 text-foreground" />
                    <span>{l.expires}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${STATUS_STYLE[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(l)}
                        title={l.status === "Active" ? "Pause listing" : "Activate listing"}
                        className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <ToggleLeft className="size-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(l)}
                        title="Edit listing"
                        className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(l.id, l.name)}
                        title="Delete listing"
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
      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-7 shadow-none space-y-5 text-foreground ern-card-glow">
            <div className="flex justify-between items-start">
              <h3 className="font-display text-xl font-bold uppercase text-foreground">
                {editTarget ? "Edit Listing" : "Add Listing"}
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Item Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                  placeholder="e.g. Artisan Sourdough Boule"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Donor Partner *</label>
                  <input
                    type="text"
                    value={form.donor}
                    onChange={(e) => setForm({ ...form, donor: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                    placeholder="e.g. Fresh Bakes Co."
                  />
                </div>
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Discount %</label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">Expires In</label>
                  <input
                    type="text"
                    value={form.expires}
                    onChange={(e) => setForm({ ...form, expires: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    placeholder="e.g. 3h 00m"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ListingStatus })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono uppercase font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.donor.trim()}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold hover:bg-[#567C8D] transition-all cursor-pointer shadow-none disabled:opacity-50"
              >
                {editTarget ? "Save Changes" : "Create Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
