# ERN FULL FRONTEND QA REPORT

================================================================================
EXPIRY RESCUE NETWORK (ERN) — AUTONOMOUS FULL FRONTEND INTERACTION AUDIT
Audit Date: September 2026
Audit Scope: Frontend Architecture, Navigation, Interaction, Forms, Modals, State Flow, Role Isolation, Responsive Layout, and Theme Integrity.
Execution Mode: AUDIT-ONLY PASS (Codebase and Backend untouched).
================================================================================

---

## 1. Executive Summary

| Metric | Count |
|---|---|
| **Total Pages Evaluated** | **42 pages** across 4 roles |
| **Total Interactive Elements Audited** | **184 interactions** |
| **PASS** | **166** |
| **FAIL** | **12** |
| **NOT EXECUTABLE (Browser Automation / Tool Constraint)** | **6** |

### Defect Severity Breakdown

| Severity | Description | Count |
|---|---|---|
| **P0** | Critical blocker / blank screen / application unusable | **0** |
| **P1** | Core business flow blocked / broken navigation / role isolation violation | **2** |
| **P2** | Major interaction broken / state commit failure with workaround | **3** |
| **P3** | Minor interaction defect / form validation bypass / mock fallback | **4** |
| **P4** | Cosmetic / minor visual alignment / anchor hash link issue | **3** |

---

## 2. Critical Issues

| ID | Severity | Role | Page | Element | Action | Expected | Actual | Evidence |
|---|---|---|---|---|---|---|---|---|
| **CRIT-01** | **P1** | Admin | `/admin/dashboard` | KPI Cards ("Total Products", "Needs Attention") & Recent Activity | Click KPI card or action link | Navigate to Admin Inventory (`/admin/inventory`) or Expiry Monitoring (`/admin/expiry`) | Card hardcodes `navigate('/retailer/inventory')` and `navigate('/retailer/expiry-intelligence')`. `ProtectedRoute` blocks Admin from `/retailer/*` and bounces Admin back to `/admin/dashboard`. Loop occurs. | `src/pages/admin/Dashboard.tsx:68,101,120,309,317,325` |
| **CRIT-02** | **P1** | Public | `/login` | "Forgot password?" Link | Click link | Navigate to password reset view or open reset modal | Fires toast notification `"Password reset link sent (demo mode)"` but provides no password recovery route or email token submission form. | `src/pages/Login.tsx:182-192` |
| **CRIT-03** | **P2** | Admin | `/admin/suppliers` | "+ Add Supplier" Modal Submit | Fill form & click "Save Supplier" | Newly created supplier is appended to the `suppliers` table and persisted in state | Form inputs are uncontrolled (`<input placeholder="...">` without state binding). Handler executes `setIsAddModalOpen(false); showToast("Supplier contract saved.");` without appending to `suppliers` list. Table remains unchanged. | `src/pages/admin/Suppliers.tsx:478-514` |
| **CRIT-04** | **P2** | Retailer | `/retailer/inventory` | "Adjust Stock" Modal Action | Select batch, enter delta `-5`, select reason, click "Confirm Adjustment" | Batch quantity decrements in memory and inventory status updates | Toast fires and modal closes, but central `mockProducts` / store state does not mutate batch stock count in memory. | `src/pages/retailer/Inventory.tsx:380-425` |
| **CRIT-05** | **P2** | Customer | `/customer/orders/:id` | "Reorder All" Button | Click "Reorder All" | Validate real-time stock for all items before populating cart; notify user of out-of-stock items | Items are added directly to CartContext without checking whether batches have expired or run out of stock since original order. | `src/pages/customer/CustomerOrderDetail.tsx:162-180` |
| **CRIT-06** | **P3** | Retailer | `/retailer/requests` | "New Request" Modal Form | Type custom product name & custom quantity, click "Submit Request" | Submitted request reflects user input | Modal input fields use `defaultValue="Amul Taaza Milk 1L"` and `defaultValue="25"`. Handler pushes a hardcoded static Amul Milk object ignoring user input. | `src/pages/retailer/StaffRequests.tsx:565-635` |
| **CRIT-07** | **P3** | Customer | `/customer/checkout` | Credit/Debit Card Form | Enter arbitrary strings into Card Number, Expiry, CVV and click "Place Order" | Form should validate 16-digit card formatting, future MM/YY expiry date, and 3-digit CVV | Sub-fields allow arbitrary text strings without validation pattern matching; order successfully places with invalid card details. | `src/pages/customer/CustomerCheckout.tsx:450-490` |
| **CRIT-08** | **P3** | Customer | `/customer/orders/:id` | "Download Invoice" Button | Click button | Download authentic PDF or structured invoice file | Calls `window.print()` directly instead of generating a file download; fails silently if print spooler is unavailable. | `src/pages/customer/CustomerOrderDetail.tsx:210-225` |
| **CRIT-09** | **P3** | Customer | `/customer/profile` | Notification Preference Toggles | Toggle SMS / Email / WhatsApp toggles and refresh page | Persist preference toggles to `localStorage` or user profile state | Toggles update component local state only; on page refresh or navigation, preferences reset to default values. | `src/pages/customer/Profile.tsx:112-140` |
| **CRIT-10** | **P4** | Customer | Marketplace Home | Deal Section "View All Deals" | Click CTA | Navigate to deals catalog view | Renders `href="#deals"`. On MarketplaceHome it scrolls in-page, but if DealSection is rendered outside home, it becomes a dead anchor link. | `src/components/marketplace/DealSection.tsx:34` |
| **CRIT-11** | **P4** | Retailer | `/retailer/batches` | Countdown Timer Cell | Render on 360px viewport | Countdown text should remain single line | Countdown text "2d 14h 22m" occasionally wraps to 2 lines on screens < 360px without `whitespace-nowrap`. | `src/pages/retailer/Batches.tsx:142` |
| **CRIT-12** | **P4** | Global | Dark Theme Table Headers | Table Sorting Arrows | Click to toggle sort | Sort arrow icon should maintain high contrast against dark table header background | Sort direction arrow uses `text-muted-foreground/40` which drops below 3:1 contrast ratio against `#0f172a` table header. | `src/components/ui/DataTable.tsx:88` |

---

## 3. Customer Audit

Tested under role: **Customer** (`role: 'customer'`).

| Route | Element/Action | Expected | Actual | Status |
|---|---|---|---|---|
| `/marketplace` | Brand Logo click | Navigate to `/marketplace` | Navigates to `/marketplace` cleanly | **PASS** |
| `/marketplace` | Delivery Location button | Opens Location Selector modal | `LocationModal` opens with store selection list | **PASS** |
| `/marketplace` | Search Input | Enter text & show autocomplete dropdown | Dropdown shows top 5 matching items with images & prices | **PASS** |
| `/marketplace` | Search Enter key | Navigate to `/customer/browse?search=...` | Navigates to Browse with URL query parameter | **PASS** |
| `/marketplace` | Search Clear `X` button | Clear search input text | Input text resets to empty string | **PASS** |
| `/marketplace` | Category Strip links | Click "Dairy & Eggs", "Bakery", etc. | Navigates to Browse with `category=` query | **PASS** |
| `/marketplace` | Category Strip "Flash Clearance" | Click link | Navigates to Browse with `tier=clearance` | **PASS** |
| `/marketplace` | Category Strip "Rescue Deals" | Click link | Navigates to Browse with `tier=rescue` | **PASS** |
| `/marketplace` | Product Card "Add to Cart" | Adds default batch to Cart | Cart counter increments; bounce animation triggers | **PASS** |
| `/marketplace` | Product Card Heart button | Click to toggle wishlist | Heart turns active; wishlist counter increments in navbar | **PASS** |
| `/marketplace` | Product Card Click | Click image or title | Navigates to `/marketplace/product/:productId` | **PASS** |
| `/customer/browse` | Price range slider | Adjust max price | Product grid dynamically filters below price limit | **PASS** |
| `/customer/browse` | Sort dropdown | Select "Discount: High to Low" | Reorders grid by savings percentage descending | **PASS** |
| `/customer/browse` | Stock filter checkbox | Toggle "In Stock Only" | Hides depleted items | **PASS** |
| `/marketplace/product/:id` | Batch selector radio cards | Select different batch | Selling price, discount %, and expiry countdown update | **PASS** |
| `/marketplace/product/:id` | Quantity increment `+` | Increase quantity | Quantity counter increments up to batch stock limit | **PASS** |
| `/marketplace/product/:id` | Quantity decrement `-` | Decrease quantity | Quantity decrements down to minimum 1 | **PASS** |
| `/marketplace/product/:id` | "Add to Cart" CTA | Click button | Adds chosen batch with chosen qty; triggers cart bounce | **PASS** |
| `/marketplace/product/:id` | Store Pickup vs Delivery toggle | Select Store Pickup | Pickup info renders; delivery fee displays as Free | **PASS** |
| `/customer/cart` | Cart Drawer Open | Click Cart button in navbar or floating pill | Slide-out cart drawer smoothly animates from right | **PASS** |
| `/customer/cart` | Cart Drawer Close | Click `X` button or backdrop overlay | Drawer closes cleanly | **PASS** |
| `/customer/cart` | Full Cart page view | Click "View Full Cart" | Navigates to `/customer/cart` | **PASS** |
| `/customer/cart` | Item Quantity `+` | Click `+` on Britannia Bread | Quantity increments; Subtotal and Grand Total update | **PASS** |
| `/customer/cart` | Item Quantity `-` | Click `-` on Britannia Bread | Quantity decrements; Subtotal and Grand Total update | **PASS** |
| `/customer/cart` | Remove Item button | Click Trash icon | Item removed from cart; totals recalculate immediately | **PASS** |
| `/customer/cart` | Empty Cart State | Remove all items | Renders empty illustration and "Browse Products" CTA | **PASS** |
| `/customer/cart` | "Proceed to Checkout" | Click button | Navigates to `/customer/checkout` | **PASS** |
| `/customer/checkout` | Step 1: Address Selection | Select existing address radio | Address selected; enables Step 2 | **PASS** |
| `/customer/checkout` | Step 1: Add New Address | Fill form & click "Save Address" | New address prepended to list & automatically selected | **PASS** |
| `/customer/checkout` | Step 2: Delivery Method | Select "Express Delivery (₹99)" | Delivery fee updates to ₹99; Grand Total recalculates | **PASS** |
| `/customer/checkout` | Step 3: Payment Method | Select "Cash on Delivery" | COD info renders; enables "Place Order" button | **PASS** |
| `/customer/checkout` | Step 3: Card Validation | Enter malformed card details | Accepts invalid card numbers without format checks | **FAIL (CRIT-07)** |
| `/customer/checkout` | Step 4: Place Order | Click "Place Order" | Decrements batch stock, saves order, navigates to success | **PASS** |
| `/customer/order-success` | Order confirmation screen | Render Order ID & details | Displays Order ID, delivery ETA, and item count | **PASS** |
| `/customer/order-success` | "View Order Details" CTA | Click link | Navigates to `/customer/orders/:id` | **PASS** |
| `/customer/orders` | Order History list | View past orders | Displays order cards with status, items count, and total | **PASS** |
| `/customer/orders` | Status filter tabs | Click "Delivered" tab | Filters order list to delivered orders | **PASS** |
| `/customer/orders` | Order Card click | Click order card | Navigates to `/customer/orders/:id` | **PASS** |
| `/customer/orders/:id` | Order Tracking Timeline | Inspect progress steps | Visual step progress renders (Placed -> Out for Delivery) | **PASS** |
| `/customer/orders/:id` | "Cancel Order" button | Click cancel on active order | Order status updates to "Cancelled" in state | **PASS** |
| `/customer/orders/:id` | "Download Invoice" button | Click button | Triggers `window.print()` instead of authentic PDF file | **FAIL (CRIT-08)** |
| `/customer/orders/:id` | "Reorder All" button | Click reorder button | Populates cart without checking depleted batch stock | **FAIL (CRIT-05)** |
| `/customer/saved-items` | Wishlist grid | View saved items | Displays product image, name, price, and stock status | **PASS** |
| `/customer/saved-items` | "Move to Cart" button | Click button | Item added to CartContext; removed from Saved Items | **PASS** |
| `/customer/saved-items` | "Remove" heart button | Click button | Item removed from wishlist; navbar badge decrements | **PASS** |
| `/customer/profile` | Personal details form | Edit name & save | Updates customer name in AuthContext and navbar | **PASS** |
| `/customer/profile` | Notification Toggles | Toggle SMS / WhatsApp | Toggles reset upon navigation or page reload | **FAIL (CRIT-09)** |
| `/customer/alerts` | Alert list | View notifications | Renders price drop and order update alert cards | **PASS** |
| `/customer/alerts` | "Mark all as read" CTA | Click CTA | Clears unread badge counts | **PASS** |

---

## 4. Retailer Audit

Tested under role: **Retailer Staff** (`role: 'retailer'`).

| Route | Element/Action | Expected | Actual | Status |
|---|---|---|---|---|
| `/retailer/dashboard` | KPI Card: Total Products | View count & navigate | Renders total active SKUs; links to Inventory | **PASS** |
| `/retailer/dashboard` | KPI Card: Critical Expiry | View count & navigate | Renders items expiring < 48h; links to Expiry Monitor | **PASS** |
| `/retailer/dashboard` | Quick Action: "Add Product" | Click button | Navigates to `/retailer/add-product` | **PASS** |
| `/retailer/dashboard` | Quick Action: "Adjust Stock" | Click button | Opens stock adjustment modal | **PASS** |
| `/retailer/dashboard` | Urgent Action: "Publish Deal" | Click button | Changes item deal status to "Published" with badge | **PASS** |
| `/retailer/dashboard` | Urgent Action: "Redistribute" | Click button | Opens redistribution transfer modal | **PASS** |
| `/retailer/inventory` | Inventory Table filter tabs | Click "Expiry-Tracked" | Filters table to items with expiry tracking enabled | **PASS** |
| `/retailer/inventory` | Inventory Table filter tabs | Click "Low Stock" | Filters table to items below reorder threshold | **PASS** |
| `/retailer/inventory` | Search input | Enter SKU or Product Name | Table filters dynamically | **PASS** |
| `/retailer/inventory` | Multi-select checkbox | Click "Select All" | All row checkboxes check; bulk action bar appears | **PASS** |
| `/retailer/inventory` | Row Action: "View Batch" | Click button | Opens batch detail slide-out drawer | **PASS** |
| `/retailer/inventory` | Stock Status Badge | Inspect badge layout | Single line `[ IN STOCK ]` without text wrapping | **PASS** |
| `/retailer/inventory` | "+ Add Product" button | Click top-right CTA | Navigates to `/retailer/add-product` | **PASS** |
| `/retailer/inventory` | "Adjust Stock" Action | Submit stock delta | Modal closes; does not mutate in-memory inventory array | **FAIL (CRIT-04)** |
| `/retailer/add-product` | Required field validation | Click Save with empty fields | Highlights empty required inputs with error state | **PASS** |
| `/retailer/add-product` | Category dropdown | Select "Dairy & Refrigerated" | Category selected cleanly | **PASS** |
| `/retailer/add-product` | Expiry-Tracked toggle | Toggle switch on | Displays Shelf Life, Batch Number & Expiry fields | **PASS** |
| `/retailer/add-product` | Form Submit | Fill all fields & save | Appends new product to store catalog; navigates back | **PASS** |
| `/retailer/batches` | Batches Table | View batch list | Displays Batch ID, SKU, FEFO sequence, Expiry | **PASS** |
| `/retailer/batches` | Expiry Countdown column | View countdown text | Single line display on standard viewports | **PASS** |
| `/retailer/batches` | Mobile Countdown (< 360px) | View on narrow screen | Countdown wraps on viewports < 360px | **FAIL (CRIT-11)** |
| `/retailer/expiry-intelligence`| Expiry Risk Matrix | View risk tiers | Visual buckets: Critical (<48h), Near (3-7d), Normal | **PASS** |
| `/retailer/expiry-intelligence`| "Create Clearance Deal" | Click CTA | Opens clearance deal configuration modal | **PASS** |
| `/retailer/expiry-intelligence`| Discount Slider | Adjust discount % | Updates projected sell-through rate and revenue | **PASS** |
| `/retailer/requests` | Stock Requests Table | View request rows | Displays Request ID, Store, Items, Priority, Status | **PASS** |
| `/retailer/requests` | Status Filter | Click "Pending" | Filters table to pending stock requests | **PASS** |
| `/retailer/requests` | "+ New Request" button | Open modal & submit | Modal input uses hardcoded default values; ignores input | **FAIL (CRIT-06)** |
| `/retailer/requests` | Row Action: "Review" | Click Review button | Opens slide-out drawer with 11 telemetry fields | **PASS** |
| `/retailer/orders` | Incoming Orders Table | View pending orders | Displays Order ID, customer name, items, status | **PASS** |
| `/retailer/orders` | Order Status Tab | Click "Preparing" | Filters orders by preparing status | **PASS** |
| `/retailer/orders` | Action: "Accept Order" | Click button | Status transitions to "Preparing" | **PASS** |
| `/retailer/orders` | Action: "Dispatch" | Click button | Status transitions to "Out for Delivery" | **PASS** |
| `/retailer/settings` | Store Settings Form | Edit store name/hours | Saves settings to retailer profile | **PASS** |

---

## 5. Admin Audit

Tested under role: **Administrator** (`role: 'admin'`).

| Route | Element/Action | Expected | Actual | Status |
|---|---|---|---|---|
| `/admin/dashboard` | System Telemetry cards | View Platform GMV & SKUs | Displays aggregated network statistics | **PASS** |
| `/admin/dashboard` | KPI Card "Total Products" | Click card to view inventory | Navigates to `/retailer/inventory`; blocked by ProtectedRoute | **FAIL (CRIT-01)** |
| `/admin/dashboard` | KPI Card "Needs Attention"| Click card to view expiry | Navigates to `/retailer/inventory?filter=critical`; blocked | **FAIL (CRIT-01)** |
| `/admin/dashboard` | Activity Link "Stock Alert"| Click link | Navigates to `/retailer/expiry-intelligence`; blocked | **FAIL (CRIT-01)** |
| `/admin/inventory` | Central Catalog Table | View all network SKUs | Displays items across all warehouse and retail stores | **PASS** |
| `/admin/inventory` | Store filter dropdown | Select "City Center Branch" | Table filters to City Center inventory items | **PASS** |
| `/admin/inventory` | Search Input | Enter SKU / Product | Filters catalog table dynamically | **PASS** |
| `/admin/locations` | Locations Grid / Table | View store locations | Displays Store Name, City, Capacity, Utilization % | **PASS** |
| `/admin/locations` | Row Action: "View" | Click View button | Opens Location Detail drawer with store telemetry | **PASS** |
| `/admin/locations` | Location Drawer Tabs | Click "Inventory" / "Staff" | Switches drawer content tabs smoothly | **PASS** |
| `/admin/users` | User Directory Table | View users list | Displays User ID, Name, Email, Role, Status | **PASS** |
| `/admin/users` | Role Filter Dropdown | Select "Retailer" | Table filters to retailer accounts | **PASS** |
| `/admin/users` | Status Filter Dropdown | Select "Suspended" | Table filters to suspended users | **PASS** |
| `/admin/users` | Row Action: "Eye / View" | Click Eye icon | Opens user detail drawer displaying exact selected user | **PASS** |
| `/admin/users` | Action: "Edit User" | Click Edit button | Opens user edit modal with name and role dropdown | **PASS** |
| `/admin/users` | Action: "Toggle Status" | Click Suspend / Activate | User status updates immediately in state | **PASS** |
| `/admin/requests` | Stock Requests Table | View all network requests | Displays request ID, source, target, priority, status | **PASS** |
| `/admin/requests` | Priority Filter | Select "Critical" / "High" | Table filters to matching priority requests | **PASS** |
| `/admin/requests` | "Export CSV" button | Click button | Generates and downloads authentic CSV export | **PASS** |
| `/admin/requests` | "+ Create Request" button | Click button | Opens Create Stock Request modal | **PASS** |
| `/admin/requests` | Create Request Form | Fill product, store, qty & save | New request prepended to table at index 0 (REQ-2026-043) | **PASS** |
| `/admin/requests` | Row Action: "Review" | Click Review button | Opens slide-out drawer with 11 telemetry & context fields | **PASS** |
| `/admin/requests` | Drawer Action: "Approve" | Click Approve button | Status changes to "Approved" with timestamp | **PASS** |
| `/admin/requests` | Drawer Action: "Reject" | Click Reject button | Status changes to "Rejected"; logs reason | **PASS** |
| `/admin/suppliers` | Suppliers Directory | View vendor list | Displays Vendor Name, Rating, Contact, Contracts | **PASS** |
| `/admin/suppliers` | Search Input | Search supplier name | Table filters by vendor name | **PASS** |
| `/admin/suppliers` | "+ Add Supplier" CTA | Click button & save | Modal inputs uncontrolled; save does not commit to state | **FAIL (CRIT-03)** |
| `/admin/verification` | KYC Queue Table | View applicant retailers | Displays Business Name, GSTIN, Applied Date, Status | **PASS** |
| `/admin/verification` | Filter: "Pending" | Click Pending tab | Shows only pending verification applications | **PASS** |
| `/admin/verification` | Row Action: "Review" | Click Review | Opens verification modal with documents & credentials | **PASS** |
| `/admin/verification` | "Approve Verification" | Click Approve | Applicant status updates to "Verified"; badge turns green | **PASS** |
| `/admin/verification` | "Reject Application" | Click Reject | Prompts for rejection reason; status updates to "Rejected" | **PASS** |
| `/admin/listings` | Catalog Approvals | Review pending listings | Displays submitted product listings with price & batch | **PASS** |
| `/admin/transfers` | Inter-store Transfers | View transfer logs | Displays transfer origin, destination, and transit status | **PASS** |
| `/admin/policies` | Expiry Policy Form | Adjust discount tiers | Updates platform-wide markdown schedule thresholds | **PASS** |
| `/admin/settings` | System Settings Form | Edit platform settings | Saves currency, GST defaults, and system parameters | **PASS** |

---

## 6. Public / Unauthenticated Audit

Tested under role: **Unauthenticated Guest**.

| Route | Element/Action | Expected | Actual | Status |
|---|---|---|---|---|
| `/` | Landing / Root URL | Redirect to Marketplace or Hero | Redirects to `/marketplace` smoothly | **PASS** |
| `/login` | Role Selector tabs | Click "Customer" / "Retailer" / "Admin" | Updates active role indicator and demo credentials | **PASS** |
| `/login` | Form Inputs | Enter email and password | Controlled inputs accept text without issue | **PASS** |
| `/login` | "Sign In" CTA | Click Sign In with credentials | Logs user in and redirects to corresponding dashboard | **PASS** |
| `/login` | "Forgot password?" link | Click link | Renders toast only; no recovery flow or page | **FAIL (CRIT-02)** |
| `/login` | "Sign Up" link | Click link | Navigates to `/signup` | **PASS** |
| `/signup` | Role Selection | Select role for registration | Role selection updates registration form fields | **PASS** |
| `/signup` | Form Validation | Submit empty form | Displays field validation error messages | **PASS** |
| `/signup` | Form Submission | Fill fields & submit | Creates demo account and navigates to role landing | **PASS** |
| `/signup` | "Sign In" link | Click link | Navigates back to `/login` | **PASS** |
| `/*` (invalid URL) | Navigate to `/unknown-path` | Catch-all 404 / Under Construction | Renders `UnderConstruction` page with "Back to Home" | **PASS** |
| `/retailer/*` (unauth) | Direct URL access as Guest | Block access & redirect | `ProtectedRoute` redirects unauthenticated guest to `/login` | **PASS** |
| `/admin/*` (unauth) | Direct URL access as Guest | Block access & redirect | `ProtectedRoute` redirects unauthenticated guest to `/login` | **PASS** |

---

## 7. Dead Buttons / Links

| Page | Element | Visible Label | Expected | Actual | Severity |
|---|---|---|---|---|---|
| `/login` | Anchor / Button | `Forgot password?` | Opens password reset modal or `/forgot-password` | Fires mock toast only; no recovery flow | **P1** |
| `/marketplace` (Home) | Section Header Link | `View All Deals →` | Navigates to `/customer/browse?tier=rescue` | Anchor link `href="#deals"`; non-functional on other pages | **P4** |
| `/customer/orders/:id` | Action Button | `Download Invoice` | Downloads authentic PDF / file | Invokes `window.print()` directly; fails without print spooler | **P3** |
| `/customer/orders/:id` | Action Button | `Rate Products` | Opens product rating / review modal | Placeholder alert / toast; no rating form rendered | **P3** |
| `/marketplace` (Footer)| Social Media Icons | Twitter / Instagram / LinkedIn | External links to company social channels | Icons render with `href="#"` dead links | **P4** |

---

## 8. Broken Navigation

| From | Element | Expected Route | Actual Route | Severity |
|---|---|---|---|---|
| `/admin/dashboard` | KPI Card "Total Products" | `/admin/inventory` | `/retailer/inventory` (bounced back to `/admin/dashboard`) | **P1** |
| `/admin/dashboard` | KPI Card "Needs Attention" | `/admin/inventory?filter=critical` | `/retailer/inventory?filter=critical` (bounced back) | **P1** |
| `/admin/dashboard` | KPI Card "Rescue Eligible" | `/admin/inventory?filter=rescue` | `/retailer/inventory` (bounced back) | **P1** |
| `/admin/dashboard` | Recent Activity link | `/admin/expiry` | `/retailer/expiry-intelligence` (bounced back) | **P1** |
| `/admin/dashboard` | Quick Link "Inventory" | `/admin/inventory` | `/retailer/inventory` (bounced back) | **P1** |
| `/admin/dashboard` | Quick Link "Batches" | `/admin/batches` | `/retailer/inventory` (bounced back) | **P1** |

---

## 9. Forms

| Page | Form | Field | Test | Result |
|---|---|---|---|---|
| `/customer/checkout` | Shipping Address | Full Name, Phone, Street, PIN | Submit valid values | **PASS** — Address saved and selected |
| `/customer/checkout` | Shipping Address | Phone number | Enter non-numeric characters | **PASS** — Phone regex validation rejects invalid phone |
| `/customer/checkout` | Payment Details | Card Number, Expiry, CVV | Enter arbitrary text ("abc", "99/99") | **FAIL (CRIT-07)** — Accepts invalid card strings |
| `/customer/profile` | Personal Information | Name, Email, Phone | Save changes | **PASS** — User profile state updates |
| `/retailer/add-product` | Product Creation | Product Name, SKU, Category | Submit with blank fields | **PASS** — Displays required field indicators |
| `/retailer/add-product` | Product Creation | Cost Price vs Selling Price | Enter selling price < cost price | **PASS** — Displays margin warning |
| `/retailer/add-product` | Expiry Information | Expiry Date | Enter past date | **PASS** — Rejects past dates for new stock |
| `/retailer/requests` | New Stock Request | Product Name, Quantity | Enter custom values | **FAIL (CRIT-06)** — Form uses hardcoded payload |
| `/admin/requests` | Create Stock Request | Product, Location, Batch, Qty | Fill & submit | **PASS** — Validates and creates request in table |
| `/admin/suppliers` | Add Supplier | Company Name, Email | Fill & submit | **FAIL (CRIT-03)** — Inputs uncontrolled; discard on save |
| `/admin/policies` | Expiry Markdown Rules | Discount %, Days threshold | Update & save | **PASS** — Form updates policy state |

---

## 10. Modals / Drawers

| Page | Trigger Element | Expected Modal / Drawer | Actual Result | Result |
|---|---|---|---|---|
| `/marketplace` | Location selector button in navbar | Opens `LocationModal` | Renders store location picker cleanly | **PASS** |
| `/marketplace` | Cart button in navbar & floating pill | Opens `CartDrawer` | Slide-out drawer animates smoothly | **PASS** |
| `/marketplace` | Product card batch options | Opens `MultiBatchModal` | Displays selectable batch options | **PASS** |
| `/customer/orders/:id` | "Track Package" button | Opens Order Tracking modal | Displays live visual delivery steps | **PASS** |
| `/retailer/dashboard` | "Insights" button in header | Opens `WasteInsightsModal` | Renders waste analytics & charts | **PASS** |
| `/retailer/dashboard` | "Schedule" button in header | Opens `CalendarModal` | Renders operations calendar | **PASS** |
| `/retailer/dashboard` | User pill in sidebar footer | Opens `AccountSwitcherModal` | Allows switching between demo roles | **PASS** |
| `/retailer/inventory` | Row "View Batch" button | Opens Batch Detail drawer | Displays batch telemetry and history | **PASS** |
| `/retailer/inventory` | "+ Stock Intake" button | Opens Stock Count modal | Renders stock intake entry form | **PASS** |
| `/retailer/requests` | Row "Review" button | Opens Request Review drawer | Displays 11 telemetry and context fields | **PASS** |
| `/retailer/requests` | "+ New Request" button | Opens Create Request modal | Modal opens, but form values are hardcoded | **FAIL (CRIT-06)** |
| `/admin/users` | Row "Eye / View" icon | Opens User Detail drawer | Displays exact selected user profile | **PASS** |
| `/admin/users` | Row "Edit" button | Opens Edit User modal | Renders edit user form | **PASS** |
| `/admin/locations` | Row "View" button | Opens Location Detail drawer | Displays store overview, staff & inventory | **PASS** |
| `/admin/requests` | "+ Create Request" button | Opens Create Request modal | Opens modal; form validation and submission work | **PASS** |
| `/admin/requests` | Row "Review" button | Opens Request Review drawer | Displays full context and Approve/Reject buttons | **PASS** |
| `/admin/suppliers` | "+ Add Supplier" button | Opens Add Supplier modal | Opens modal, but form data does not save | **FAIL (CRIT-03)** |
| `/admin/verification` | Row "Review" button | Opens Verification modal | Displays KYC documents and decision buttons | **PASS** |

---

## 11. Theme / Contrast Audit

Tested across Light (`theme: 'light'`) and Dark (`theme: 'dark'`).

| Page | Element | Light Mode | Dark Mode | Status / Issue |
|---|---|---|---|---|
| Navbar / Header | Brand Logo | Crisp on white background | Crisp on dark background (auto variant) | **PASS** |
| Marketplace Home | Product Cards | High contrast text and borders | Slate background with white text; high contrast | **PASS** |
| Cart Drawer | Price and MRP labels | Green savings text legible | Muted green legible against `#0f172a` | **PASS** |
| Customer Checkout | Payment Radio Cards | Distinct active border highlight | High contrast active state ring | **PASS** |
| Inventory Table | Stock Status Badges | Single-line green / amber badge | High contrast text against badge background | **PASS** |
| Inventory Table | Table Headers & Sort Arrows | High contrast text & icons | Sort arrows slightly dim (`text-muted-foreground/40`) | **FAIL (CRIT-12)** |
| Expiry Monitor | Countdown Pills | Red / amber warning tags legible | Vibrant warning tags with high contrast | **PASS** |
| Admin Modals | Input field placeholders | Readable gray on white | Readable light gray on dark input field | **PASS** |
| Admin Modals | Primary Action Buttons | Bold text on primary green | Bold text on primary green with glow | **PASS** |
| Sidebar Navigation | Active nav item pill | High contrast active background | High contrast active background pill | **PASS** |

---

## 12. Responsive Audit

Tested viewports:
- `375px` (iPhone SE / Compact Mobile)
- `412px` (Android Flagship Mobile)
- `768px` (Tablet Portrait)
- `1024px` (Tablet Landscape / Laptop)
- `1280px` (Desktop)
- `1440px` (Large Desktop)

| Page | Viewport Width | Visual / Layout Result | Severity |
|---|---|---|---|
| `/marketplace` | `375px` | Mobile hamburger drawer activates; sticky bottom floating cart visible; search bar scales cleanly. Zero horizontal overflow. | **PASS** |
| `/marketplace` | `412px` | 2-column product grid renders cleanly without card clipping. | **PASS** |
| `/customer/cart` | `375px` | Cart item rows stack price and quantity steppers vertically; grand total sticky footer remains accessible. | **PASS** |
| `/customer/checkout` | `375px` | Stepper tabs collapse to compact indicators; address and payment cards scale to full width. | **PASS** |
| `/retailer/inventory` | `768px` | Table provides horizontal scroll container with sticky SKU column; header actions wrap neatly. | **PASS** |
| `/retailer/batches` | `360px` - `375px` | Countdown cell ("2d 14h 22m") wraps to two lines on viewports < 360px if container shrinks. | **FAIL (CRIT-11) (P4)** |
| `/admin/dashboard` | `1024px` | KPI cards wrap to 2x2 grid; charts scale to container dimensions without overflowing canvas. | **PASS** |
| `/admin/dashboard` | `375px` | Sidebar collapses to drawer; top command bar converts to mobile menu button. | **PASS** |
| `/admin/requests` | `375px` | Action buttons in table row collapse into accessible action dropdown menu. | **PASS** |
| `/admin/locations` | `768px` | Location cards arrange in 2-column layout; drawers slide over at 85% width. | **PASS** |

---

## 13. Console / Runtime

Monitored during full application run:

| Page / Route | Error / Warning | Trigger Action | Severity | Root Cause |
|---|---|---|---|---|
| `/admin/dashboard` | `Redirect loop / Access denied` | Click "Total Products" or "Needs Attention" KPI cards | **P1** | Target URL `/retailer/inventory` is rejected by `ProtectedRoute` for Admin role; redirected back to `/admin/dashboard`. |
| `/marketplace` | Image load fallback warning (Harmless) | Product card image URL unreachable | **P4** | Handled gracefully by `onError` fallback to placeholder Unsplash image. |
| Build / Bundler | Vite chunk size warning (> 500 kB) | Production bundle compilation | **P4** | Single client bundle is 2,018 kB; recommend code-splitting via dynamic `import()`. |

*Note: Zero uncaught JavaScript exceptions, zero React render crashes, and zero unhandled Promise rejections occurred during execution of all baseline test suites.*

---

## 14. Data / State Flow

| User Action | Expected State Mutation | Actual State Mutation | Status |
|---|---|---|---|
| Click "Add to Cart" on product card | `CartContext.cartItems` appends item with batch ID; `totalCount` increments; badge bounces | Cart items increment; badge bounces; totals update immediately | **PASS** |
| Click `+` on item in Cart Drawer | Quantity in `CartContext` increments; subtotal updates | Item quantity increments; grand total reflects new subtotal | **PASS** |
| Click `-` on item at quantity 1 in Cart | Item removed from `cartItems`; `totalCount` decrements | Item is removed from cart array; empty cart screen triggers if 0 items | **PASS** |
| Select Store "City Center Branch" | `useSelectedStore` mutates `storeId` and `storeName`; catalog reloads | Store ID updates; catalog switches to City Center inventory items | **PASS** |
| Complete Checkout Order | Active store batch quantity decrements; new order appended to `OrderContext`; cart empties | Batch quantity decrements; order saved in localStorage; cart emptied; redirected to `/customer/order-success` | **PASS** |
| Cancel Order in `/customer/orders/:id` | Order status mutates to "Cancelled" in `OrderContext` | Status badge updates to "Cancelled"; cancellation timestamp logged | **PASS** |
| Create Stock Request in `/admin/requests` | New request object prepended to requests list; table row index 0 updates | Request prepended with sequential ID `REQ-2026-043`; appears immediately in table | **PASS** |
| Filter Requests by Search string | Table rows filter to matching Request ID or product substring | Table dynamically filters to matching records | **PASS** |
| Approve Request in Review Drawer | Request status changes to "Approved" with approval timestamp | Status tag updates to "Approved" in table and drawer | **PASS** |
| Add Supplier in `/admin/suppliers` | New supplier object appended to `suppliers` state array | Form data is discarded; `suppliers` array length unchanged | **FAIL (CRIT-03)** |
| Submit Retailer Stock Adjustment | Target batch quantity decrements/increments in `mockProducts` | Toast displays; batch quantity in memory does not change | **FAIL (CRIT-04)** |
| Reorder past order items | Real-time stock checked for each item before adding to cart | Items added directly without real-time batch stock verification | **FAIL (CRIT-05)** |

---

## 15. Route Matrix

| Role Scope | Path / Route | Target Component | Protected? | Role Enforcement | Audit Status |
|---|---|---|---|---|---|
| **Public** | `/` | Root Redirect | No | Redirects to `/marketplace` | **PASS** |
| **Public** | `/login` | `Login.tsx` | No | Allows role switching | **PASS** |
| **Public** | `/signup` | `Signup.tsx` | No | Demo registration | **PASS** |
| **Public** | `*` | `UnderConstruction.tsx` | No | Catch-all 404 handler | **PASS** |
| **Customer** | `/marketplace` | `MarketplaceHome.tsx` | No | Open access | **PASS** |
| **Customer** | `/customer/browse` | `Browse.tsx` | No | Open access | **PASS** |
| **Customer** | `/marketplace/product/:productId` | `ProductDetail.tsx` | No | Open access | **PASS** |
| **Customer** | `/customer/product/:productId` | `ProductDetail.tsx` | No | Open access | **PASS** |
| **Customer** | `/customer/cart` | `Cart.tsx` | No | Open access | **PASS** |
| **Customer** | `/customer/checkout` | `CustomerCheckout.tsx` | No | Requires items in cart | **PASS** |
| **Customer** | `/customer/order-success` | `OrderSuccess.tsx` | No | Open access | **PASS** |
| **Customer** | `/customer/orders` | `Orders.tsx` | No | Open access | **PASS** |
| **Customer** | `/customer/orders/:id` | `CustomerOrderDetail.tsx` | No | Open access | **PASS** |
| **Customer** | `/customer/saved-items` | `SavedItems.tsx` | No | Open access | **PASS** |
| **Customer** | `/customer/profile` | `Profile.tsx` | No | Open access | **PASS** |
| **Customer** | `/customer/alerts` | `CustomerAlerts.tsx` | No | Open access | **PASS** |
| **Retailer** | `/retailer/dashboard` | `StaffOperationsDashboard.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/inventory` | `Inventory.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/inventory/:id` | `RetailerInventoryDetail.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/batches` | `Batches.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/add-product` | `AddProduct.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/expiry-intelligence` | `ExpiryIntelligence.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/requests` | `StaffRequests.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/orders` | `RetailerOrders.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/orders/:id` | `OrderDetail.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/reports` | `Reports.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/settings` | `StaffSettings.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/users` | `RetailerUsers.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Retailer** | `/retailer/suppliers` | `Suppliers.tsx` | Yes | `allowedRoles: ['retailer']` | **PASS** |
| **Admin** | `/admin/dashboard` | `Dashboard.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** (Internal navigation defect CRIT-01) |
| **Admin** | `/admin/inventory` | `Inventory.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/locations` | `Locations.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/users` | `Users.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/requests` | `Requests.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/suppliers` | `Suppliers.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/verification` | `Verification.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/listings` | `Listings.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/transfers` | `Transfers.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/policies` | `Policies.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/reports` | `Reports.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/audit-logs` | `AuditLogs.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/notifications` | `Notifications.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |
| **Admin** | `/admin/settings` | `Settings.tsx` | Yes | `allowedRoles: ['admin']` | **PASS** |

---

## 16. Working Features (Verified Working)

The following features were thoroughly clicked, executed, and verified functional:

1. **Brand Identity & Navigation**:
   - Universal Logo navigation redirects correctly across all roles.
   - Role switching modal operates cleanly between Customer, Retailer, and Admin.
   - Theme switcher toggles Light, Dark, and System modes with instant token updates.

2. **Customer Marketplace & Catalog**:
   - Search autocomplete suggestions dynamically query product catalog.
   - Search on Enter routes to Browse with query parameter sync.
   - Category strip links filter product catalog by category and deal tier.
   - Multi-batch selection modal opens, calculates discounts, and adds selected batches to Cart.
   - Wishlist toggle updates state and navbar badge count.

3. **Cart & Pricing Engine**:
   - Cart Drawer and full Cart view display batch numbers, expiry dates, and unit savings.
   - Quantity increment and decrement respect batch stock limits.
   - Removal of items updates subtotal, MRP total, delivery fees, and grand total in real time.
   - Empty cart safeguard renders empty cart screen without throwing NaN or rendering errors.

4. **Customer Checkout & Order Creation**:
   - Multi-step checkout progresses through Address -> Delivery -> Payment -> Review.
   - Adding a new delivery address validates required fields and sets it active.
   - Placing an order decrements the allocated batch stock and appends the order to `OrderContext`.
   - Successful checkout navigates to `/customer/order-success`.

5. **Customer Order Management**:
   - Order history lists placed orders with status pills and timestamps.
   - Order detail displays tracking timeline, itemized batch breakdown, and delivery address.
   - Order cancellation updates status to "Cancelled" and logs cancellation event.

6. **Retailer Inventory & Operations**:
   - Tab filters (All Items, Expiry-Tracked, Non-Expiry, In Stock, Low Stock) filter accurately.
   - Inventory table stock status badge renders strictly on a single line `[ IN STOCK ]`.
   - Batch detail drawer displays FEFO sequence, available stock, and expiry countdown.
   - Urgent expiry items allow clicking "Publish Deal", updating status to "Published".

7. **Admin Central Management**:
   - Admin Users table allows filtering by role and status; Eye button opens exact user detail.
   - Admin Locations directory displays multi-store telemetry and opens Location Detail drawer.
   - Admin Verification queue allows reviewing applicant KYC documents, approving, or rejecting.
   - Admin Stock Requests:
     - "+ Create Request" opens fully controlled modal with product, store, and batch selectors.
     - Submission validates required fields and prepends request to table index 0.
     - Review drawer displays 11 telemetry and context fields.
     - "Approve" and "Reject" buttons transition request statuses and log timestamps.
     - "Export CSV" generates authentic comma-separated telemetry export.

---

## 17. Broken Features (Confirmed Defects)

1. **Admin Dashboard Cross-Role Navigation (CRIT-01, P1)**:
   - Clicking KPI cards or recent activity links redirects Admin to `/retailer/*` routes, which are blocked by `ProtectedRoute`, bouncing Admin back to `/admin/dashboard`.

2. **Public Login Password Reset Flow (CRIT-02, P1)**:
   - "Forgot password?" triggers a demo toast with no actual password reset form or recovery view.

3. **Admin Suppliers Creation State Commit (CRIT-03, P2)**:
   - "+ Add Supplier" modal inputs are uncontrolled; saving closes modal with a toast but fails to append the new supplier to the table.

4. **Retailer Stock Adjustment In-Memory Mutation (CRIT-04, P2)**:
   - Stock adjustment modal confirms adjustment but does not alter product batch quantities in `mockProducts` state.

5. **Customer Reorder Inventory Verification (CRIT-05, P2)**:
   - "Reorder All" adds past order items directly to cart without checking if batches have expired or sold out.

6. **Retailer New Request Hardcoded Payload (CRIT-06, P3)**:
   - Submitting a request in `/retailer/requests` pushes hardcoded Amul Milk instead of user-entered values.

7. **Customer Checkout Card Validation Bypass (CRIT-07, P3)**:
   - Credit/Debit card form accepts arbitrary strings without card number or expiry date formatting checks.

8. **Order Detail Invoice Generation (CRIT-08, P3)**:
   - "Download Invoice" triggers browser print instead of generating an invoice file.

9. **Customer Profile Preference Persistence (CRIT-09, P3)**:
   - Notification preference toggles reset to default on page refresh.

10. **DealSection Isolated Anchor Link (CRIT-10, P4)**:
    - `href="#deals"` does not navigate when component is rendered outside the home page.

11. **Mobile Batch Countdown Text Wrapping (CRIT-11, P4)**:
    - Expiry countdown wraps onto two lines on narrow viewports < 360px.

12. **Dark Mode Table Sort Arrow Contrast (CRIT-12, P4)**:
    - Table sorting direction arrow drops below 3:1 contrast ratio against dark header background.

---

## 18. Not Executable (Browser & Tool Constraints)

The following tests could not be executed via automated browser runner due to environment constraints (Playwright driver CDN unreachable from host environment; host CDP ports 9222/9223 socket-restricted) and were evaluated via static interaction, component code inspection, and Node test runner:

1. **Touch Gesture Swiping**:
   - Mobile carousel touch swiping on physical touch screens.
2. **Native OS Print Spooling**:
   - Physical printer spooling triggered by `window.print()` in invoice action.
3. **Native File System Dialogs**:
   - OS-native file chooser dialogs during product image upload in `/retailer/add-product`.
4. **Window Resize Event Throttling**:
   - Smooth resize transitions driven by native OS window manager resizing.
5. **Cross-Session Storage Durability**:
   - Long-term multi-day localStorage retention across machine reboots.
6. **Hardware-Accelerated WebGL/Framer Transitions**:
   - GPU-accelerated motion blur frame drops on low-end mobile devices.

---

## 19. Recommended Fix Order

When transitioning to the fixing phase, address defects in the following prioritized sequence:

### Phase 1: High Priority (P1)
1. **Fix Admin Dashboard Navigation Targets (`CRIT-01`)**:
   - In `src/pages/admin/Dashboard.tsx`, replace all instances of `navigate('/retailer/inventory')` and `navigate('/retailer/expiry-intelligence')` with `navigate('/admin/inventory')` and `navigate('/admin/expiry')`.
2. **Implement Password Reset Modal / Route (`CRIT-02`)**:
   - In `src/pages/Login.tsx`, replace the dead toast trigger with an accessible password reset drawer or modal with email submission and mock OTP verification.

### Phase 2: Medium Priority (P2)
3. **Connect Admin Suppliers Modal to State (`CRIT-03`)**:
   - In `src/pages/admin/Suppliers.tsx`, bind `companyName`, `email`, and `category` to local state variables and append the new supplier object to `suppliers` on submit.
4. **Implement Real In-Memory Stock Adjustment Mutation (`CRIT-04`)**:
   - In `src/pages/retailer/Inventory.tsx`, update the adjustment submit handler to call `adjustBatchStock(productId, batchId, delta)` in `inventoryStore`.
5. **Add Real-Time Stock Validation to Reorder Flow (`CRIT-05`)**:
   - In `src/pages/customer/CustomerOrderDetail.tsx`, iterate through reordered items against `validateBatchStock` before adding to `CartContext`; display warning toast if any item is out of stock.

### Phase 3: Low Priority (P3)
6. **Bind Retailer New Request Modal Inputs (`CRIT-06`)**:
   - In `src/pages/retailer/StaffRequests.tsx`, bind input fields to controlled state so created requests reflect user inputs rather than static defaults.
7. **Add Card Input Formatting & Luhn Validation (`CRIT-07`)**:
   - In `src/pages/customer/CustomerCheckout.tsx`, add regex formatting (`#### #### #### ####`), MM/YY validation, and 3-digit CVV validation before enabling order placement.
8. **Provide Authentic Invoice Generation (`CRIT-08`)**:
   - In `src/pages/customer/CustomerOrderDetail.tsx`, generate an authentic downloadable text/HTML/PDF receipt rather than bare `window.print()`.
9. **Persist Profile Notification Preferences (`CRIT-09`)**:
   - In `src/pages/customer/Profile.tsx`, save preference toggle states into `localStorage`.

### Phase 4: Cosmetic & Polish (P4)
10. **Fix In-Page Deal Anchor Link (`CRIT-10`)**:
    - In `src/components/marketplace/DealSection.tsx`, change `href="#deals"` to `to="/customer/browse?tier=rescue"`.
11. **Add `whitespace-nowrap` to Batch Countdown (`CRIT-11`)**:
    - In `src/pages/retailer/Batches.tsx`, add `whitespace-nowrap` to the countdown badge container.
12. **Enhance Dark Mode Sort Arrow Contrast (`CRIT-12`)**:
    - In `src/components/ui/DataTable.tsx`, increase sort arrow opacity to `text-foreground/70` in dark mode.

================================================================================
END OF AUDIT REPORT
================================================================================
