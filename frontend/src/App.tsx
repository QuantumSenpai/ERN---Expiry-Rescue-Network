import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/context/ThemeContext";
import { RescueDealsProvider } from "@/context/RescueDealsContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { AppDataProvider } from "@/context/AppDataContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import StaffLayout from "@/layouts/StaffLayout";
import AdminLayout from "@/layouts/AdminLayout";
import MarketplaceLayout from "@/layouts/MarketplaceLayout";
import PageTransition from "@/components/PageTransition";

import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import UnderConstruction from "@/pages/UnderConstruction";

import StaffOperationsDashboard from "@/pages/retailer/StaffOperationsDashboard";
import MarketplaceHome from "@/pages/customer/MarketplaceHome";
import RetailerCheckout from "@/pages/retailer/Checkout";
import RetailerOrderSuccess from "@/pages/retailer/OrderSuccess";
import RetailerOrderDetail from "@/pages/retailer/OrderDetail";
import RetailerProducts from "@/pages/retailer/Products";
import RetailerBatches from "@/pages/retailer/Batches";
import ExpiryMonitor from "@/pages/retailer/ExpiryMonitor";
import ExpiryIntelligence from "@/pages/retailer/ExpiryIntelligence";
import StaffRequests from "@/pages/retailer/StaffRequests";
import Alerts from "@/pages/retailer/Alerts";
import Clearance from "@/pages/retailer/Clearance";
import AddProduct from "@/pages/retailer/AddProduct";
import Inventory from "@/pages/retailer/Inventory";
import Sales from "@/pages/retailer/Sales";
import Reports from "@/pages/retailer/Reports";
import Suppliers from "@/pages/retailer/Suppliers";
import RetailerUsers from "@/pages/retailer/RetailerUsers";

import Browse from "@/pages/customer/Browse";
import Orders from "@/pages/customer/Orders";
import Profile from "@/pages/customer/Profile";
import SavedItems from "@/pages/customer/SavedItems";
import CustomerAlerts from "@/pages/customer/CustomerAlerts";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminLocations from "@/pages/admin/Locations";
import AdminOrganization from "@/pages/admin/Organization";
import AdminPolicies from "@/pages/admin/Policies";
import AdminListings from "@/pages/admin/Listings";
import AdminRequests from "@/pages/admin/Requests";
import AdminSuppliers from "@/pages/admin/Suppliers";
import AdminSettings from "@/pages/admin/Settings";
import AdminMarketplacePreview from "@/pages/admin/MarketplacePreview";
import AdminTransfers from "@/pages/admin/Transfers";
import AdminVerification from "@/pages/admin/Verification";
import AdminAuditLogs from "@/pages/admin/AuditLogs";
import AdminModeration from "@/pages/admin/Moderation";
import AdminNotifications from "@/pages/admin/Notifications";


function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === "customer") {
    return <Navigate to="/marketplace" replace />;
  }
  return <Navigate to="/retailer/dashboard" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      {/* Sticky Liquid Navbar strictly on Home/Landing */}
      {isHomePage && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/signup"
            element={
              <PageTransition>
                <Signup />
              </PageTransition>
            }
          />

          {/* Top-Level Route Aliases mapping cleanly to Retailer/Customer Modules */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Top-Level Customer Marketplace Route */}
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRoles={["retailer", "admin", "customer"]}>
                <MarketplaceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MarketplaceHome />} />
          </Route>

          {/* Customer Protected Canonical Routes inside MarketplaceLayout */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MarketplaceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/marketplace" replace />} />
            <Route path="browse" element={<Browse />} />
            <Route path="saved-items" element={<SavedItems />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<RetailerOrderDetail />} />
            <Route path="checkout" element={<RetailerCheckout />} />
            <Route path="order-success" element={<RetailerOrderSuccess />} />
            <Route path="profile" element={<Profile />} />
            <Route path="alerts" element={<CustomerAlerts />} />
          </Route>

          {/* Legacy Customer Aliases (Redirecting to Canonical Customer Routes) */}
          <Route
            path="/browse"
            element={<Navigate to="/customer/browse" replace />}
          />
          <Route
            path="/account"
            element={<Navigate to="/customer/profile" replace />}
          />
          <Route
            path="/wishlist"
            element={<Navigate to="/customer/saved-items" replace />}
          />
          <Route
            path="/customer/wishlist"
            element={<Navigate to="/customer/saved-items" replace />}
          />
          <Route
            path="/orders"
            element={<Navigate to="/customer/orders" replace />}
          />
          <Route
            path="/orders/:id"
            element={<Navigate to="/customer/orders" replace />}
          />
          <Route
            path="/profile"
            element={<Navigate to="/customer/profile" replace />}
          />
          <Route
            path="/saved-items"
            element={<Navigate to="/customer/saved-items" replace />}
          />
          <Route
            path="/checkout"
            element={<Navigate to="/customer/checkout" replace />}
          />
          <Route
            path="/order-success"
            element={<Navigate to="/customer/order-success" replace />}
          />
          <Route
            path="/retailer/checkout"
            element={<Navigate to="/customer/checkout" replace />}
          />
          <Route
            path="/retailer/order-success"
            element={<Navigate to="/customer/order-success" replace />}
          />
          <Route
            path="/retailer/orders"
            element={<Navigate to="/customer/orders" replace />}
          />
          <Route
            path="/retailer/orders/:id"
            element={<Navigate to="/customer/orders" replace />}
          />
          <Route
            path="/retailer/profile"
            element={<Navigate to="/customer/profile" replace />}
          />

          {/* Top-Level Retailer Aliases */}
          <Route
            path="/products"
            element={<Navigate to="/retailer/products" replace />}
          />
          <Route
            path="/products/new"
            element={<Navigate to="/retailer/add-product" replace />}
          />
          <Route
            path="/inventory"
            element={<Navigate to="/retailer/inventory" replace />}
          />
          <Route
            path="/batches"
            element={<Navigate to="/retailer/batches" replace />}
          />
          <Route
            path="/expiry"
            element={<Navigate to="/retailer/expiry-intelligence" replace />}
          />
          <Route
            path="/expiry-monitor"
            element={<Navigate to="/retailer/expiry-intelligence" replace />}
          />
          <Route
            path="/expiry-intelligence"
            element={<Navigate to="/retailer/expiry-intelligence" replace />}
          />
          <Route
            path="/alerts"
            element={<Navigate to="/retailer/alerts" replace />}
          />
          <Route
            path="/clearance"
            element={<Navigate to="/retailer/clearance" replace />}
          />
          <Route
            path="/sales"
            element={<Navigate to="/retailer/sales" replace />}
          />
          <Route
            path="/reports"
            element={<Navigate to="/retailer/reports" replace />}
          />
          <Route
            path="/analytics"
            element={<Navigate to="/retailer/reports" replace />}
          />
          <Route
            path="/suppliers"
            element={<Navigate to="/retailer/suppliers" replace />}
          />
          <Route
            path="/users"
            element={<Navigate to="/retailer/users" replace />}
          />
          <Route
            path="/settings"
            element={<Navigate to="/retailer/settings" replace />}
          />
          <Route
            path="/requests"
            element={<Navigate to="/retailer/requests" replace />}
          />

          {/* Retailer / Staff Protected Routes (inside StaffLayout) */}
          <Route
            path="/retailer"
            element={
              <ProtectedRoute allowedRoles={["retailer"]}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffOperationsDashboard />} />
            <Route path="dashboard" element={<StaffOperationsDashboard />} />
            <Route path="products" element={<RetailerProducts />} />
            <Route
              path="products/:id"
              element={<UnderConstruction moduleName="Product Detail View" />}
            />
            <Route path="inventory" element={<Inventory />} />
            <Route
              path="inventory/:id"
              element={<UnderConstruction moduleName="Inventory Item Log" />}
            />
            <Route path="batches" element={<RetailerBatches />} />
            <Route
              path="batches/:id"
              element={
                <UnderConstruction moduleName="Batch Traceability Log" />
              }
            />
            <Route path="expiry" element={<ExpiryIntelligence />} />
            <Route path="expiry-monitor" element={<ExpiryIntelligence />} />
            <Route
              path="expiry-intelligence"
              element={<ExpiryIntelligence />}
            />
            <Route path="requests" element={<StaffRequests />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="clearance" element={<Clearance />} />
            <Route path="sales" element={<Sales />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Reports />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="users" element={<RetailerUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="add-product" element={<AddProduct />} />
          </Route>

          {/* Admin Protected Routes (inside AdminLayout) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="organization" element={<AdminOrganization />} />
            <Route path="policies" element={<AdminPolicies />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="expiry" element={<ExpiryMonitor />} />
            <Route path="expiry-monitor" element={<ExpiryMonitor />} />
            <Route path="products" element={<RetailerProducts />} />
            <Route path="batches" element={<RetailerBatches />} />
            <Route path="sales" element={<Sales />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="clearance" element={<Clearance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route
              path="marketplace-preview"
              element={<AdminMarketplacePreview />}
            />
            <Route path="transfers" element={<AdminTransfers />} />
            <Route path="verification" element={<AdminVerification />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>

          {/* Fallback / Under Development Wildcard Route */}
          <Route
            path="*"
            element={
              <PageTransition>
                <UnderConstruction
                  title="Page Under Active Development"
                  description="This route is being actively designed and will be available soon."
                />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
          <RescueDealsProvider>
            <CartProvider>
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </CartProvider>
          </RescueDealsProvider>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
