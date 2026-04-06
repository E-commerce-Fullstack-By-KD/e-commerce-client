"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, EmptyState } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { formatPrice, formatDate } from "@/lib/utils";
import { orderService } from "@/services/order.service";
import type {
  BackendOrder,
  BackendOrderStatus,
  BackendPaymentStatus,
} from "@/types";

const statusVariant: Record<
  BackendOrderStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  PENDING: "warning",
  CONFIRMED: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "error",
};

function statusLabel(status: BackendOrderStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

const paymentVariant: Record<
  BackendPaymentStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "error",
  REFUNDED: "info",
};

function paymentLabel(status?: BackendPaymentStatus) {
  if (!status) return "Unknown";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await orderService.getAll();
        if (!mounted) return;
        setOrders(res.result?.orders ?? []);
      } catch (err: unknown) {
        if (!mounted) return;
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to load orders";
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [orders],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2].map((row) => (
            <div
              key={row}
              className="h-20 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : sortedOrders.length === 0 ? (
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
          {sortedOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-surface p-5 transition hover:shadow-md space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-text-muted">Order #{order.id}</p>
                  <p className="mt-1 font-semibold text-text-primary">{formatPrice(Number(order.total_amount))}</p>
                  <p className="text-sm text-text-secondary">
                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) > 1 ? "s" : ""} &middot;{" "}
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[order.status]}>
                    {statusLabel(order.status)}
                  </Badge>
                  {order.payment?.status && (
                    <Badge variant={paymentVariant[order.payment.status]}>
                      Payment: {paymentLabel(order.payment.status)}
                    </Badge>
                  )}
                </div>
              </div>

              {order.address && (
                <div className="rounded-lg border border-border bg-surface-secondary p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Customer / Shipping Details
                  </p>
                  <p className="mt-2 text-sm font-semibold text-text-primary">
                    {order.address.full_name || "N/A"}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {order.address.phone || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    {order.address.address_line_1 || ""}
                    {order.address.address_line_2
                      ? `, ${order.address.address_line_2}`
                      : ""}
                    {order.address.city ? `, ${order.address.city}` : ""}
                    {order.address.state ? `, ${order.address.state}` : ""}
                    {order.address.postal_code
                      ? ` ${order.address.postal_code}`
                      : ""}
                    {order.address.country ? `, ${order.address.country}` : ""}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Products
                </p>
                {order.items?.length ? (
                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const image = item.product?.image_url?.[0];
                      const unitPrice = Number(item.unit_price ?? 0);
                      const rowTotal = Number(item.total_price ?? unitPrice * item.quantity);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 overflow-hidden rounded-md bg-surface-secondary shrink-0">
                              {image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={image}
                                  alt={item.product?.name || "Product"}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              {item.product?.id ? (
                                <Link
                                  href={ROUTES.PRODUCT_DETAIL(item.product.id)}
                                  className="text-sm font-medium text-text-primary hover:text-primary-600 line-clamp-1"
                                >
                                  {item.product?.name || "Product"}
                                </Link>
                              ) : (
                                <p className="text-sm font-medium text-text-primary line-clamp-1">
                                  {item.product?.name || "Product"}
                                </p>
                              )}
                              <p className="text-xs text-text-muted">
                                Qty: {item.quantity} {unitPrice > 0 ? `· ${formatPrice(unitPrice)} each` : ""}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-text-primary shrink-0">
                            {formatPrice(rowTotal)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">No product lines available.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
