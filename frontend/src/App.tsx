import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppDataProvider } from "@/context/AppDataContext";
import { RescueDealsProvider } from "@/context/RescueDealsContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import MarketplaceLayout from "@/layouts/MarketplaceLayout";
import StaffLayout from "@/layouts/StaffLayout";
import AdminLayout from "@/layouts/AdminLayout";
import PageTransition from "@/components/PageTransition";

import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import UnderConstruction from "@/pages/UnderConstruction";

import MarketplaceHome from "@/pages/customer/MarketplaceHome";
import Browse from "@/pages/customer/Browse";
import Orders from "@/pages/customer/Orders";
import CustomerOrderDetail from "@/pages/customer/CustomerOrderDetail";
import Profile from "@/pages/customer/Profile";
import SavedItems from "@/pages/customer/SavedItems";
import CustomerAlerts from "@/pages/customer/CustomerAlerts";
import ProductDetail from "@/pages/customer/ProductDetail";
import Cart from "@/pages/customer/Cart";
import CustomerCheckout from "@/pages/customer/CustomerCheckout";

const StaffOperationsDashboard = lazy(() => import("@/pages/retailer/StaffOperationsDashboard"));
const RetailerCheckout = lazy(() => import("@/pages/retailer/Checkout"));
const RetailerOrderSuccess = lazy(() => import("@/pages/retailer/OrderSuccess"));
const RetailerOrderDetail = lazy(() => import("@/pages/retailer/OrderDetail"));
const RetailerOrders = lazy(() => import("@/pages/retailer/RetailerOrders"));
const RetailerProductDetail = lazy(() => import("@/pages/retailer/RetailerProductDetail"));
const RetailerInventoryDetail = lazy(() => import("@/pages/retailer/RetailerInventoryDetail"));
const RetailerBatchDetail = lazy(() => import("@/pages/retailer/RetailerBatchDetail"));
const RetailerProducts = lazy(() => import("@/pages/retailer/Products"));
const RetailerBatches = lazy(() => import("@/pages/retailer/Batches"));
const ExpiryMonitor = lazy(() => import("@/pages/retailer/ExpiryMonitor"));
const ExpiryIntelligence = lazy(() => import("@/pages/retailer/ExpiryIntelligence"));
const StaffRequests = lazy(() => import("@/pages/retailer/StaffRequests"));
const Alerts = lazy(() => import("@/pages/retailer/Alerts"));
const Clearance = lazy(() => import("@/pages/retailer/Clearance"));
const AddProduct = lazy(() => import("@/pages/retailer/AddProduct"));
const Inventory = lazy(() => import("@/pages/retailer/Inventory"));
const Sales = lazy(() => import("@/pages/retailer/Sales"));
const Reports = lazy(() => import("@/pages/retailer/Reports"));
const Suppliers = lazy(() => import("@/pages/retailer/Suppliers"));
const RetailerUsers = lazy(() => import("@/pages/retailer/RetailerUsers"));

const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminLocations = lazy(() => import("@/pages/admin/Locations"));
const AdminOrganization = lazy(() => import("@/pages/admin/Organization"));
const AdminPolicies = lazy(() => import("@/pages/admin/Policies"));
const AdminListings = lazy(() => import("@/pages/admin/Listings"));
const AdminRequests = lazy(() => import("@/pages/admin/Requests"));
const AdminSuppliers = lazy(() => import("@/pages/admin/Suppliers"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminMarketplacePreview = lazy(() => import("@/pages/admin/MarketplacePreview"));
const AdminTransfers = lazy(() => import("@/pages/admin/Transfers"));
const AdminVerification = lazy(() => import("@/pages/admin/Verification"));
const AdminAuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));
const AdminModeration = lazy(() => import("@/pages/admin/Moderation"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));

function RouteLoadingFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 font-mono text-xs text-muted-foreground">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>INITIALIZING ERN TELEMETRY...</span>
      </div>
    </div>
  );
}

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
      {isHomePage && <Navbar />}

      <Suspense fallback={<RouteLoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
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
            <Route
              path="/privacy-policy"
              element={
                <PageTransition>
                  <PrivacyPolicy />
                </PageTransition>
              }
            />

            <Route path="/dashboard" element={<DashboardRedirect />} />

            <Route
              path="/marketplace"
              element={
                <ProtectedRoute allowedRoles={["retailer", "admin", "customer"]}>
                  <MarketplaceLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<MarketplaceHome />} />
              <Route path="product/:productId" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<CustomerCheckout />} />
            </Route>

            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={["customer", "retailer", "admin"]}>
                  <MarketplaceLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<MarketplaceHome />} />
              <Route path="browse" element={<Browse />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<CustomerOrderDetail />} />
              <Route path="product/:productId" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="saved-items" element={<SavedItems />} />
              <Route path="checkout" element={<CustomerCheckout />} />
              <Route path="order-success" element={<RetailerOrderSuccess />} />
              <Route path="profile" element={<Profile />} />
              <Route path="alerts" element={<CustomerAlerts />} />
            </Route>

            <Route path="/browse" element={<Navigate to="/customer/browse" replace />} />
            <Route path="/account" element={<Navigate to="/customer/profile" replace />} />
            <Route path="/wishlist" element={<Navigate to="/customer/saved-items" replace />} />
            <Route path="/customer/wishlist" element={<Navigate to="/customer/saved-items" replace />} />
            <Route path="/orders" element={<Navigate to="/customer/orders" replace />} />
            <Route path="/orders/:id" element={<Navigate to="/customer/orders" replace />} />
            <Route path="/profile" element={<Navigate to="/customer/profile" replace />} />
            <Route path="/saved-items" element={<Navigate to="/customer/saved-items" replace />} />
            <Route path="/checkout" element={<Navigate to="/customer/checkout" replace />} />
            <Route path="/order-success" element={<Navigate to="/customer/order-success" replace />} />
            <Route path="/retailer/checkout" element={<Navigate to="/customer/checkout" replace />} />
            <Route path="/retailer/order-success" element={<Navigate to="/customer/order-success" replace />} />
            <Route path="/retailer/orders" element={<Navigate to="/customer/orders" replace />} />
            <Route path="/retailer/orders/:id" element={<Navigate to="/customer/orders" replace />} />
            <Route path="/retailer/profile" element={<Navigate to="/customer/profile" replace />} />

            <Route path="/products" element={<Navigate to="/retailer/products" replace />} />
            <Route path="/products/new" element={<Navigate to="/retailer/add-product" replace />} />
            <Route path="/inventory" element={<Navigate to="/retailer/inventory" replace />} />
            <Route path="/batches" element={<Navigate to="/retailer/batches" replace />} />
            <Route path="/expiry" element={<Navigate to="/retailer/expiry-intelligence" replace />} />
            <Route path="/expiry-monitor" element={<Navigate to="/retailer/expiry-intelligence" replace />} />
            <Route path="/expiry-intelligence" element={<Navigate to="/retailer/expiry-intelligence" replace />} />
            <Route path="/alerts" element={<Navigate to="/retailer/alerts" replace />} />
            <Route path="/clearance" element={<Navigate to="/retailer/clearance" replace />} />
            <Route path="/sales" element={<Navigate to="/retailer/sales" replace />} />
            <Route path="/reports" element={<Navigate to="/retailer/reports" replace />} />
            <Route path="/analytics" element={<Navigate to="/retailer/reports" replace />} />
            <Route path="/suppliers" element={<Navigate to="/retailer/suppliers" replace />} />
            <Route path="/users" element={<Navigate to="/retailer/users" replace />} />
            <Route path="/settings" element={<Navigate to="/retailer/settings" replace />} />
            <Route path="/requests" element={<Navigate to="/retailer/requests" replace />} />

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
              <Route path="products/:id" element={<RetailerProductDetail />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/:id" element={<RetailerInventoryDetail />} />
              <Route path="batches" element={<RetailerBatches />} />
              <Route path="batches/:id" element={<RetailerBatchDetail />} />
              <Route path="orders" element={<RetailerOrders />} />
              <Route path="orders/:id" element={<RetailerOrderDetail />} />
              <Route path="expiry" element={<ExpiryIntelligence />} />
              <Route path="expiry-monitor" element={<ExpiryIntelligence />} />
              <Route path="expiry-intelligence" element={<ExpiryIntelligence />} />
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
              <Route path="checkout" element={<RetailerCheckout />} />
              <Route path="order-success" element={<RetailerOrderSuccess />} />
            </Route>

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
              <Route path="marketplace-preview" element={<AdminMarketplacePreview />} />
              <Route path="transfers" element={<AdminTransfers />} />
              <Route path="verification" element={<AdminVerification />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

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
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppDataProvider>
            <RescueDealsProvider>
              <CartProvider>
                <BrowserRouter>
                  <AnimatedRoutes />
                </BrowserRouter>
              </CartProvider>
            </RescueDealsProvider>
          </AppDataProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
