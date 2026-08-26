# ERN — Smart Retail Expiry Management & Clearance Network
## Comprehensive Project Handoff & Technical Documentation

---

## 1. Project Overview & Business Model

**ERN (Expiry Rescue Network)** is an Enterprise & Retail Expiry Management SaaS + Dynamic Clearance Marketplace built specifically for **Supermarkets, Grocery Chains, and Local Retail Stores (Small, Medium, and Large)**.

- **The Problem**: Store owners at cash counters manage thousands of inventory items without real-time expiry visibility. By the time expired stock is spotted on shelves, it becomes dead stock resulting in 100% financial write-offs.
- **The Solution**:
  1. **Barcode & Batch Stock Ingestion**: Capture Barcode/EAN, Batch No., Stock Units, MRP, Manufacturing Date, and Expiry Date upon stock arrival.
  2. **Multi-Tier Smart Expiry Alert Engine**:
     - 🟡 **30-Day Warning Alert**: Early warning trigger with 15–20% dynamic clearance discount.
     - 🟠 **14-Day Urgent Alert**: Escalated warning trigger with 35–40% clearance discount.
     - 🔴 **7-Day Critical Alert**: Flash clearance trigger with 50–70% discount to guarantee zero dead-stock loss.
     - 🟢 **Fresh Stock (> 30 Days)**: Standard retail MRP tracking.
  3. **Consumer Clearance Marketplace**: Local shoppers buy near-expiry grocery batches at live discounts based on days left to expiration.
  4. **Bulk NGO / Orphanage Procurement**: Verified institutions (orphanages, hostels, NGO kitchens) purchase expiring bulk lots at wholesale clearance rates before zero day.

---

## 2. Tech Stack & Architecture

| Technology | Version / Spec | Role |
|---|---|---|
| **Framework** | React 19 (`^19.2.8`) + Vite 8 (`^8.2.0`) | Client-side UI & Bundling |
| **Language** | TypeScript (`~6.0.2`) | Strict typing across all components |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite` + `@theme inline`) + Vanilla CSS | Modern CSS design tokens & liquid glass utilities |
| **Animation Engine** | `framer-motion` (`^12.x`) | 3D perspective cards, perimeter light beams & page transitions |
| **Icons** | `lucide-react` (`^1.31.0`) | Semantic UI icons |
| **Routing & Auth** | `react-router-dom` (`^7.18.2`) + Custom Context | Role-based protected routes & animated transitions |

---

## 3. Visual Identity & Design System

### 🎨 Strict 5-Color Palette
1. **Navy**: `#2F4156` (Deep Brand Navy `#1C2836`)
2. **Teal**: `#567C8D` (Accent & Highlights)
3. **Sky Blue**: `#C8D9E6` (Light Sky Background `#EDF4F9`)
4. **Beige**: `#F5EFEB` (Muted Warm White)
5. **Pure White**: `#FFFFFF`

### 🌓 Dual-Theme System (`ThemeContext.tsx`)
- **Light Mode**: `#EDF4F9` canvas with frosted pure white glass cards and high-contrast navy typography.
- **Dark Mode**: `#1C2836` canvas with slate navy frosted glass cards and sky blue accents.
- **Persistence**: Synced with `localStorage` and toggles `.dark` on `document.documentElement`.

### 🖋️ Typography Stack
- **Headings (`h1-h6, .font-display, .font-heading`)**: **`Montserrat`** (Bold 700 / Black 900)
- **Body & Content (`body, p, input, label`)**: **`Lato`** (Clean editorial sans-serif)
- **Logotype & Accent (`.ern-logotype, .ern-editorial`)**: **`Playfair Display`** (Luxury display serif)
- **Numbers / Metrics (`.ern-numeric`)**: **`Space Mono`** (Tabular digits)

---

## 4. Role-Based Architecture & Portals

### 👥 User Roles & Portals
- **Supermarket & Retailer (`/retailer/*`)**:
  - `/retailer/dashboard`: Multi-tier alert buckets (Critical <7d, Urgent 7–14d, Warning 15–30d, Fresh >30d), inventory value at risk vs recovered revenue.
  - `/retailer/add-product`: Stock entry form with barcode scanner simulation, batch number, MRP, manufacturing & expiry dates, and automated dynamic discount configurator.
  - `/retailer/inventory`: Complete stock table with Barcode, Batch, Quantity, Manufacturing, Expiry Date, Days Left counter, Expiry Risk Badge (🔴/🟠/🟡/🟢), Current Dynamic Selling Price, and Quick Actions (Push to Flash Clearance, Offer to Bulk Buyer, Delete).
- **Customer & Bulk Buyer (`/customer/*`)**:
  - `/customer/browse`: Live clearance catalog with days-left countdown, dynamic discounts, and "Bulk Order for Orphanage / NGO / Hostel" modal.
  - `/customer/orders`: Order history with counter QR pick-up pass & savings breakdown.
- **System Admin (`/admin/*`)**:
  - `/admin/dashboard`: Platform-wide store oversight, global stock risk monitoring, bulk organization requests.
  - `/admin/users`: Store verification & customer management.
  - `/admin/listings`: Global listing oversight.
  - `/admin/requests`: Partner support & bulk procurement tickets.

---

## 5. Directory Structure

```
ERN-Expiry-Rescue-Network/
├── frontend/
│   ├── public/
│   │   ├── logos/
│   │   │   ├── logo-light.png
│   │   │   ├── logo-dark.png
│   │   │   └── logo-main.png
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── sign-in-card-2.tsx   # 3D Beam Sign In Card with quick role switch
│   │   │   │   └── sign-up-card.tsx     # 3D Beam Sign Up Card (Store Owner vs Shopper)
│   │   │   ├── AnimatedNumber.tsx       # Rolling digit odometer
│   │   │   ├── BrandLogo.tsx            # Theme-aware logo component
│   │   │   ├── DashboardLayout.tsx      # Liquid glassmorphic sidebar layout
│   │   │   ├── FinalCta.tsx             # Closing CTA section
│   │   │   ├── Footer.tsx               # Main footer with store & clearance links
│   │   │   ├── ItemCard.tsx             # Clearance product item card with days-left counter
│   │   │   ├── LiquidBlob.tsx           # Organic SVG gradient blob
│   │   │   ├── LiquidGlassCard.tsx      # 3D glass card with traveling perimeter light beams
│   │   │   ├── MagneticButton.tsx       # Magnetic cursor pull button
│   │   │   ├── Navbar.tsx               # Fixed compact motion-blur navbar
│   │   │   ├── PageTransition.tsx       # Route motion transition wrapper
│   │   │   ├── ProtectedRoute.tsx       # Role-based route protection
│   │   │   ├── ScrollReveal.tsx         # Intersection Observer scroll animation
│   │   │   ├── SkeletonLoader.tsx       # Shimmer placeholder
│   │   │   ├── StartCard.tsx            # How ERN Works (3-step retail flow)
│   │   │   ├── StatsBand.tsx            # Live retail impact statistics band
│   │   │   └── TestimonialCarousel.tsx  # Rotating store owner reviews
│   │   ├── context/
│   │   │   ├── AuthContext.tsx          # Role-based user auth state & localStorage
│   │   │   └── ThemeContext.tsx         # Light/Dark mode state & localStorage
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx        # Admin system overview
│   │   │   │   ├── Listings.tsx         # Global listing oversight
│   │   │   │   ├── Requests.tsx         # Partner tickets & requests
│   │   │   │   └── Users.tsx            # User moderation & verification
│   │   │   ├── customer/
│   │   │   │   ├── Browse.tsx           # Clearance catalog & bulk NGO modal
│   │   │   │   └── Orders.tsx           # Order history & counter QR passes
│   │   │   ├── retailer/
│   │   │   │   ├── AddProduct.tsx       # Barcode, Batch, Mfg & Expiry Ingestion Form
│   │   │   │   ├── Dashboard.tsx        # 4-Tier Expiry Alert Buckets & Loss Recovery
│   │   │   │   └── Inventory.tsx        # Real-time stock inventory & alert table
│   │   │   ├── Hero.tsx                 # Retail Expiry SaaS landing hero
│   │   │   ├── Home.tsx                 # Full landing page assembly
│   │   │   ├── Login.tsx                # Auth login page
│   │   │   └── Signup.tsx               # Auth registration page
│   │   ├── App.tsx                      # App root with role routing & animated routes
│   │   ├── index.css                    # Tailwind v4 tokens & glassmorphism
│   │   └── main.tsx                     # React entry point
│   ├── package.json
│   └── vite.config.ts
└── ERN_PROJECT_SUMMARY.md               # Complete Project Handoff Documentation
```

---

## 6. How to Run Locally

```bash
# Navigate to frontend directory
cd frontend

# Start local development server
npm run dev

# Run production build validation
npm run build
```

---

## 7. Verification & Status

- **Build Status**: `tsc -b && vite build` passes with **Exit Code 0** (0 errors).
- **Dev Server**: Running on `http://localhost:5173/`.
