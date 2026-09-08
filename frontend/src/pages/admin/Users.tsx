import { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Users as UsersIcon,
  UserCheck,
  Clock,
  UserX,
  Search,
  Plus,
  Shield,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  X,
  Mail,
  Phone,
  Calendar,
  History,
  RefreshCw,
  Eye,
  Edit2,
  Ban,
  Check,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AnimatedNumber from "@/components/AnimatedNumber";

export type UserRole = "Admin" | "Staff" | "User";
export type UserStatus = "Active" | "Pending" | "Suspended";

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  location: string;
  status: UserStatus;
  lastActive: string;
  joinedDate: string;
  recentActivity?: {
    action: string;
    location: string;
    time: string;
  }[];
}

const INITIAL_USERS: OrgUser[] = [
  {
    id: "usr-1",
    name: "Md Danish Raza",
    email: "danish@ern-network.com",
    phone: "+91 98765 43210",
    role: "Admin",
    location: "All Locations",
    status: "Active",
    lastActive: "2 min ago",
    joinedDate: "15 Aug 2026",
    recentActivity: [
      {
        action: "Updated inventory stock quantity (Amul Milk 1L)",
        location: "Store A",
        time: "2 min ago",
      },
      {
        action: "Modified organization expiry threshold",
        location: "Global",
        time: "1 hour ago",
      },
      {
        action: "Reviewed 3 pending user access requests",
        location: "Administration",
        time: "Today, 10:15 AM",
      },
    ],
  },
  {
    id: "usr-2",
    name: "Krishnendu Adak",
    email: "krishnendu@ern-network.com",
    phone: "+91 98765 43211",
    role: "Admin",
    location: "All Locations",
    status: "Active",
    lastActive: "10 min ago",
    joinedDate: "15 Aug 2026",
    recentActivity: [
      {
        action: "Imported bulk inventory catalog (248 products)",
        location: "Store B",
        time: "18 min ago",
      },
      {
        action: "Authorized stock reconciliation audit",
        location: "Central Warehouse",
        time: "3 hours ago",
      },
    ],
  },
  {
    id: "usr-3",
    name: "Sarah Jenkins",
    email: "sarah.j@greenleaf.com",
    phone: "+1 555-0192",
    role: "Admin",
    location: "Central Warehouse",
    status: "Active",
    lastActive: "1 hour ago",
    joinedDate: "16 Aug 2026",
    recentActivity: [
      {
        action: "Configured warehouse safety thresholds",
        location: "Central Warehouse",
        time: "1 hour ago",
      },
      {
        action: "Approved supplier credential review",
        location: "Procurement",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "usr-4",
    name: "Priya Sharma",
    email: "priya.s@greenleaf.com",
    phone: "+91 98765 12345",
    role: "Staff",
    location: "Store A",
    status: "Active",
    lastActive: "25 min ago",
    joinedDate: "18 Aug 2026",
    recentActivity: [
      {
        action: "Performed daily expiry sweep (22 products checked)",
        location: "Store A",
        time: "25 min ago",
      },
    ],
  },
  {
    id: "usr-5",
    name: "Vikram Patel",
    email: "vikram.p@greenleaf.com",
    phone: "+91 98765 67890",
    role: "Staff",
    location: "Store B",
    status: "Active",
    lastActive: "35 min ago",
    joinedDate: "18 Aug 2026",
    recentActivity: [
      {
        action: "Created clearance batch for whole wheat bread",
        location: "Store B",
        time: "35 min ago",
      },
    ],
  },
  {
    id: "usr-16",
    name: "Chloe Bennett",
    email: "chloe.b@greenleaf.com",
    phone: "+1 555-0891",
    role: "User",
    location: "Store A",
    status: "Pending",
    lastActive: "Never signed in",
    joinedDate: "Today, 10:15 AM",
    recentActivity: [],
  },
  {
    id: "usr-17",
    name: "Rajesh Nair",
    email: "rajesh.nair@outlook.com",
    phone: "+91 98901 23456",
    role: "Staff",
    location: "Distribution Center",
    status: "Pending",
    lastActive: "Never signed in",
    joinedDate: "Today, 11:30 AM",
    recentActivity: [],
  },
  {
    id: "usr-18",
    name: "Sophie Martin",
    email: "sophie.martin@greenleaf.com",
    phone: "+33 6 12 34 56 78",
    role: "User",
    location: "Store B",
    status: "Pending",
    lastActive: "Never signed in",
    joinedDate: "Yesterday, 4:00 PM",
    recentActivity: [],
  },
];

const LOCATIONS = [
  "All Locations",
  "Store A",
  "Store B",
  "Central Warehouse",
  "Distribution Center",
];

const ROLE_PERMISSIONS: Record<
  UserRole,
  { label: string; desc: string; permissions: string[] }
> = {
  Admin: {
    label: "Organization Administrator",
    desc: "Full organization-level management, security, users, locations, and policy governance.",
    permissions: [
      "Manage Users & Roles",
      "Configure Locations & Facilities",
      "Manage Inventory & Expiry Policies",
      "Approve Stock Reconciliation & Discards",
      "Manage Suppliers & Procurement",
      "View All Reports & Export Catalog",
      "View Audit Logs & Security History",
      "Configure Workspace Settings",
    ],
  },
  Staff: {
    label: "Operational Staff",
    desc: "Operational inventory management, stock adjustments, expiry sweeps, and batch tracking within assigned locations.",
    permissions: [
      "View & Search Inventory",
      "Add, Edit & Scan Products",
      "Adjust Stock Quantities",
      "View Expiry Intelligence Alerts",
      "Initiate Inter-facility Transfers",
      "View Facility Operational Reports",
    ],
  },
  User: {
    label: "Standard Workspace User",
    desc: "Read-only and basic operational access to permitted inventory and facility catalogs.",
    permissions: [
      "View Permitted Inventory",
      "Look up SKUs and Barcodes",
      "View Product Expiration Dates",
      "Access Assigned Store Catalog",
    ],
  },
};

export default function Users() {
  const { user: currentUser } = useAuth();

  const [usersList, setUsersList] = useState<OrgUser[]>(INITIAL_USERS);

  useEffect(() => {
    let isMounted = true;
    api.admin
      .allUsers()
      .then((data) => {
        if (!isMounted || !Array.isArray(data) || data.length === 0) return;
        const liveMapped: OrgUser[] = data.map((u) => ({
          id: `usr-${u.id}`,
          name: u.name,
          email: u.email,
          role: u.role === "admin" ? "Admin" : u.role === "donor" ? "Staff" : "User",
          location: "All Locations",
          status: u.verified ? "Active" : "Pending",
          lastActive: "Active Session",
          joinedDate: new Date(u.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        }));
        setUsersList(liveMapped);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");

  const [sortField, setSortField] = useState<keyof OrgUser>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);

  const [isBulkRoleModalOpen, setIsBulkRoleModalOpen] = useState(false);
  const [bulkTargetRole, setBulkTargetRole] = useState<UserRole>("Staff");
  const [isBulkLocationModalOpen, setIsBulkLocationModalOpen] = useState(false);
  const [bulkTargetLocation, setBulkTargetLocation] =
    useState<string>("Store A");

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    variant: "danger" | "primary";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    actionLabel: "",
    variant: "primary",
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Staff" as UserRole,
    location: "Store A",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalCount = usersList.length;
  const activeCount = usersList.filter((u) => u.status === "Active").length;
  const pendingCount = usersList.filter((u) => u.status === "Pending").length;
  const suspendedCount = usersList.filter(
    (u) => u.status === "Suspended",
  ).length;

  const isFiltered =
    searchQuery.trim() !== "" ||
    statusFilter !== "All" ||
    roleFilter !== "All" ||
    locationFilter !== "All";

  const filteredUsers = useMemo(() => {
    return usersList
      .filter((u) => {
        if (statusFilter !== "All" && u.status !== statusFilter) return false;
        if (roleFilter !== "All" && u.role !== roleFilter) return false;
        if (
          locationFilter !== "All" &&
          u.location !== locationFilter &&
          u.location !== "All Locations"
        )
          return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q) ||
            u.location.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = (a[sortField] ?? "").toString().toLowerCase();
        const valB = (b[sortField] ?? "").toString().toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [
    usersList,
    statusFilter,
    roleFilter,
    locationFilter,
    searchQuery,
    sortField,
    sortAsc,
  ]);

  const handleSort = (field: keyof OrgUser) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setRoleFilter("All");
    setLocationFilter("All");
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenDetail = (user: OrgUser) => {
    setSelectedUser(user);
    setIsDetailDrawerOpen(true);
  };

  const handleOpenEdit = (user: OrgUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      location: user.location,
    });
    setIsEditUserModalOpen(true);
  };

  const activeAdminsCount = usersList.filter(
    (u) => u.role === "Admin" && u.status === "Active",
  ).length;

  const handleSaveUserEdit = () => {
    if (!selectedUser) return;

    if (
      selectedUser.role === "Admin" &&
      formData.role !== "Admin" &&
      activeAdminsCount <= 1
    ) {
      showToast("Safety alert: You cannot remove the last active Admin.");
      return;
    }

    setUsersList((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              role: formData.role,
              location: formData.location,
            }
          : u,
      ),
    );

    setIsEditUserModalOpen(false);
    showToast(`User ${formData.name} updated successfully.`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const newUser: OrgUser = {
      id: `usr-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      role: formData.role,
      location: formData.location,
      status: "Pending",
      lastActive: "Never signed in",
      joinedDate: "Today",
      recentActivity: [],
    };

    setUsersList((prev) => [newUser, ...prev]);
    setIsAddUserModalOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Staff",
      location: "Store A",
    });

    showToast(`Invitation queued for ${newUser.email}`);
  };

  const handleConfirmSuspend = (user: OrgUser) => {
    if (user.email === currentUser?.email) {
      showToast(
        "Security notice: You cannot suspend your own active administrator session.",
      );
      return;
    }

    if (
      user.role === "Admin" &&
      user.status === "Active" &&
      activeAdminsCount <= 1
    ) {
      showToast("Safety alert: You cannot suspend the last active Admin.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Suspend this user?",
      message: "The user will lose workspace access until reactivated.",
      actionLabel: "Suspend User",
      variant: "danger",
      onConfirm: () => {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, status: "Suspended" } : u,
          ),
        );
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`User ${user.name} suspended.`);
      },
    });
  };

  const handleConfirmReactivate = (user: OrgUser) => {
    setConfirmDialog({
      isOpen: true,
      title: "Restore access for this user?",
      message:
        "This will restore active workspace access and assigned permissions.",
      actionLabel: "Reactivate User",
      variant: "primary",
      onConfirm: () => {
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: "Active" } : u)),
        );
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`User ${user.name} reactivated.`);
      },
    });
  };

  const handleConfirmDeactivate = (user: OrgUser) => {
    if (
      user.role === "Admin" &&
      user.status === "Active" &&
      activeAdminsCount <= 1
    ) {
      showToast("Safety alert: You cannot deactivate the last active Admin.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Deactivate ${user.name}?`,
      message: "Access will be revoked immediately.",
      actionLabel: "Deactivate User",
      variant: "danger",
      onConfirm: () => {
        setUsersList((prev) => prev.filter((u) => u.id !== user.id));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setIsDetailDrawerOpen(false);
        showToast(`User ${user.name} deactivated.`);
      },
    });
  };

  const handleBulkSuspend = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Suspend ${selectedIds.length} selected users?`,
      message: "Selected accounts will lose access until reactivated.",
      actionLabel: "Suspend Selected",
      variant: "danger",
      onConfirm: () => {
        setUsersList((prev) =>
          prev.map((u) =>
            selectedIds.includes(u.id) && u.email !== currentUser?.email
              ? { ...u, status: "Suspended" }
              : u,
          ),
        );
        setSelectedIds([]);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`Suspended ${selectedIds.length} users.`);
      },
    });
  };

  const handleApplyBulkRole = () => {
    setUsersList((prev) =>
      prev.map((u) =>
        selectedIds.includes(u.id) ? { ...u, role: bulkTargetRole } : u,
      ),
    );
    setIsBulkRoleModalOpen(false);
    showToast(
      `Updated role to ${bulkTargetRole} for ${selectedIds.length} users.`,
    );
    setSelectedIds([]);
  };

  const handleApplyBulkLocation = () => {
    setUsersList((prev) =>
      prev.map((u) =>
        selectedIds.includes(u.id) ? { ...u, location: bulkTargetLocation } : u,
      ),
    );
    setIsBulkLocationModalOpen(false);
    showToast(`Assigned ${bulkTargetLocation} to ${selectedIds.length} users.`);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const exportTargets =
      selectedIds.length > 0
        ? filteredUsers.filter((u) => selectedIds.includes(u.id))
        : filteredUsers;

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Email,Phone,Role,Location,Status,Last Active,Joined"]
        .concat(
          exportTargets.map(
            (u) =>
              `"${u.name}","${u.email}","${u.phone || ""}","${u.role}","${u.location}","${u.status}","${u.lastActive}","${u.joinedDate}"`,
          ),
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ern_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${exportTargets.length} users to CSV.`);
  };

  return (
    <div className="space-y-6 max-w-[1400px] pb-24 text-foreground font-body">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>MEMBERS & PERMISSIONS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            USERS & ROLES
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Manage organization members, access levels, roles, and workspace
            permissions.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap font-mono">
          <button
            onClick={() => setIsManageRolesModalOpen(true)}
            className="flex items-center gap-2 text-xs font-bold uppercase px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer shadow-none ern-shimmer-hover"
          >
            <Shield className="size-3.5 text-foreground" />
            <span>Manage Roles</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-bold uppercase px-3.5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer shadow-none ern-shimmer-hover"
            title="Export CSV"
          >
            <Download className="size-3.5 text-foreground" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                name: "",
                email: "",
                phone: "",
                role: "Staff",
                location: "Store A",
              });
              setIsAddUserModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs font-bold uppercase px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-[#567C8D] transition-all shadow-none cursor-pointer active:scale-95 ern-shimmer-hover"
          >
            <Plus className="size-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div
          onClick={() => {
            setStatusFilter("All");
            showToast("Showing all users");
          }}
          className={`p-6 rounded-[24px] bg-card border border-border hover:border-primary cursor-pointer shadow-none flex items-center
justify-between transition-all ern-card-glow ${
            statusFilter === "All" ? "border-[#2F4156]" : ""
          }`}
        >
          <div>
            <p className="text-xs uppercase font-bold text-muted-foreground">
              Total Users
            </p>
            <p className="text-3xl font-bold font-display uppercase text-foreground mt-1">
              <AnimatedNumber value={totalCount} />
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Workspace members
            </p>
          </div>
          <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <UsersIcon className="size-5" />
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter("Active");
            showToast("Filtered by Active");
          }}
          className={`p-6 rounded-[24px] bg-card border border-border hover:border-primary cursor-pointer shadow-none flex items-center justify-between transition-all ern-card-glow ${
            statusFilter === "Active" ? "border-[#2F4156]" : ""
          }`}
        >
          <div>
            <p className="text-xs uppercase font-bold text-muted-foreground">
              Active
            </p>
            <p className="text-3xl font-bold font-display uppercase text-foreground mt-1">
              <AnimatedNumber value={activeCount} />
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Full access
            </p>
          </div>
          <div className="size-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
            <UserCheck className="size-5" />
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter("Pending");
            showToast("Filtered by Pending");
          }}
          className={`p-6 rounded-[24px] bg-card border border-border hover:border-primary cursor-pointer shadow-none flex items-center justify-between transition-all ern-card-glow ${
            statusFilter === "Pending" ? "border-[#2F4156]" : ""
          }`}
        >
          <div>
            <p className="text-xs uppercase font-bold text-muted-foreground">
              Pending
            </p>
            <p className="text-3xl font-bold font-display uppercase text-foreground mt-1">
              <AnimatedNumber value={pendingCount} />
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Awaiting login
            </p>
          </div>
          <div className="size-11 rounded-full bg-secondary text-foreground flex items-center justify-center font-bold">
            <Clock className="size-5" />
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter("Suspended");
            showToast("Filtered by Suspended");
          }}
          className={`p-6 rounded-[24px] bg-card border border-border hover:border-primary cursor-pointer shadow-none flex items-center justify-between transition-all ern-card-glow ${
            statusFilter === "Suspended" ? "border-[#2F4156]" : ""
          }`}
        >
          <div>
            <p className="text-xs uppercase font-bold text-muted-foreground">
              Suspended
            </p>
            <p className="text-3xl font-bold font-display uppercase text-foreground mt-1">
              <AnimatedNumber value={suspendedCount} />
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Revoked
            </p>
          </div>
          <div className="size-11 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
            <UserX className="size-5" />
          </div>
        </div>
      </div>

      
      <div className="p-5 rounded-[24px] bg-card border border-border shadow-none space-y-4 ern-card-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, role, or location..."
              className="w-full bg-background border border-border rounded-full pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <span className="text-muted-foreground uppercase font-bold">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <span className="text-muted-foreground uppercase font-bold">
                Role:
              </span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="User">User</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <span className="text-muted-foreground uppercase font-bold">
                Location:
              </span>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 rounded-full text-xs font-mono uppercase font-bold text-foreground hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      
      {selectedIds.length > 0 && (
        <div className="p-4 px-6 rounded-2xl bg-[#2F4156] border border-border shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2.5 text-xs font-bold text-primary-foreground uppercase">
            <CheckCircle2 className="size-4 text-accent" />
            <span>{selectedIds.length} users selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-bold">
            <button
              onClick={() => setIsBulkRoleModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground hover:bg-[#bbf070] transition-colors cursor-pointer uppercase"
            >
              Role
            </button>

            <button
              onClick={() => setIsBulkLocationModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-pointer uppercase"
            >
              Facility
            </button>

            <button
              onClick={handleBulkSuspend}
              className="px-3.5 py-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-[#8e884f] transition-colors cursor-pointer uppercase"
            >
              Suspend
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-1.5 text-primary-foreground hover:underline font-bold cursor-pointer uppercase"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      
      <div className="bg-card border border-border rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-none ern-card-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-secondary text-[10.5px] uppercase text-foreground border-b border-border">
              <tr>
                <th className="py-4 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredUsers.length > 0 &&
                      selectedIds.length === filteredUsers.length
                    }
                    onChange={handleSelectAll}
                    className="size-4 accent-primary cursor-pointer"
                  />
                </th>

                <th
                  onClick={() => handleSort("name")}
                  className="py-4 px-5 min-w-[240px] cursor-pointer hover:text-foreground font-bold uppercase group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>User</span>
                    {sortField === "name" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("role")}
                  className="py-4 px-4 w-32 cursor-pointer hover:text-foreground font-bold uppercase group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    {sortField === "role" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("location")}
                  className="py-4 px-4 min-w-[180px] cursor-pointer hover:text-foreground font-bold uppercase group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Facility</span>
                    {sortField === "location" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("status")}
                  className="py-4 px-4 w-40 cursor-pointer hover:text-foreground font-bold uppercase group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === "status" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("lastActive")}
                  className="py-4 px-4 w-36 cursor-pointer hover:text-foreground font-bold uppercase hidden md:table-cell group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Last Active</span>
                    {sortField === "lastActive" ? (
                      sortAsc ? (
                        <ArrowUp className="size-3 text-foreground dark:text-foreground shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 text-foreground dark:text-foreground shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-foreground/45 group-hover:text-foreground dark:text-foreground/60 dark:group-hover:text-foreground shrink-0 transition-colors" />
                    )}
                  </div>
                </th>

                <th className="py-4 px-5 w-36 text-right font-bold uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[rgba(28,58,19,0.15)]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isSelected = selectedIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      onClick={() => handleOpenDetail(u)}
                      className={`hover:bg-secondary/40 transition-colors cursor-pointer ${
                        isSelected ? "bg-secondary/50" : ""
                      }`}
                    >
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="py-4 px-4 text-center"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(u.id)}
                          className="size-4 accent-primary cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="size-9 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground font-display uppercase text-sm leading-tight truncate">
                              {u.name}
                            </p>
                            <p className="text-[11px] font-mono text-muted-foreground truncate mt-0.5">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            u.role === "Admin"
                              ? "bg-primary text-primary-foreground"
                              : u.role === "Staff"
                                ? "bg-accent text-accent-foreground"
                                : "bg-secondary text-foreground"
                          }`}
                        >
                          {u.role === "Admin" && <Shield className="size-3" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span className="font-bold text-foreground">
                            {u.location}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                            u.status === "Active"
                              ? "bg-accent text-accent-foreground"
                              : u.status === "Pending"
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap font-bold">
                        {u.lastActive}
                      </td>

                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="py-4 px-5 text-right font-mono"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(u)}
                            className="size-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-foreground transition-colors cursor-pointer"
                            title="View user"
                            aria-label="View user"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="size-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-foreground transition-colors cursor-pointer"
                            title={`Edit ${u.name}`}
                            aria-label={`Edit ${u.name}`}
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-muted-foreground font-mono text-xs font-bold"
                  >
                    No members match filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-7 shadow-none space-y-5 text-foreground ern-card-glow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">
                  Add Workspace Member
                </h3>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  Send an invitation to join your ERN organization.
                </p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleCreateUser}
              className="space-y-4 font-mono text-xs"
            >
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex.morgan@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Facility Scope
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono uppercase font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold hover:bg-[#567C8D] transition-all cursor-pointer shadow-none"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {isEditUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-7 shadow-none space-y-5 text-foreground ern-card-glow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">
                  Edit Member
                </h3>
              </div>
              <button
                onClick={() => setIsEditUserModalOpen(false)}
                className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Facility
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono uppercase font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUserEdit}
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold hover:bg-[#567C8D] transition-all cursor-pointer shadow-none"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none space-y-4 text-foreground font-mono ern-card-glow">
            <h3 className="font-display text-xl font-bold uppercase text-foreground">
              {confirmDialog.title}
            </h3>

            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              {confirmDialog.message}
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() =>
                  setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-2 rounded-full bg-secondary text-foreground text-xs font-mono uppercase font-bold cursor-pointer hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-mono uppercase font-bold cursor-pointer hover:bg-[#567C8D]"
              >
                {confirmDialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {isDetailDrawerOpen && selectedUser && (
        <div
          onClick={() => setIsDetailDrawerOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs animate-in fade-in"
          role="dialog"
          aria-label={`User details for ${selectedUser.name}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 sm:p-7 shadow-none text-foreground space-y-5 ern-card-glow max-h-[90vh] overflow-y-auto"
          >
            
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-foreground text-sm shrink-0 font-display">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl uppercase text-foreground leading-tight">
                    {selectedUser.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer transition-colors"
                aria-label="Close user details modal"
              >
                <X className="size-4" />
              </button>
            </div>

            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground text-[10.5px] uppercase font-bold block">Assigned Role</span>
                <span className="font-bold text-foreground text-sm uppercase mt-0.5 inline-flex items-center gap-1">
                  {selectedUser.role === "Admin" && <Shield className="size-3.5 text-primary" />}
                  <span>{selectedUser.role}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground text-[10.5px] uppercase font-bold block">Account Status</span>
                <span className="font-bold text-foreground text-sm uppercase mt-0.5 block">
                  {selectedUser.status}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground text-[10.5px] uppercase font-bold block">Operating Facility</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block truncate flex items-center gap-1">
                  <MapPin className="size-3 text-muted-foreground shrink-0" />
                  <span>{selectedUser.location}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                <span className="text-muted-foreground text-[10.5px] uppercase font-bold block">Last Active</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">
                  {selectedUser.lastActive}
                </span>
              </div>
            </div>

            
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2 text-xs">
              <span className="font-bold uppercase text-foreground text-xs block">Contact & Access Meta</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[10.5px]">Phone:</span>
                  <span className="text-foreground font-bold">{selectedUser.phone || "Not available"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10.5px]">Member Since:</span>
                  <span className="text-foreground font-bold">{selectedUser.joinedDate}</span>
                </div>
              </div>
            </div>

            
            {selectedUser.recentActivity && selectedUser.recentActivity.length > 0 && (
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2 text-xs">
                <span className="font-bold uppercase text-foreground text-xs block">Recent Activity Log</span>
                <div className="space-y-2">
                  {selectedUser.recentActivity.map((act, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-[11px] pb-1.5 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground font-semibold truncate">{act.action}</p>
                        <span className="text-muted-foreground font-mono text-[10px]">{act.location}</span>
                      </div>
                      <span className="text-muted-foreground font-mono text-[10px] shrink-0">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  handleOpenEdit(selectedUser);
                }}
                className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer transition-colors"
              >
                Edit Member
              </button>
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-bold hover:bg-primary/90 cursor-pointer shadow-none transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
