"use client";

import type { Metadata } from "next";
import { useAuth } from "@/store/auth-context";
import { AuthForm } from "@/components/forms/AuthForm";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Log in to your account to continue shopping.
      </p>
      <div className="mt-8">
        <AuthForm mode="login" onSubmit={login} />
      </div>
    </div>
  );
}
