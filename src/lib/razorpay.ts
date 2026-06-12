"use client";

import { config } from "@/config";

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOpenInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayCheckoutOptions,
    ) => RazorpayOpenInstance;
  }
}

export async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface OpenCheckoutArgs {
  orderId: number;
  razorpayOrderId: string;
  amount: number;
  currency?: string;
  key?: string;
  description?: string;
  onSuccess: (response: RazorpaySuccessResponse) => Promise<void>;
}

export async function openRazorpayCheckout({
  orderId,
  razorpayOrderId,
  amount,
  currency = "INR",
  key,
  description,
  onSuccess,
}: OpenCheckoutArgs): Promise<void> {
  const razorpayReady = await loadRazorpayScript();

  if (!razorpayReady || !window.Razorpay) {
    throw new Error("Unable to load payment gateway");
  }

  const RazorpayCtor = window.Razorpay;
  if (!RazorpayCtor) {
    throw new Error("Unable to load payment gateway");
  }

  const checkoutKey = key || config.razorpayKeyId;
  if (!checkoutKey) {
    throw new Error("Razorpay key is not configured");
  }

  await new Promise<void>((resolve, reject) => {
    const razorpay = new RazorpayCtor({
      key: checkoutKey,
      amount: Math.round(Number(amount) * 100),
      currency,
      name: config.appName,
      description: description ?? `Order #${orderId}`,
      order_id: razorpayOrderId,
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          await onSuccess(response);
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled by user")),
      },
    });

    razorpay.on("payment.failed", () => {
      reject(new Error("Payment failed. Please try again."));
    });

    razorpay.open();
  });
}
