# ERN — Expiry Rescue Network
## Comprehensive Project Development & Progress Report

**Document Version:** 2.4  
**Date:** 16 August 2026  
**Project:** ERN — Expiry Rescue Network (Frontend & Operations Platform)  
**Status:** All core modules implemented, polished, integrated, and verified (0 build errors).

---

## 📑 Table of Contents

1. [Executive Overview & Vision](#1-executive-overview--vision)
2. [Global Theme System (Light / Dark Mode Sync)](#2-global-theme-system-light--dark-mode-sync)
3. [Customer Marketplace & Discovery](#3-customer-marketplace--discovery)
4. [Shopping Cart & Checkout System (Including Bug Fixes)](#4-shopping-cart--checkout-system)
5. [User Profile, Account Center & Saved Items (Wishlist)](#5-user-profile-account-center--saved-items-wishlist)
6. [Staff Operations Command Center (`/retailer/dashboard`)](#6-staff-operations-command-center)
7. [Staff Expiry Decision Center (`/retailer/expiry-intelligence`)](#7-staff-expiry-decision-center)
8. [Routing, State Architecture & Role-Based Access](#8-routing-state-architecture--role-based-access)
9. [Build Verification & Quality Audit](#9-build-verification--quality-audit)

---

## 1. Executive Overview & Vision

**ERN (Expiry Rescue Network)** is an enterprise e-commerce and retail supply chain platform designed to eliminate food waste by enabling customers to purchase groceries across different shelf-life batches (**Fresh Stock**, **Rescue Deals**, and **Clearance**) with dynamic pricing, while providing operations staff with a command center to track, rescue, and fulfill inventory lots before expiration.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ERN PLATFORM ECOSYSTEM                                  │
├────────────────────────────────────────────┬────────────────────────────────────────────┤
│           CONSUMER EXPERIENCE              │              STAFF OPERATIONS              │
├────────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Marketplace Home & Search                │ • Operations Command Center                │
│ • Fresh Stock / Rescue / Clearance Batches │ • Expiry Intelligence Decision Center      │
│ • Single-Click Cart & Batch Selection      │ • FEFO Dispatch & Warehouse Queue          │
│ • User Profile & Carbon Impact Center      │ • Low Stock Reorder & Supplier Tracking    │
│ • Saved Items / Multi-Batch Wishlist       │ • Barcode Scanning & Realtime CSV Exports  │
└────────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Global Theme System (Light / Dark Mode Sync)

### 📌 Problem Resolved
Previously, switching themes in settings would leave the customer marketplace in dark mode while other pages switched to light mode.

### 🛠️ Architecture & Fix
- **Unified Theme State**: Configured `ThemeContext.tsx` with single source of truth (`light` | `dark` | `system`).
- **DOM Class Synchronization**: Root `<html className="dark" | "light">` synced on every change with `localStorage` persistence.
- **Universal Design Tokens**: All CSS classes across consumer and staff routes now use semantic Tailwind variables (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`).
- **Complete Page Coverage**: 100% of pages switch instantly without hard reloads.

---

## 3. Customer Marketplace & Discovery

### 🛒 Marketplace Home (`/marketplace`)
- **Clean Separation**: Customer home cleanly routed to `/marketplace` without collisions with the staff portal.
- **Hero & Value Proposition**: *"Shop Smart. Save More. Waste Less."* with quick filters for discount tiers.
- **Category Explorer**: Direct navigation to Dairy, Bakery, Produce, Beverages, Snacks, and Pantry.
- **Recommended For You**: All 4 product cards interactive & connected to dynamic batch selection.
- **Smooth Navigation**: Links for *Home*, *Shop*, *Deals*, *Saved*, *Orders*, and *Cart* scroll smoothly to anchor targets or navigate cleanly.

### 🏷️ Multi-Batch Selection Modal (`MultiBatchModal.tsx`)
- **Explicit Batch Choice**: When clicking *"Add to Cart"* on any item with multiple batches, users must explicitly select:
  1. **Fresh Stock**: Maximum shelf life (e.g., 12 days left) &bull; Standard price.
  2. **Rescue Deal**: Optimal usage window (e.g., 5 days left) &bull; 20–35% discount.
  3. **Clearance**: Immediate consumption (e.g., 2 days left) &bull; 50–70% flash discount.
- **Cart Sync**: The exact selected batch ID, price, and expiry date are passed into the global cart.

---

## 4. Shopping Cart & Checkout System

### 🐛 Cart Quantity Increment/Decrement Bug Fix
- **Issue**: Clicking `+` or `-` once was increasing/decreasing quantity by 2 instead of 1.
- **Root Cause**: Duplicate event handling & bubbling from child buttons to parent card wrappers.
- **Solution**: Added `e.stopPropagation()`, cleaned `CartContext.tsx` update handlers, and ensured strict 1-click = &plusmn;1 quantity.

### 💳 Checkout, Payment & Live Tracking
- **Address & Delivery Scheduling**: Standard, Express, and Same-Day eco-delivery options.
- **Dynamic Pricing Breakdown**: Subtotal, Dynamic Rescue Discounts Saved, Delivery Fee, and Net Payable.
- **Payment Gateway**: UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery.
- **Live Order Tracking**: Stage progression (Order Placed &rarr; Batch Picked &rarr; Out for Delivery &rarr; Delivered) with live OTP and delivery agent contact.

---

## 5. User Profile, Account Center & Saved Items (Wishlist)

### 👤 Profile & Account Center (`/customer/profile`)
- **Profile Header**: Avatar, name, email, phone, membership badge (*"Eco Champion"*), and member since date.
- **ERN Sustainability Impact**:
  - 🌳 **CO₂ Emissions Avoided**: 42.8 kg
  - 💰 **Total Money Saved**: ₹3,840
  - 📦 **Perishable Meals Rescued**: 38 items
- **Saved Addresses**: Default delivery addresses with Add/Edit/Delete actions.
- **Preferences & Notifications**: Expiry alert thresholds, push notifications, and theme settings.
- **Account Security**: Password management, 2FA toggle, and active session logs.

### ❤️ Saved Items / Wishlist (`/customer/saved-items`)
- **Wishlist Card Grid**: Displays saved items with live stock status and available shelf-life batches.
- **Batch-Aware Add to Cart**: Opening a wishlist item with multiple batches opens `MultiBatchModal` so the user selects their preferred expiry tier before adding to cart.
- **Remove & Move**: Seamless item removal or moving between wishlist and active cart.

---

## 6. Staff Operations Command Center (`/retailer/dashboard`)

### 🏢 Layout Architecture
Rebuilt from scratch to eliminate dead space, balance vertical heights, and establish an enterprise hierarchy:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. FULL-WIDTH STAFF HERO                                                    │
│ "Good morning, Operations Staff" | Facility Badge | Date | Quick CTAs       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. 6-CARD RESPONSIVE KPI ROW (Single Row Desktop)                           │
│ Total Inv: 1,248 | Value: ₹22.37L | Expiry: 326 | Critical: 3 | Low: 9 | 12 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. FULL-WIDTH INVENTORY HEALTH DISTRIBUTION                                 │
│ Safe: 82% (1,023) | Warning: 11% (138) | High Risk: 5% (62) | Critical: 2% │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 4. PRIMARY OPERATIONAL GRID (50%)    │ 4. PRIMARY OPERATIONAL GRID (50%)    │
│    EXPIRY & RESCUE INTELLIGENCE      │    TODAY'S OPERATIONAL QUEUE         │
│    - 5 Prioritized batch rows        │    - 6 Warehouse fulfillment rows    │
│    - Days left countdown badges      │    - Priority tags & timestamps      │
│    - View / Create Rescue actions    │    - Receive, Pick, Pack & Dispatch  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 5. SECONDARY GRID (50%)              │ 5. SECONDARY GRID (50%)              │
│    LOW STOCK INTELLIGENCE            │    OPERATIONS QUICK ACTIONS          │
│    - 4 Reorder-alert products        │    - 2x3 Button Matrix:              │
│    - Current stock vs Reorder level  │      • Scan Barcode  • Receive Stock │
│    - View / Request Stock actions    │      • Inventory     • Create Rescue │
│                                      │      • Clearance     • Orders        │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ 6. FULL-WIDTH RECENT STAFF ACTIVITY & AUDIT LOG TABLE                        │
│ Time | Operation Activity | Product / Batch | Staff Action & Details | Status│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🔍 Readability & Visual Polish
- **Typography**: KPI numbers boosted to `text-2xl sm:text-[26px] font-black`, section headers to `text-base sm:text-lg`.
- **Row Heights**: Balanced `h-12` table rows, generous internal padding (`p-4.5 sm:p-5`), and symmetrical card borders.

---

## 7. Staff Expiry Decision Center (`/retailer/expiry-intelligence`)

### ⚡ Enterprise Expiry Command Center
Built specifically as a decision center to identify expiry risks early and prevent inventory write-offs:

1. **Page Header**:
   - Location: `Central Warehouse · Main Branch Dock 4` &bull; Date &bull; Live Risk Radar Active.
   - Quick Actions: `[Scan Batch]`, `[Export CSV]`, `[Staff Inventory]`.
2. **6 Overview KPI Cards**:
   - Total Tracked (326) &bull; Critical 0–7d (3) &bull; High Risk 8–14d (9) &bull; Rescue Candidates (12) &bull; Clearance (7) &bull; Expired (2).
3. **Expiry Horizon & Distribution Bar**:
   - Full-width visual segmentation: Safe (75.2%), Medium (16.9%), High (5.8%), Critical (1.5%), Expired (0.6%).
4. **Smart Expiry Summary & Risk Valuation**:
   - AI Insight: *"12 batches require action within the next 14 days."*
   - Stock Value at Risk: **₹68,450** &bull; Potential Recovery: **₹51,338** (75%) &bull; Waste Saved: **148 kg** &bull; 4 Facilities.
5. **Priority Expiry Queue Table**:
   - Filter Tabs: `[All]`, `[Critical]`, `[High Risk]`, `[Medium]`, `[Expired]`.
   - Multi-Filter Controls: Search input, Facility selector, Category selector, Days Remaining selector.
   - Table Columns: Product, SKU/Batch, Location, Quantity, Expiry Date, Days Left (Bold color pill), Stock Value, Risk Level, Recommended Action, and Action Buttons.
6. **Smart Rescue Opportunities Matrix (4 High-Value Cards)**:
   - Amul Milk 1L (20% off &rarr; ₹34) &bull; Britannia Bread (40% off &rarr; ₹30) &bull; Tropicana Juice (25% off &rarr; ₹90) &bull; FarmFresh Paneer (30% off &rarr; ₹66).
7. **Interactive Modals**:
   - **Batch Traceability Modal**: Full product metadata, manufacturing & expiry dates, stock values, and audit history.
   - **Deal Publishing Modal**: Configures dynamic discount %, unit rescue price, and distribution channels.
   - **Batch Barcode Scanner**: Instant lookup for test batch codes (`MILK-0042`, `BRD-102`, `JUC-882`).
   - **Live CSV Exporter**: Generates and downloads real `.csv` risk reports.

---

## 8. Routing, State Architecture & Role-Based Access

### 🛣️ Application Route Hierarchy

| Route Path | Module / Target Component | Allowed Roles | Layout |
| :--- | :--- | :--- | :--- |
| `/` | Landing / Homepage | Public | NavbarLayout |
| `/login` / `/signup` | Authentication | Public | AuthLayout |
| `/marketplace` | Customer Marketplace Home | Customer / Staff / Admin | MarketplaceNavbar |
| `/customer/profile` | User Profile & Account Center | Customer / Staff / Admin | MarketplaceNavbar |
| `/customer/saved-items` | Wishlist & Saved Items | Customer / Staff / Admin | MarketplaceNavbar |
| `/orders` | Customer Orders & Live Tracking | Customer / Staff / Admin | MarketplaceNavbar |
| `/retailer/dashboard` | Staff Operations Command Center | Staff / Admin | DashboardLayout |
| `/retailer/inventory` | Master Staff Inventory | Staff / Admin | DashboardLayout |
| `/retailer/expiry-intelligence`| Staff Expiry Decision Center | Staff / Admin | DashboardLayout |
| `/retailer/clearance` | Flash Liquidation Management | Staff / Admin | DashboardLayout |
## 8. Staff Requests & Approvals Module (`/retailer/requests`)

### 📋 Operational Approval Center
Built `/retailer/requests` as an enterprise decision and execution hub to manage warehouse requests, approvals, and inventory adjustments:

1. **Smart Priority Ranking Engine**:
   - Critical requests receive score `+100` and subtle highlight tinting.
   - Overdue items receive score `+80`.
   - Batches with `daysLeft <= 3` automatically receive dynamic priority boost `+(4 - daysLeft) * 10` so urgent expiry actions bubble to the top of the queue.
2. **Transfer Route Indicators**:
   - Location column clearly displays origin and destination for transfers (`Store A → Store B (Koramangala)`).
3. **5-KPI Overview Row**:
   - Pending Requests (12) &bull; High Priority (4) &bull; Overdue (2) &bull; Approved (8) &bull; Completed (24).
4. **Main Request Queue & Multi-Filter Toolbar**:
   - Filter Tabs: `[All]`, `[Pending]`, `[Approved]`, `[Processing]`, `[Completed]`, `[Rejected]`.
   - Collapsible Advanced Filters: Type, Priority, and Facility Location.
   - Enterprise Data Table with status-driven actions (`Review`, `View`, `Approve`, `Process`, `Complete`).
5. **My Active Requests & Stream Activity**:
   - Displays requests submitted by the logged-in staff profile with live status and quick drawer access.
   - Real-time audit log tracking timestamped authorizations and PO generation.
## 9. Staff Suppliers & Procurement Module (`/retailer/suppliers`)

### 🚚 Direct Procurement & Inbound Intake Center
Built `/retailer/suppliers` as the operational command center to manage vendor partnerships, purchase orders, reorder opportunities, and dock intake verification.

## 10. Staff Reports & Analytics Module (`/retailer/reports`)

### 📊 Business Intelligence & ERN Impact Command Center
Built `/retailer/reports` as the enterprise business intelligence center:

1. **Executive 6-KPI Row**:
   - Inventory Value (`₹22.37L`) &bull; Expiry-Risk Value (`₹68,450`) &bull; Products Rescued (`326`) &bull; Money Recovered (`₹51,338`) &bull; Waste Prevented (`148 kg`) &bull; Rescue Success Rate (`86%`).
2. **ERN Impact Summary Banner**:
   - Prominent impact metrics with period comparisons (`+18.4% rescue value`, `+12.2% waste prevented`).
3. **Interactive Charts**:
   - **Expiry Risk Trend Area Chart**: Multi-layer risk curves (`Critical ≤3d`, `High Risk 4-7d`, `Medium 8-14d`).
   - **Rescue vs Clearance Comparison Bar Chart**: Recovery volume and financial yield by pricing strategy.
4. **Inventory Value at Risk Stacked Distribution**:
   - Safe (`₹18.90L / 84.5%`), At-Risk (`₹2.80L / 12.5%`), Critical (`₹68,450 / 3.1%`), Expired (`₹12,500 / 0.6%`).
5. **Category & Location Performance Matrices**:
   - Sortable matrices across 8 retail categories and 4 fulfillment hubs (`Central Warehouse`, `Store A`, `Store B`, `Distribution Center`).
6. **Supplier Audit & Top Rescue Opportunities**:
   - Quality and SLA scorecards linked to the Suppliers module.
   - Top recovery opportunity cards linking directly into Expiry Intelligence.
7. **Modals & Export Engine**:
   - Report Generator, Print-ready Preview modal, Schedule Report modal, and real CSV data exporter.

1. **Procurement 6-KPI Row**:
   - Active Suppliers (24) &bull; Pending POs (6) &bull; In Transit (4) &bull; Receiving Today (3) &bull; Low Stock Supply Risks (7) &bull; Supplier Value (₹8.42L).
2. **Supplier Directory & Performance Scorecards**:
   - Multi-field search, status tabs (`All`, `Preferred`, `Active`, `Under Review`, `On Hold`, `Inactive`), and category/location/rating dropdowns.
   - Comprehensive performance indicators: On-Time Delivery %, Order Accuracy %, Quality Score, Avg Lead Time, and Overall Score.
3. **Smart Reorder Opportunities**:
   - Automated triggers for products below safety stock (`Amul Milk`, `Royal Basmati Rice`, `FarmFresh Paneer`, `Britannia Bread`) with 1-click PO generator.
4. **Incoming Shipments Queue & ERN Expiry Validation Engine**:
   - Real-time inbound logistics tracking.
   - **Dock Intake & Shelf-Life Validation**: Computes remaining days from manufacturing & expiry dates during intake; alerts if batch is critically low (≤ 3 days) and provides instant rescue deal staging recommendations.
   - Quality inspection: `Passed`, `Needs Review`, `Rejected`.
5. **Interactive Drawers & Modals**:
   - Slide-over Supplier Detail Drawer (Contact info, scorecards, supplied products catalog, purchase history, activity stream).
   - Create Purchase Order Modal (Calculates live subtotal from unit prices & quantities).
   - Onboard Supplier Modal (Registers vendor, location, payment terms, and legal tax IDs).
   - Real CSV Exporter for compliance records.
| `/admin/dashboard` | Central Platform Administration | Admin | DashboardLayout |

---

## 9. Build Verification & Quality Audit

### 🛠️ Automated Compilation & Type-Checking
- **Command**: `npm run build` (`tsc -b && vite build`)
- **Modules Transformed**: 2,881 modules
- **Build Status**: **✓ Built successfully in 1.89s (0 Errors, 0 Warnings)**
- **Distribution Bundle**:
  - `dist/index.html`: `0.63 kB`
  - `dist/assets/index.css`: `172.87 kB`
  - `dist/assets/index.js`: `2,253.79 kB`

---

## 🎯 Summary of Key Accomplishments

1. ✅ **Global Theme System**: 100% synchronized across customer and staff interfaces.
2. ✅ **Marketplace & Batch Selection**: Multi-batch selection modal ensures users consciously select shelf-life tiers.
3. ✅ **Cart & Checkout Polish**: Single-click &plusmn;1 quantity bug completely resolved; multi-batch checkout functional.
4. ✅ **User Profile & Saved Items**: Full sustainability impact dashboard and multi-batch wishlist to cart flow.
5. ✅ **Staff Operations Dashboard**: Rebuilt with symmetrical 6-section enterprise layout, balanced grids, and audit timeline.
6. ✅ **Staff Expiry Decision Center**: Full risk distribution, dynamic deal publishing workflow, CSV exporter, and batch scanner.
7. ✅ **Shared Data Model**: Unified `MASTER_INVENTORY` source ensures zero conflicting SKUs or prices across modules.
