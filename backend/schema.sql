-- =============================================================================
-- ERN (Expiry Rescue Network) — Neon Postgres Database Schema
-- Migration from MySQL to PostgreSQL (Neon Serverless)
-- =============================================================================

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS discount_rules CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('donor', 'buyer', 'admin')),
    buyer_type TEXT CHECK (buyer_type IN ('individual', 'ngo', 'orphanage')),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_buyer_type CHECK (
        (role = 'buyer' AND buyer_type IS NOT NULL) OR
        (role != 'buyer')
    )
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_verified ON users(role, verified);

-- -----------------------------------------------------------------------------
-- 2. LISTINGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    qty INTEGER NOT NULL CHECK (qty >= 0),
    expiry_date DATE NOT NULL,
    orig_price NUMERIC(10, 2) NOT NULL CHECK (orig_price >= 0),
    discount_price NUMERIC(10, 2) NOT NULL CHECK (discount_price >= 0),
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_donor_id ON listings(donor_id);
CREATE INDEX idx_listings_expiry_date ON listings(expiry_date);
CREATE INDEX idx_listings_category ON listings(category);

-- -----------------------------------------------------------------------------
-- 3. REQUESTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_listing_id ON requests(listing_id);
CREATE INDEX idx_requests_buyer_id ON requests(buyer_id);
CREATE INDEX idx_requests_status ON requests(status);

-- -----------------------------------------------------------------------------
-- 4. DISCOUNT RULES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE discount_rules (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    days_threshold INTEGER NOT NULL CHECK (days_threshold >= 0),
    discount_percent NUMERIC(5, 2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_donor_threshold UNIQUE (donor_id, days_threshold)
);

CREATE INDEX idx_discount_rules_donor ON discount_rules(donor_id, days_threshold);
