import { get, post, put, del } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, Cart } from "@/types";

export const cartService = {
  get() {
    return get<ApiResponse<Cart>>(API_ENDPOINTS.CART.GET);
  },

  addItem(productId: number, quantity: number) {
    return post<ApiResponse<Cart>>(API_ENDPOINTS.CART.ADD, { productId, quantity });
  },

  updateItem(productId: number, quantity: number) {
    return put<ApiResponse<Cart>>(API_ENDPOINTS.CART.UPDATE, { productId, quantity });
  },

  removeItem(id: number | string) {
    return del<ApiResponse>(API_ENDPOINTS.CART.REMOVE(id));
  },
};
