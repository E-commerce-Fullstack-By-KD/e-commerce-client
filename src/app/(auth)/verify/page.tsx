"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Button, Loader } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  console.log('token: ', token);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. Token may be expired.");
      });
  }, [token]);

  return (
    <div className="animate-fade-in text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader size="lg" />
          <p className="text-text-secondary">Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Email Verified!</h2>
          <p className="mt-2 text-text-secondary">{message}</p>
          <Link href={ROUTES.LOGIN} className="mt-6 inline-block">
            <Button>Continue to Login</Button>
          </Link>
        </div>
      )}

      {status === "error" && (
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Verification Failed</h2>
          <p className="mt-2 text-text-secondary">{message}</p>
          <Link href={ROUTES.LOGIN} className="mt-6 inline-block">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  console.log('Verify Loaded')
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader size="lg" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
