import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
  useCallback,
} from "react";
import {
  MASTER_PRODUCTS,
  type MarketplaceProduct,
  type ProductOffer,
} from "@/data/marketplaceData";
import {
  calculateExpiryStatus,
  type ExpiryCalculationResult,
} from "@/lib/expiryService";
import { calculatePricing, formatINR } from "@/lib/pricingService";
import {
  getStoredOrders,
  saveStoredOrders,
  type Order,
  type OrderItem,
} from "@/data/ordersData";
import {
  inventoryStore,
  normalizeStoreId,
  getStoreDisplayName,
  INVENTORY_UPDATE_EVENT,
} from "@/lib/inventoryStore";

export interface CartItem {
  product: MarketplaceProduct;
  selectedOffer: ProductOffer;
  quantity: number;
  storeId?: string;
  storeName?: string;
}

export interface SavedAddress {
  id: string;
  type: "Home" | "Warehouse" | "Office";
  recipientName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface DeliveryOption {
  id: "standard" | "express" | "pickup";
  title: string;
  subtitle: string;
  duration: string;
  fee: number;
  freeThreshold?: number;
  tag?: string;
}

export interface PlacedOrderData {
  orderId: string;
  items: CartItem[];
  totalUnits: number;
  subtotal: number;
  deliveryFee: number;
  totalSavings: number;
  totalPaid: number;
  address: SavedAddress;
  deliveryOption: DeliveryOption;
  paymentMethod: string;
  placedAt: string;
  estimatedDelivery: string;
}

export interface CartValidationIssue {
  productId: string;
  productName: string;
  type: "expired" | "out_of_stock" | "price_changed" | "quantity_reduced";
  message: string;
  adjustedQuantity?: number;
}

export interface CartValidationResult {
  isValid: boolean;
  issues: CartValidationIssue[];
}

export interface ReorderResult {
  successCount: number;
  partialCount: number;
  unavailableCount: number;
  addedItemNames: string[];
  partialItemNames: string[];
  unavailableItemNames: string[];
  message: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: MarketplaceProduct,
    offer?: ProductOffer,
    quantity?: number,
    storeId?: string,
    storeName?: string
  ) => void;
  updateQty: (idx: number, delta: number) => void;
  removeItem: (idx: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  totalSavings: number;
  originalTotal: number;
  formattedTotalAmount: string;
  formattedTotalSavings: string;
  formattedOriginalTotal: string;
  wishlist: Set<string>;
  toggleWishlist: (product: MarketplaceProduct) => boolean;
  removeFromWishlist: (productId: string) => void;
  addToWishlist: (productId: string) => void;
  isCartBouncing: boolean;
  validateCart: () => CartValidationResult;
  reorderFromPastOrder: (order: Order) => ReorderResult;
  addresses: SavedAddress[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  selectedAddress: SavedAddress;
  addAddress: (address: Omit<SavedAddress, "id">) => SavedAddress;
  updateAddress: (id: string, address: Partial<SavedAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  deliveryOptions: DeliveryOption[];
  selectedDeliveryId: "standard" | "express" | "pickup";
  setSelectedDeliveryId: (id: "standard" | "express" | "pickup") => void;
  selectedDelivery: DeliveryOption;
  paymentMethods: Array<{
    id: string;
    title: string;
    description: string;
    iconName: string;
    badge?: string;
  }>;
  selectedPaymentId: string;
  setSelectedPaymentId: (id: string) => void;
  placedOrder: PlacedOrderData | null;
  createOrder: () => PlacedOrderData;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    title: "Standard Delivery",
    subtitle: "Eco-routed local delivery",
    duration: "Tomorrow",
    fee: 30,
    freeThreshold: 500,
    tag: "Free above ₹500",
  },
  {
    id: "express",
    title: "Express Delivery",
    subtitle: "Priority dispatch within 3 hours",
    duration: "Today (in 3 hrs)",
    fee: 49,
    tag: "⚡ Fast",
  },
  {
    id: "pickup",
    title: "Store / Hub Pickup",
    subtitle: "Collect in person from nearest branch",
    duration: "Ready in 1 hour",
    fee: 0,
    tag: "100% Free",
  },
];

const PAYMENT_METHODS = [
  {
    id: "upi",
    title: "UPI (Google Pay, PhonePe, Paytm, BHIM)",
    description: "Instant payment via any UPI app or ID",
    iconName: "Zap",
    badge: "Recommended",
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Visa, MasterCard, RuPay with secure OTP authentication",
    iconName: "CreditCard",
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay upon physical delivery of your order",
    iconName: "Coins",
  },
];

export function normalizeCartItem(raw: any, idx = 0): CartItem | null {
  if (!raw || typeof raw !== "object") return null;

  // 1. Resolve product
  const rawProduct = raw.product || raw;
  const productId = String(rawProduct.id || raw.id || raw.productId || `item-${idx}`);
  const productName = String(rawProduct.name || raw.name || raw.title || "Grocery Item");
  const brand = String(rawProduct.brand || raw.brand || "ERN Verified");
  const unit = String(rawProduct.unit || raw.unit || "1 unit");
  const category = String(rawProduct.category || raw.category || "Pantry");
  const rawMrp = Number(rawProduct.mrp ?? raw.mrp ?? rawProduct.price ?? raw.price ?? 0);
  const rawPrice = Number(rawProduct.price ?? raw.price ?? rawMrp ?? 0);
  const mrp = isNaN(rawMrp) ? 0 : rawMrp;
  const price = isNaN(rawPrice) ? mrp : rawPrice;
  const imageUrl = String(
    rawProduct.imageUrl ||
    raw.imageUrl ||
    rawProduct.image ||
    raw.image ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
  );

  // 2. Resolve selectedOffer
  const rawOffer = raw.selectedOffer || raw.offer || {};
  const offerId = String(rawOffer.id || `offer-${productId}-${idx}`);
  const batchNumber = String(rawOffer.batchNumber || raw.batchNumber || `BAT-${idx + 1}`);
  const rawOfferPrice = Number(rawOffer.price ?? price);
  const offerPrice = isNaN(rawOfferPrice) ? price : rawOfferPrice;
  const rawOfferMrp = Number(rawOffer.mrp ?? mrp ?? offerPrice);
  const offerMrp = isNaN(rawOfferMrp) ? Math.max(mrp, offerPrice) : rawOfferMrp;
  const offerType = String(rawOffer.type || raw.type || (offerPrice < offerMrp ? "Rescue Deal" : "Fresh Stock"));
  const rawAvail = Number(rawOffer.availability ?? raw.availability ?? raw.stock ?? 99);
  const availability = isNaN(rawAvail) ? 99 : Math.max(1, rawAvail);

  // Safe expiry date - preserve actual date if valid, never invent fake dates
  const candidateExpiry = String(rawOffer.expiryDate || raw.expiryDate || "");
  const safeExpiry = candidateExpiry && !isNaN(new Date(candidateExpiry).getTime())
    ? candidateExpiry
    : "";

  const selectedOffer: ProductOffer = {
    id: offerId,
    batchNumber,
    expiryDate: safeExpiry,
    price: offerPrice,
    mrp: offerMrp,
    discountPercent: offerMrp > 0 ? Math.round(((offerMrp - offerPrice) / offerMrp) * 100) : 0,
    type: (["Fresh Stock", "Rescue Deal", "Clearance"].includes(offerType)
      ? offerType
      : "Rescue Deal") as any,
    savings: Math.max(0, offerMrp - offerPrice),
    availability,
    storeId: rawOffer.storeId || raw.storeId || "main-branch",
    storeName: rawOffer.storeName || raw.storeName || "Main Branch (Indiranagar)",
  };

  const product: MarketplaceProduct = {
    id: productId,
    productId,
    name: productName,
    subtitle: rawProduct.subtitle || `${brand} • ${unit}`,
    brand,
    unit,
    category,
    categorySlug: (rawProduct.categorySlug || "dairy") as any,
    mrp: offerMrp,
    rating: rawProduct.rating || 4.5,
    reviewsCount: rawProduct.reviewsCount || 12,
    imageUrl,
    defaultOffer: selectedOffer,
    allOffers: rawProduct.allOffers && Array.isArray(rawProduct.allOffers) ? rawProduct.allOffers : [selectedOffer],
    isRescueDeal: offerType === "Rescue Deal",
    isPopular: false,
    isRecommended: false,
    isClearance: offerType === "Clearance",
    isBuyAgain: false,
    description: rawProduct.description || "",
  };

  const rawQty = Number(raw.quantity);
  const quantity = isNaN(rawQty) ? 1 : Math.max(1, rawQty);

  return {
    product,
    selectedOffer,
    quantity,
    storeId: raw.storeId || selectedOffer.storeId,
    storeName: raw.storeName || selectedOffer.storeName,
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // 1. Cart Items (Persisted in localStorage; safe parsing with normalization)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("ern_cart_items");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item, idx) => normalizeCartItem(item, idx))
            .filter((item): item is CartItem => item !== null);
        }
      }
    } catch (e) {
      console.error("Failed to load cart items from localStorage:", e);
    }
    return [];
  });

  // 2. Wishlist / Saved Items (Persisted in localStorage; default empty for new customer)
  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("ern_wishlist");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return new Set<string>();
  });

  // 3. Saved Addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    try {
      const stored = localStorage.getItem("ern_saved_addresses");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    return addresses[0]?.id || "default-addr";
  });

  // 4. Delivery & Payment Selection
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<"standard" | "express" | "pickup">("standard");
  const [selectedPaymentId, setSelectedPaymentId] = useState("upi");

  // 5. Placed Order State
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderData | null>(() => {
    try {
      const stored = localStorage.getItem("ern_last_placed_order");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Animation bounce state
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  // Sync states to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("ern_cart_items", JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem("ern_wishlist", JSON.stringify(Array.from(wishlist)));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem("ern_saved_addresses", JSON.stringify(addresses));
    } catch (e) {
      console.error(e);
    }
  }, [addresses]);

  // Derived Address
  const selectedAddress = useMemo<SavedAddress>(() => {
    const found = addresses.find((a) => a.id === selectedAddressId);
    if (found) return found;
    if (addresses.length > 0) return addresses[0];
    return {
      id: "default-addr",
      type: "Home",
      recipientName: "Customer",
      tagline: "Primary Delivery Address",
      addressLine1: "Flat 402, Green Valley Apartments",
      addressLine2: "12th Main Road, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      phone: "+91 98765 43210",
      isDefault: true,
    };
  }, [addresses, selectedAddressId]);

  // Derived Delivery Option
  const selectedDelivery = useMemo<DeliveryOption>(() => {
    const found = DELIVERY_OPTIONS.find((d) => d.id === selectedDeliveryId);
    return found || DELIVERY_OPTIONS[0];
  }, [selectedDeliveryId]);

  // Cart Add / Update / Remove / Clear
  const triggerCartBounce = () => {
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 600);
  };

  const addToCart = useCallback(
    (
      product: MarketplaceProduct,
      offer?: ProductOffer,
      quantity = 1,
      storeId?: string,
      storeName?: string
    ) => {
      const targetOffer = offer || product.defaultOffer;
      const effectiveStoreId = storeId || targetOffer.storeId || "main-branch";
      const effectiveStoreName = storeName || targetOffer.storeName || getStoreDisplayName(effectiveStoreId);

      setCartItems((prev) => {
        const existingIdx = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.selectedOffer.id === targetOffer.id &&
            (item.storeId === effectiveStoreId || !item.storeId)
        );

        if (existingIdx >= 0) {
          const updated = [...prev];
          const currentQty = updated[existingIdx].quantity;
          const maxAvail = targetOffer.availability || 99;
          const newQty = Math.min(maxAvail, currentQty + quantity);
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
            storeId: effectiveStoreId,
            storeName: effectiveStoreName,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              product,
              selectedOffer: targetOffer,
              quantity: Math.min(targetOffer.availability || 99, Math.max(1, quantity)),
              storeId: effectiveStoreId,
              storeName: effectiveStoreName,
            },
          ];
        }
      });
      triggerCartBounce();
    },
    []
  );

  const updateQty = useCallback((idx: number, delta: number) => {
    setCartItems((prev) => {
      if (idx < 0 || idx >= prev.length) return prev;
      const current = prev[idx];
      const newQty = current.quantity + delta;
      const maxAvail = current.selectedOffer.availability || 99;

      if (newQty <= 0) {
        return prev.filter((_, i) => i !== idx);
      }
      const updated = [...prev];
      updated[idx] = { ...current, quantity: Math.min(maxAvail, newQty) };
      return updated;
    });
  }, []);

  const removeItem = useCallback((idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calculated Cart Totals
  const { totalCount, totalAmount, originalTotal, totalSavings } = useMemo(() => {
    let count = 0;
    let amount = 0;
    let orig = 0;

    for (const item of cartItems) {
      if (!item) continue;
      const qty = Math.max(1, item.quantity || 1);
      count += qty;
      const safeMrp = Number(item.selectedOffer?.mrp ?? item.product?.mrp ?? item.selectedOffer?.price ?? 0);
      const safeSellingPrice = Number(item.selectedOffer?.price ?? (item.product as any)?.price ?? safeMrp);
      const pricing = calculatePricing(safeMrp, {
        sellingPrice: safeSellingPrice,
      });
      amount += pricing.sellingPrice * qty;
      orig += pricing.mrp * qty;
    }

    const savings = Math.max(0, orig - amount);
    return {
      totalCount: count,
      totalAmount: amount,
      originalTotal: orig,
      totalSavings: savings,
    };
  }, [cartItems]);

  // Wishlist / Saved Items Toggle
  const toggleWishlist = useCallback((product: MarketplaceProduct): boolean => {
    let isAdded = false;
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        isAdded = false;
      } else {
        next.add(product.id);
        isAdded = true;
      }
      return next;
    });
    return isAdded;
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  }, []);

  const addToWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  }, []);

  // Address Actions
  const addAddress = useCallback((addr: Omit<SavedAddress, "id">): SavedAddress => {
    const newAddr: SavedAddress = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    setAddresses((prev) => {
      if (newAddr.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), newAddr];
      }
      return [...prev, newAddr];
    });
    setSelectedAddressId(newAddr.id);
    return newAddr;
  }, []);

  const updateAddress = useCallback((id: string, updates: Partial<SavedAddress>) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, ...updates };
          return updated;
        }
        if (updates.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (selectedAddressId === id && filtered.length > 0) {
        setSelectedAddressId(filtered[0].id);
      }
      return filtered;
    });
  }, [selectedAddressId]);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    setSelectedAddressId(id);
  }, []);

  // 6. Cart Validation against live store inventory, expiry and stock
  const validateCart = useCallback((): CartValidationResult => {
    const issues: CartValidationIssue[] = [];
    const validItems: CartItem[] = [];

    for (const item of cartItems) {
      const storeId = item.storeId || item.selectedOffer.storeId || "main-branch";
      const productId = item.product.productId || item.product.id;
      const batchNo = item.selectedOffer.batchNumber;

      const check = inventoryStore.validateBatchStock(
        storeId,
        productId,
        batchNo,
        item.quantity
      );

      if (check.isExpired) {
        issues.push({
          productId: item.product.id,
          productName: item.product.name,
          type: "expired",
          message: `${item.product.name} (Batch ${batchNo}) has reached expiration. Please select another active batch.`,
        });
        continue;
      }

      if (check.availableQty <= 0) {
        issues.push({
          productId: item.product.id,
          productName: item.product.name,
          type: "out_of_stock",
          message: `${item.product.name} (Batch ${batchNo}) is currently out of stock.`,
        });
        continue;
      }

      let targetQty = item.quantity;
      if (targetQty > check.availableQty) {
        targetQty = check.availableQty;
        issues.push({
          productId: item.product.id,
          productName: item.product.name,
          type: "quantity_reduced",
          message: `Only ${check.availableQty} units available for ${item.product.name}. Quantity adjusted.`,
          adjustedQuantity: targetQty,
        });
      }

      validItems.push({
        ...item,
        quantity: targetQty,
        selectedOffer: {
          ...item.selectedOffer,
          availability: check.availableQty,
        },
      });
    }

    if (issues.length > 0) {
      setCartItems(validItems);
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }, [cartItems]);

  // 7. Intelligent Reorder from Past Order with Live Batch Resolution
  const reorderFromPastOrder = useCallback((order: Order): ReorderResult => {
    let successCount = 0;
    let partialCount = 0;
    let unavailableCount = 0;
    const addedItemNames: string[] = [];
    const partialItemNames: string[] = [];
    const unavailableItemNames: string[] = [];

    const newCartItemsToAdd: CartItem[] = [];
    const targetStoreId = order.storeId || "main-branch";
    const liveCatalog = inventoryStore.getMarketplaceCatalog(targetStoreId);

    for (const orderItem of order.items) {
      const liveProduct = liveCatalog.find(
        (p) =>
          p.id === orderItem.productId ||
          p.productId === orderItem.productId ||
          p.name.toLowerCase() === orderItem.name.toLowerCase()
      );

      if (!liveProduct) {
        unavailableCount++;
        unavailableItemNames.push(orderItem.name);
        continue;
      }

      // Live unexpired batches with available inventory only
      const validBatches = liveProduct.allOffers.filter((offer) => {
        const expiry = calculateExpiryStatus(offer.expiryDate);
        return !expiry.isExpired && offer.availability > 0;
      });

      if (validBatches.length === 0) {
        unavailableCount++;
        unavailableItemNames.push(`${liveProduct.name} (Out of Stock / Expired)`);
        continue;
      }

      // Prefer matching batch, fallback to best valid unexpired batch
      const matchedTierBatch =
        validBatches.find((b) => b.id === (orderItem as any).batchId) ||
        validBatches.find((b) => b.type === orderItem.batchType) ||
        validBatches[0];

      const requestedQty = Math.max(1, orderItem.quantity || 1);
      const availableStock = matchedTierBatch.availability;

      if (availableStock <= 0) {
        unavailableCount++;
        unavailableItemNames.push(`${liveProduct.name} (Depleted)`);
        continue;
      }

      let fulfilledQty = requestedQty;
      if (requestedQty > availableStock) {
        fulfilledQty = availableStock;
        partialCount++;
        partialItemNames.push(`${liveProduct.name} (${fulfilledQty} of ${requestedQty} available)`);
        successCount++;
      } else {
        successCount++;
        addedItemNames.push(`${liveProduct.name} (${matchedTierBatch.type})`);
      }

      newCartItemsToAdd.push({
        product: liveProduct,
        selectedOffer: matchedTierBatch,
        quantity: fulfilledQty,
        storeId: targetStoreId,
        storeName: order.storeName || getStoreDisplayName(targetStoreId),
      });
    }

    if (newCartItemsToAdd.length > 0) {
      setCartItems((prev) => {
        const updated = [...prev];
        for (const newItem of newCartItemsToAdd) {
          const existingIdx = updated.findIndex(
            (it) =>
              it.product.id === newItem.product.id &&
              it.selectedOffer.id === newItem.selectedOffer.id
          );
          if (existingIdx >= 0) {
            updated[existingIdx].quantity = Math.min(
              newItem.selectedOffer.availability,
              updated[existingIdx].quantity + newItem.quantity
            );
          } else {
            updated.push(newItem);
          }
        }
        return updated;
      });
      triggerCartBounce();
    }

    const messageParts: string[] = [];
    const fullAdds = successCount - partialCount;
    if (fullAdds > 0) {
      messageParts.push(`${fullAdds} item${fullAdds > 1 ? "s" : ""} added`);
    }
    if (partialCount > 0) {
      messageParts.push(`${partialCount} item${partialCount > 1 ? "s" : ""} partially added (stock limited)`);
    }
    if (unavailableCount > 0) {
      messageParts.push(`${unavailableCount} item${unavailableCount > 1 ? "s" : ""} unavailable`);
    }

    const message =
      messageParts.length > 0
        ? `${messageParts.join(", ")}.`
        : `Items from this order are no longer available in current stock.`;

    return {
      successCount,
      partialCount,
      unavailableCount,
      addedItemNames,
      partialItemNames,
      unavailableItemNames,
      message,
    };
  }, []);

  // 8. Create & Place Order with Live Inventory Stock Deductions
  const createOrder = useCallback((): PlacedOrderData => {
    const finalDeliveryFee =
      selectedDelivery.freeThreshold && totalAmount >= selectedDelivery.freeThreshold
        ? 0
        : selectedDelivery.fee;

    const totalPaid = totalAmount + finalDeliveryFee;
    const totalUnits = cartItems.reduce((acc, it) => acc + it.quantity, 0);
    const primaryStoreId =
      cartItems[0]?.storeId || cartItems[0]?.selectedOffer?.storeId || "main-branch";
    const primaryStoreName =
      cartItems[0]?.storeName ||
      cartItems[0]?.selectedOffer?.storeName ||
      getStoreDisplayName(primaryStoreId);

    const newOrderData: PlacedOrderData = {
      orderId: `ERN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      items: [...cartItems],
      totalUnits,
      subtotal: totalAmount,
      deliveryFee: finalDeliveryFee,
      totalSavings,
      totalPaid,
      address: selectedAddress,
      deliveryOption: selectedDelivery,
      paymentMethod:
        PAYMENT_METHODS.find((p) => p.id === selectedPaymentId)?.title || "UPI",
      placedAt: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      estimatedDelivery:
        selectedDelivery.id === "express"
          ? "Today within 3 hours"
          : selectedDelivery.id === "pickup"
          ? "Ready for pickup in 1 hour"
          : "Tomorrow by 2:00 PM",
    };

    setPlacedOrder(newOrderData);
    try {
      localStorage.setItem("ern_last_placed_order", JSON.stringify(newOrderData));
    } catch (e) {
      console.error(e);
    }

    // Deduct stock from exact store and batch in inventoryStore
    for (const it of cartItems) {
      const itemStoreId = it.storeId || it.selectedOffer.storeId || primaryStoreId;
      const prodId = it.product.productId || it.product.id;
      const batchNumber = it.selectedOffer.batchNumber;
      inventoryStore.decrementBatchStock(itemStoreId, prodId, batchNumber, it.quantity);
    }

    // Persist into all orders history
    const existingOrders = getStoredOrders();
    const historyOrder: Order = {
      id: newOrderData.orderId,
      storeId: primaryStoreId,
      storeName: primaryStoreName,
      orderDate: newOrderData.placedAt,
      orderDateSimple: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: "Processing",
      paymentStatus: `Paid via ${newOrderData.paymentMethod}`,
      paymentMethod: newOrderData.paymentMethod,
      deliveryMethod: newOrderData.deliveryOption.title,
      deliveryPartner: "ERN Local Hub Dispatch",
      trackingId: `TRK-ERN-${Math.floor(10000 + Math.random() * 90000)}`,
      estimatedDelivery: newOrderData.estimatedDelivery,
      shippingAddress: newOrderData.address,
      items: newOrderData.items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        productId: it.product.id,
        name: it.product.name,
        subtitle: it.product.subtitle,
        brand: it.product.brand,
        category: it.product.category,
        imageUrl: it.product.imageUrl,
        unit: it.product.unit,
        quantity: it.quantity,
        batchType: it.selectedOffer.type === "Expired" ? "Rescue Deal" : it.selectedOffer.type,
        batchNumber: it.selectedOffer.batchNumber,
        storeId: it.storeId || it.selectedOffer.storeId || primaryStoreId,
        storeName: it.storeName || it.selectedOffer.storeName || primaryStoreName,
        expiryDate: it.selectedOffer.expiryDate,
        shelfLifeAtPurchase: it.selectedOffer.expiryText || "5 days left",
        daysRemaining: it.selectedOffer.daysRemaining || 5,
        originalPrice: it.selectedOffer.mrp || it.product.mrp,
        paidPrice: it.selectedOffer.price,
        savings: (it.selectedOffer.savings || 0) * it.quantity,
      })),
      itemsSubtotal: newOrderData.subtotal,
      ernDiscount: newOrderData.totalSavings,
      deliveryFee: newOrderData.deliveryFee,
      taxes: 0,
      totalPaid: newOrderData.totalPaid,
      totalSavings: newOrderData.totalSavings,
      productsRescued: totalUnits,
      wastePreventedKg: Number((totalUnits * 0.4).toFixed(1)),
      timeline: [
        {
          id: "step-1",
          title: "Order Placed",
          timestamp: "Just Now",
          completed: true,
          current: false,
          locationNote: `Order confirmed at ${primaryStoreName}`,
        },
        {
          id: "step-2",
          title: "Allocating Batch Stock",
          timestamp: "In Progress",
          completed: false,
          current: true,
          locationNote: "Exact batch items reserved and deducted from inventory",
        },
      ],
    };

    saveStoredOrders([historyOrder, ...existingOrders]);

    // Clear active cart after successful order creation
    clearCart();

    return newOrderData;
  }, [
    cartItems,
    selectedDelivery,
    totalAmount,
    totalSavings,
    selectedAddress,
    selectedPaymentId,
    clearCart,
  ]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        totalCount,
        totalAmount,
        totalSavings,
        originalTotal,
        formattedTotalAmount: formatINR(totalAmount),
        formattedTotalSavings: formatINR(totalSavings),
        formattedOriginalTotal: formatINR(originalTotal),
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        addToWishlist,
        isCartBouncing,
        validateCart,
        reorderFromPastOrder,
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        selectedAddress,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        deliveryOptions: DELIVERY_OPTIONS,
        selectedDeliveryId,
        setSelectedDeliveryId,
        selectedDelivery,
        paymentMethods: PAYMENT_METHODS,
        selectedPaymentId,
        setSelectedPaymentId,
        placedOrder,
        createOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
