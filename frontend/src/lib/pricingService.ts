/**
 * Centralized Pricing & Currency Calculation Service
 *
 * Enforces correct MRP representation, authentic discount calculations,
 * and standard Indian Rupee (₹) formatting across the entire marketplace.
 */

export interface PricingDetails {
  mrp: number; // Maximum Retail Price (original printed price)
  sellingPrice: number; // Final customer price after tier discount
  discountPercent: number; // Percentage off MRP
  savings: number; // Amount saved in ₹ (mrp - sellingPrice)
  formattedSellingPrice: string; // e.g. "₹34"
  formattedMrp: string; // e.g. "MRP ₹42"
  formattedSavings: string; // e.g. "Save ₹8"
  discountBadge: string; // e.g. "20% OFF"
  hasDiscount: boolean;
}

/**
 * Formats a number to Indian Rupee representation (₹)
 * e.g. 34 -> "₹34", 1250 -> "₹1,250"
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount == null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/**
 * Calculates accurate pricing details given MRP and either a selling price or discount percent.
 */
export function calculatePricing(
  mrp: number,
  sellingPriceOrDiscount?: { sellingPrice?: number; discountPercent?: number }
): PricingDetails {
  const safeMrp = Math.max(0, Math.round(mrp || 0));
  let sellingPrice = safeMrp;
  let discountPercent = 0;

  if (sellingPriceOrDiscount?.sellingPrice != null) {
    sellingPrice = Math.min(safeMrp, Math.max(0, Math.round(sellingPriceOrDiscount.sellingPrice)));
    if (safeMrp > 0 && sellingPrice < safeMrp) {
      discountPercent = Math.round(((safeMrp - sellingPrice) / safeMrp) * 100);
    }
  } else if (sellingPriceOrDiscount?.discountPercent != null) {
    discountPercent = Math.min(90, Math.max(0, Math.round(sellingPriceOrDiscount.discountPercent)));
    sellingPrice = Math.round(safeMrp * (1 - discountPercent / 100));
  }

  const savings = Math.max(0, safeMrp - sellingPrice);
  const hasDiscount = savings > 0 && discountPercent > 0;

  return {
    mrp: safeMrp,
    sellingPrice,
    discountPercent,
    savings,
    formattedSellingPrice: formatINR(sellingPrice),
    formattedMrp: `MRP ${formatINR(safeMrp)}`,
    formattedSavings: `Save ${formatINR(savings)}`,
    discountBadge: hasDiscount ? `${discountPercent}% OFF` : "",
    hasDiscount,
  };
}
