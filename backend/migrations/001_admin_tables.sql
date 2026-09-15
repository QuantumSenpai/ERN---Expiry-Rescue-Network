-- =============================================================================
-- ERN Database Migration 001: Admin Panel Schema Expansion
-- Adds transfers, suppliers, locations, moderation_cases, and audit_logs tables.
-- Idempotent: Does NOT drop or modify existing users, listings, requests, discount_rules.
-- =============================================================================

-- 1. TRANSFERS TABLE
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    transfer_code TEXT NOT NULL UNIQUE,
    source_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    assigned_to TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled')),
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    completed_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_created_at ON transfers(created_at);

-- 2. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    category TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.8,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Under Review', 'Suspended')),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);

-- 3. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Store', 'Warehouse', 'Distribution Center', 'Facility')),
    manager_name TEXT,
    manager_email TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Pending Setup')),
    total_products INTEGER DEFAULT 0,
    inventory_value NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_status ON locations(status);

-- 4. MODERATION CASES TABLE
CREATE TABLE IF NOT EXISTS moderation_cases (
    id SERIAL PRIMARY KEY,
    case_code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('Listing Dispute', 'User Report', 'Fraud Flag', 'Quality Complaint')),
    subject TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    filed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Under Investigation', 'Resolved', 'Escalated')),
    description TEXT NOT NULL,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_cases_status ON moderation_cases(status);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    log_code TEXT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    ip_address TEXT,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- =============================================================================
-- SEED INITIAL TELEMETRY IF TABLES ARE EMPTY
-- =============================================================================

INSERT INTO transfers (transfer_code, source_location, destination, product_name, quantity, assigned_to, status, created_date, expected_delivery, completed_date)
SELECT * FROM (VALUES
  ('TRF-1001', 'Central Warehouse', 'Hope Foundation', 'Rice (25kg bags)', '120 kg', 'Amit Sharma', 'Delivered', '2026-08-10'::date, '2026-08-12'::date, '2026-08-12'::date),
  ('TRF-1002', 'North Depot', 'Sunrise Shelter', 'Canned Vegetables', '80 units', 'Priya Nair', 'In Transit', '2026-08-14'::date, '2026-08-16'::date, NULL::date),
  ('TRF-1003', 'Central Warehouse', 'City Food Bank', 'Bread Loaves', '200 units', 'Ravi Kumar', 'Picked Up', '2026-08-15'::date, '2026-08-17'::date, NULL::date),
  ('TRF-1004', 'South Depot', 'Green Valley NGO', 'Milk Packets', '150 L', 'Amit Sharma', 'Pickup Scheduled', '2026-08-16'::date, '2026-08-18'::date, NULL::date),
  ('TRF-1005', 'Central Warehouse', 'Hope Foundation', 'Medicine Kits', '40 kits', 'Priya Nair', 'Accepted', '2026-08-17'::date, '2026-08-19'::date, NULL::date),
  ('TRF-1006', 'North Depot', 'City Food Bank', 'Wheat Flour', '300 kg', 'Ravi Kumar', 'Pending', '2026-08-18'::date, '2026-08-20'::date, NULL::date),
  ('TRF-1007', 'Central Warehouse', 'Sunrise Shelter', 'Cooking Oil', '60 L', 'Amit Sharma', 'Cancelled', '2026-08-11'::date, '2026-08-13'::date, NULL::date)
) AS t(transfer_code, source_location, destination, product_name, quantity, assigned_to, status, created_date, expected_delivery, completed_date)
WHERE NOT EXISTS (SELECT 1 FROM transfers LIMIT 1);

INSERT INTO suppliers (code, name, contact_name, email, phone, category, rating, status, address)
SELECT * FROM (VALUES
  ('SUP-101', 'Heritage Dairy Farms', 'Ramesh Patel', 'orders@heritagedairy.com', '+91 98231 44550', 'Dairy & Refrigerated', 4.9, 'Active', 'Koramangala 4th Block, Bangalore'),
  ('SUP-102', 'Golden Harvest Bakery', 'Ananya Roy', 'supply@goldenharvest.in', '+91 98450 11223', 'Bakery & Grains', 4.8, 'Active', 'Indiranagar 100ft Road, Bangalore'),
  ('SUP-103', 'Tropical Pure Beverages', 'Vikram Singh', 'vikram@tropicalpure.com', '+91 98112 33445', 'Beverages & Juices', 4.6, 'Active', 'Whitefield EPIP Zone, Bangalore'),
  ('SUP-104', 'GreenField Organics', 'Sunita Rao', 'contact@greenfield.org', '+91 98770 99881', 'Fresh Produce', 4.7, 'Under Review', 'HSR Layout Sector 2, Bangalore')
) AS s(code, name, contact_name, email, phone, category, rating, status, address)
WHERE NOT EXISTS (SELECT 1 FROM suppliers LIMIT 1);

INSERT INTO locations (code, name, type, manager_name, manager_email, address, city, region, phone, status, total_products, inventory_value)
SELECT * FROM (VALUES
  ('LOC-001', 'Central Cold Storage & Logistics Hub', 'Warehouse', 'Suresh Menon', 'suresh.m@ern-network.com', 'Plot 42, Electronic City Phase 1', 'Bangalore', 'Karnataka', '+91 80 2852 0100', 'Active', 1240, 1150000.00),
  ('LOC-002', 'Indiranagar Metro Superstore', 'Store', 'Kavita Das', 'kavita.d@ern-network.com', '100ft Road, HAL 2nd Stage', 'Bangalore', 'Karnataka', '+91 80 4115 2200', 'Active', 580, 480000.00),
  ('LOC-003', 'Koramangala Express Depository', 'Store', 'Manoj Gowda', 'manoj.g@ern-network.com', '80ft Road, 4th Block', 'Bangalore', 'Karnataka', '+91 80 2553 4400', 'Active', 420, 360000.00),
  ('LOC-004', 'Whitefield Regional Logistics Depot', 'Distribution Center', 'Priya Nambiar', 'priya.n@ern-network.com', 'ITPL Main Road, EPIP Zone', 'Bangalore', 'Karnataka', '+91 80 6712 8800', 'Active', 310, 247000.00)
) AS l(code, name, type, manager_name, manager_email, address, city, region, phone, status, total_products, inventory_value)
WHERE NOT EXISTS (SELECT 1 FROM locations LIMIT 1);

INSERT INTO moderation_cases (case_code, type, subject, reported_by, filed_date, status, description, resolution)
SELECT * FROM (VALUES
  ('MD-501', 'Listing Dispute', 'MILK-0042 Batch Mislabeled', 'Ritika Sen', '2026-08-20'::date, 'Open', 'Buyer claims expiry date on listing did not match delivered batch.', NULL),
  ('MD-502', 'User Report', 'Arjun Mehta', 'Daily Fresh Mart', '2026-08-19'::date, 'Under Investigation', 'Repeated no-shows for confirmed pickup requests.', NULL),
  ('MD-503', 'Fraud Flag', 'GreenLeaf Distributors', 'system', '2026-08-18'::date, 'Escalated', 'Unusual pattern of duplicate listings across multiple accounts.', NULL),
  ('MD-504', 'Quality Complaint', 'BRD-102 Batch', 'Kolkata Food Bank Trust', '2026-08-17'::date, 'Resolved', 'Bread batch received in poor condition, below listed quality grade.', 'Supplier issued refund, listing flagged for quality re-check.'),
  ('MD-505', 'Listing Dispute', 'JUC-882 Batch Quantity', 'Ravi Sharma', '2026-08-16'::date, 'Open', 'Delivered quantity less than listed amount.', NULL),
  ('MD-506', 'User Report', 'Priya Kapoor', 'Hope & Harvest NGO', '2026-08-14'::date, 'Resolved', 'Miscommunication over pickup time, resolved directly between parties.', 'Both parties confirmed resolution, no action needed.')
) AS m(case_code, type, subject, reported_by, filed_date, status, description, resolution)
WHERE NOT EXISTS (SELECT 1 FROM moderation_cases LIMIT 1);

INSERT INTO audit_logs (log_code, actor, action, entity, timestamp, severity, ip_address, details)
SELECT * FROM (VALUES
  ('LOG-9001', 'admin@ern-network.com', 'User Verified', 'Hope & Harvest Food Bank', NOW() - INTERVAL '1 hour', 'Low', '103.21.4.12', 'Approved NGO buyer registration and verified tax-exempt documentation.'),
  ('LOG-9002', 'system', 'Automated Clearance Markdown', 'Amul Taaza Milk 1L', NOW() - INTERVAL '3 hours', 'Medium', '127.0.0.1', 'Applied 40% automated discount threshold as batch reached 3 days to expiry.'),
  ('LOG-9003', 'metro.supermarket@ern-network.com', 'Listing Created', 'Britannia Whole Wheat Bread', NOW() - INTERVAL '5 hours', 'Low', '103.21.4.15', 'New rescue listing registered: 50 units @ Rs 25.00.'),
  ('LOG-9004', 'admin@ern-network.com', 'Transfer Status Updated', 'TRF-1002', NOW() - INTERVAL '8 hours', 'Medium', '103.21.4.12', 'Transfer status advanced to In Transit, driver assigned: Priya Nair.'),
  ('LOG-9005', 'system', 'Security Alert: Failed Logins', 'fresh.bakery@example.com', NOW() - INTERVAL '12 hours', 'High', '45.112.8.99', '5 consecutive failed authentication attempts detected. Workstation IP temporarily throttled.'),
  ('LOG-9006', 'admin@ern-network.com', 'Inventory Rule Updated', 'Policy: Low Stock Warning', NOW() - INTERVAL '1 day', 'Medium', '103.21.4.12', 'Adjusted low stock threshold baseline from 10 units to 25 units across all facilities.')
) AS a(log_code, actor, action, entity, timestamp, severity, ip_address, details)
WHERE NOT EXISTS (SELECT 1 FROM audit_logs LIMIT 1);
