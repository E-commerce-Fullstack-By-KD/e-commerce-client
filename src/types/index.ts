// ──── API Response Types ────
export interface ApiResponse<T = unknown> {
  status_code: number;
  error: boolean;
  message: string;
  result?: T;
}

// ──── Auth Types ────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
}

export interface AuthResponse {
  jwtToken: string;
  user: User;
}

// ──── User ────
export type UserRole = "admin" | "user";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ──── Collection ────
export interface Collection {
  id: number;
  name: string;
}

// ──── Product Status ────
export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

// ──── Admin Product (matches backend Product entity exactly) ────
export interface AdminProduct {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  image_url: string[];
  list_price: number;
  offer_price: number | null;   // null = no offer, display list_price
  status: ProductStatus;
  stock: number;
  is_deleted: boolean;
  collections: Collection[];
  created_at: string;
  updated_at: string;
}

// ──── Product Create/Update Payloads (mirrors backend DTO) ────
export interface CreateProductPayload {
  name: string;
  sku: string;
  description?: string;
  image_url?: string[];
  list_price: number;
  offer_price?: number | null;  // optional — omit or null = no offer price
  stock: number;
  status?: ProductStatus;
  collectionIds?: number[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: number;
}

// ──── Public Product (storefront) ────
export interface Product {
  id: number;
  name: string;
  description: string;
  list_price: number;
  offer_price: number;
  image_url: string[];
  status: ProductStatus;
  stock: number;
  collections: Collection[];
  created_at: string;
}

// ──── Cart ────
/** One row in the cart table — matches backend Cart entity */
export interface CartItem {
  id: number;          // cart row id (used for PATCH/DELETE)
  quantity: number;
  product: AdminProduct;
  created_at: string;
  updated_at: string;
}

export interface CartListResult {
  carts: CartItem[];
}

export interface CartSingleResult {
  cart: CartItem;
}

// ──── Order ────
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

// ──── Address ────
export interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressPayload {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default?: boolean;
}

export interface AddressListResult {
  addresses: Address[];
}

export interface AddressSingleResult {
  address: Address;
}

// ──── Pagination ────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}
