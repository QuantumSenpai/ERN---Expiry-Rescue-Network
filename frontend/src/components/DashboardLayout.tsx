import { useAuth } from "@/context/AuthContext";
import StaffLayout from "@/layouts/StaffLayout";
import AdminLayout from "@/layouts/AdminLayout";
import MarketplaceLayout from "@/layouts/MarketplaceLayout";

export default function DashboardLayout() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminLayout />;
  }
  if (user?.role === "customer") {
    return <MarketplaceLayout />;
  }
  return <StaffLayout />;
}