import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Role = "retailer" | "customer" | "admin";

export const ROLE_HOME_ROUTES: Record<Role, string> = {
  customer: "/marketplace",
  retailer: "/retailer/dashboard",
  admin: "/admin/dashboard",
} as const;

export function getRoleHomeRoute(role?: Role | null): string {
  if (!role) return "/login";
  return ROLE_HOME_ROUTES[role] || "/login";
}

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("ern_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ern_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      setUser(null);
    }
  }, []);

  const login = (u: AuthUser) => {
    localStorage.setItem("ern_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("ern_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}