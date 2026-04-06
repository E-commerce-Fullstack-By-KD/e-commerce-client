import { post } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, VerifyPaymentPayload } from "@/types";

export const paymentService = {
  verify(payload: VerifyPaymentPayload) {
    return post<ApiResponse>(API_ENDPOINTS.PAYMENTS.VERIFY, payload);
  },
};
