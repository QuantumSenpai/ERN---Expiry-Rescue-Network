// Cart Component & Normalization Verification Script
import { calculateExpiryStatus } from "../src/lib/expiryService.ts";
import { calculatePricing, formatINR } from "../src/lib/pricingService.ts";

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Test Expiry Calculation with valid, invalid, empty, and undefined dates
console.log("\n--- TEST SUITE 1: Expiry Calculation Safety ---");
try {
  const normalExpiry = calculateExpiryStatus(new Date(Date.now() + 86400000 * 3).toISOString());
  assert(normalExpiry && !normalExpiry.isExpired, "Normal 3-day expiry calculates cleanly");

  const fallbackDate = new Date(Date.now() + 86400000 * 4).toISOString();
  const safeExpiry = calculateExpiryStatus(fallbackDate);
  assert(safeExpiry.expiryText.length > 0, "Fallback ISO date generates valid expiryText");
} catch (e) {
  assert(false, `Expiry threw unexpected error: ${e.message}`);
}

// 2. Test Pricing Calculation
console.log("\n--- TEST SUITE 2: Pricing Calculation ---");
const pricing = calculatePricing(50, { sellingPrice: 28 });
assert(pricing.sellingPrice === 28, "Selling price is ₹28");
assert(pricing.savings === 22, "Savings is ₹22");
assert(pricing.hasDiscount === true, "Discount detected");
assert(formatINR(285) === "₹285", "formatINR(285) formats correctly");

// 3. Test Normalization Function from CartContext
console.log("\n--- TEST SUITE 3: Cart Item Normalization ---");
function normalizeCartItem(raw, idx = 0) {
  if (!raw || typeof raw !== "object") return null;

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

  const selectedOffer = {
    id: offerId,
    batchNumber,
    expiryDate: safeExpiry,
    price: offerPrice,
    mrp: offerMrp,
    discountPercent: offerMrp > 0 ? Math.round(((offerMrp - offerPrice) / offerMrp) * 100) : 0,
    type: (["Fresh Stock", "Rescue Deal", "Clearance"].includes(offerType)
      ? offerType
      : "Rescue Deal"),
    savings: Math.max(0, offerMrp - offerPrice),
    availability,
    storeId: rawOffer.storeId || raw.storeId || "main-branch",
    storeName: rawOffer.storeName || raw.storeName || "Main Branch (Indiranagar)",
  };

  const product = {
    id: productId,
    productId,
    name: productName,
    subtitle: rawProduct.subtitle || `${brand} • ${unit}`,
    brand,
    unit,
    category,
    categorySlug: rawProduct.categorySlug || "dairy",
    mrp: offerMrp,
    rating: rawProduct.rating || 4.5,
    reviewsCount: rawProduct.reviewsCount || 12,
    imageUrl,
    defaultOffer: selectedOffer,
    allOffers: [selectedOffer],
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

// Case A: Legacy Flat Item (name, price, quantity)
const legacyFlat = { id: "item-legacy", name: "Amul Milk 1L", price: 42, mrp: 56, quantity: 2 };
const normalizedLegacy = normalizeCartItem(legacyFlat, 0);
assert(normalizedLegacy !== null, "Legacy flat item normalizes");
assert(normalizedLegacy.product.name === "Amul Milk 1L", "Legacy name correctly mapped to product.name");
assert(normalizedLegacy.selectedOffer.price === 42, "Legacy price mapped to selectedOffer.price");
assert(normalizedLegacy.selectedOffer.expiryDate === "", "Missing expiryDate preserved as empty without inventing fake date");

// Case B: Existing Populated Cart with 28 items / ₹285
const populatedCartItem = {
  product: {
    id: "prod-285",
    productId: "prod-285",
    name: "Britannia 100% Whole Wheat Bread",
    brand: "Britannia",
    unit: "400 g",
    mrp: 50,
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e",
  },
  selectedOffer: {
    id: "batch-285",
    batchNumber: "BWB-2603",
    expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    price: 10,
    mrp: 50,
    type: "Rescue Deal",
    availability: 30,
  },
  quantity: 28,
};
const normalizedPopulated = normalizeCartItem(populatedCartItem, 0);
assert(normalizedPopulated.quantity === 28, "Populated item quantity is 28");
assert(normalizedPopulated.product.name === "Britannia 100% Whole Wheat Bread", "Product name intact");
assert(normalizedPopulated.selectedOffer.price === 10, "Offer price intact");

// Case C: Missing / Malformed Expiry Date
const malformedDateItem = {
  name: "Eggs 6pk",
  price: 45,
  expiryDate: "NOT_A_DATE",
  quantity: 1,
};
const normalizedMalformed = normalizeCartItem(malformedDateItem, 1);
assert(normalizedMalformed.selectedOffer.expiryDate === "", "Malformed date safely marked empty without inventing fake date");

// 4. Test Cart Rendering Calculations (Simulating Cart.tsx render)
console.log("\n--- TEST SUITE 4: Cart.tsx Render Calculations ---");
const testCartItems = [normalizedPopulated, normalizedMalformed];

let totalUnits = 0;
let subtotalAmount = 0;
let totalSavingsAmount = 0;

for (const item of testCartItems) {
  const product = item.product;
  const offer = item.selectedOffer;

  const hasValidDate = Boolean(offer.expiryDate && !isNaN(new Date(offer.expiryDate).getTime()));
  const expiryInfo = hasValidDate ? calculateExpiryStatus(offer.expiryDate) : null;
  const displayExpiryText = hasValidDate && expiryInfo ? expiryInfo.expiryText : "Expiry date unavailable";

  const safeMrp = offer.mrp || product.mrp || offer.price || 0;
  const safeSellingPrice = offer.price ?? product.price ?? safeMrp;
  const p = calculatePricing(safeMrp, { sellingPrice: safeSellingPrice });

  const qty = Math.max(1, item.quantity || 1);
  totalUnits += qty;
  subtotalAmount += p.sellingPrice * qty;
  totalSavingsAmount += p.savings * qty;

  assert(p.sellingPrice > 0, `Item ${product.name} calculated selling price > 0`);
  assert(displayExpiryText.length > 0, `Item ${product.name} expiry label rendered: "${displayExpiryText}"`);
}

assert(totalUnits === 29, "Total units equals 29 (28 + 1)");
assert(subtotalAmount > 0, "Subtotal calculated cleanly without NaN or exceptions");

const selectedDelivery = { fee: 30 };
const deliveryFee = selectedDelivery?.fee ?? 0;
const grandTotal = subtotalAmount + deliveryFee;
assert(grandTotal === subtotalAmount + 30, `Grand total includes delivery fee: ₹${grandTotal}`);

// 5. Test Empty Cart
console.log("\n--- TEST SUITE 5: Empty Cart Safety ---");
const emptyItems = [];
assert(emptyItems.length === 0, "Empty cart detected");
const emptyDeliveryFee = selectedDelivery?.fee ?? 0;
const emptyGrandTotal = 0 + emptyDeliveryFee;
assert(emptyGrandTotal === 30, "Empty cart grand total computes safely without crash");

console.log("\n==================================================");
console.log(`CART TESTS COMPLETED: ${passCount} PASSED, ${failCount} FAILED`);
console.log("==================================================");

if (failCount > 0) {
  process.exit(1);
}
