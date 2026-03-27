"use client";

import { Badge, EmptyState } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { formatPrice, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const statusVariant: Record<OrderStatus, "default" | "info" | "warning" | "success" | "error"> = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
};

export default function OrdersPage() {
  // Placeholder until orders backend is ready
  const orders: { id: number; total: number; status: OrderStatus; createdAt: string; itemCount: number }[] = [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No orders yet"
            description="When you place an order, it will appear here."
            actionLabel="Start Shopping"
            onAction={() => (window.location.href = ROUTES.PRODUCTS)}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-surface p-5 transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Order #{order.id}</p>
                  <p className="mt-1 font-semibold text-text-primary">{formatPrice(order.total)}</p>
                  <p className="text-sm text-text-secondary">
                    {order.itemCount} item{order.itemCount > 1 ? "s" : ""} &middot;{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <Badge variant={statusVariant[order.status]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
