"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { isValidEmail } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

type SubmitData = { email: string; password: string; name?: string };

interface AuthFormProps {
  mode: "login" | "signup";
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: SubmitData) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (mode === "signup" && !name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        email: email.trim().toLowerCase(),
        password,
        ...(mode === "signup" && { name: name.trim() }),
      });
      
    } catch {
      // Error is handled by the caller (auth context / toast)
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isLogin && (
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
      )}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Min. 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <Button type="submit" fullWidth loading={loading}>
        {isLogin ? "Log in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link
          href={isLogin ? ROUTES.SIGNUP : ROUTES.LOGIN}
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
