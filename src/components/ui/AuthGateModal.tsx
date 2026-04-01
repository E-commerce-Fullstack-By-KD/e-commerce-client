"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

interface AuthGateModalProps {
  open: boolean;
  onClose: () => void;
  /** Message shown below the title, defaults to cart copy */
  message?: string;
  /** Current page path so login/signup can redirect back */
  redirectTo?: string;
}

export function AuthGateModal({
  open,
  onClose,
  message = "Sign in to add items to your cart and place orders.",
  redirectTo,
}: AuthGateModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const loginHref  = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}`  : "/login";
  const signupHref = redirectTo ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : "/signup";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="px-8 py-8 text-center">
          {/* Logo mark */}
          <div className="mx-auto mb-5 flex items-center justify-center">
            <Logo variant="full" size={36} linked={false} />
          </div>

          <h2 className="text-xl font-bold text-text-primary">Sign in to continue</h2>
          <p className="mt-2 text-sm text-text-secondary">{message}</p>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={loginHref}
              className="block w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary-600/25 transition hover:bg-primary-700 active:scale-[.98]"
            >
              Sign In
            </Link>
            <Link
              href={signupHref}
              className="block w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-secondary active:scale-[.98]"
            >
              Create Account — it&apos;s free
            </Link>
          </div>

          <p className="mt-5 text-xs text-text-muted">
            You can continue browsing without an account.
          </p>
        </div>

        {/* Bottom accent */}
        <div className="h-1 w-full bg-linear-to-r from-primary-400 via-primary-600 to-primary-400" />
      </div>
    </div>
  );
}
