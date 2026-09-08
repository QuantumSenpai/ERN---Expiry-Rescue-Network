/**
 * Centralized Expiry Intelligence & Calculation Service
 * 
 * Provides unified, date-based expiry derivations across all marketplace screens:
 * - ProductCard
 * - SmartPriceProduct
 * - MultiBatchModal
 * - Cart & Checkout validation
 * - Orders & Reorder validation
 * - Browse & Search
 */

export type RescueTierType = "Fresh Stock" | "Rescue Deal" | "Clearance" | "Expired";

export interface ExpiryCalculationResult {
  expiryDateIso: string;
  isExpired: boolean;
  isUrgent: boolean; // <= 24 hours
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  totalHoursRemaining: number;
  expiryText: string;
  badgeLabel: string;
  badgeVariant: "fresh" | "rescue" | "clearance" | "expired";
  tier: RescueTierType;
  tierDescription: string;
}

/**
 * Calculates human-readable, precise expiry status from an ISO date string or Date object.
 */
export function calculateExpiryStatus(
  expiryDateInput: string | Date | number,
  nowInput?: Date | number
): ExpiryCalculationResult {
  const targetDate = new Date(expiryDateInput);
  const now = nowInput ? new Date(nowInput) : new Date();

  // Milliseconds difference
  const diffMs = targetDate.getTime() - now.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.ceil(totalHours / 24);

  const isExpired = diffMs <= 0;
  const isUrgent = !isExpired && totalHours <= 24;

  let expiryText = "";
  let tier: RescueTierType = "Fresh Stock";
  let tierDescription = "Standard shelf life";
  let badgeVariant: "fresh" | "rescue" | "clearance" | "expired" = "fresh";
  let badgeLabel = "FRESH";

  if (isExpired) {
    expiryText = "Expired";
    tier = "Expired";
    tierDescription = "Past eligible consumption date";
    badgeVariant = "expired";
    badgeLabel = "EXPIRED";
  } else if (totalHours < 1) {
    expiryText = `Expires in ${Math.max(1, totalMinutes)} mins`;
    tier = "Clearance";
    tierDescription = "Lowest price • Urgent rescue";
    badgeVariant = "clearance";
    badgeLabel = "CLEARANCE";
  } else if (totalHours <= 18) {
    expiryText = `Expires in ${totalHours} hours`;
    tier = "Clearance";
    tierDescription = "Lowest price • Urgent rescue";
    badgeVariant = "clearance";
    badgeLabel = "CLEARANCE";
  } else if (totalDays <= 1) {
    expiryText = "Expires tomorrow";
    tier = "Clearance";
    tierDescription = "Lowest price with 1 day left";
    badgeVariant = "clearance";
    badgeLabel = "CLEARANCE";
  } else if (totalDays <= 2) {
    expiryText = "2 days left";
    tier = "Clearance";
    tierDescription = "Lowest price with 2 days left";
    badgeVariant = "clearance";
    badgeLabel = "CLEARANCE";
  } else if (totalDays <= 7) {
    expiryText = `${totalDays} days left`;
    tier = "Rescue Deal";
    tierDescription = `Good value with ${totalDays} days left`;
    badgeVariant = "rescue";
    badgeLabel = "RESCUE DEAL";
  } else {
    expiryText = `${totalDays} days left`;
    tier = "Fresh Stock";
    tierDescription = "Standard shelf life";
    badgeVariant = "fresh";
    badgeLabel = "FRESH STOCK";
  }

  return {
    expiryDateIso: targetDate.toISOString(),
    isExpired,
    isUrgent,
    daysRemaining: Math.max(0, totalDays),
    hoursRemaining: Math.max(0, totalHours % 24),
    minutesRemaining: Math.max(0, totalMinutes % 60),
    totalHoursRemaining: Math.max(0, totalHours),
    expiryText,
    badgeLabel,
    badgeVariant,
    tier,
    tierDescription,
  };
}

/**
 * Helper to dynamically generate ISO dates relative to now.
 * Ensures data always stays relative and never goes stale in local testing.
 */
export function getRelativeIsoDate(daysFromNow: number, hoursOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString();
}
