"use client";

import { useState, useEffect, useCallback } from "react";
import { addressService } from "@/services/address.service";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { config } from "@/config";
import { useCart } from "@/store/cart-context";
import { useToast } from "@/store/toast-context";
import { formatPrice, getProductPrice } from "@/lib/utils";
import type { Address, AddressPayload } from "@/types";

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOpenInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayOpenInstance;
  }
}

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ─────────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────────── */
const EMPTY_FORM: AddressPayload = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  is_default: false,
};

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-text-secondary">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 transition-colors"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Address Form (add / edit)
───────────────────────────────────────────── */
function AddressForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: AddressPayload;
  onSave: (data: AddressPayload) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<AddressPayload>(initial);
  const set = (k: keyof AddressPayload) => (v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const valid =
    form.full_name.trim() &&
    form.phone.trim() &&
    form.address_line_1.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.country.trim() &&
    form.postal_code.trim();

  return (
    <div className="rounded-2xl border border-border bg-surface-secondary p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Full Name"
          required
          value={form.full_name}
          onChange={set("full_name")}
          placeholder="John Doe"
        />
        <Field
          label="Phone"
          required
          value={form.phone}
          onChange={set("phone")}
          placeholder="+1 555 000 0000"
          type="tel"
        />
      </div>

      <Field
        label="Address Line 1"
        required
        value={form.address_line_1}
        onChange={set("address_line_1")}
        placeholder="123 Main Street"
      />
      <Field
        label="Address Line 2"
        value={form.address_line_2 ?? ""}
        onChange={set("address_line_2")}
        placeholder="Apt, suite, floor (optional)"
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="City"
          required
          value={form.city}
          onChange={set("city")}
          placeholder="New York"
        />
        <Field
          label="State / Province"
          required
          value={form.state}
          onChange={set("state")}
          placeholder="NY"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Country"
          required
          value={form.country}
          onChange={set("country")}
          placeholder="United States"
        />
        <Field
          label="Postal Code"
          required
          value={form.postal_code}
          onChange={set("postal_code")}
          placeholder="10001"
        />
      </div>

      {/* Set as default */}
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={!!form.is_default}
          onChange={(e) => set("is_default")(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary-600"
        />
        Set as default delivery address
      </label>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={!valid || saving}
          className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 active:scale-[.98] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Address"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Address Card (selectable)
───────────────────────────────────────────── */
function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  deleting,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl border p-4 transition-all ${
        selected
          ? "border-primary-500 bg-primary-50 ring-1 ring-primary-400/40"
          : "border-border bg-surface hover:border-primary-300 hover:bg-surface-secondary"
      }`}
    >
      {/* Radio dot */}
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${selected ? "border-primary-600" : "border-border"}`}
        >
          {selected && <div className="h-2 w-2 rounded-full bg-primary-600" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-text-primary text-sm">
              {address.full_name}
            </p>
            {address.is_default && (
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-600">
                Default
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-text-secondary">{address.phone}</p>
          <p className="mt-1 text-sm text-text-secondary leading-relaxed">
            {address.address_line_1}
            {address.address_line_2 ? `, ${address.address_line_2}` : ""}
            <br />
            {address.city}, {address.state} {address.postal_code}
            <br />
            {address.country}
          </p>
        </div>

        {/* Edit / Delete */}
        <div
          className="flex shrink-0 gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-secondary hover:text-primary-600"
            title="Edit"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
            title="Delete"
          >
            {deleting ? (
              <svg
                className="h-3.5 w-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main CheckoutDrawer
───────────────────────────────────────────── */
interface CheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
}

type Step = "address" | "review";
type FormMode = "add" | "edit" | null;

export function CheckoutDrawer({ open, onClose }: CheckoutDrawerProps) {
  const { items, total, itemCount, clearItems } = useCart();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);

  // Shipping calc
  const subtotal = total;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const grandTotal = subtotal + shipping;

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("address");
      setFormMode(null);
      setEditTarget(null);
    }
  }, [open]);

  const fetchAddresses = useCallback(async () => {
    setLoadingAddress(true);
    try {
      const res = await addressService.getAll();
      const list = res.result?.addresses ?? [];
      setAddresses(list);
      // Auto-select default address
      const def = list.find((a) => a.is_default) ?? list[0];
      if (def) setSelectedId(def.id);
    } catch {
      showToast("Could not load addresses", "error");
    } finally {
      setLoadingAddress(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (open) fetchAddresses();
  }, [open, fetchAddresses]);

  /* ── Save address (create or update) ── */
  const handleSaveAddress = async (data: AddressPayload) => {
    setSaving(true);
    try {
      if (formMode === "edit" && editTarget) {
        const res = await addressService.update(editTarget.id, data);
        showToast("Address updated!", "success");
        const updated = res.result?.address;
        if (updated) setSelectedId(updated.id);
      } else {
        const res = await addressService.create(data);
        showToast("Address saved!", "success");
        const created = res.result?.address;
        if (created) setSelectedId(created.id);
      }
      setFormMode(null);
      setEditTarget(null);
      await fetchAddresses();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save address";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete address ── */
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await addressService.remove(id);
      showToast("Address removed", "success");
      if (selectedId === id) setSelectedId(null);
      await fetchAddresses();
    } catch {
      showToast("Failed to delete address", "error");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Place order and complete Razorpay payment ── */
  const handlePlaceOrder = async () => {
    if (!selectedId) {
      showToast("Please select a delivery address", "error");
      return;
    }

    if (!items.length) {
      showToast("Your cart is empty", "error");
      return;
    }

    setPlacing(true);
    try {
      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady || !window.Razorpay) {
        throw new Error("Unable to load payment gateway");
      }

      const cartIds = items.map((item) => item.id);
      const createOrderRes = await orderService.create(selectedId, cartIds);
      const createdOrder = createOrderRes.result?.order;

      if (!createdOrder) {
        throw new Error("Order creation failed");
      }

      const checkoutKey = createdOrder.razorpay_key_id || config.razorpayKeyId;
      if (!checkoutKey) {
        throw new Error("Razorpay key is not configured");
      }

      await new Promise<void>((resolve, reject) => {
        const razorpay = new window.Razorpay!({
          key: checkoutKey,
          amount: Math.round(Number(createdOrder.total_amount) * 100),
          currency: "INR",
          name: config.appName,
          description: `Order #${createdOrder.id}`,
          order_id: createdOrder.razorpay_order_id,
          handler: async (response: RazorpaySuccessResponse) => {
            try {
              await paymentService.verify({
                order_id: createdOrder.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled by user")),
          },
        });

        razorpay.on("payment.failed", () => {
          reject(new Error("Payment failed. Please try again."));
        });

        razorpay.open();
      });

      showToast("Order placed successfully! 🎉", "success");
      clearItems();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err as { message?: string })?.message ??
        "Failed to place order. Please try again.";
      showToast(msg, "error");
    } finally {
      setPlacing(false);
    }
  };

  if (!open) return null;

  const selectedAddress = addresses.find((a) => a.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative ml-auto flex h-full w-full max-w-lg flex-col bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Checkout</h2>
            <p className="text-xs text-text-muted">
              {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
              {formatPrice(grandTotal)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex border-b border-border">
          {(["address", "review"] as Step[]).map((s, i) => (
            <button
              key={s}
              onClick={() => {
                if (s === "review" && !selectedId) {
                  showToast("Select a delivery address first", "error");
                  return;
                }
                setStep(s);
              }}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                step === s
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  step === s
                    ? "bg-primary-600 text-white"
                    : "bg-surface-secondary text-text-muted"
                }`}
              >
                {i + 1}
              </span>
              {s === "address" ? "Delivery" : "Review"}
            </button>
          ))}
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* ── STEP 1: Address ── */}
          {step === "address" && (
            <div className="space-y-4 p-6">
              {loadingAddress ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-28 animate-pulse rounded-2xl bg-surface-secondary"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {/* Saved addresses */}
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      selected={selectedId === addr.id}
                      onSelect={() => {
                        setSelectedId(addr.id);
                        setFormMode(null);
                      }}
                      onEdit={() => {
                        setFormMode("edit");
                        setEditTarget(addr);
                        setSelectedId(addr.id);
                      }}
                      onDelete={() => handleDelete(addr.id)}
                      deleting={deletingId === addr.id}
                    />
                  ))}

                  {/* Inline form */}
                  {formMode !== null && (
                    <AddressForm
                      initial={
                        formMode === "edit" && editTarget
                          ? {
                              ...editTarget,
                              address_line_2: editTarget.address_line_2 ?? "",
                            }
                          : EMPTY_FORM
                      }
                      onSave={handleSaveAddress}
                      onCancel={() => {
                        setFormMode(null);
                        setEditTarget(null);
                      }}
                      saving={saving}
                    />
                  )}

                  {/* Add address button */}
                  {formMode === null && (
                    <button
                      onClick={() => {
                        setFormMode("add");
                        setEditTarget(null);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-medium text-text-muted transition-colors hover:border-primary-400 hover:text-primary-600"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add new address
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── STEP 2: Review ── */}
          {step === "review" && (
            <div className="space-y-5 p-6">
              {/* Selected address recap */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">
                    Delivering to
                  </h3>
                  <button
                    onClick={() => setStep("address")}
                    className="text-xs font-medium text-primary-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
                {selectedAddress && (
                  <div className="rounded-2xl border border-border bg-surface-secondary p-4 text-sm text-text-secondary leading-relaxed">
                    <p className="font-semibold text-text-primary">
                      {selectedAddress.full_name}
                    </p>
                    <p>{selectedAddress.phone}</p>
                    <p className="mt-1">
                      {selectedAddress.address_line_1}
                      {selectedAddress.address_line_2
                        ? `, ${selectedAddress.address_line_2}`
                        : ""}
                    </p>
                    <p>
                      {selectedAddress.city}, {selectedAddress.state}{" "}
                      {selectedAddress.postal_code}
                    </p>
                    <p>{selectedAddress.country}</p>
                  </div>
                )}
              </div>

              {/* Order items */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  Your items ({itemCount})
                </h3>
                <div className="space-y-2">
                  {items.map((item) => {
                    const { displayPrice } = getProductPrice(
                      item.product?.list_price ?? 0,
                      item.product?.offer_price,
                    );
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-secondary">
                          {item.product?.image_url?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.image_url[0]}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-text-muted">
                              <svg
                                className="h-5 w-5 opacity-30"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary line-clamp-1">
                            {item.product?.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-text-primary">
                          {formatPrice(displayPrice * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-2xl bg-surface-secondary p-4 space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-medium text-text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-emerald-600">Free</span>
                  ) : (
                    <span className="font-medium text-text-primary">
                      {formatPrice(shipping)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-bold text-text-primary">
                  <span>Total</span>
                  <span className="text-primary-600">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-surface p-5">
          {step === "address" ? (
            <button
              onClick={() => {
                if (!selectedId) {
                  showToast("Please select a delivery address", "error");
                  return;
                }
                setStep("review");
              }}
              disabled={!selectedId}
              className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition-all hover:bg-primary-700 active:scale-[.98] disabled:opacity-50"
            >
              Continue to Review →
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition-all hover:bg-primary-700 active:scale-[.98] disabled:opacity-70"
            >
              {placing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Placing order…
                </span>
              ) : (
                `Place Order · ${formatPrice(grandTotal)}`
              )}
            </button>
          )}
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-muted">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Secure & encrypted checkout
          </p>
        </div>
      </div>
    </div>
  );
}
