import { get } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, AdminProduct } from "@/types";

interface ProductListResult {
  products: AdminProduct[];
}

interface ProductDetailResult {
  product: AdminProduct;
}

export const productService = {
  getAll() {
    return get<ApiResponse<ProductListResult>>(API_ENDPOINTS.ADMIN.PRODUCT.LIST);
  },

  getById(id: number | string) {
    return get<ApiResponse<ProductDetailResult>>(API_ENDPOINTS.ADMIN.PRODUCT.DETAIL(id));
  },
};
