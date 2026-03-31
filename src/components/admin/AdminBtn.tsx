import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "danger" | "success";
type Size    = "sm" | "md";

interface AdminBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantCls: Record<Variant, string> = {
  primary: "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50",
  ghost:   "border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40",
  danger:  "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 disabled:opacity-40",
};

const sizeCls: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
};

export function AdminBtn({
  variant = "primary",
  size    = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: AdminBtnProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-medium transition-all",
        variantCls[variant],
        sizeCls[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
