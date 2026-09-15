import { Navigate } from "react-router-dom";
import { useAuth, type Role, getRoleHomeRoute, normalizeRole } from "@/context/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: (Role | string)[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user.role);
  const isAllowed = allowedRoles.some((r) => normalizeRole(r) === userRole);

  if (!isAllowed) {
    return <Navigate to={getRoleHomeRoute(user.role)} replace />;
  }

  return <>{children}</>;
}