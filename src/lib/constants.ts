// ──── Storage Keys ────
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
  CART: "cart",
  THEME: "theme",
} as const;

// ──── API Endpoints ────
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    VERIFY: "/auth/verify",
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (id: number | string) => `/products/${id}`,
  },
  CART: {
    GET: "/cart",
    ADD: "/cart/add",
    UPDATE: "/cart/update",
    REMOVE: (id: number | string) => `/cart/${id}`,
  },
  ORDERS: {
    LIST: "/orders",
    DETAIL: (id: number | string) => `/orders/${id}`,
    CREATE: "/orders",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE: "/user/profile",
    ADDRESSES: "/user/addresses",
  },
  // ──── Admin ────
  ADMIN: {
    COLLECTION: {
      LIST:             "/collection/findAll",
      DETAIL:           (id: number | string) => `/collection/findOne/${id}`,
      CREATE:           "/collection/create",
      UPDATE:           "/collection/update",
      DELETE:           (id: number | string) => `/collection/remove/${id}`,
    },
    PRODUCT: {
      LIST:             "/admin/products",
      DETAIL:           (id: number | string) => `/admin/products/${id}`,
      CREATE:           "/admin/products/create",
      UPDATE:           (id: number | string) => `/admin/products/${id}`,
      DELETE:           (id: number | string) => `/admin/products/${id}`,
    },
  },
} as const;

// ──── App Routes ────
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY: "/verify",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: number | string) => `/products/${id}`,
  CART: "/cart",
  ORDERS: "/orders",
  PROFILE: "/profile",
  // ──── Admin ────
  ADMIN: {
    ROOT:        "/admin",
    PRODUCTS:    "/admin/products",
    COLLECTIONS: "/admin/collections",
  },
} as const;

// ──── Toast Messages ────
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Logged in successfully!",
    SIGNUP_SUCCESS: "Account created! Please check your email to verify.",
    LOGOUT_SUCCESS: "Logged out successfully!",
    VERIFY_SUCCESS: "Email verified successfully!",
    SESSION_EXPIRED: "Session expired. Please log in again.",
  },
  CART: {
    ADDED: "Item added to cart!",
    UPDATED: "Cart updated!",
    REMOVED: "Item removed from cart!",
  },
  ORDER: {
    PLACED: "Order placed successfully!",
  },
  ERROR: {
    GENERIC: "Something went wrong. Please try again.",
    NETWORK: "Network error. Please check your connection.",
  },
} as const;
