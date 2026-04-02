"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart-context";
import { ROUTES } from "@/lib/constants";
import { formatPrice, getProductPrice } from "@/lib/utils";
import { CheckoutDrawer } from "@/components/checkout/CheckoutDrawer";
import type { CartItem } from "@/types";

/* ── Cart Row ── */
function CartRow({
  item,
  onQtyChange,
  onRemove,
}: {
  item: CartItem;
  onQtyChange: (cartId: number, qty: number) => void;
  onRemove: (cartId: number) => void;
}) {
  const p = item.product;
  const { displayPrice } = getProductPrice(p?.list_price ?? 0, p?.offer_price);
  const lineTotal = displayPrice * item.quantity;

  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm">
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-secondary sm:h-24 sm:w-24">
        {p?.image_url?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url[0]}
            alt={p.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <svg className="h-8 w-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={ROUTES.PRODUCT_DETAIL(p?.id ?? 0)}
              className="font-semibold text-text-primary hover:text-primary-600 transition-colors line-clamp-2"
            >
              {p?.name}
            </Link>
            {p?.collections?.length > 0 && (
              <p className="mt-0.5 text-xs text-text-muted">
                {p.collections.map((c) => c.name).join(", ")}
              </p>
            )}
          </div>

          {/* Remove */}
          <button
            onClick={() => onRemove(item.id)}
            className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Remove item"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between">
          {/* Qty stepper */}
          <div className="flex items-center overflow-hidden rounded-lg border border-border">
            <button
              onClick={() => onQtyChange(item.id, Math.max(1, item.quantity - 1))}
              className="flex h-8 w-8 items-center justify-center text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-semibold text-text-primary">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item.id, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-bold text-text-primary">{formatPrice(lineTotal)}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-text-muted">
                {formatPrice(displayPrice)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function CartSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-4 rounded-2xl border border-border bg-surface p-4 animate-pulse">
          <div className="h-24 w-24 shrink-0 rounded-xl bg-surface-secondary" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-2/3 rounded bg-surface-secondary" />
            <div className="h-3 w-1/3 rounded bg-surface-secondary" />
            <div className="h-8 w-28 rounded-lg bg-surface-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ── */
export default function CartPage() {
  const { items, loading, total, itemCount, updateItem, removeItem } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const subtotal  = total;
  const shipping  = subtotal >= 50 ? 0 : 9.99;
  const grandTotal = subtotal + shipping;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Shopping Cart</h1>
        {!loading && itemCount > 0 && (
          <p className="mt-1 text-text-secondary">
            {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <CartSkeleton />
          <div className="h-64 animate-pulse rounded-2xl bg-surface-secondary" />
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-secondary">
            <svg className="h-10 w-10 text-text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-semibold text-text-primary">Your cart is empty</p>
            <p className="mt-1 text-text-secondary">Browse our store and add items you love.</p>
          </div>
          <Link
            href={ROUTES.PRODUCTS}
            className="mt-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition hover:bg-primary-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Cart items */}
          <div className="space-y-3">
            {items.map((item) => (
              <CartRow
                key={item.id}
                item={item}
                onQtyChange={updateItem}
                onRemove={removeItem}
              />
            ))}

            <Link
              href={ROUTES.PRODUCTS}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="h-fit rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24">
            <h2 className="mb-5 text-lg font-bold text-text-primary">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
                <span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-text-secondary">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="font-medium text-emerald-600">Free</span>
                ) : (
                  <span className="font-medium text-text-primary">{formatPrice(shipping)}</span>
                )}
              </div>

              {shipping > 0 && (
                <p className="rounded-lg bg-surface-secondary px-3 py-2 text-xs text-text-secondary">
                  Add{" "}
                  <span className="font-semibold text-text-primary">
                    {formatPrice(50 - subtotal)}
                  </span>{" "}
                  more for free shipping
                </p>
              )}

              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-text-primary">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-6 w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition hover:bg-primary-700 active:scale-[.98]"
            >
              Proceed to Checkout →
            </button>

            {/* Trust */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-muted">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure checkout
            </div>
          </div>
        </div>
      )}

      {/* Checkout drawer */}
      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}
