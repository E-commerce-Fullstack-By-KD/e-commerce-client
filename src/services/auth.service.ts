import { post, get } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, AuthResponse, LoginPayload, SignupPayload } from "@/types";

export const authService = {
  login(payload: LoginPayload) {
    return post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, payload);
  },

  signup(payload: SignupPayload) {
    return post<ApiResponse>(API_ENDPOINTS.AUTH.SIGNUP, payload);
  },

  verifyEmail(token: string) {
    return get<ApiResponse>(API_ENDPOINTS.AUTH.VERIFY, { params: { token } });
  },
};
