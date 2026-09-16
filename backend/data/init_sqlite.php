<?php
$dataDir = __DIR__;
$sqliteFile = $dataDir . '/ern.sqlite';

$db = new PDO("sqlite:$sqliteFile");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 1. Create Tables
$db->exec("
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    buyer_type TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    qty INTEGER NOT NULL,
    expiry_date DATE NOT NULL,
    orig_price REAL NOT NULL,
    discount_price REAL NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'available',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discount_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL,
    days_threshold INTEGER NOT NULL,
    discount_percent REAL NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transfer_code TEXT NOT NULL UNIQUE,
    source_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    assigned_to TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_date DATE NOT NULL,
    expected_delivery DATE,
    completed_date DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    category TEXT NOT NULL,
    rating REAL DEFAULT 4.8,
    status TEXT NOT NULL DEFAULT 'Active',
    address TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    manager_name TEXT,
    manager_email TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    total_products INTEGER DEFAULT 0,
    inventory_value REAL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS moderation_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    filed_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    description TEXT NOT NULL,
    resolution TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_code TEXT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    severity TEXT NOT NULL,
    ip_address TEXT,
    details TEXT
);
");

// 2. Seed Users
$hashedAdmin = password_hash('AdminPass123!', PASSWORD_DEFAULT);
$hashedStaff = password_hash('StaffPass123!', PASSWORD_DEFAULT);
$hashedUser  = password_hash('UserPass123!', PASSWORD_DEFAULT);

$users = [
    [1, 'Enterprise Admin', 'admin', null, 'admin@ern-network.com', $hashedAdmin],
    [2, 'Metro Supermarket • Indiranagar', 'staff', null, 'metro.supermarket@ern-network.com', $hashedStaff],
    [3, 'City Mart Superstore • Koramangala', 'staff', null, 'citymart@ern-network.com', $hashedStaff],
    [4, 'Priya Sharma', 'user', 'individual', 'priya.sharma@example.com', $hashedUser],
    [5, 'Hope & Harvest Food Bank', 'user', 'ngo', 'hope.harvest@ngo.org', $hashedUser],
    [6, 'Shanti Bhavan Children Home', 'user', 'orphanage', 'shanti.bhavan@orphanage.org', $hashedUser],
    [7, 'Corner Fresh Bakes', 'staff', null, 'fresh.bakery@example.com', $hashedStaff],
    [8, 'Arjun Mehta', 'user', 'individual', 'arjun.mehta@example.com', $hashedUser],
    [9, 'Developer Admin (Verification)', 'admin', null, 'dev-admin@ern-network.com', $hashedAdmin],
];

$insUser = $db->prepare("
    INSERT OR REPLACE INTO users (id, name, role, buyer_type, email, password, verified)
    VALUES (?, ?, ?, ?, ?, ?, 1)
");
foreach ($users as $u) {
    $insUser->execute($u);
}

// 3. Seed Sample Listings
$today = date('Y-m-d');
$d3 = date('Y-m-d', strtotime('+3 days'));
$d4 = date('Y-m-d', strtotime('+4 days'));
$d6 = date('Y-m-d', strtotime('+6 days'));
$d12 = date('Y-m-d', strtotime('+12 days'));
$d14 = date('Y-m-d', strtotime('+14 days'));

$listings = [
    [1, 2, 'Artisan Whole Wheat Toast Loaf', 'Bakery', 45, $d3, 120.00, 48.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'available'],
    [2, 2, 'Farm Fresh Pasteurized Milk (5L Crate)', 'Dairy', 30, $d4, 350.00, 175.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', 'claimed'],
    [3, 2, 'Organic Valencia Orange Juice (1L)', 'Beverages', 50, $d6, 180.00, 90.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', 'delivered'],
    [4, 3, 'Roasted Hazelnut Chocolate Spread (350g)', 'Packaged Goods', 25, $d12, 420.00, 210.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', 'available'],
    [5, 3, 'Classic Granola Breakfast Cereal (1kg)', 'Packaged Goods', 40, $d14, 480.00, 192.00, 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80', 'available'],
];

$insListing = $db->prepare("
    INSERT OR REPLACE INTO listings (id, donor_id, item_name, category, qty, expiry_date, orig_price, discount_price, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");
foreach ($listings as $l) {
    $insListing->execute($l);
}

// 4. Seed Locations
$locations = [
    [1, 'LOC-001', 'Central Cold Storage & Logistics Hub', 'Warehouse', 'Suresh Menon', 'suresh.m@ern-network.com', 'Plot 42, Electronic City Phase 1', 'Bangalore', 'Karnataka', '+91 80 2852 0100', 'Active', 1240, 1150000.00],
    [2, 'LOC-002', 'Indiranagar Metro Superstore', 'Store', 'Kavita Das', 'kavita.d@ern-network.com', '100ft Road, HAL 2nd Stage', 'Bangalore', 'Karnataka', '+91 80 4115 2200', 'Active', 580, 480000.00],
    [3, 'LOC-003', 'Koramangala Express Depository', 'Store', 'Manoj Gowda', 'manoj.g@ern-network.com', '80ft Road, 4th Block', 'Bangalore', 'Karnataka', '+91 80 2553 4400', 'Active', 420, 360000.00],
];
$insLoc = $db->prepare("
    INSERT OR REPLACE INTO locations (id, code, name, type, manager_name, manager_email, address, city, region, phone, status, total_products, inventory_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");
foreach ($locations as $loc) {
    $insLoc->execute($loc);
}

echo "SQLite Database initialized successfully at $sqliteFile\n";
