export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  subtitle: string;
  brand: string;
  category: string;
  imageUrl: string;
  unit: string;
  quantity: number;
  batchType: "Fresh Stock" | "Rescue Deal" | "Clearance";
  shelfLifeAtPurchase: string;
  daysRemaining: number;
  originalPrice: number;
  paidPrice: number;
  savings: number;
}

export interface TrackingStep {
  id: string;
  title: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
  locationNote?: string;
}

export type OrderStatus =
  | "Processing"
  | "Confirmed"
  | "Packed"
  | "Dispatched"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export interface Order {
  id: string;
  orderDate: string;
  orderDateSimple: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryPartner: string;
  trackingId: string;
  estimatedDelivery: string;
  shippingAddress: {
    recipientName: string;
    tagline: string;
    type: "Home" | "Warehouse" | "Office";
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: OrderItem[];
  itemsSubtotal: number;
  ernDiscount: number;
  deliveryFee: number;
  taxes: number;
  totalPaid: number;
  totalSavings: number;
  productsRescued: number;
  wastePreventedKg: number;
  timeline: TrackingStep[];
  cancellationReason?: string;
}

export const INITIAL_ORDERS: Order[] = [
  // 1. Order 1: Out for Delivery (Primary Featured Order)
  {
    id: "ERN-2026-82802",
    orderDate: "16 Aug 2026, 11:40 AM",
    orderDateSimple: "16 Aug 2026",
    status: "Out for Delivery",
    paymentStatus: "Paid via UPI (Google Pay)",
    paymentMethod: "UPI",
    deliveryMethod: "Standard Delivery",
    deliveryPartner: "BlueDart Express / ERN Fleet",
    trackingId: "TRK-ERN-99214",
    estimatedDelivery: "18 Aug 2026",
    shippingAddress: {
      recipientName: "Alex",
      tagline: "Workspace Member & Retail Partner",
      type: "Home",
      addressLine1: "Plot 42, Sector 18, Phase II, Industrial Area",
      addressLine2: "Near Central Food Logistics Hub",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400072",
      phone: "+91 98765 43210",
    },
    items: [
      {
        id: "item-1",
        productId: "prod-milk-01",
        name: "Amul Taaza Milk 1L",
        subtitle: "Homogenized Toned Milk Tetra Pak",
        brand: "Amul",
        category: "Dairy & Milk",
        imageUrl: "/assets/marketplace/milk_bottle.jpg",
        unit: "1L",
        quantity: 2,
        batchType: "Rescue Deal",
        shelfLifeAtPurchase: "5 days left",
        daysRemaining: 5,
        originalPrice: 42,
        paidPrice: 34,
        savings: 16,
      },
      {
        id: "item-2",
        productId: "prod-bread-01",
        name: "Britannia Whole Wheat Bread 400g",
        subtitle: "100% Atta Fresh Daily Baked Loaf",
        brand: "Britannia",
        category: "Bakery & Breads",
        imageUrl: "/assets/marketplace/bread_loaf.jpg",
        unit: "400g",
        quantity: 1,
        batchType: "Rescue Deal",
        shelfLifeAtPurchase: "3 days left",
        daysRemaining: 3,
        originalPrice: 38,
        paidPrice: 31,
        savings: 7,
      },
      {
        id: "item-3",
        productId: "prod-juice-01",
        name: "Tropicana Orange Juice 1L",
        subtitle: "100% Real Squeezed Fruit Juice",
        brand: "Tropicana",
        category: "Beverages & Juices",
        imageUrl: "/assets/marketplace/orange_juice.jpg",
        unit: "1L",
        quantity: 1,
        batchType: "Fresh Stock",
        shelfLifeAtPurchase: "2 days left",
        daysRemaining: 2,
        originalPrice: 120,
        paidPrice: 96,
        savings: 24,
      },
      {
        id: "item-4",
        productId: "prod-chips-01",
        name: "Lays Classic Salted 52g",
        subtitle: "Crispy Golden Potato Chips Pack",
        brand: "FritoLay",
        category: "Snacks & Munchies",
        imageUrl: "/assets/marketplace/lays_chips.jpg",
        unit: "52g",
        quantity: 1,
        batchType: "Clearance",
        shelfLifeAtPurchase: "Expires tomorrow",
        daysRemaining: 1,
        originalPrice: 28,
        paidPrice: 16,
        savings: 12,
      },
    ],
    itemsSubtotal: 300,
    ernDiscount: 47,
    deliveryFee: 30,
    taxes: 0,
    totalPaid: 283,
    totalSavings: 47,
    productsRescued: 5,
    wastePreventedKg: 0.8,
    timeline: [
      {
        id: "step-1",
        title: "Order Placed",
        timestamp: "16 Aug · 11:40 AM",
        completed: true,
        current: false,
        locationNote: "Received at ERN Digital Node",
      },
      {
        id: "step-2",
        title: "Order Confirmed",
        timestamp: "16 Aug · 11:43 AM",
        completed: true,
        current: false,
        locationNote: "Batch inventory locked & verified",
      },
      {
        id: "step-3",
        title: "Packed",
        timestamp: "16 Aug · 2:10 PM",
        completed: true,
        current: false,
        locationNote: "Central Warehouse Dock 4",
      },
      {
        id: "step-4",
        title: "Dispatched",
        timestamp: "17 Aug · 6:30 AM",
        completed: true,
        current: false,
        locationNote: "In transit via ERN Green Van #42",
      },
      {
        id: "step-5",
        title: "Out for Delivery",
        timestamp: "17 Aug · 9:20 AM",
        completed: false,
        current: true,
        locationNote: "Driver Ramesh arriving shortly",
      },
      {
        id: "step-6",
        title: "Delivered",
        timestamp: "Expected 18 Aug",
        completed: false,
        current: false,
        locationNote: "OTP verification at destination",
      },
    ],
  },

  // 2. Order 2: Processing
  {
    id: "ERN-2026-74910",
    orderDate: "16 Aug 2026, 9:15 AM",
    orderDateSimple: "16 Aug 2026",
    status: "Processing",
    paymentStatus: "Paid via Credit Card",
    paymentMethod: "Credit Card",
    deliveryMethod: "Express Priority",
    deliveryPartner: "ERN Quick Dispatch",
    trackingId: "TRK-ERN-88401",
    estimatedDelivery: "Today by 4:00 PM",
    shippingAddress: {
      recipientName: "Alex",
      tagline: "Workspace Member & Retail Partner",
      type: "Home",
      addressLine1: "Plot 42, Sector 18, Phase II, Industrial Area",
      addressLine2: "Near Central Food Logistics Hub",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400072",
      phone: "+91 98765 43210",
    },
    items: [
      {
        id: "item-5",
        productId: "prod-med-01",
        name: "Paracetamol 500mg Fast Relief",
        subtitle: "Analgesic & Antipyretic (10 Tabs)",
        brand: "Cipla",
        category: "Healthcare",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
        unit: "10 Tabs",
        quantity: 2,
        batchType: "Fresh Stock",
        shelfLifeAtPurchase: "180 days left",
        daysRemaining: 180,
        originalPrice: 35,
        paidPrice: 25,
        savings: 20,
      },
      {
        id: "item-6",
        productId: "prod-curd-01",
        name: "Amul Masti Dahi 400g",
        subtitle: "Pasteurized Probiotic Curd Pouch",
        brand: "Amul",
        category: "Dairy & Milk",
        imageUrl: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=600&q=80",
        unit: "400g",
        quantity: 2,
        batchType: "Rescue Deal",
        shelfLifeAtPurchase: "4 days left",
        daysRemaining: 4,
        originalPrice: 35,
        paidPrice: 24,
        savings: 22,
      },
    ],
    itemsSubtotal: 140,
    ernDiscount: 42,
    deliveryFee: 49,
    taxes: 0,
    totalPaid: 147,
    totalSavings: 42,
    productsRescued: 4,
    wastePreventedKg: 0.6,
    timeline: [
      {
        id: "step-1",
        title: "Order Placed",
        timestamp: "16 Aug · 9:15 AM",
        completed: true,
        current: false,
        locationNote: "Order successfully authenticated",
      },
      {
        id: "step-2",
        title: "Order Confirmed",
        timestamp: "16 Aug · 9:18 AM",
        completed: false,
        current: true,
        locationNote: "Allocating closest hub warehouse stock",
      },
      {
        id: "step-3",
        title: "Packed",
        timestamp: "Estimated 11:00 AM",
        completed: false,
        current: false,
      },
      {
        id: "step-4",
        title: "Dispatched",
        timestamp: "Estimated 1:00 PM",
        completed: false,
        current: false,
      },
      {
        id: "step-5",
        title: "Out for Delivery",
        timestamp: "Estimated 2:30 PM",
        completed: false,
        current: false,
      },
      {
        id: "step-6",
        title: "Delivered",
        timestamp: "Estimated 4:00 PM",
        completed: false,
        current: false,
      },
    ],
  },

  // 3. Order 3: Delivered (Historical completed order)
  {
    id: "ERN-2026-61842",
    orderDate: "12 Aug 2026, 4:20 PM",
    orderDateSimple: "12 Aug 2026",
    status: "Delivered",
    paymentStatus: "Paid via ERN Wallet & UPI",
    paymentMethod: "ERN Green Wallet",
    deliveryMethod: "Standard Delivery",
    deliveryPartner: "BlueDart Express",
    trackingId: "TRK-ERN-71029",
    estimatedDelivery: "14 Aug 2026",
    shippingAddress: {
      recipientName: "Alex",
      tagline: "Workspace Member & Retail Partner",
      type: "Home",
      addressLine1: "Plot 42, Sector 18, Phase II, Industrial Area",
      addressLine2: "Near Central Food Logistics Hub",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400072",
      phone: "+91 98765 43210",
    },
    items: [
      {
        id: "item-7",
        productId: "prod-milk-01",
        name: "Amul Taaza Milk 1L",
        subtitle: "Homogenized Toned Milk Tetra Pak",
        brand: "Amul",
        category: "Dairy & Milk",
        imageUrl: "/assets/marketplace/milk_bottle.jpg",
        unit: "1L",
        quantity: 4,
        batchType: "Rescue Deal",
        shelfLifeAtPurchase: "5 days left",
        daysRemaining: 5,
        originalPrice: 42,
        paidPrice: 34,
        savings: 32,
      },
      {
        id: "item-8",
        productId: "prod-bread-01",
        name: "Britannia Whole Wheat Bread 400g",
        subtitle: "100% Atta Fresh Daily Baked Loaf",
        brand: "Britannia",
        category: "Bakery & Breads",
        imageUrl: "/assets/marketplace/bread_loaf.jpg",
        unit: "400g",
        quantity: 2,
        batchType: "Clearance",
        shelfLifeAtPurchase: "1 day left",
        daysRemaining: 1,
        originalPrice: 38,
        paidPrice: 20,
        savings: 36,
      },
      {
        id: "item-9",
        productId: "prod-juice-01",
        name: "Tropicana Orange Juice 1L",
        subtitle: "100% Real Squeezed Fruit Juice",
        brand: "Tropicana",
        category: "Beverages & Juices",
        imageUrl: "/assets/marketplace/orange_juice.jpg",
        unit: "1L",
        quantity: 2,
        batchType: "Rescue Deal",
        shelfLifeAtPurchase: "4 days left",
        daysRemaining: 4,
        originalPrice: 120,
        paidPrice: 84,
        savings: 72,
      },
    ],
    itemsSubtotal: 484,
    ernDiscount: 140,
    deliveryFee: 0,
    taxes: 0,
    totalPaid: 344,
    totalSavings: 140,
    productsRescued: 8,
    wastePreventedKg: 2.4,
    timeline: [
      {
        id: "step-1",
        title: "Order Placed",
        timestamp: "12 Aug · 4:20 PM",
        completed: true,
        current: false,
      },
      {
        id: "step-2",
        title: "Order Confirmed",
        timestamp: "12 Aug · 4:25 PM",
        completed: true,
        current: false,
      },
      {
        id: "step-3",
        title: "Packed",
        timestamp: "13 Aug · 8:30 AM",
        completed: true,
        current: false,
      },
      {
        id: "step-4",
        title: "Dispatched",
        timestamp: "13 Aug · 1:00 PM",
        completed: true,
        current: false,
      },
      {
        id: "step-5",
        title: "Out for Delivery",
        timestamp: "14 Aug · 10:15 AM",
        completed: true,
        current: false,
      },
      {
        id: "step-6",
        title: "Delivered",
        timestamp: "14 Aug · 1:45 PM",
        completed: true,
        current: true,
        locationNote: "Handed to recipient with Verified PIN",
      },
    ],
  },

  // 4. Order 4: Cancelled
  {
    id: "ERN-2026-40291",
    orderDate: "05 Aug 2026, 2:10 PM",
    orderDateSimple: "05 Aug 2026",
    status: "Cancelled",
    paymentStatus: "Refunded to Source",
    paymentMethod: "UPI",
    deliveryMethod: "Standard Delivery",
    deliveryPartner: "BlueDart Express",
    trackingId: "TRK-ERN-61298",
    estimatedDelivery: "Cancelled",
    shippingAddress: {
      recipientName: "Alex",
      tagline: "Workspace Member & Retail Partner",
      type: "Home",
      addressLine1: "Plot 42, Sector 18, Phase II, Industrial Area",
      addressLine2: "Near Central Food Logistics Hub",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400072",
      phone: "+91 98765 43210",
    },
    items: [
      {
        id: "item-10",
        productId: "prod-chips-01",
        name: "Lays Classic Salted 52g",
        subtitle: "Crispy Golden Potato Chips Pack",
        brand: "FritoLay",
        category: "Snacks & Munchies",
        imageUrl: "/assets/marketplace/lays_chips.jpg",
        unit: "52g",
        quantity: 3,
        batchType: "Clearance",
        shelfLifeAtPurchase: "1 day left",
        daysRemaining: 1,
        originalPrice: 28,
        paidPrice: 16,
        savings: 36,
      },
    ],
    itemsSubtotal: 84,
    ernDiscount: 36,
    deliveryFee: 30,
    taxes: 0,
    totalPaid: 0,
    totalSavings: 0,
    productsRescued: 0,
    wastePreventedKg: 0,
    cancellationReason: "Cancelled by user — Destination changed to secondary warehouse.",
    timeline: [
      {
        id: "step-1",
        title: "Order Placed",
        timestamp: "05 Aug · 2:10 PM",
        completed: true,
        current: false,
      },
      {
        id: "step-2",
        title: "Cancelled & Refunded",
        timestamp: "05 Aug · 2:35 PM",
        completed: true,
        current: true,
        locationNote: "Refund processed to UPI ID instantly",
      },
    ],
  },
];

export function getStoredOrders(): Order[] {
  try {
    const stored = localStorage.getItem("ern_all_orders");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_ORDERS;
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem("ern_all_orders", JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }
}
