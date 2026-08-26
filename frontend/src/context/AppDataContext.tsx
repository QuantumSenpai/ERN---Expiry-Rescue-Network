import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ── Listings ──────────────────────────────────────────────────────────────────

export type ListingStatus = "Active" | "Urgent" | "Expired" | "Paused";

export interface Listing {
  id: number;
  name: string;
  donor: string;
  category: string;
  price: number;
  discount: number;
  status: ListingStatus;
  expires: string;
}

const INITIAL_LISTINGS: Listing[] = [
  { id: 1, name: "Artisan Sourdough Boule", donor: "Fresh Bakes Co.", category: "Bakery", price: 110, discount: 60, status: "Active", expires: "2h 15m" },
  { id: 2, name: "Organic Produce Selection Box", donor: "Green Grocer", category: "Produce", price: 225, discount: 50, status: "Active", expires: "5h 40m" },
  { id: 3, name: "Farm Fresh Dairy Combo", donor: "Valley Farms", category: "Dairy", price: 128, discount: 60, status: "Urgent", expires: "1h 10m" },
  { id: 4, name: "Mixed Veggie Rescue Pack", donor: "Fresh Bakes Co.", category: "Produce", price: 89, discount: 45, status: "Active", expires: "3h 20m" },
  { id: 5, name: "Bakery Assorted Bundle", donor: "Metro Breads", category: "Bakery", price: 150, discount: 55, status: "Active", expires: "4h 00m" },
];

// ── Toast ─────────────────────────────────────────────────────────────────────

interface AppDataContextType {
  listings: Listing[];
  addListing: (listing: Omit<Listing, "id">) => void;
  updateListing: (id: number, updates: Partial<Listing>) => void;
  deleteListing: (id: number) => void;
  // global toast
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const addListing = useCallback((listing: Omit<Listing, "id">) => {
    setListings((prev) => [...prev, { ...listing, id: Date.now() }]);
  }, []);

  const updateListing = useCallback((id: number, updates: Partial<Listing>) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const deleteListing = useCallback((id: number) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return (
    <AppDataContext.Provider value={{ listings, addListing, updateListing, deleteListing, toast, showToast }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
