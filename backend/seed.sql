-- =============================================================================
-- ERN (Expiry Rescue Network) — Neon Postgres Seed Data
-- =============================================================================

-- Clean up existing data before seeding
TRUNCATE TABLE discount_rules, requests, listings, users RESTART IDENTITY CASCADE;

-- -----------------------------------------------------------------------------
-- 1. USERS SEED
-- Default password for all non-admin users: password123
-- Default password for admin user: AdminPass123!
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, role, buyer_type, email, password, verified, created_at)
VALUES
  -- System Admin (Verified)
  (1, 'Enterprise Admin', 'admin', NULL, 'admin@ern-network.com', '$2y$10$pAudOw1tfSapJzXK99.t0.rmUldsRbD9KEvHb1VvV4YyQ53uRWU2y', TRUE, NOW() - INTERVAL '30 days'),

  -- Donors / Store Retailers (Verified)
  (2, 'Metro Supermarket • Indiranagar', 'donor', NULL, 'metro.supermarket@ern-network.com', '$2y$10$xIErdiNn2ntiqtiC0IDyw.POBNsLXi6IrkqZunCTIebdnvPstzYju', TRUE, NOW() - INTERVAL '25 days'),
  (3, 'City Mart Superstore • Koramangala', 'donor', NULL, 'citymart@ern-network.com', '$2y$10$xIErdiNn2ntiqtiC0IDyw.POBNsLXi6IrkqZunCTIebdnvPstzYju', TRUE, NOW() - INTERVAL '20 days'),

  -- Buyers: Individual, NGO, Orphanage (Verified)
  (4, 'Priya Sharma', 'buyer', 'individual', 'priya.sharma@example.com', '$2y$10$xIErdiNn2ntiqtiC0IDyw.POBNsLXi6IrkqZunCTIebdnvPstzYju', TRUE, NOW() - INTERVAL '15 days'),
  (5, 'Hope & Harvest Food Bank', 'buyer', 'ngo', 'hope.harvest@ngo.org', '$2y$10$xIErdiNn2ntiqtiC0IDyw.POBNsLXi6IrkqZunCTIebdnvPstzYju', TRUE, NOW() - INTERVAL '12 days'),
  (6, 'Shanti Bhavan Children Home', 'buyer', 'orphanage', 'shanti.bhavan@orphanage.org', '$2y$10$xIErdiNn2ntiqtiC0IDyw.POBNsLXi6IrkqZunCTIebdnvPstzYju', TRUE, NOW() - INTERVAL '10 days'),

  -- Unverified Registrations (For Admin Moderation Testing)
  (7, 'Corner Fresh Bakes', 'donor', NULL, 'fresh.bakery@example.com', '$2y$10$xIErdiNn2ntiqtiC0IDyw.POBNsLXi6IrkqZunCTIebdnvPstzYju', FALSE, NOW() - INTERVAL '2 days'),
  (8, 'Arjun Mehta', 'buyer', 'individual', 'arjun.mehta@example.com', '$2y$10$xIErdiNn2ntiqtiC0IDyw.POBNsLXi6IrkqZunCTIebdnvPstzYju', FALSE, NOW() - INTERVAL '1 day');

-- Reset identity sequence for users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- -----------------------------------------------------------------------------
-- 2. DISCOUNT RULES SEED
-- Rules for automated markdown calculation based on days left
-- -----------------------------------------------------------------------------
INSERT INTO discount_rules (donor_id, days_threshold, discount_percent, created_at)
VALUES
  -- Metro Supermarket rules
  (2, 30, 20.00, NOW() - INTERVAL '24 days'),
  (2, 14, 40.00, NOW() - INTERVAL '24 days'),
  (2, 7,  60.00, NOW() - INTERVAL '24 days'),
  (2, 3,  75.00, NOW() - INTERVAL '24 days'),

  -- City Mart Superstore rules
  (3, 30, 15.00, NOW() - INTERVAL '19 days'),
  (3, 14, 35.00, NOW() - INTERVAL '19 days'),
  (3, 7,  50.00, NOW() - INTERVAL '19 days');

-- -----------------------------------------------------------------------------
-- 3. LISTINGS SEED
-- Realistic rescue inventory across multiple categories
-- -----------------------------------------------------------------------------
INSERT INTO listings (id, donor_id, item_name, category, qty, expiry_date, orig_price, discount_price, image_url, status, created_at)
VALUES
  (1, 2, 'Artisan Whole Wheat Toast Loaf', 'Bakery', 45, CURRENT_DATE + INTERVAL '3 days', 120.00, 48.00,
   'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'available', NOW() - INTERVAL '2 days'),

  (2, 2, 'Farm Fresh Pasteurized Milk (5L Crate)', 'Dairy', 30, CURRENT_DATE + INTERVAL '4 days', 350.00, 175.00,
   'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', 'claimed', NOW() - INTERVAL '3 days'),

  (3, 2, 'Organic Valencia Orange Juice (1L)', 'Beverages', 50, CURRENT_DATE + INTERVAL '6 days', 180.00, 90.00,
   'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', 'delivered', NOW() - INTERVAL '5 days'),

  (4, 3, 'Roasted Hazelnut Chocolate Spread (350g)', 'Packaged Goods', 25, CURRENT_DATE + INTERVAL '12 days', 420.00, 210.00,
   'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', 'available', NOW() - INTERVAL '1 day'),

  (5, 3, 'Classic Granola Breakfast Cereal (1kg)', 'Packaged Goods', 40, CURRENT_DATE + INTERVAL '14 days', 480.00, 192.00,
   'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80', 'available', NOW() - INTERVAL '2 days'),

  (6, 2, 'Gourmet Greek Dip & Olive Trio', 'Deli & Snacks', 20, CURRENT_DATE + INTERVAL '2 days', 290.00, 116.00,
   'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 'available', NOW() - INTERVAL '12 hours'),

  (7, 3, 'Amul Taaza Homogenized Milk 1L', 'Dairy', 60, CURRENT_DATE + INTERVAL '5 days', 60.00, 30.00,
   'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80', 'available', NOW() - INTERVAL '6 hours'),

  (8, 2, 'Organic Produce Selection Box (5kg)', 'Produce', 15, CURRENT_DATE + INTERVAL '4 days', 225.00, 112.50,
   'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80', 'available', NOW() - INTERVAL '1 day');

SELECT setval('listings_id_seq', (SELECT MAX(id) FROM listings));

-- -----------------------------------------------------------------------------
-- 4. REQUESTS SEED
-- Demonstrating pending, approved, and completed claims
-- -----------------------------------------------------------------------------
INSERT INTO requests (id, listing_id, buyer_id, status, requested_at)
VALUES
  (1, 2, 5, 'pending', NOW() - INTERVAL '1 day'),
  (2, 3, 6, 'completed', NOW() - INTERVAL '4 days');

SELECT setval('requests_id_seq', (SELECT MAX(id) FROM requests));
