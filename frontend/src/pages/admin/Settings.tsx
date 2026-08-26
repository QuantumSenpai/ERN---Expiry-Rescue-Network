import { useState, useMemo, useRef } from "react";
import {
  Sliders,
  Bell,
  Clock,
  ShieldCheck,
  Lock,
  Palette,
  Database,
  Save,
  RotateCcw,
  CheckCircle2,
  Download,
  Upload,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export type SettingsTab =
  | "general"
  | "notifications"
  | "expiry"
  | "workflow"
  | "security"
  | "appearance"
  | "data";

export interface WorkspaceSettingsState {
  workspaceName: string;
  defaultLanguage: string;
  timeZone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  defaultLandingPage: string;
  supportEmail: string;

  criticalExpiryAlerts: boolean;
  highRiskExpiryAlerts: boolean;
  lowStockAlerts: boolean;
  outOfStockAlerts: boolean;
  supplierAlerts: boolean;
  approvalAlerts: boolean;
  systemNotifications: boolean;
  deliveryInApp: boolean;
  deliveryEmail: boolean;
  deliveryBrowser: boolean;

  expiryTrackingEnabled: boolean;
  warningThresholdDays: number;
  urgentThresholdDays: number;
  criticalThresholdDays: number;
  lowStockAlertsEnabled: boolean;
  overstockMonitoringEnabled: boolean;
  batchTrackingEnabled: boolean;

  stockAdjustmentApproval: "Manager Approval" | "Admin Approval" | "Disabled";
  transferApproval: "Manager Approval" | "Admin Approval" | "Disabled";
  purchaseOrderApproval: "Manager Approval" | "Admin Approval" | "Disabled";
  clearanceApproval: "Manager Approval" | "Admin Approval" | "Disabled";
  fefoDispatchApproval: "Manager Approval" | "Admin Approval" | "Disabled";

  sessionTimeout: string;
  loginNotifications: boolean;
  twoFactorAuth: boolean;
  passwordPolicy: "Strict (12+ chars, symbols)" | "Standard (8+ chars)" | "Basic";
  auditLogging: boolean;

  theme: "dark" | "light" | "system";
  compactMode: boolean;
  reduceMotion: boolean;
  sidebarBehavior: "Expanded" | "Auto-collapse" | "Slim Icons";
}

const DEFAULT_SETTINGS: WorkspaceSettingsState = {
  workspaceName: "Expiry Rescue Network (ERN)",
  defaultLanguage: "English (US)",
  timeZone: "Asia/Kolkata (IST, UTC+5:30)",
  currency: "INR (₹)",
  dateFormat: "DD MMM YYYY",
  numberFormat: "Indian (1,00,000.00)",
  defaultLandingPage: "Admin Overview",
  supportEmail: "admin@greenleafretail.com",

  criticalExpiryAlerts: true,
  highRiskExpiryAlerts: true,
  lowStockAlerts: true,
  outOfStockAlerts: true,
  supplierAlerts: true,
  approvalAlerts: true,
  systemNotifications: false,
  deliveryInApp: true,
  deliveryEmail: true,
  deliveryBrowser: false,

  expiryTrackingEnabled: true,
  warningThresholdDays: 30,
  urgentThresholdDays: 14,
  criticalThresholdDays: 7,
  lowStockAlertsEnabled: true,
  overstockMonitoringEnabled: true,
  batchTrackingEnabled: true,

  stockAdjustmentApproval: "Manager Approval",
  transferApproval: "Manager Approval",
  purchaseOrderApproval: "Manager Approval",
  clearanceApproval: "Manager Approval",
  fefoDispatchApproval: "Manager Approval",

  sessionTimeout: "30 minutes",
  loginNotifications: true,
  twoFactorAuth: false,
  passwordPolicy: "Strict (12+ chars, symbols)",
  auditLogging: true,

  theme: "light",
  compactMode: false,
  reduceMotion: false,
  sidebarBehavior: "Expanded",
};

export default function Settings() {
  const { setThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [savedSettings, setSavedSettings] = useState<WorkspaceSettingsState>(() => {
    const cached = localStorage.getItem("ern-workspace-settings");
    if (cached) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [formData, setFormData] = useState<WorkspaceSettingsState>(savedSettings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivateInput, setDeactivateInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(savedSettings) !== JSON.stringify(formData);
  }, [savedSettings, formData]);

  const handleSave = () => {
    setSavedSettings(formData);
    localStorage.setItem("ern-workspace-settings", JSON.stringify(formData));
    showToast("Saved! Your settings are now live.");
  };

  const handleDiscard = () => {
    setFormData(savedSettings);
    showToast("Changes undone.");
  };

  const handleConfirmReset = () => {
    setFormData(DEFAULT_SETTINGS);
    setSavedSettings(DEFAULT_SETTINGS);
    localStorage.setItem("ern-workspace-settings", JSON.stringify(DEFAULT_SETTINGS));
    setIsResetModalOpen(false);
    showToast("Back to default settings.");
  };

  const handleThemeChange = (theme: "dark" | "light" | "system") => {
    setFormData((prev) => ({ ...prev, theme }));
    setThemeMode(theme);
    showToast(`Switched to ${theme} mode.`);
  };

  const handleToggleCompactMode = () => {
    const next = !formData.compactMode;
    setFormData((prev) => ({ ...prev, compactMode: next }));
    if (next) {
      document.documentElement.classList.add("compact-density");
      showToast("Compact view turned on.");
    } else {
      document.documentElement.classList.remove("compact-density");
      showToast("Normal spacing restored.");
    }
  };

  const handleToggleReduceMotion = () => {
    const next = !formData.reduceMotion;
    setFormData((prev) => ({ ...prev, reduceMotion: next }));
    if (next) {
      document.documentElement.classList.add("reduce-motion");
      showToast("Animations reduced.");
    } else {
      document.documentElement.classList.remove("reduce-motion");
      showToast("Animations restored.");
    }
  };

  const [openExportMenu, setOpenExportMenu] = useState<string | null>(null);

  const handleExportData = (dataType: string, format: string) => {
    setOpenExportMenu(null);
    showToast(`${dataType} exported as ${format.toUpperCase()}.`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`"${file.name}" uploaded. Review it before it goes live.`);
    }
    e.target.value = "";
  };

  const handleSignOut = () => {
    setIsSignoutModalOpen(false);
    showToast("Signed out. Redirecting to login...");
  };

  const isDeactivateConfirmed = deactivateInput.trim().toUpperCase() === "DEACTIVATE";

  const handleDeactivate = () => {
    if (!isDeactivateConfirmed) return;
    setIsDeactivateModalOpen(false);
    setDeactivateInput("");
    showToast("Workspace deactivated.");
  };

  const NAV_ITEMS: { id: SettingsTab; label: string; icon: typeof Sliders; desc: string }[] = [
    { id: "general", label: "General", icon: Sliders, desc: "Name, language, region" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "What alerts you get" },
    { id: "expiry", label: "Expiry Rules", icon: Clock, desc: "When items count as urgent" },
    { id: "workflow", label: "Approvals", icon: ShieldCheck, desc: "Who signs off on what" },
    { id: "security", label: "Security", icon: Lock, desc: "Login, sessions, account" },
    { id: "appearance", label: "Appearance", icon: Palette, desc: "Light, dark, and layout" },
    { id: "data", label: "Data & Backups", icon: Database, desc: "Import and export data" },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
        checked ? "bg-primary" : "bg-secondary"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 max-w-[1400px] pb-24 text-foreground font-body">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase mb-2">
            <span>Workspace</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase text-foreground leading-[0.92] tracking-tight">
            SETTINGS
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Set up how your workspace works, looks, and keeps things safe.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap font-mono text-xs font-bold uppercase">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset to Default</span>
          </button>

          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              className="px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer"
            >
              <span>Undo Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all shadow-none ${
              hasUnsavedChanges
                ? "bg-primary text-primary-foreground hover:bg-[#567C8D] cursor-pointer active:scale-95"
                : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Save className="size-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Unsaved changes notice */}
      {hasUnsavedChanges && (
        <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border text-xs font-mono font-bold flex items-center gap-2.5 text-foreground">
          <AlertTriangle className="size-4 shrink-0" />
          <span>You have unsaved changes. Click "Save Changes" or they'll be lost.</span>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Menu */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1.5 p-3 rounded-[24px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none transition-colors duration-200">
          <div className="px-3 py-2 text-[10.5px] uppercase font-bold text-muted-foreground">
            Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className="size-4 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold leading-none uppercase">{item.label}</p>
                  <p
                    className={`text-[10px] mt-1 truncate font-sans ${
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* General */}
          {activeTab === "general" && (
            <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 font-mono text-xs transition-colors duration-200 ern-card-glow">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <Sliders className="size-5 text-foreground" />
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-foreground">General</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Basic info about your workspace and how it's displayed.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={formData.workspaceName}
                    onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-sans"
                  />
                  <p className="text-[10px] text-muted-foreground font-sans mt-1 normal-case">
                    Where users write to for help.
                  </p>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Language
                  </label>
                  <select
                    value={formData.defaultLanguage}
                    onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary font-bold"
                  >
                    <option value="INR (₹)">INR (₹) — Indian Rupee</option>
                    <option value="USD ($)">USD ($) — US Dollar</option>
                    <option value="EUR (€)">EUR (€) — Euro</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Timezone
                  </label>
                  <select
                    value={formData.timeZone}
                    onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    <option value="Asia/Kolkata (IST, UTC+5:30)">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-bold block mb-1">
                    Date Format
                  </label>
                  <select
                    value={formData.dateFormat}
                    onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    <option value="DD MMM YYYY">DD MMM YYYY (12 Aug 2026)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 font-mono text-xs transition-colors duration-200 ern-card-glow">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <Bell className="size-5 text-foreground" />
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-foreground">Notifications</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Choose which events send you an alert.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: "criticalExpiryAlerts" as const, title: "Items Expiring in 7 Days or Less" },
                  { key: "highRiskExpiryAlerts" as const, title: "Items Expiring in 8–14 Days" },
                  { key: "lowStockAlerts" as const, title: "Stock Running Low" },
                  { key: "outOfStockAlerts" as const, title: "Item Completely Out of Stock" },
                  { key: "approvalAlerts" as const, title: "Something Needs My Approval" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border"
                  >
                    <span className="font-bold text-foreground uppercase">{item.title}</span>
                    <Toggle
                      checked={formData[item.key]}
                      onChange={() =>
                        setFormData({ ...formData, [item.key]: !formData[item.key] })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground uppercase font-bold text-[10.5px] block mb-2">
                  How should we notify you?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "deliveryInApp" as const, label: "In the App" },
                    { key: "deliveryEmail" as const, label: "By Email" },
                    { key: "deliveryBrowser" as const, label: "Browser Pop-up" },
                  ].map((d) => (
                    <div
                      key={d.key}
                      className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border"
                    >
                      <span className="font-bold text-foreground uppercase text-[11px]">{d.label}</span>
                      <Toggle
                        checked={formData[d.key]}
                        onChange={() => setFormData({ ...formData, [d.key]: !formData[d.key] })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expiry Rules */}
          {activeTab === "expiry" && (
            <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 font-mono text-xs transition-colors duration-200 ern-card-glow">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <Clock className="size-5 text-foreground" />
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-foreground">Expiry Rules</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Decide how many days before expiry an item becomes urgent.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                  <span className="text-muted-foreground uppercase text-[10.5px] font-bold block">
                    Critical — Act Now
                  </span>
                  <input
                    type="number"
                    value={formData.criticalThresholdDays}
                    onChange={(e) =>
                      setFormData({ ...formData, criticalThresholdDays: parseInt(e.target.value) || 7 })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none"
                  />
                  <span className="text-[10.5px] text-muted-foreground font-bold block">
                    Days left when it's this urgent
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                  <span className="text-muted-foreground uppercase text-[10.5px] font-bold block">
                    Urgent — Plan Soon
                  </span>
                  <input
                    type="number"
                    value={formData.urgentThresholdDays}
                    onChange={(e) =>
                      setFormData({ ...formData, urgentThresholdDays: parseInt(e.target.value) || 14 })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none"
                  />
                  <span className="text-[10.5px] text-muted-foreground font-bold block">
                    Days left when it's this urgent
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                  <span className="text-muted-foreground uppercase text-[10.5px] font-bold block">
                    Warning — Keep an Eye
                  </span>
                  <input
                    type="number"
                    value={formData.warningThresholdDays}
                    onChange={(e) =>
                      setFormData({ ...formData, warningThresholdDays: parseInt(e.target.value) || 30 })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none"
                  />
                  <span className="text-[10.5px] text-muted-foreground font-bold block">
                    Days left when it's this urgent
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: "lowStockAlertsEnabled" as const, title: "Flag Items Running Low" },
                  { key: "overstockMonitoringEnabled" as const, title: "Flag Items Over-Stocked" },
                  { key: "batchTrackingEnabled" as const, title: "Track Items by Batch / Lot" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border"
                  >
                    <span className="font-bold text-foreground uppercase">{item.title}</span>
                    <Toggle
                      checked={formData[item.key]}
                      onChange={() =>
                        setFormData({ ...formData, [item.key]: !formData[item.key] })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approvals */}
          {activeTab === "workflow" && (
            <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 font-mono text-xs transition-colors duration-200 ern-card-glow">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <ShieldCheck className="size-5 text-foreground" />
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-foreground">Approvals</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Decide who needs to sign off before an action goes through.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: "stockAdjustmentApproval" as const, title: "Changing Stock Numbers" },
                  { key: "transferApproval" as const, title: "Moving Stock Between Locations" },
                  { key: "purchaseOrderApproval" as const, title: "Placing a Purchase Order" },
                  { key: "clearanceApproval" as const, title: "Marking Items for Clearance" },
                  { key: "fefoDispatchApproval" as const, title: "Dispatching Oldest Stock First" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border gap-3"
                  >
                    <span className="font-bold text-foreground uppercase">{item.title}</span>
                    <select
                      value={formData[item.key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [item.key]: e.target.value as any })
                      }
                      className="bg-background border border-border rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold text-foreground outline-none cursor-pointer"
                    >
                      <option value="Manager Approval">Manager must approve</option>
                      <option value="Admin Approval">Admin must approve</option>
                      <option value="Disabled">No approval needed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 font-mono text-xs transition-colors duration-200 ern-card-glow">
                <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                  <Lock className="size-5 text-foreground" />
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase text-foreground">Security</h3>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      Keep your account and workspace safe.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">
                      Log Me Out After Inactivity
                    </label>
                    <select
                      value={formData.sessionTimeout}
                      onChange={(e) => setFormData({ ...formData, sessionTimeout: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    >
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground uppercase font-bold block mb-1">
                      Password Strength Required
                    </label>
                    <select
                      value={formData.passwordPolicy}
                      onChange={(e) => setFormData({ ...formData, passwordPolicy: e.target.value as any })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                    >
                      <option value="Strict (12+ chars, symbols)">Strict (12+ characters, symbols)</option>
                      <option value="Standard (8+ chars)">Standard (8+ characters)</option>
                      <option value="Basic">Basic</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                    <div>
                      <span className="font-bold text-foreground uppercase block">
                        Two-Factor Login
                      </span>
                      <span className="text-[10.5px] text-muted-foreground font-sans normal-case">
                        Ask for a code in addition to password at login.
                      </span>
                    </div>
                    <Toggle
                      checked={formData.twoFactorAuth}
                      onChange={() => setFormData({ ...formData, twoFactorAuth: !formData.twoFactorAuth })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                    <div>
                      <span className="font-bold text-foreground uppercase block">
                        Alert Me on New Logins
                      </span>
                      <span className="text-[10.5px] text-muted-foreground font-sans normal-case">
                        Notify when someone logs in from a new device.
                      </span>
                    </div>
                    <Toggle
                      checked={formData.loginNotifications}
                      onChange={() =>
                        setFormData({ ...formData, loginNotifications: !formData.loginNotifications })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                    <div>
                      <span className="font-bold text-foreground uppercase block">
                        Keep Activity Logs
                      </span>
                      <span className="text-[10.5px] text-muted-foreground font-sans normal-case">
                        Record who did what, for audits later.
                      </span>
                    </div>
                    <Toggle
                      checked={formData.auditLogging}
                      onChange={() => setFormData({ ...formData, auditLogging: !formData.auditLogging })}
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-destructive/40 space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2.5 pb-4 border-b border-destructive/20">
                  <AlertTriangle className="size-5 text-destructive" />
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase text-foreground">Danger Zone</h3>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      These actions are hard to undo — be careful.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div>
                    <span className="font-bold text-foreground uppercase block">Sign Out</span>
                    <span className="text-[10.5px] text-muted-foreground font-sans normal-case">
                      Sign out of this device right now.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSignoutModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground uppercase font-bold cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    Sign Out
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-destructive/10 border border-destructive/30">
                  <div>
                    <span className="font-bold text-destructive uppercase block">Deactivate Workspace</span>
                    <span className="text-[10.5px] text-muted-foreground font-sans normal-case">
                      Shuts down access for everyone. This cannot be undone.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeactivateModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground uppercase font-bold cursor-pointer hover:opacity-90"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 font-mono text-xs transition-colors duration-200 ern-card-glow">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <Palette className="size-5 text-foreground" />
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-foreground">Appearance</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Pick how the app looks and feels.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  { id: "light" as const, label: "Light", icon: Sun },
                  { id: "dark" as const, label: "Dark", icon: Moon },
                  { id: "system" as const, label: "Match Device", icon: Monitor },
                ].map((themeOpt) => {
                  const Icon = themeOpt.icon;
                  const isSelected = formData.theme === themeOpt.id;
                  return (
                    <div
                      key={themeOpt.id}
                      onClick={() => handleThemeChange(themeOpt.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-[#2F4156]"
                          : "bg-secondary/50 border-border text-foreground hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <span className="font-bold uppercase text-xs">{themeOpt.label}</span>
                      </div>
                      {isSelected && <Check className="size-4" />}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div>
                    <span className="font-bold text-foreground uppercase block">Compact View</span>
                    <span className="text-[10.5px] text-muted-foreground font-sans normal-case">
                      Fit more on screen with tighter spacing.
                    </span>
                  </div>
                  <Toggle checked={formData.compactMode} onChange={handleToggleCompactMode} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div>
                    <span className="font-bold text-foreground uppercase block">Reduce Motion</span>
                    <span className="text-[10.5px] text-muted-foreground font-sans normal-case">
                      Turn off animations if they bother you.
                    </span>
                  </div>
                  <Toggle checked={formData.reduceMotion} onChange={handleToggleReduceMotion} />
                </div>

                <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                  <label className="text-muted-foreground uppercase font-bold block mb-2">
                    Sidebar Style
                  </label>
                  <select
                    value={formData.sidebarBehavior}
                    onChange={(e) =>
                      setFormData({ ...formData, sidebarBehavior: e.target.value as any })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-primary"
                  >
                    <option value="Expanded">Always show full sidebar</option>
                    <option value="Auto-collapse">Collapse on small screens</option>
                    <option value="Slim Icons">Icons only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Data & Backups */}
          {activeTab === "data" && (
            <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] dark:hover:border-[#2F4156] shadow-none space-y-6 font-mono text-xs transition-colors duration-200 ern-card-glow">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <Database className="size-5 text-foreground" />
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-foreground">Data & Backups</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Download your data, or bring in data from a file.
                  </p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground uppercase font-bold text-[10.5px] block mb-2">
                  Download
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Full Inventory List", formats: ["CSV", "Excel", "PDF"] },
                    { title: "Activity & Audit Logs", formats: ["CSV", "Excel", "PDF"] },
                    { title: "Expiry Report", formats: ["CSV", "Excel", "PDF"] },
                    { title: "Supplier & Order History", formats: ["CSV", "Excel", "PDF", "Word"] },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2"
                    >
                      <p className="font-bold text-foreground uppercase">{item.title}</p>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenExportMenu(openExportMenu === item.title ? null : item.title)
                        }
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        Choose Format
                      </button>

                      {openExportMenu === item.title && (
                        <div className="rounded-xl bg-card border border-[#2F4156] dark:border-[rgba(47,65,86,0.15)] p-1.5 grid grid-cols-2 gap-1">
                          {item.formats.map((fmt) => (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => handleExportData(item.title, fmt)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground text-[11px] font-bold uppercase hover:bg-secondary/60 cursor-pointer"
                            >
                              <Download className="size-3" />
                              {fmt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground uppercase font-bold text-[10.5px] block mb-2">
                  Upload
                </span>
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground uppercase">Import Inventory (CSV)</p>
                    <p className="text-[10.5px] text-muted-foreground font-sans normal-case mt-0.5">
                      Bring in stock data from a spreadsheet.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleImportClick}
                    className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-bold hover:bg-[#567C8D] cursor-pointer shrink-0"
                  >
                    <Upload className="size-3.5" />
                    Choose File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none space-y-4 text-foreground">
            <h3 className="font-display text-xl font-bold uppercase text-foreground">Reset everything?</h3>
            <p className="text-xs text-muted-foreground font-body">
              This brings back ERN's original default settings and undoes your changes.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-full bg-secondary text-foreground uppercase font-bold cursor-pointer hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-bold cursor-pointer hover:bg-[#567C8D]"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Modal */}
      {isSignoutModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-[24px] sm:rounded-[32px] p-6 shadow-none space-y-4 text-foreground">
            <h3 className="font-display text-xl font-bold uppercase text-foreground">Sign out?</h3>
            <p className="text-xs text-muted-foreground font-body">
              You'll need to log in again to access this workspace.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsSignoutModalOpen(false)}
                className="px-4 py-2 rounded-full bg-secondary text-foreground uppercase font-bold cursor-pointer hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-bold cursor-pointer hover:bg-[#567C8D]"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-xs font-mono text-xs">
          <div className="w-full max-w-md bg-card border border-destructive/40 rounded-[24px] sm:rounded-[32px] p-6 shadow-none space-y-4 text-foreground">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="size-5 text-destructive" />
              <h3 className="font-display text-xl font-bold uppercase text-foreground">Deactivate workspace?</h3>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              Everyone loses access immediately. This cannot be undone. Type{" "}
              <span className="font-bold text-foreground">DEACTIVATE</span> to confirm.
            </p>
            <input
              type="text"
              value={deactivateInput}
              onChange={(e) => setDeactivateInput(e.target.value)}
              placeholder="Type DEACTIVATE"
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground outline-none focus:border-destructive font-sans"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsDeactivateModalOpen(false);
                  setDeactivateInput("");
                }}
                className="px-4 py-2 rounded-full bg-secondary text-foreground uppercase font-bold cursor-pointer hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={!isDeactivateConfirmed}
                className={`px-5 py-2 rounded-full uppercase font-bold ${
                  isDeactivateConfirmed
                    ? "bg-destructive text-destructive-foreground cursor-pointer hover:opacity-90"
                    : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                }`}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}