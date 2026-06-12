import { post } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiResponse,
  PaymentCreateResult,
  VerifyPaymentPayload,
} from "@/types";

export const paymentService = {
  verify(payload: VerifyPaymentPayload) {
    return post<ApiResponse>(API_ENDPOINTS.PAYMENTS.VERIFY, payload);
  },

  createOrder(orderId: number | string) {
    return post<ApiResponse<PaymentCreateResult>>(
      API_ENDPOINTS.PAYMENTS.ORDER_CREATE(orderId),
    );
  },
};
