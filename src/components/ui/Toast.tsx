"use client";

import { useToast } from "@/store/toast-context";
import { cn } from "@/lib/utils";

const typeStyles = {
  success: "bg-green-50 border-green-400 text-green-800",
  error: "bg-red-50 border-red-400 text-red-800",
  warning: "bg-amber-50 border-amber-400 text-amber-800",
  info: "bg-blue-50 border-blue-400 text-blue-800",
};

const icons = {
  success: "\u2713",
  error: "\u2717",
  warning: "!",
  info: "i",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-slide-down min-w-[300px]",
            typeStyles[toast.type]
          )}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10 text-xs font-bold">
            {icons[toast.type]}
          </span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-current opacity-50 hover:opacity-100"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
