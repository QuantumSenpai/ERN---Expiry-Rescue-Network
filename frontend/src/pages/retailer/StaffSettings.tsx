import { useState } from "react";
import {
  Settings,
  Barcode,
  Clock,
  Printer,
  CheckCircle2,
  Save,
  Warehouse,
  Bell,
} from "lucide-react";

export default function StaffSettings() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings State
  const [stationConfig, setStationConfig] = useState({
    terminalId: "TERM-MUM-WH-04",
    facility: "Central Warehouse Facility (Mumbai)",
    assignedBay: "Bay D-04 (Cold Depot)",
    shift: "Morning (06:00 - 14:00)",
  });

  const [scannerConfig, setScannerConfig] = useState({
    soundOnScan: true,
    continuousScan: true,
    hapticFeedback: false,
    autoLookupBatch: true,
  });

  const [expiryThresholds, setExpiryThresholds] = useState({
    criticalDays: 3,
    highRiskDays: 7,
    mediumRiskDays: 14,
    autoQuarantineExpired: true,
  });

  const [printerConfig, setPrinterConfig] = useState({
    printerName: "Zebra ZD421 Thermal Barcode Printer",
    autoPrintRescueLabels: true,
    labelSize: "50mm x 25mm (Standard Lot Tag)",
    printCopies: 1,
  });

  const [notificationConfig, setNotificationConfig] = useState({
    expiryCrossAlert: true,
    procurementRequestAlert: true,
    clearanceApprovalAlert: true,
    soundAlerts: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Operations station settings saved successfully!");
  };

  return (
    <div className="space-y-6 pb-20 font-sans text-foreground">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-primary/50 shadow-2xl text-foreground font-sans text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="size-4 text-primary shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Settings className="size-4.5" />
            </div>
            <h1 className="font-display font-black text-xl sm:text-2xl tracking-tight uppercase">
              OPERATIONS STATION SETTINGS
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Configure local store hardware, scanner sensitivity, expiry warning horizons & label printers.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-muted-foreground">
            Station: <strong className="text-foreground">{stationConfig.terminalId}</strong>
          </span>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Assigned Station & Storage Facility */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4 ern-card-glow">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Warehouse className="size-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-foreground font-display">
                Assigned Station & Warehouse Bay
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Location bindings for stock receiving, transfers, and clearance lot staging.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground uppercase font-bold">Terminal ID</label>
              <input
                type="text"
                value={stationConfig.terminalId}
                onChange={(e) => setStationConfig({ ...stationConfig, terminalId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground uppercase font-bold">Operating Facility</label>
              <select
                value={stationConfig.facility}
                onChange={(e) => setStationConfig({ ...stationConfig, facility: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs focus:border-primary outline-none"
              >
                <option value="Central Warehouse Facility (Mumbai)">Central Warehouse Facility (Mumbai)</option>
                <option value="Store A - Koramangala Hub">Store A - Koramangala Hub</option>
                <option value="Store B - Whitefield Store">Store B - Whitefield Store</option>
                <option value="Distribution Center - North">Distribution Center - North</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground uppercase font-bold">Default Receiving Bay</label>
              <input
                type="text"
                value={stationConfig.assignedBay}
                onChange={(e) => setStationConfig({ ...stationConfig, assignedBay: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground uppercase font-bold">Current Shift</label>
              <input
                type="text"
                value={stationConfig.shift}
                onChange={(e) => setStationConfig({ ...stationConfig, shift: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Barcode Scanner & Handheld Device Preferences */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4 ern-card-glow">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="size-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Barcode className="size-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-foreground font-display">
                Barcode Scanner & Hardware Sensitivity
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Configure tethered optical scanner, handheld camera reader, and audio feedback.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Audio Beep on Successful Scan</span>
                <span className="text-[11px] text-muted-foreground">Play audible verification sound when batch code matches</span>
              </div>
              <input
                type="checkbox"
                checked={scannerConfig.soundOnScan}
                onChange={(e) => setScannerConfig({ ...scannerConfig, soundOnScan: e.target.checked })}
                className="accent-primary size-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Continuous Batch Scan Mode</span>
                <span className="text-[11px] text-muted-foreground">Automatically keep scanner active for rapid crate intake</span>
              </div>
              <input
                type="checkbox"
                checked={scannerConfig.continuousScan}
                onChange={(e) => setScannerConfig({ ...scannerConfig, continuousScan: e.target.checked })}
                className="accent-primary size-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Automatic Batch Record Lookup</span>
                <span className="text-[11px] text-muted-foreground">Populate product details instantly upon barcode scan</span>
              </div>
              <input
                type="checkbox"
                checked={scannerConfig.autoLookupBatch}
                onChange={(e) => setScannerConfig({ ...scannerConfig, autoLookupBatch: e.target.checked })}
                className="accent-primary size-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Haptic Feedback on Handheld POS</span>
                <span className="text-[11px] text-muted-foreground">Vibrate on mobile barcode acquisition</span>
              </div>
              <input
                type="checkbox"
                checked={scannerConfig.hapticFeedback}
                onChange={(e) => setScannerConfig({ ...scannerConfig, hapticFeedback: e.target.checked })}
                className="accent-primary size-4"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Expiry Risk Warning Horizon */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4 ern-card-glow">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="size-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-foreground font-display">
                Expiry Warning Horizons & Dynamic Triggers
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Thresholds for Critical, High Risk, and Rescue deal trigger recommendations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-secondary border border-border space-y-1.5">
              <label className="text-[10.5px] uppercase font-bold text-rose-500 block">Critical Horizon (Days)</label>
              <input
                type="number"
                min={1}
                max={7}
                value={expiryThresholds.criticalDays}
                onChange={(e) => setExpiryThresholds({ ...expiryThresholds, criticalDays: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border font-bold text-sm text-foreground focus:border-rose-500 outline-none"
              />
              <span className="text-[10px] text-muted-foreground block">Immediate clearance / quarantine</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary border border-border space-y-1.5">
              <label className="text-[10.5px] uppercase font-bold text-amber-500 block">High Risk Horizon (Days)</label>
              <input
                type="number"
                min={3}
                max={14}
                value={expiryThresholds.highRiskDays}
                onChange={(e) => setExpiryThresholds({ ...expiryThresholds, highRiskDays: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border font-bold text-sm text-foreground focus:border-amber-500 outline-none"
              />
              <span className="text-[10px] text-muted-foreground block">Recommend dynamic rescue deal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary border border-border space-y-1.5">
              <label className="text-[10.5px] uppercase font-bold text-primary block">Medium Watchlist (Days)</label>
              <input
                type="number"
                min={7}
                max={30}
                value={expiryThresholds.mediumRiskDays}
                onChange={(e) => setExpiryThresholds({ ...expiryThresholds, mediumRiskDays: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl bg-card border border-border font-bold text-sm text-foreground focus:border-primary outline-none"
              />
              <span className="text-[10px] text-muted-foreground block">Active radar monitoring</span>
            </div>
          </div>
        </div>

        {/* Section 4: Label & Thermal Printer Profile */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4 ern-card-glow">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="size-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
              <Printer className="size-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-foreground font-display">
                Label & Thermal Slip Printer Profile
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Hardware profiles for printing dynamic rescue tags, lot barcodes, and shipment slips.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground uppercase font-bold">Connected Printer</label>
              <input
                type="text"
                value={printerConfig.printerName}
                onChange={(e) => setPrinterConfig({ ...printerConfig, printerName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground uppercase font-bold">Label Dimensions</label>
              <select
                value={printerConfig.labelSize}
                onChange={(e) => setPrinterConfig({ ...printerConfig, labelSize: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs focus:border-primary outline-none"
              >
                <option value="50mm x 25mm (Standard Lot Tag)">50mm x 25mm (Standard Lot Tag)</option>
                <option value="100mm x 50mm (Clearance Crate Tag)">100mm x 50mm (Clearance Crate Tag)</option>
                <option value="80mm Thermal Slip (Inbound Receipt)">80mm Thermal Slip (Inbound Receipt)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Operational Notifications & Alerts */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4 ern-card-glow">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="size-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
              <Bell className="size-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-foreground font-display">
                Operational Shift & Push Notifications
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Real-time alerts for replenishment requisitions, expiry breaches, and clearance approvals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Critical Expiry Cross-Threshold Alert</span>
                <span className="text-[11px] text-muted-foreground">Notify immediately when lots enter &lt; 3 days window</span>
              </div>
              <input
                type="checkbox"
                checked={notificationConfig.expiryCrossAlert}
                onChange={(e) => setNotificationConfig({ ...notificationConfig, expiryCrossAlert: e.target.checked })}
                className="accent-primary size-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Inbound Procurement Delivery Notice</span>
                <span className="text-[11px] text-muted-foreground">Alert when supplier shipments arrive at receiving bay</span>
              </div>
              <input
                type="checkbox"
                checked={notificationConfig.procurementRequestAlert}
                onChange={(e) => setNotificationConfig({ ...notificationConfig, procurementRequestAlert: e.target.checked })}
                className="accent-primary size-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Clearance Deal Publication Confirmation</span>
                <span className="text-[11px] text-muted-foreground">Receive confirmation ping upon rescue deal publication</span>
              </div>
              <input
                type="checkbox"
                checked={notificationConfig.clearanceApprovalAlert}
                onChange={(e) => setNotificationConfig({ ...notificationConfig, clearanceApprovalAlert: e.target.checked })}
                className="accent-primary size-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Terminal Sound Alerts</span>
                <span className="text-[11px] text-muted-foreground">Play audible chimes for critical operational events</span>
              </div>
              <input
                type="checkbox"
                checked={notificationConfig.soundAlerts}
                onChange={(e) => setNotificationConfig({ ...notificationConfig, soundAlerts: e.target.checked })}
                className="accent-primary size-4"
              />
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border font-mono text-xs">
          <button
            type="button"
            onClick={() => showToast("Restored station defaults.")}
            className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground font-semibold cursor-pointer transition-colors"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Save className="size-4" />
            <span>Save Station Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
