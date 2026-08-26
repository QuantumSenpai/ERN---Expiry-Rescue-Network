import { useState, useMemo } from "react";
import {
  Building,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  MapPin,
  Boxes,
  Download,
  AlertCircle,
  Upload,
  Trash2,
  Lock,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedNumber from "@/components/AnimatedNumber";

export interface OrgSettingsState {
  orgName: string;
  orgType: string;
  workspaceId: string;
  primaryContact: string;
  businessEmail: string;
  phone: string;
  website: string;
  logoUrl: string | null;

  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;

  timeZone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;

  defaultInventoryUnit: string;
  defaultStockStatus: string;
  defaultReorderBehavior: string;
  defaultLocation: string;

  defaultExpiryTracking: boolean;
  alertWarningDays: number;
  alertUrgentDays: number;
  alertCriticalDays: number;
}

const INITIAL_SETTINGS: OrgSettingsState = {
  orgName: "GreenLeaf Retail Group",
  orgType: "Retail / Grocery",
  workspaceId: "ERN-ORG-001",
  primaryContact: "Enterprise Admin",
  businessEmail: "admin@greenleafretail.com",
  phone: "+91 98765 43210",
  website: "https://www.greenleafretail.in",
  logoUrl: null,

  addressLine1: "Corporate Tower 4, Level 8, Cyber City",
  addressLine2: "DLF Phase II, Sector 24",
  city: "Gurugram",
  region: "Haryana / NCR",
  postalCode: "122002",
  country: "India",

  timeZone: "Asia/Kolkata (IST · UTC+05:30)",
  currency: "INR (₹)",
  dateFormat: "DD MMM YYYY (e.g. 15 Aug 2026)",
  numberFormat: "Indian (1,00,000 / 18.4L)",

  defaultInventoryUnit: "Units",
  defaultStockStatus: "Normal",
  defaultReorderBehavior: "Manual Review",
  defaultLocation: "Central Warehouse",

  defaultExpiryTracking: true,
  alertWarningDays: 30,
  alertUrgentDays: 14,
  alertCriticalDays: 7,
};

const ORG_TYPES = [
  "Retail / Grocery",
  "Supermarket Chain",
  "Distribution / Wholesale",
  "Pharmacy / Healthcare",
  "Hospitality & Food Services",
  "Non-Profit & NGO Redistribution",
];

const TIMEZONES = [
  "Asia/Kolkata (IST · UTC+05:30)",
  "UTC (Coordinated Universal Time · UTC+00:00)",
  "America/New_York (EST / EDT · UTC-05:00)",
  "Europe/London (GMT / BST · UTC+00:00)",
  "Asia/Dubai (GST · UTC+04:00)",
  "Asia/Singapore (SGT · UTC+08:00)",
];

const CURRENCIES = [
  "INR (₹) - Indian Rupee",
  "USD ($) - US Dollar",
  "EUR (€) - Euro",
  "GBP (£) - British Pound",
  "AED (د.إ) - UAE Dirham",
  "SGD ($) - Singapore Dollar",
];

const INVENTORY_UNITS = [
  "Units",
  "Cases / Cartons",
  "Kilograms (kg)",
  "Grams (g)",
  "Litres (L)",
  "Millilitres (ml)",
  "Packs / Bundles",
  "Boxes",
];

const LOCATIONS = [
  "Central Warehouse",
  "Store A (Metro)",
  "Store B (Express)",
  "Distribution Center",
];

const LOCATION_DISTRIBUTION = [
  { name: "Central Warehouse", code: "WH-001", count: 498 },
  { name: "Store A (Metro)", code: "STR-001", count: 342 },
  { name: "Store B (Express)", code: "STR-002", count: 268 },
  { name: "Distribution Center", code: "DC-001", count: 140 },
];

const TOTAL_INVENTORY_COUNT = 1248;

export default function Organization() {
  const [savedSettings, setSavedSettings] = useState<OrgSettingsState>(INITIAL_SETTINGS);
  const [formData, setFormData] = useState<OrgSettingsState>(INITIAL_SETTINGS);
  const [workspaceStatus, setWorkspaceStatus] = useState<"Active" | "Deactivated">("Active");

  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(savedSettings) !== JSON.stringify(formData);
  }, [savedSettings, formData]);

  const handleSave = () => {
    setSavedSettings(formData);
    showToast("Organization settings saved successfully.");
  };

  const handleDiscard = () => {
    setFormData(savedSettings);
    showToast("Changes discarded.");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
        showToast("Logo updated (preview mode). Remember to click Save.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: null }));
    showToast("Logo removed. Click Save to apply changes.");
  };

  const handleExportOrgData = () => {
    const exportBundle = {
      organization: formData,
      exportedAt: new Date().toISOString(),
      formatVersion: "ERN-v2.0",
      workspaceStatus,
      totalInventoryRecords: TOTAL_INVENTORY_COUNT,
      locations: LOCATION_DISTRIBUTION,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ern_org_export_${formData.workspaceId}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Organization export archive generated successfully.");
  };

  const handleConfirmDeactivateWorkspace = () => {
    setWorkspaceStatus("Deactivated");
    setIsDeactivateModalOpen(false);
    setConfirmInput("");
    showToast("Workspace deactivated.");
  };

  const handleReactivateWorkspace = () => {
    setWorkspaceStatus("Active");
    showToast("Workspace reactivated.");
  };

  return (
    <div className="space-y-6 max-w-[1400px] pb-24 text-foreground font-body">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium uppercase mb-2">
            <span>GOVERNANCE & PREFERENCES</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            ORGANIZATION SETTINGS
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Workspace profile, regional formatting standards, address, and default inventory configurations.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap font-mono">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`size-2 rounded-full ${
                hasUnsavedChanges
                  ? "bg-[#2F4156] border border-[#2F4156]"
                  : "bg-[#2F4156]"
              }`}
            />
            <span className="font-bold uppercase text-muted-foreground">
              {hasUnsavedChanges ? "Unsaved edits" : "Synced"}
            </span>
          </div>

          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs uppercase font-bold cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={!hasUnsavedChanges}
            className={`flex items-center gap-2 text-xs uppercase font-bold px-5 py-2.5 rounded-full transition-all shadow-none ${
              hasUnsavedChanges
                ? "bg-primary text-primary-foreground hover:bg-[#567C8D] cursor-pointer active:scale-95"
                : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Save className="size-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Profile */}
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <Building className="size-5 text-foreground" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Organization Profile</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Business identity and corporate contact details.
                </p>
              </div>
            </div>

            {/* Logo */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-secondary/50 border border-border">
              <div className="size-16 rounded-2xl bg-popover border border-border flex items-center justify-center overflow-hidden shrink-0">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Organization Logo"
                    className="size-full object-cover"
                  />
                ) : (
                  <Building className="size-7 text-foreground" />
                )}
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <label className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-none">
                    <Upload className="size-3.5" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-1.5 rounded-full bg-secondary text-foreground border border-border hover:bg-secondary/80 uppercase font-bold cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[10.5px] text-muted-foreground font-mono">
                  Square ratio, PNG or SVG format.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Organization Type
                </label>
                <select
                  value={formData.orgType}
                  onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                >
                  {ORG_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Primary Contact
                </label>
                <input
                  type="text"
                  value={formData.primaryContact}
                  onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Business Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <MapPin className="size-5 text-foreground" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Headquarters Address</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Primary corporate headquarters or registered facility.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">State / Region</label>
                <input
                  type="text"
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Country</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Regional */}
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <Globe className="size-5 text-foreground" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Regional & Time</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Formatting standards, currency, and operational timezone.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Time Zone</label>
                <select
                  value={formData.timeZone}
                  onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Defaults */}
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <Boxes className="size-5 text-foreground" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Inventory Defaults</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Defaults for new SKUs and default facility routing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Default Unit</label>
                <select
                  value={formData.defaultInventoryUnit}
                  onChange={(e) => setFormData({ ...formData, defaultInventoryUnit: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                >
                  {INVENTORY_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted-foreground uppercase font-bold block mb-1">Default Facility</label>
                <select
                  value={formData.defaultLocation}
                  onChange={(e) => setFormData({ ...formData, defaultLocation: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center gap-2 text-foreground font-bold uppercase">
              <AlertCircle className="size-4" />
              <span>Workspace Administration</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <p className="font-bold text-foreground uppercase">Export Organization Bundle</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  Generate an immutable backup archive of users, facilities, and inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportOrgData}
                className="px-4 py-2 rounded-full bg-secondary border border-border text-foreground font-bold uppercase hover:bg-secondary/80 transition-all cursor-pointer shrink-0 flex items-center gap-2"
              >
                <Download className="size-3.5" />
                <span>Export Bundle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Identity & Readiness */}
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs uppercase font-bold text-muted-foreground">
                Workspace Identity
              </span>
              <span className="px-3 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase">
                {workspaceStatus}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-secondary/50 border border-border">
                <p className="text-[10.5px] uppercase text-muted-foreground font-bold">Workspace Name</p>
                <p className="font-bold text-foreground font-display uppercase text-sm mt-0.5">{formData.orgName}</p>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/50 border border-border">
                <p className="text-[10.5px] uppercase text-muted-foreground font-bold">Workspace ID</p>
                <p className="font-bold text-foreground text-xs mt-0.5">{formData.workspaceId}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div className="p-2.5 rounded-2xl bg-secondary/50 border border-border">
                  <p className="text-muted-foreground font-bold uppercase">Created</p>
                  <p className="font-bold text-foreground mt-0.5">15 Aug 2026</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-secondary/50 border border-border">
                  <p className="text-muted-foreground font-bold uppercase">Mode</p>
                  <p className="font-bold text-foreground mt-0.5">Production</p>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 transition-colors duration-200 ern-card-glow">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs uppercase font-bold text-muted-foreground">
                Distribution
              </span>
              <Link to="/admin/locations" className="text-xs font-bold text-foreground hover:underline uppercase">
                Facilities →
              </Link>
            </div>

            <div className="space-y-3">
              {LOCATION_DISTRIBUTION.map((loc) => {
                const percentage = ((loc.count / TOTAL_INVENTORY_COUNT) * 100).toFixed(1);
                return (
                  <div key={loc.code} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-foreground uppercase">{loc.name}</span>
                      <span className="text-muted-foreground font-bold">{loc.count} ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-[#2F4156] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
