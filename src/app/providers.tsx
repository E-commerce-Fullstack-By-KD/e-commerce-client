"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/store/toast-context";
import { AuthProvider } from "@/store/auth-context";
import { CartProvider } from "@/store/cart-context";
import { ToastContainer } from "@/components/ui";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
