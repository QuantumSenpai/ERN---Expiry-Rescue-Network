import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import {
  MASTER_PRODUCTS,
  type MarketplaceProduct,
  type ProductOffer,
} from "@/data/marketplaceData";
import {
  getStoredOrders,
  saveStoredOrders,
  type Order,
  type OrderItem,
} from "@/data/ordersData";

export interface CartItem {
  product: MarketplaceProduct;
  selectedOffer: ProductOffer;
  quantity: number;
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

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: MarketplaceProduct, offer?: ProductOffer) => void;
  updateQty: (idx: number, delta: number) => void;
  removeItem: (idx: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  totalSavings: number;
  originalTotal: number;
  wishlist: Set<string>;
  toggleWishlist: (product: MarketplaceProduct) => void;
  removeFromWishlist: (productId: string) => void;
  addToWishlist: (productId: string) => void;
  isCartBouncing: boolean;
  addresses: SavedAddress[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  selectedAddress: SavedAddress;
  addAddress: (address: Omit<SavedAddress, "id">) => void;
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

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: "addr-1",
    type: "Home",
    recipientName: "Alex",
    tagline: "Workspace Member & Retail Partner",
    addressLine1: "Plot 42, Sector 18, Phase II, Industrial Area",
    addressLine2: "Near Central Food Logistics Hub",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400072",
    phone: "+91 98765 43210",
    isDefault: true,
  },
  {
    id: "addr-2",
    type: "Warehouse",
    recipientName: "Central Warehouse Dispatch",
    tagline: "Main Branch Dock 4",
    addressLine1: "ERN Regional Fulfillment Center, Gate 2",
    addressLine2: "MIDC Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400093",
    phone: "+91 98220 11223",
    isDefault: false,
  },
];

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    title: "Standard Delivery",
    subtitle: "Eco-routed standard delivery",
    duration: "2–3 Days",
    fee: 30,
    freeThreshold: 500,
    tag: "Free above ₹500",
  },
  {
    id: "express",
    title: "Express Delivery",
    subtitle: "Fast-track guaranteed priority dispatch",
    duration: "Same / Next Day",
    fee: 49,
    tag: "⚡ Faster",
  },
  {
    id: "pickup",
    title: "Store / Hub Pickup",
    subtitle: "Collect in person from Central Warehouse / Main Branch",
    duration: "Ready in 1 hour",
    fee: 0,
    tag: "100% Free",
  },
];

const PAYMENT_METHODS = [
  {
    id: "upi",
    title: "UPI (Google Pay, PhonePe, Paytm)",
    description: "Instant zero-fee transfer via any verified UPI App or ID",
    iconName: "Zap",
    badge: "Recommended",
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Visa, MasterCard, RuPay, Corporate Amex with 3D Secure",
    iconName: "CreditCard",
  },
  {
    id: "cod",
    title: "Cash on Delivery / Counter Pickup",
    description: "Pay upon physical inspection at your address or counter",
    iconName: "Coins",
  },
  {
    id: "wallet",
    title: "ERN Green Wallet / Amazon Pay",
    description: "Use your ERN Rescue credits & cashback balance (₹240 available)",
    iconName: "Wallet",
    badge: "₹240 Balance",
  },
];

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // 1. Cart Items with initial mock items from MASTER_PRODUCTS
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("ern_cart_items");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        product: MASTER_PRODUCTS[0], // Amul Taaza Milk 1L
        selectedOffer: MASTER_PRODUCTS[0].defaultOffer,
        quantity: 2,
      },
      {
        product: MASTER_PRODUCTS[1], // Britannia Whole Wheat Bread 400g
        selectedOffer: MASTER_PRODUCTS[1].defaultOffer,
        quantity: 1,
      },
      {
        product: MASTER_PRODUCTS[2], // Tropicana Orange Juice 1L
        selectedOffer: MASTER_PRODUCTS[2].defaultOffer,
        quantity: 1,
      },
    ];
  });

  // 2. Wishlist with rich defaults for demoing saved items
  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("ern_wishlist");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return new Set(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return new Set([
      "prod-milk-01",
      "prod-juice-01",
      "prod-chips-01",
      "prod-rice-01",
      "prod-honey-01",
    ]);
  });

  // 3. Addresses State (Persisted)
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
    return DEFAULT_ADDRESSES;
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const defaultAddr = addresses.find((a) => a.isDefault);
    return defaultAddr ? defaultAddr.id : addresses[0]?.id || "addr-1";
  });

  const [selectedDeliveryId, setSelectedDeliveryId] =
    useState<"standard" | "express" | "pickup">("standard");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("upi");
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderData | null>(() => {
    try {
      const stored = localStorage.getItem("ern_last_placed_order");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [isCartBouncing, setIsCartBouncing] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ern_cart_items", JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ern_wishlist", JSON.stringify(Array.from(wishlist)));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Sync addresses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ern_saved_addresses", JSON.stringify(addresses));
    } catch (e) {
      console.error(e);
    }
  }, [addresses]);

  // Address helper functions
  const addAddress = (address: Omit<SavedAddress, "id">) => {
    const id = `addr-${Date.now()}`;
    const newAddress: SavedAddress = {
      ...address,
      id,
    };
    setAddresses((prev) => {
      if (newAddress.isDefault) {
        // Unset previous defaults
        return [newAddress, ...prev.map((a) => ({ ...a, isDefault: false }))];
      }
      return [...prev, newAddress];
    });
    if (newAddress.isDefault || addresses.length === 0) {
      setSelectedAddressId(id);
    }
  };

  const updateAddress = (id: string, updated: Partial<SavedAddress>) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const merged = { ...a, ...updated };
          return merged;
        }
        if (updated.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
    if (updated.isDefault) {
      setSelectedAddressId(id);
    }
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    if (selectedAddressId === id) {
      const remaining = addresses.filter((a) => a.id !== id);
      if (remaining.length > 0) {
        setSelectedAddressId(remaining[0].id);
      }
    }
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    setSelectedAddressId(id);
  };

  // Calculations
  const totalCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.selectedOffer.price * item.quantity,
      0
    );
  }, [cartItems]);

  const totalSavings = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.selectedOffer.savings * item.quantity,
      0
    );
  }, [cartItems]);

  const originalTotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.selectedOffer.originalPrice * item.quantity,
      0
    );
  }, [cartItems]);

  const selectedAddress = useMemo(() => {
    return (
      addresses.find((a) => a.id === selectedAddressId) ||
      addresses[0] ||
      DEFAULT_ADDRESSES[0]
    );
  }, [addresses, selectedAddressId]);

  const selectedDelivery = useMemo(() => {
    const opt =
      DELIVERY_OPTIONS.find((d) => d.id === selectedDeliveryId) ||
      DELIVERY_OPTIONS[0];

    // Check if free standard delivery threshold is met
    if (opt.id === "standard" && totalAmount >= (opt.freeThreshold || 500)) {
      return { ...opt, fee: 0, tag: "Free (Order > ₹500)" };
    }
    return opt;
  }, [selectedDeliveryId, totalAmount]);

  // Actions
  const addToCart = (product: MarketplaceProduct, offer?: ProductOffer) => {
    const chosenOffer = offer || product.defaultOffer;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedOffer.id === chosenOffer.id
      );
      if (existingIdx > -1) {
        return prev.map((item, i) =>
          i === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, selectedOffer: chosenOffer, quantity: 1 }];
    });

    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 500);
  };

  const updateQty = (idx: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const nextQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: nextQty,
        };
      })
    );
  };

  const removeItem = (idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleWishlist = (product: MarketplaceProduct) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.add(product.id);
      }
      return next;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const addToWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  };

  const createOrder = (): PlacedOrderData => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const orderId = `ERN-2026-${randomNum}`;

    const deliveryFee = selectedDelivery.fee;
    const finalPaid = totalAmount + deliveryFee;
    const paymentTitle =
      PAYMENT_METHODS.find((p) => p.id === selectedPaymentId)?.title || "UPI";

    const order: PlacedOrderData = {
      orderId,
      items: [...cartItems],
      totalUnits: totalCount,
      subtotal: totalAmount,
      deliveryFee,
      totalSavings,
      totalPaid: finalPaid,
      address: selectedAddress,
      deliveryOption: selectedDelivery,
      paymentMethod: paymentTitle,
      placedAt: now.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      estimatedDelivery:
        selectedDelivery.id === "pickup"
          ? "Today within 1 hour"
          : selectedDelivery.id === "express"
          ? "Tomorrow by 2:00 PM"
          : "2–3 business days",
    };

    setPlacedOrder(order);
    try {
      localStorage.setItem("ern_last_placed_order", JSON.stringify(order));
    } catch (e) {
      console.error(e);
    }

    // Build a full Order and prepend to stored orders list for the My Orders page
    const orderItems: OrderItem[] = cartItems.map((ci, index) => ({
      id: `item-placed-${index}-${Date.now()}`,
      productId: ci.product.productId || ci.product.id,
      name: ci.product.name,
      subtitle: ci.product.subtitle,
      brand: ci.product.brand,
      category: ci.product.category,
      imageUrl: ci.product.imageUrl,
      unit: ci.product.unit,
      quantity: ci.quantity,
      batchType:
        ci.selectedOffer.type === "Clearance"
          ? "Clearance"
          : ci.selectedOffer.type === "Fresh Stock"
          ? "Fresh Stock"
          : "Rescue Deal",
      shelfLifeAtPurchase: ci.selectedOffer.expiryText,
      daysRemaining: ci.selectedOffer.daysRemaining,
      originalPrice: ci.selectedOffer.originalPrice,
      paidPrice: ci.selectedOffer.price,
      savings: ci.selectedOffer.savings * ci.quantity,
    }));

    const fullOrder: Order = {
      id: orderId,
      orderDate: now.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      orderDateSimple: now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Out for Delivery",
      paymentStatus: `Paid via ${selectedPaymentId.toUpperCase()}`,
      paymentMethod: paymentTitle,
      deliveryMethod: selectedDelivery.title,
      deliveryPartner: "BlueDart Express / ERN Fleet",
      trackingId: `TRK-ERN-${randomNum}`,
      estimatedDelivery: order.estimatedDelivery,
      shippingAddress: {
        recipientName: selectedAddress.recipientName,
        tagline: selectedAddress.tagline,
        type: selectedAddress.type,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        phone: selectedAddress.phone,
      },
      items: orderItems,
      itemsSubtotal: totalAmount + totalSavings,
      ernDiscount: totalSavings,
      deliveryFee,
      taxes: 0,
      totalPaid: finalPaid,
      totalSavings,
      productsRescued: totalCount,
      wastePreventedKg: Number((totalCount * 0.25).toFixed(1)),
      timeline: [
        {
          id: "step-1",
          title: "Order Placed",
          timestamp: "Just Now",
          completed: true,
          current: false,
          locationNote: "Authenticated at ERN Hub",
        },
        {
          id: "step-2",
          title: "Order Confirmed",
          timestamp: "Just Now",
          completed: true,
          current: false,
          locationNote: "Batch inventory reserved",
        },
        {
          id: "step-3",
          title: "Packed",
          timestamp: "Estimated today",
          completed: false,
          current: true,
          locationNote: "Central Warehouse Dock 4",
        },
        {
          id: "step-4",
          title: "Dispatched",
          timestamp: "Estimated tomorrow",
          completed: false,
          current: false,
        },
        {
          id: "step-5",
          title: "Out for Delivery",
          timestamp: "Estimated soon",
          completed: false,
          current: false,
        },
        {
          id: "step-6",
          title: "Delivered",
          timestamp: order.estimatedDelivery,
          completed: false,
          current: false,
        },
      ],
    };

    const currentOrders = getStoredOrders();
    saveStoredOrders([fullOrder, ...currentOrders]);

    return order;
  };

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
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        addToWishlist,
        isCartBouncing,
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
