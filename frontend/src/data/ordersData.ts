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
  batchNumber?: string;
  storeId?: string;
  storeName?: string;
  expiryDate?: string;
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
  storeId?: string;
  storeName?: string;
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
  // 1. Order 1: Out for Delivery
  {
    id: "ERN-2026-82802",
    orderDate: "05 Sep 2026, 10:30 AM",
    orderDateSimple: "05 Sep 2026",
    status: "Out for Delivery",
    paymentStatus: "Paid via UPI (Google Pay)",
    paymentMethod: "UPI",
    deliveryMethod: "Standard Delivery",
    deliveryPartner: "ERN Local Delivery",
    trackingId: "TRK-ERN-99214",
    estimatedDelivery: "Today by 2:00 PM",
    shippingAddress: {
      recipientName: "Customer",
      tagline: "Primary Residence",
      type: "Home",
      addressLine1: "Flat 402, Green Valley Apartments",
      addressLine2: "12th Main Road, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      phone: "+91 98765 43210",
    },
    items: [
      {
        id: "item-1",
        productId: "prod-milk-01",
        name: "Amul Taaza Toned Milk 1L",
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
        productId: "prod-curd-01",
        name: "Amul Masti Dahi 400g",
        subtitle: "Pasteurized Probiotic Curd Pouch",
        brand: "Amul",
        category: "Dairy & Milk",
        imageUrl: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=600&q=80",
        unit: "400g",
        quantity: 1,
        batchType: "Rescue Deal",
        shelfLifeAtPurchase: "4 days left",
        daysRemaining: 4,
        originalPrice: 35,
        paidPrice: 26,
        savings: 9,
      },
    ],
    itemsSubtotal: 125,
    ernDiscount: 32,
    deliveryFee: 30,
    taxes: 0,
    totalPaid: 155,
    totalSavings: 32,
    productsRescued: 4,
    wastePreventedKg: 1.6,
    timeline: [
      {
        id: "step-1",
        title: "Order Placed",
        timestamp: "05 Sep · 10:30 AM",
        completed: true,
        current: false,
        locationNote: "Order confirmed at Indiranagar Hub",
      },
      {
        id: "step-2",
        title: "Packed",
        timestamp: "05 Sep · 11:15 AM",
        completed: true,
        current: false,
        locationNote: "Batch items packed with cool storage pack",
      },
      {
        id: "step-3",
        title: "Out for Delivery",
        timestamp: "05 Sep · 12:45 PM",
        completed: false,
        current: true,
        locationNote: "Delivery executive en route",
      },
      {
        id: "step-4",
        title: "Delivered",
        timestamp: "Expected by 2:00 PM",
        completed: false,
        current: false,
      },
    ],
  },

  // 2. Order 2: Delivered
  {
    id: "ERN-2026-61842",
    orderDate: "02 Sep 2026, 4:20 PM",
    orderDateSimple: "02 Sep 2026",
    status: "Delivered",
    paymentStatus: "Paid via UPI",
    paymentMethod: "UPI",
    deliveryMethod: "Standard Delivery",
    deliveryPartner: "ERN Local Delivery",
    trackingId: "TRK-ERN-71029",
    estimatedDelivery: "03 Sep 2026",
    shippingAddress: {
      recipientName: "Customer",
      tagline: "Primary Residence",
      type: "Home",
      addressLine1: "Flat 402, Green Valley Apartments",
      addressLine2: "12th Main Road, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      phone: "+91 98765 43210",
    },
    items: [
      {
        id: "item-4",
        productId: "prod-milk-01",
        name: "Amul Taaza Toned Milk 1L",
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
        id: "item-5",
        productId: "prod-juice-01",
        name: "Tropicana Orange Juice 1L",
        subtitle: "100% Real Squeezed Fruit Juice Tetra Pak",
        brand: "Tropicana",
        category: "Beverages & Tea",
        imageUrl: "/assets/marketplace/orange_juice.jpg",
        unit: "1L",
        quantity: 1,
        batchType: "Rescue Deal",
        shelfLifeAtPurchase: "4 days left",
        daysRemaining: 4,
        originalPrice: 120,
        paidPrice: 84,
        savings: 36,
      },
    ],
    itemsSubtotal: 152,
    ernDiscount: 52,
    deliveryFee: 0,
    taxes: 0,
    totalPaid: 152,
    totalSavings: 52,
    productsRescued: 3,
    wastePreventedKg: 2.1,
    timeline: [
      {
        id: "step-1",
        title: "Order Placed",
        timestamp: "02 Sep · 4:20 PM",
        completed: true,
        current: false,
      },
      {
        id: "step-2",
        title: "Packed",
        timestamp: "02 Sep · 5:00 PM",
        completed: true,
        current: false,
      },
      {
        id: "step-3",
        title: "Out for Delivery",
        timestamp: "03 Sep · 9:30 AM",
        completed: true,
        current: false,
      },
      {
        id: "step-4",
        title: "Delivered",
        timestamp: "03 Sep · 11:10 AM",
        completed: true,
        current: true,
        locationNote: "Handed over at door",
      },
    ],
  },
];

export function getStoredOrders(): Order[] {
  try {
    const stored = localStorage.getItem("ern_all_orders");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
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
