import { get } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildQueryString } from "@/lib/utils";
import type { ApiResponse, PaginatedResponse, Product, QueryParams } from "@/types";

export const productService = {
  getAll(params?: QueryParams) {
    const qs = params ? buildQueryString(params) : "";
    return get<ApiResponse<PaginatedResponse<Product>>>(`${API_ENDPOINTS.PRODUCTS.LIST}${qs}`);
  },

  getById(id: number | string) {
    return get<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  },
};
