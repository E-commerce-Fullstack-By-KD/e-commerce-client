import { get, post, patch, del } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiResponse,
  AddressListResult,
  AddressSingleResult,
  AddressPayload,
} from "@/types";

export const addressService = {
  /** GET /address — all addresses for the logged-in user */
  getAll() {
    return get<ApiResponse<AddressListResult>>(API_ENDPOINTS.ADDRESS.LIST);
  },

  /** GET /address/:id */
  getById(id: number) {
    return get<ApiResponse<AddressSingleResult>>(API_ENDPOINTS.ADDRESS.DETAIL(id));
  },

  /** POST /address */
  create(payload: AddressPayload) {
    return post<ApiResponse<AddressSingleResult>>(API_ENDPOINTS.ADDRESS.CREATE, payload);
  },

  /** PATCH /address/:id */
  update(id: number, payload: Partial<AddressPayload>) {
    return patch<ApiResponse<AddressSingleResult>>(API_ENDPOINTS.ADDRESS.UPDATE(id), payload);
  },

  /** DELETE /address/:id */
  remove(id: number) {
    return del<ApiResponse>(API_ENDPOINTS.ADDRESS.DELETE(id));
  },
};
