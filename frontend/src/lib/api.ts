


const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}


async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("ern_token");

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }


  if (options.body && typeof options.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`;

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err: unknown) {
    throw new ApiError(
      "NETWORK_ERROR",
      "Unable to reach the server. Please check your network connection.",
      0
    );
  }

  if (res.status === 401) {
    let wasAdmin = false;
    try {
      const priorUser = localStorage.getItem("ern_user");
      if (priorUser) {
        const u = JSON.parse(priorUser);
        wasAdmin = u.role === "admin" || u.rawRole === "admin";
      }
    } catch {}

    localStorage.removeItem("ern_token");
    localStorage.removeItem("ern_user");
    window.dispatchEvent(new CustomEvent("ern:auth-unauthorized", { detail: { wasAdmin } }));
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(
      "INVALID_RESPONSE",
      `Invalid server response (${res.status} ${res.statusText})`,
      res.status
    );
  }

  if (!res.ok || json.success === false) {
    const code = json.error?.code || `HTTP_${res.status}`;
    const message = json.error?.message || json.message || "An unexpected error occurred.";
    throw new ApiError(code, message, res.status);
  }

  return json.data as T;
}



export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "user" | "donor" | "buyer" | "retailer" | "customer";
  buyer_type?: "individual" | "ngo" | "orphanage" | null;
  verified: boolean;
  created_at?: string;
}

export interface AuthSuccessData {
  token: string;
  user: BackendUser;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "user" | "donor" | "buyer" | "retailer" | "customer";
  buyer_type?: "individual" | "ngo" | "orphanage";
  admin_invite_key?: string;
}



export interface ApiListing {
  id: number;
  donor_id: number;
  item_name: string;
  category: string;
  qty: number;
  expiry_date: string;
  orig_price: number;
  discount_price: number;
  image_url?: string | null;
  status: "available" | "claimed" | "delivered" | "cancelled";
  created_at: string;
  donor_name?: string;
  donor_email?: string;
  discount_percent?: number;
  days_remaining?: number;
}

export interface CreateListingPayload {
  item_name: string;
  category: string;
  qty: number;
  expiry_date: string;
  orig_price: number;
  discount_price?: number;
  image_url?: string;
}

export interface UpdateListingPayload {
  id: number;
  item_name?: string;
  category?: string;
  qty?: number;
  expiry_date?: string;
  orig_price?: number;
  discount_price?: number;
  image_url?: string;
  status?: "available" | "claimed" | "delivered" | "cancelled";
}



export interface ApiRequest {
  id: number;
  listing_id: number;
  buyer_id?: number;
  status: "pending" | "approved" | "completed" | "cancelled";
  requested_at: string;
  item_name: string;
  category?: string;
  qty?: number;
  orig_price?: number;
  discount_price?: number;
  image_url?: string | null;
  listing_status?: string;
  donor_name?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_type?: "individual" | "ngo" | "orphanage";
  days_remaining?: number;
}



export interface DashboardStats {
  pending_users: number;
  active_listings: number;
  pending_requests: number;
  completed_requests: number;
  total_users: number;
  total_listings: number;
}

export interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  buyer_type?: string | null;
  created_at: string;
}



export interface DiscountRule {
  id: number;
  donor_id: number;
  days_threshold: number;
  discount_percent: number;
  created_at: string;
}

export interface ApiTransfer {
  id: number;
  transfer_code: string;
  source_location: string;
  destination: string;
  product_name: string;
  quantity: string;
  assigned_to?: string | null;
  status: "Pending" | "Accepted" | "Pickup Scheduled" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled";
  created_date: string;
  expected_delivery?: string | null;
  completed_date?: string | null;
  created_at: string;
}

export interface ApiSupplier {
  id: number;
  code: string;
  name: string;
  contact_name?: string | null;
  email: string;
  phone?: string | null;
  category: string;
  rating: number;
  status: "Active" | "Under Review" | "Suspended";
  address?: string | null;
  created_at: string;
}

export interface ApiLocation {
  id: number;
  code: string;
  name: string;
  type: "Store" | "Warehouse" | "Distribution Center" | "Facility";
  manager_name?: string | null;
  manager_email?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  phone?: string | null;
  status: "Active" | "Inactive" | "Pending Setup";
  total_products: number;
  inventory_value: number;
  created_at: string;
}

export interface ApiModerationCase {
  id: number;
  case_code: string;
  type: "Listing Dispute" | "User Report" | "Fraud Flag" | "Quality Complaint";
  subject: string;
  reported_by: string;
  filed_date: string;
  status: "Open" | "Under Investigation" | "Resolved" | "Escalated";
  description: string;
  resolution?: string | null;
  created_at: string;
}

export interface ApiAuditLog {
  id: number;
  log_code: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  ip_address?: string | null;
  details?: string | null;
}

export interface ApiReportsData {
  period: string;
  kpis: {
    inventoryValue: number;
    expiryRiskValue: number;
    productsRescued: number;
    clearanceSold: number;
    recoveryValue: number;
    wastePreventedKg: number;
  };
  categories: Array<{
    category: string;
    listings_count: number;
    inventory_units: number;
    expiry_risk_value: number;
    recovery_value: number;
    rescued_units: number;
    clearance_units: number;
    waste_prevented_kg: number;
  }>;
  trend: Array<{
    label: string;
    critical: number;
    rescued: number;
  }>;
}



export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<AuthSuccessData>("auth.php?action=login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    signup: (payload: SignupPayload) =>
      request<{ user_id: number }>("auth.php?action=signup", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    me: () =>
      request<{ user: BackendUser }>("auth.php?action=me", {
        method: "GET",
      }),
  },

  listings: {
    browse: (params?: { category?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.category && params.category !== "All") {
        query.append("category", params.category);
      }
      if (params?.search) {
        query.append("search", params.search);
      }
      const qs = query.toString();
      return request<ApiListing[]>(`listings.php?action=browse${qs ? `&${qs}` : ""}`, {
        method: "GET",
      });
    },

    get: (id: number | string) =>
      request<ApiListing>(`listings.php?action=get&id=${id}`, {
        method: "GET",
      }),

    myListings: () =>
      request<ApiListing[]>("listings.php?action=my_listings", {
        method: "GET",
      }),

    create: (payload: CreateListingPayload) =>
      request<{ listing_id: number; discount_price: number; days_left: number }>(
        "listings.php?action=create",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),

    update: (payload: UpdateListingPayload) =>
      request<{ listing_id: number }>("listings.php?action=update", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    delete: (id: number | string) =>
      request<{ listing_id: number }>(`listings.php?action=delete&id=${id}`, {
        method: "POST",
      }),
  },

  requests: {
    claim: (listing_id: number | string) =>
      request<{ request_id: number; listing_id: number; status: string }>(
        "requests.php?action=claim",
        {
          method: "POST",
          body: JSON.stringify({ listing_id: Number(listing_id) }),
        }
      ),

    myRequests: () =>
      request<ApiRequest[]>("requests.php?action=my_requests", {
        method: "GET",
      }),

    incoming: () =>
      request<ApiRequest[]>("requests.php?action=incoming", {
        method: "GET",
      }),

    cancel: (request_id: number | string) =>
      request<{ request_id: number }>("requests.php?action=cancel", {
        method: "POST",
        body: JSON.stringify({ request_id: Number(request_id) }),
      }),
  },

  admin: {
    dashboardStats: () =>
      request<DashboardStats>("admin.php?action=dashboard-stats", {
        method: "GET",
      }),

    pendingUsers: () =>
      request<PendingUser[]>("admin.php?action=pending_users", {
        method: "GET",
      }),

    allUsers: () =>
      request<
        Array<{
          id: number;
          name: string;
          email: string;
          role: string;
          buyer_type?: string | null;
          verified: boolean;
          created_at: string;
        }>
      >("admin.php?action=all_users", {
        method: "GET",
      }),

    verifyUser: (user_id: number | string) =>
      request<{ user_id: number }>("admin.php?action=verify_user", {
        method: "POST",
        body: JSON.stringify({ user_id: Number(user_id) }),
      }),

    rejectUser: (user_id: number | string) =>
      request<{ user_id: number }>("admin.php?action=reject_user", {
        method: "POST",
        body: JSON.stringify({ user_id: Number(user_id) }),
      }),

    allListings: () =>
      request<ApiListing[]>("admin.php?action=all_listings", {
        method: "GET",
      }),

    allRequests: () =>
      request<ApiRequest[]>("admin.php?action=all_requests", {
        method: "GET",
      }),

    updateRequestStatus: (request_id: number | string, status: "pending" | "approved" | "completed" | "cancelled") =>
      request<{ request_id: number; status: string }>("admin.php?action=update_request_status", {
        method: "POST",
        body: JSON.stringify({ request_id: Number(request_id), status }),
      }),

    createUser: (payload: { name: string; email: string; password?: string; role: string; buyer_type?: string }) =>
      request<{ id: number; name: string; email: string; role: string }>("admin.php?action=create_user", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    allTransfers: () =>
      request<ApiTransfer[]>("admin.php?action=all_transfers", {
        method: "GET",
      }),

    createTransfer: (payload: { product_name: string; source_location: string; destination: string; quantity: number; assigned_to?: string; expected_delivery?: string }) =>
      request<{ id: number; transfer_code: string }>("admin.php?action=create_transfer", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    updateTransferStatus: (id: number | string, status: string, transfer_code?: string) =>
      request<{ id: number; transfer_code?: string; status: string }>("admin.php?action=update_transfer_status", {
        method: "POST",
        body: JSON.stringify({ id: Number(id), status, transfer_code }),
      }),

    allSuppliers: () =>
      request<ApiSupplier[]>("admin.php?action=all_suppliers", {
        method: "GET",
      }),

    createSupplier: (payload: { name: string; email: string; category: string; contact_name?: string; phone?: string; address?: string }) =>
      request<{ id: number; code: string; name: string }>("admin.php?action=create_supplier", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    allLocations: () =>
      request<ApiLocation[]>("admin.php?action=all_locations", {
        method: "GET",
      }),

    createLocation: (payload: { code: string; name: string; type?: string; manager_name?: string; manager_email?: string; address?: string; city?: string; region?: string; phone?: string }) =>
      request<{ id: number; code: string; name: string }>("admin.php?action=create_location", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    allModeration: () =>
      request<ApiModerationCase[]>("admin.php?action=all_moderation", {
        method: "GET",
      }),

    updateModerationStatus: (id: number | string, status: string, resolution?: string, case_code?: string) =>
      request<{ id: number; case_code?: string; status: string }>("admin.php?action=update_moderation_status", {
        method: "POST",
        body: JSON.stringify({ id: Number(id), status, resolution, case_code }),
      }),

    allAuditLogs: () =>
      request<ApiAuditLog[]>("admin.php?action=all_audit_logs", {
        method: "GET",
      }),

    reportsData: (period: string = "7d") =>
      request<ApiReportsData>(`admin.php?action=reports_data&period=${period}`, {
        method: "GET",
      }),
  },

  discountRules: {
    list: () =>
      request<DiscountRule[]>("discount_rules.php?action=list", {
        method: "GET",
      }),

    create: (rule: { days_threshold: number; discount_percent: number }) =>
      request<{ id: number; days_threshold: number; discount_percent: number }>(
        "discount_rules.php?action=create",
        {
          method: "POST",
          body: JSON.stringify(rule),
        }
      ),

    update: (id: number | string, rule: { days_threshold?: number; discount_percent?: number }) =>
      request<{ id: number }>("discount_rules.php?action=update", {
        method: "POST",
        body: JSON.stringify({ id: Number(id), ...rule }),
      }),

    delete: (id: number | string) =>
      request<{ id: number }>(`discount_rules.php?action=delete&id=${id}`, {
        method: "POST",
      }),
  },

  health: () =>
    request<{ database: string; driver: string; server_time: string }>("health.php", {
      method: "GET",
    }),
};
