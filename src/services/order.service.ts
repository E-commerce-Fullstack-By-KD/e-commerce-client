import { get, post } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildQueryString } from "@/lib/utils";
import type { ApiResponse, Order, PaginatedResponse, QueryParams } from "@/types";

export const orderService = {
  getAll(params?: QueryParams) {
    const qs = params ? buildQueryString(params) : "";
    return get<ApiResponse<PaginatedResponse<Order>>>(`${API_ENDPOINTS.ORDERS.LIST}${qs}`);
  },

  getById(id: number | string) {
    return get<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.DETAIL(id));
  },

  create(addressId: number) {
    return post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.CREATE, { addressId });
  },
};
