// ──── API Response Types ────
// Backend uses `result` for data payloads (not `data`)
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
  jwtToken: string;   // backend returns `jwtToken`
  user: User;
}

// ──── User Role ────
export type UserRole = "admin" | "user";

// ──── User Types ────
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ──── Collection Types ────
export interface Collection {
  id: number;
  name: string;
}

// ──── Admin Product Types (matches backend Product entity) ────
export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

export interface AdminProduct {
  id: number;
  name: string;
  sku: string;
  image_url: string[];
  list_price: number;
  offer_price: number;
  status: ProductStatus;
  stock: number;
  created_at: string;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  list_price: number;
  offer_price: number;
  stock: number;
  status: ProductStatus;
  image_url?: string[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: number;
}

// ──── Product Types ────
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

// ──── Cart Types ────
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

// ──── Order Types ────
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

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

// ──── Address Types ────
export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// ──── Common Types ────
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
