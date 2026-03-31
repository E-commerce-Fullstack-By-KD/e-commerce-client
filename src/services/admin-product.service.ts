import { get, post, del, put } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, AdminProduct, CreateProductPayload } from "@/types";

interface ProductListResult {
  products: AdminProduct[];
}

interface ProductDetailResult {
  product: AdminProduct;
}

export const adminProductService = {
  getAll() {
    return get<ApiResponse<ProductListResult>>(
      API_ENDPOINTS.ADMIN.PRODUCT.LIST,
    );
  },

  getById(id: number | string) {
    return get<ApiResponse<ProductDetailResult>>(
      API_ENDPOINTS.ADMIN.PRODUCT.DETAIL(id),
    );
  },

  create(payload: CreateProductPayload) {
    return post<ApiResponse<ProductDetailResult>>(
      API_ENDPOINTS.ADMIN.PRODUCT.CREATE,
      payload,
    );
  },

  update(id: number | string, payload: Partial<CreateProductPayload>) {
    return put<ApiResponse<ProductDetailResult>>(
      API_ENDPOINTS.ADMIN.PRODUCT.UPDATE(id),
      payload,
    );
  },

  remove(id: number | string) {
    return del<ApiResponse>(API_ENDPOINTS.ADMIN.PRODUCT.DELETE(id));
  },
};
