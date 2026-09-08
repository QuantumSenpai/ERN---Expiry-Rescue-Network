import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Key,
  Shield,
  Smartphone,
  LogOut,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  X,
  Heart,
  BellRing,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart, type SavedAddress } from "@/context/CartContext";
import AnimatedNumber from "@/components/AnimatedNumber";

type ActiveTab = "all" | "personal" | "security" | "preferences" | "journey";

export interface NotificationPreferences {
  orderUpdatesEmail: boolean;
  orderUpdatesSms: boolean;
  orderUpdatesWhatsapp: boolean;
  rescueAlertsEmail: boolean;
  rescueAlertsWhatsapp: boolean;
  promoOffersEmail: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  orderUpdatesEmail: true,
  orderUpdatesSms: true,
  orderUpdatesWhatsapp: true,
  rescueAlertsEmail: true,
  rescueAlertsWhatsapp: false,
  promoOffersEmail: false,
};

const STORAGE_KEY = "ern_customer_notification_preferences";

export default function Profile() {
  const { user, logout } = useAuth();
  const {
    addresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
  } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(saved) };
    } catch (e) {
      // fallback
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      showToast("Notification preference updated and saved.");
      return updated;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || "Alex Chen",
    email: user?.email || "alex@ern-network.com",
    phone: "+91 98765 43210",
  });
  const [tempInfo, setTempInfo] = useState({ ...personalInfo });

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    type: "Home" as "Home" | "Warehouse" | "Office",
    recipientName: "Alex Chen",
    tagline: "Primary Residence",
    addressLine1: "",
    addressLine2: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    phone: "+91 98765 43210",
    isDefault: false,
  });

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalInfo({ ...tempInfo });
    setIsEditingInfo(false);
    showToast("Profile credentials updated.");
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      type: "Home",
      recipientName: personalInfo.fullName,
      tagline: "New Address",
      addressLine1: "",
      addressLine2: "",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      phone: personalInfo.phone,
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.addressLine1.trim() || !addressForm.pincode.trim()) {
      showToast("Please fill all required address fields.");
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
      showToast("Address updated successfully.");
    } else {
      addAddress(addressForm);
      showToast("Address added successfully.");
    }
    setAddressModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body py-8 px-4 sm:px-6 lg:px-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-card border border-border shadow-none text-foreground font-mono text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-foreground shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Identity Card */}
        <div className="bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 sm:p-8 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-20 rounded-full bg-primary text-primary-foreground font-display text-3xl font-[350] flex items-center justify-center">
              {personalInfo.fullName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-display font-[350] text-foreground">
                  {personalInfo.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-mono text-xs font-medium uppercase">
                  Verified Saver
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-1">{personalInfo.email} · {personalInfo.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="px-5 py-2.5 rounded-full bg-card hover:bg-[#c4c7c4]/40 text-foreground font-mono text-xs font-medium uppercase cursor-pointer flex items-center gap-2 transition-colors"
            >
              <LogOut className="size-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* ESG & Savings Band */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-none flex flex-col justify-between">
            <span className="text-xs uppercase font-medium text-muted-foreground">Total Savings</span>
            <p className="text-3xl font-[350] font-display text-foreground mt-2">₹1,450</p>
            <p className="text-[11px] text-muted-foreground font-body mt-0.5">Discounted perishable goods</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-none flex flex-col justify-between">
            <span className="text-xs uppercase font-medium text-muted-foreground">Items Rescued</span>
            <p className="text-3xl font-[350] font-display text-foreground mt-2">18 Lots</p>
            <p className="text-[11px] text-muted-foreground font-body mt-0.5">Prevented from waste</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-none flex flex-col justify-between">
            <span className="text-xs uppercase font-medium text-foreground">CO₂ Offsets</span>
            <p className="text-3xl font-[350] font-display text-foreground mt-2">12.4 kg</p>
            <p className="text-[11px] text-muted-foreground font-body mt-0.5">Carbon footprint reduced</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
          {[
            { label: "All Settings", value: "all" },
            { label: "Personal Information", value: "personal" },
            { label: "Delivery Addresses", value: "journey" },
            { label: "Notification Preferences", value: "preferences" },
            { label: "Security & Passwords", value: "security" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as ActiveTab)}
              className={`px-4 py-2 rounded-full uppercase transition-all cursor-pointer ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          {(activeTab === "all" || activeTab === "personal") && (
            <div className="bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 shadow-none font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="font-display text-xl font-[350] text-foreground">Personal Credentials</h2>
                <button
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                  className="px-3.5 py-1.5 rounded-full bg-card hover:bg-[#c4c7c4]/40 text-foreground font-medium uppercase cursor-pointer"
                >
                  {isEditingInfo ? "Cancel" : "Edit Details"}
                </button>
              </div>

              {isEditingInfo ? (
                <form onSubmit={handleSaveInfo} className="space-y-3">
                  <div>
                    <label className="text-muted-foreground uppercase font-medium block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={tempInfo.fullName}
                      onChange={(e) => setTempInfo({ ...tempInfo, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-transparent focus:border-primary text-foreground font-sans text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground uppercase font-medium block mb-1">Email</label>
                    <input
                      type="email"
                      value={tempInfo.email}
                      onChange={(e) => setTempInfo({ ...tempInfo, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-transparent focus:border-primary text-foreground font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground uppercase font-medium block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={tempInfo.phone}
                      onChange={(e) => setTempInfo({ ...tempInfo, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-transparent focus:border-primary text-foreground font-mono text-xs outline-none"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium uppercase hover:bg-[#567C8D] cursor-pointer shadow-none"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-card">
                    <span className="text-muted-foreground uppercase text-[10px] block">Full Name</span>
                    <p className="font-[350] text-foreground text-sm font-display mt-0.5">{personalInfo.fullName}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-card">
                    <span className="text-muted-foreground uppercase text-[10px] block">Email Address</span>
                    <p className="font-medium text-foreground mt-0.5">{personalInfo.email}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-card">
                    <span className="text-muted-foreground uppercase text-[10px] block">Phone Contact</span>
                    <p className="font-medium text-foreground mt-0.5">{personalInfo.phone}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delivery Addresses */}
          {(activeTab === "all" || activeTab === "journey") && (
            <div className="bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 shadow-none font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="font-display text-xl font-[350] text-foreground">Delivery Locations</h2>
                <button
                  onClick={handleOpenAddAddress}
                  className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground font-medium uppercase hover:bg-[#567C8D] cursor-pointer shadow-none flex items-center gap-1"
                >
                  <Plus className="size-3.5" />
                  <span>Add Address</span>
                </button>
              </div>

              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center">No addresses saved yet.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="p-4 rounded-xl bg-card flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground uppercase">{addr.type}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-foreground font-body text-xs mt-1">{addr.addressLine1}, {addr.city} {addr.pincode}</p>
                        <p className="text-muted-foreground text-[11px] mt-0.5">Contact: {addr.phone}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeAddress(addr.id)}
                          className="p-2 rounded-full bg-background hover:bg-[#c4c7c4]/40 text-foreground cursor-pointer transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Notification Preferences Card (CRIT-09) */}
          {(activeTab === "all" || activeTab === "preferences") && (
            <div className="bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 shadow-none font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <BellRing className="size-4 text-primary" />
                  <h2 className="font-display text-xl font-[350] text-foreground">Notification Preferences</h2>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase">Synced Locally</span>
              </div>

              <div className="space-y-3 font-sans">
                <div className="p-3.5 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-xs">Order Updates via Email</p>
                    <p className="text-muted-foreground text-[11px]">Real-time rescue tracking receipts and order changes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.orderUpdatesEmail}
                    onChange={() => toggleNotification("orderUpdatesEmail")}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-xs">Order Updates via SMS</p>
                    <p className="text-muted-foreground text-[11px]">Dispatch OTPs and immediate delivery alerts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.orderUpdatesSms}
                    onChange={() => toggleNotification("orderUpdatesSms")}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-xs">WhatsApp Live Delivery Pass</p>
                    <p className="text-muted-foreground text-[11px]">Instant live map link and verified digital invoice</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.orderUpdatesWhatsapp}
                    onChange={() => toggleNotification("orderUpdatesWhatsapp")}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-xs">Flash Rescue Expiry Alerts</p>
                    <p className="text-muted-foreground text-[11px]">Notify when items near you reach &gt;60% clearance discounts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.rescueAlertsEmail}
                    onChange={() => toggleNotification("rescueAlertsEmail")}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-xs">WhatsApp Perishable Deals</p>
                    <p className="text-muted-foreground text-[11px]">Daily 8 PM anti-waste discount digest</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.rescueAlertsWhatsapp}
                    onChange={() => toggleNotification("rescueAlertsWhatsapp")}
                    className="size-4 rounded accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Card */}
          {(activeTab === "all" || activeTab === "security") && (
            <div className="bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 shadow-none font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <h2 className="font-display text-xl font-[350] text-foreground">Security & Password</h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium uppercase">
                  Protected
                </span>
              </div>

              <div className="space-y-3 font-sans">
                <div className="p-3.5 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-xs">Two-Factor Authentication (2FA)</p>
                    <p className="text-muted-foreground text-[11px]">SMS and Authenticator app verification on sign in</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground text-[11px] font-mono font-medium">
                    Active
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-xs">Active Web Session</p>
                    <p className="text-muted-foreground text-[11px]">Signed in via Secure ERN Session Token</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-500 font-bold">This Device</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-mono text-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 shadow-none text-foreground space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-[350] text-xl uppercase text-foreground">New Delivery Address</h3>
              <button onClick={() => setAddressModalOpen(false)} className="p-1 text-foreground cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="text-muted-foreground uppercase font-medium block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="Flat / House No / Road"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-transparent focus:border-primary text-foreground font-sans text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground uppercase font-medium block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-transparent focus:border-primary text-foreground font-sans text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground uppercase font-medium block mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-card border border-transparent focus:border-primary text-foreground font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-card hover:bg-[#c4c7c4]/40 text-foreground uppercase font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground uppercase font-medium hover:bg-[#567C8D] cursor-pointer shadow-none"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
