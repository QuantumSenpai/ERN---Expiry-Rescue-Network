import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RescueDealChannels {
  marketplace: boolean;
  ngo: boolean;
}

export interface PublishedRescueDeal {
  id: string;                // "deal-{timestamp}-{batchNo}"
  batchId: string;           // ExpiryDecisionBatch.id ("batch-1")
  batchNo: string;           // "MILK-0042"
  productId: string;         // "prod-1" (maps to MASTER_PRODUCTS)
  name: string;              // "Amul Taaza Homogenised Toned Milk 1L"
  brand: string;
  category: string;
  imageUrl: string;
  unit: string;
  originalPrice: number;     // ₹42
  rescuePrice: number;       // ₹34
  discountPercent: number;   // 20
  savings: number;           // ₹8
  quantity: number;          // 45
  expiryDate: string;        // "18 Aug 2026"
  daysRemaining: number;     // 2
  location: string;
  channels: RescueDealChannels;
  publishedAt: string;       // ISO string
  publishedBy: string;
  status: "Active" | "Sold Out" | "Expired";
}

export interface PublishDealInput {
  batchId: string;
  batchNo: string;
  productId: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  unit: string;
  originalPrice: number;
  rescuePrice: number;
  discountPercent: number;
  savings: number;
  quantity: number;
  expiryDate: string;
  daysRemaining: number;
  location: string;
  channels: RescueDealChannels;
  publishedBy: string;
}

// ─── Context Interface ────────────────────────────────────────────────────────

interface RescueDealsContextType {
  deals: PublishedRescueDeal[];
  publishDeal: (input: PublishDealInput) => PublishedRescueDeal;
  getDealByBatch: (batchId: string) => PublishedRescueDeal | undefined;
  hasDeal: (batchId: string) => boolean;
  getMarketplaceDeals: () => PublishedRescueDeal[];
  expireDeal: (dealId: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const RescueDealsContext = createContext<RescueDealsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "ern_rescue_deals";

// ─── Provider ────────────────────────────────────────────────────────────────

export function RescueDealsProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<PublishedRescueDeal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("[RescueDealsContext] Failed to load from localStorage:", e);
    }
    return [];
  });

  // Sync to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
    } catch (e) {
      console.error("[RescueDealsContext] Failed to save to localStorage:", e);
    }
  }, [deals]);

  // Publish a new rescue deal
  const publishDeal = useCallback(
    (input: PublishDealInput): PublishedRescueDeal => {
      const now = new Date();
      const deal: PublishedRescueDeal = {
        id: `deal-${now.getTime()}-${input.batchNo}`,
        batchId: input.batchId,
        batchNo: input.batchNo,
        productId: input.productId,
        name: input.name,
        brand: input.brand,
        category: input.category,
        imageUrl: input.imageUrl,
        unit: input.unit,
        originalPrice: input.originalPrice,
        rescuePrice: input.rescuePrice,
        discountPercent: input.discountPercent,
        savings: input.savings,
        quantity: input.quantity,
        expiryDate: input.expiryDate,
        daysRemaining: input.daysRemaining,
        location: input.location,
        channels: input.channels,
        publishedAt: now.toISOString(),
        publishedBy: input.publishedBy,
        status: "Active",
      };

      setDeals((prev) => {
        // Remove any stale deal for same batch before adding new
        const filtered = prev.filter((d) => d.batchId !== input.batchId);
        return [deal, ...filtered];
      });

      return deal;
    },
    []
  );

  // Find deal by batch ID
  const getDealByBatch = useCallback(
    (batchId: string): PublishedRescueDeal | undefined => {
      return deals.find((d) => d.batchId === batchId && d.status === "Active");
    },
    [deals]
  );

  // Check if a batch already has an active deal
  const hasDeal = useCallback(
    (batchId: string): boolean => {
      return deals.some((d) => d.batchId === batchId && d.status === "Active");
    },
    [deals]
  );

  // Get deals visible to Marketplace (channels.marketplace === true)
  const getMarketplaceDeals = useCallback((): PublishedRescueDeal[] => {
    return deals.filter(
      (d) => d.channels.marketplace && d.status === "Active"
    );
  }, [deals]);

  // Mark a deal as expired / sold out
  const expireDeal = useCallback((dealId: string) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, status: "Expired" } : d
      )
    );
  }, []);

  return (
    <RescueDealsContext.Provider
      value={{
        deals,
        publishDeal,
        getDealByBatch,
        hasDeal,
        getMarketplaceDeals,
        expireDeal,
      }}
    >
      {children}
    </RescueDealsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRescueDeals(): RescueDealsContextType {
  const ctx = useContext(RescueDealsContext);
  if (!ctx) {
    throw new Error("useRescueDeals must be used within a RescueDealsProvider");
  }
  return ctx;
}
