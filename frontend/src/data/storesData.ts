export interface StoreLocation {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  area: string;
  city: string;
  pincode: string;
  distance: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  aisleLocation: string;
  managerName: string;
  contactNumber: string;
  operatingHours: string;
  activeCampaignsCount: number;
  discountedItemsCount: number;
  isOpen: boolean;
}

export const STORES_DATA: StoreLocation[] = [
  {
    id: "main-branch",
    name: "Main Branch",
    shortCode: "MB-01",
    address: "Plot 42, 100ft Road, Indiranagar Metro Hub",
    area: "Indiranagar",
    city: "Bengaluru, KA",
    pincode: "560038",
    distance: "1.2 km away",
    coordinates: {
      lat: 12.9716,
      lng: 77.6412,
    },
    aisleLocation: "Aisle 3 & 4 (Chilled Dairy & Bakery Clearance Zone)",
    managerName: "Amit Sharma",
    contactNumber: "+91 98450 12345",
    operatingHours: "08:00 AM – 10:30 PM",
    activeCampaignsCount: 4,
    discountedItemsCount: 68,
    isOpen: true,
  },
  {
    id: "city-center",
    name: "City Center",
    shortCode: "CC-02",
    address: "Level 1, Sector 18 Commercial Complex, MG Road",
    area: "Central Business District",
    city: "Bengaluru, KA",
    pincode: "560001",
    distance: "3.8 km away",
    coordinates: {
      lat: 12.9784,
      lng: 77.5946,
    },
    aisleLocation: "Rack B2 (Express Grocery & Fresh Produce Bay)",
    managerName: "Priya Sundaram",
    contactNumber: "+91 98450 54321",
    operatingHours: "09:00 AM – 11:00 PM",
    activeCampaignsCount: 2,
    discountedItemsCount: 42,
    isOpen: true,
  },
  {
    id: "north-outlet",
    name: "North Outlet",
    shortCode: "NO-03",
    address: "5th Block, 80ft Main Road, Near Sony World Signal",
    area: "Koramangala",
    city: "Bengaluru, KA",
    pincode: "560095",
    distance: "5.4 km away",
    coordinates: {
      lat: 12.9352,
      lng: 77.6245,
    },
    aisleLocation: "Front Entrance Display Rack 1 & Chiller C4",
    managerName: "Rohan Verma",
    contactNumber: "+91 98450 67890",
    operatingHours: "07:30 AM – 10:00 PM",
    activeCampaignsCount: 2,
    discountedItemsCount: 31,
    isOpen: true,
  },
  {
    id: "east-wing",
    name: "East Wing Express",
    shortCode: "EW-04",
    address: "ITPL Main Road, Prestige Shantiniketan Junction",
    area: "Whitefield",
    city: "Bengaluru, KA",
    pincode: "560066",
    distance: "8.1 km away",
    coordinates: {
      lat: 12.9698,
      lng: 77.7499,
    },
    aisleLocation: "Counter 6 Quick-Pick Clearance Endcap",
    managerName: "Ananya Rao",
    contactNumber: "+91 98450 99887",
    operatingHours: "08:00 AM – 11:30 PM",
    activeCampaignsCount: 1,
    discountedItemsCount: 15,
    isOpen: true,
  },
];
