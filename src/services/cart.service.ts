import { get, post, del, put } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, CartListResult, CartSingleResult } from "@/types";

export const cartService = {
  /** GET /cart — all cart rows for the logged-in user */
  getAll() {
    return get<ApiResponse<CartListResult>>(API_ENDPOINTS.CART.LIST);
  },

  /** POST /cart — add product (merges quantity if product already in cart) */
  addItem(productId: number, quantity = 1) {
    return post<ApiResponse<CartSingleResult>>(API_ENDPOINTS.CART.ADD, {
      productId,
      quantity,
    });
  },

  /** PATCH /cart/:cartId — set new quantity for a cart row */
  updateItem(cartId: number, quantity: number) {
    return put<ApiResponse<CartSingleResult>>(
      API_ENDPOINTS.CART.UPDATE(cartId),
      { quantity },
    );
  },

  /** DELETE /cart/:cartId — remove a cart row */
  removeItem(cartId: number) {
    return del<ApiResponse>(API_ENDPOINTS.CART.REMOVE(cartId));
  },
};
