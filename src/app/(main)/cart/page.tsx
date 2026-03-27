"use client";

import Link from "next/link";
import { Button, EmptyState } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  // Placeholder until cart backend is ready
  const cartItems: { id: number; name: string; price: number; quantity: number }[] = [];

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you haven't added anything yet."
            actionLabel="Start Shopping"
            onAction={() => (window.location.href = ROUTES.PRODUCTS)}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-surface-tertiary" />
                <div>
                  <h3 className="font-medium text-text-primary">{item.name}</h3>
                  <p className="text-sm text-text-secondary">{formatPrice(item.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary">Qty: {item.quantity}</span>
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 rounded-xl border border-border bg-surface-secondary p-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-text-primary">Total</span>
              <span className="text-xl font-bold text-primary-600">{formatPrice(total)}</span>
            </div>
            <Button fullWidth className="mt-4" size="lg">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
