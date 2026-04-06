import { get, post } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildQueryString } from "@/lib/utils";
import type {
  ApiResponse,
  OrderListResult,
  OrderCreateResult,
  OrderSingleResult,
  QueryParams,
} from "@/types";

export const orderService = {
  getAll(params?: QueryParams) {
    const qs = params ? buildQueryString(params) : "";
    return get<ApiResponse<OrderListResult>>(`${API_ENDPOINTS.ORDERS.LIST}${qs}`);
  },

  getById(id: number | string) {
    return get<ApiResponse<OrderSingleResult>>(API_ENDPOINTS.ORDERS.DETAIL(id));
  },

  create(addressId: number, cartIds?: number[]) {
    return post<ApiResponse<OrderCreateResult>>(API_ENDPOINTS.ORDERS.CREATE, {
      addressId,
      ...(cartIds && cartIds.length > 0 ? { cartIds } : {}),
    });
  },
};
