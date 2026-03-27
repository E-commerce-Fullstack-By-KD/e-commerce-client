"use client";

import { useAuth } from "@/store/auth-context";
import { AuthForm } from "@/components/forms/AuthForm";

export default function SignupPage() {
  const { signup } = useAuth();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-text-primary">Create an account</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Sign up to start shopping with us.
      </p>
      <div className="mt-8">
        <AuthForm mode="signup" onSubmit={signup} />
      </div>
    </div>
  );
}
