"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/store/toast-context";
import { AuthProvider } from "@/store/auth-context";
import { ToastContainer } from "@/components/ui";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  );
}
