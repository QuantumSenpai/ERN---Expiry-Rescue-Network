import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, type BackendUser, type SignupPayload } from "@/lib/api";

export type Role = "retailer" | "customer" | "admin";

export const ROLE_HOME_ROUTES: Record<Role, string> = {
  customer: "/marketplace",
  retailer: "/retailer/dashboard",
  admin: "/admin/dashboard",
} as const;

export function getRoleHomeRoute(role?: Role | string | null): string {
  if (!role) return "/login";
  if (role === "donor" || role === "retailer") return "/retailer/dashboard";
  if (role === "buyer" || role === "customer") return "/marketplace";
  if (role === "admin") return "/admin/dashboard";
  return "/login";
}

export function normalizeRole(rawRole: string): Role {
  if (rawRole === "donor" || rawRole === "retailer") return "retailer";
  if (rawRole === "buyer" || rawRole === "customer") return "customer";
  return "admin";
}

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role: Role;
  rawRole?: "donor" | "buyer" | "admin";
  buyerType?: "individual" | "ngo" | "orphanage" | null;
  verified?: boolean;
}

export type LoginParam = { email: string; password: string } | AuthUser;

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (param: LoginParam) => Promise<AuthUser>;
  signup: (payload: SignupPayload) => Promise<{ user_id: number }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUser(u: BackendUser): AuthUser {
  const normRole = normalizeRole(u.role);
  return {
    id: Number(u.id),
    name: u.name,
    email: u.email,
    role: normRole,
    rawRole: (u.role === "retailer" ? "donor" : u.role === "customer" ? "buyer" : u.role) as "donor" | "buyer" | "admin",
    buyerType: u.buyer_type,
    verified: Boolean(u.verified),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("ern_token"));
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("ern_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem("ern_token");
    localStorage.removeItem("ern_user");
    setToken(null);
    setUser(null);
  }, []);


  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("ern_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.auth.me();
        const mapped = mapBackendUser(res.user);
        setUser(mapped);
        localStorage.setItem("ern_user", JSON.stringify(mapped));
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();


    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("ern:auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("ern:auth-unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const login = async (param: LoginParam): Promise<AuthUser> => {
    if ("role" in param && "id" in param) {
      const normRole = normalizeRole(param.role);
      const mappedUser: AuthUser = {
        ...param,
        role: normRole,
        rawRole: (param.rawRole || (normRole === "retailer" ? "donor" : normRole === "customer" ? "buyer" : "admin")) as "donor" | "buyer" | "admin",
        verified: param.verified ?? true,
      };
      localStorage.setItem("ern_user", JSON.stringify(mappedUser));
      setUser(mappedUser);
      return mappedUser;
    }

    const data = await api.auth.login(param);
    const mapped = mapBackendUser(data.user);

    localStorage.setItem("ern_token", data.token);
    localStorage.setItem("ern_user", JSON.stringify(mapped));

    setToken(data.token);
    setUser(mapped);

    return mapped;
  };

  const signup = async (payload: SignupPayload): Promise<{ user_id: number }> => {
    return await api.auth.signup(payload);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}