"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/store/auth-context";

/**
 * Gate protected actions behind authentication.
 *
 * Usage:
 *   const { requireAuth, AuthGateOpen, closeAuthGate } = useAuthGate();
 *
 *   // In a click handler:
 *   if (!requireAuth()) return;   // opens modal automatically, stops execution
 *   // ... proceed with the protected action
 */
export function useAuthGate() {
  const { isAuthenticated } = useAuth();
  const [authGateOpen, setAuthGateOpen] = useState(false);

  /**
   * Returns true if user is authenticated.
   * Returns false AND opens the auth gate modal if they are not.
   */
  const requireAuth = useCallback((): boolean => {
    if (isAuthenticated) return true;
    setAuthGateOpen(true);
    return false;
  }, [isAuthenticated]);

  const closeAuthGate = useCallback(() => setAuthGateOpen(false), []);

  return { requireAuth, authGateOpen, closeAuthGate };
}
