import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types";

type BadgeVariant = "success" | "warning" | "danger" | "muted" | "info";

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantCls: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
  warning: "bg-amber-500/15  text-amber-400  ring-amber-500/20",
  danger:  "bg-red-500/15    text-red-400    ring-red-500/20",
  muted:   "bg-slate-500/15  text-slate-400  ring-slate-500/20",
  info:    "bg-blue-500/15   text-blue-400   ring-blue-500/20",
};

export function AdminBadge({ children, variant = "muted", className }: AdminBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        variantCls[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* Pre-baked product status badge */
const STATUS_MAP: Record<ProductStatus, BadgeVariant> = {
  ACTIVE:   "success",
  INACTIVE: "muted",
  DRAFT:    "warning",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <AdminBadge variant={STATUS_MAP[status]}>{status}</AdminBadge>;
}
