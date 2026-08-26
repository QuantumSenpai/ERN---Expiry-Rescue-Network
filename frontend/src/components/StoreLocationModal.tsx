import { useState } from "react";
import { STORES_DATA } from "@/data/storesData";
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  User,
  Layers,
  ShoppingBag,
  CheckCircle2,
  X,
  ExternalLink,
  Store,
} from "lucide-react";

interface StoreLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStoreId?: string;
  onSelectStore: (storeId: string, storeName: string) => void;
}

export default function StoreLocationModal({
  isOpen,
  onClose,
  selectedStoreId = "all",
  onSelectStore,
}: StoreLocationModalProps) {
  const [activeBranchId, setActiveBranchId] = useState<string>(
    selectedStoreId === "all" ? STORES_DATA[0].id : selectedStoreId
  );

  if (!isOpen) return null;

  const activeBranch =
    STORES_DATA.find((s) => s.id === activeBranchId) || STORES_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4156]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Store className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Store Network & Clearance Locations
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Real-time outlet tracking, aisle clearance zones & GPS coordinates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body: Map View + Store List */}
        <div className="grid md:grid-cols-12 gap-0 overflow-y-auto flex-1">
          {/* Left Column: Branch Cards List (5 cols) */}
          <div className="md:col-span-5 p-4 border-r border-border space-y-3 bg-secondary/10 overflow-y-auto max-h-[500px]">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Retail Outlets ({STORES_DATA.length})
              </span>
              <button
                onClick={() => {
                  onSelectStore("all", "All Stores");
                  onClose();
                }}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedStoreId === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                View All Stores
              </button>
            </div>

            {STORES_DATA.map((store) => {
              const isSelected = activeBranchId === store.id;
              return (
                <div
                  key={store.id}
                  onClick={() => setActiveBranchId(store.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-card border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-card/60 hover:bg-card border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {store.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {store.shortCode}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {store.area}, {store.city}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-primary shrink-0">
                      {store.distance}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3 text-primary" />
                      {store.activeCampaignsCount} Campaigns
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="size-3 text-emerald-500" />
                      {store.discountedItemsCount} Items
                    </span>
                    <span className="ml-auto text-emerald-600 font-semibold flex items-center gap-1 text-[10px]">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Open
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Map Preview & Detailed Info (7 cols) */}
          <div className="md:col-span-7 p-6 space-y-5 flex flex-col justify-between">
            {/* Visual Schematic Map */}
            <div className="relative rounded-2xl border border-border bg-secondary/40 h-48 overflow-hidden flex items-center justify-center p-4">
              {/* Map grid lines simulation */}
              <div className="absolute inset-0 opacity-20 bg-[,] bg-[size:20px_20px]" />

              {/* Road Lines */}
              <svg className="absolute inset-0 w-full h-full stroke-primary/30 fill-none" strokeWidth="2">
                <path d="M 40 120 Q 180 80 320 140 T 480 60" />
                <path d="M 120 20 L 220 180 L 360 40" strokeDasharray="4 4" />
              </svg>

              {/* Store Markers on Map */}
              {STORES_DATA.map((s, idx) => {
                const positions = [
                  { top: "35%", left: "28%" },
                  { top: "25%", left: "62%" },
                  { top: "65%", left: "45%" },
                  { top: "50%", left: "82%" },
                ];
                const pos = positions[idx % positions.length];
                const isActive = s.id === activeBranchId;

                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveBranchId(s.id)}
                    style={{ top: pos.top, left: pos.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-transform ${
                      isActive ? "scale-125 z-10" : "hover:scale-110 z-0"
                    }`}
                  >
                    <div
                      className={`size-7 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/30"
                          : "bg-card text-primary border border-border"
                      }`}
                    >
                      <MapPin className="size-4" />
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/90 text-foreground border border-border"
                      }`}
                    >
                      {s.name}
                    </span>
                  </button>
                );
              })}

              <div className="absolute bottom-2 right-2 bg-card/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-muted-foreground border border-border">
                📍 Metro Bengaluru Hub
              </div>
            </div>

            {/* Branch Details Card */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">
                    {activeBranch.name} ({activeBranch.shortCode})
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    {activeBranch.address}, {activeBranch.city} - {activeBranch.pincode}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary shrink-0">
                  {activeBranch.distance}
                </span>
              </div>

              {/* Shelf / Aisle Clearance Location Highlight */}
              <div className="p-3 rounded-lg bg-secondary/40 border border-border text-xs">
                <span className="font-semibold text-foreground block mb-0.5">
                  🏬 In-Store Clearance Zone:
                </span>
                <span className="text-muted-foreground font-mono">
                  {activeBranch.aisleLocation}
                </span>
              </div>

              {/* Grid of contact & operational info */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" />
                  <span>{activeBranch.operatingHours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  <span>Mgr: {activeBranch.managerName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-primary" />
                  <span>{activeBranch.contactNumber}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="size-3.5 text-primary" />
                  <span>
                    GPS: {activeBranch.coordinates.lat.toFixed(4)},{" "}
                    {activeBranch.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <a
                href={`https://maps.google.com/?q=${activeBranch.coordinates.lat},${activeBranch.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Open in Maps
              </a>
              <button
                onClick={() => {
                  onSelectStore(activeBranch.id, activeBranch.name);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="size-4" />
                Select {activeBranch.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
