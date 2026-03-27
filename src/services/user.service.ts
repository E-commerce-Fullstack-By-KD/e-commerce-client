import { get, put } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, User, Address } from "@/types";

export const userService = {
  getProfile() {
    return get<ApiResponse<User>>(API_ENDPOINTS.USER.PROFILE);
  },

  updateProfile(data: Partial<Pick<User, "name" | "email">>) {
    return put<ApiResponse<User>>(API_ENDPOINTS.USER.UPDATE, data);
  },

  getAddresses() {
    return get<ApiResponse<Address[]>>(API_ENDPOINTS.USER.ADDRESSES);
  },
};
