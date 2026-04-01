"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { formatPrice, getProductPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useAuthGate } from "@/hooks";
import { useCart } from "@/store/cart-context";
import { AuthGateModal } from "@/components/ui";
import type { AdminProduct } from "@/types";

/* ── Image Gallery ── */
function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-surface-secondary text-text-muted">
        <svg
          className="h-24 w-24 opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-square overflow-hidden rounded-2xl bg-surface-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                i === active
                  ? "border-primary-600"
                  : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square rounded-2xl bg-surface-secondary" />
        <div className="space-y-4">
          <div className="h-4 w-32 rounded bg-surface-secondary" />
          <div className="h-8 w-3/4 rounded bg-surface-secondary" />
          <div className="h-6 w-24 rounded bg-surface-secondary" />
          <div className="space-y-2">
            <div className="h-3 rounded bg-surface-secondary" />
            <div className="h-3 rounded bg-surface-secondary" />
            <div className="h-3 w-2/3 rounded bg-surface-secondary" />
          </div>
          <div className="h-12 w-full rounded-xl bg-surface-secondary" />
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { requireAuth, authGateOpen, closeAuthGate } = useAuthGate();
  const { addItem, adding } = useCart();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productService
      .getById(id)
      .then((res) => {
        const p = res.result?.product;
        if (!p || p.is_deleted || p.status !== "ACTIVE") setNotFound(true);
        else setProduct(p);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!requireAuth()) return;
    if (!product) return;
    await addItem(product.id, quantity);
  };

  const handleWishlist = () => {
    if (!requireAuth()) return;
    // TODO: wire to wishlist service
  };

  if (loading) return <Skeleton />;

  if (notFound || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <p className="text-5xl font-bold text-text-muted">404</p>
        <p className="text-xl font-semibold text-text-primary">
          Product not found
        </p>
        <p className="text-text-secondary">
          This product may no longer be available.
        </p>
        <Link
          href={ROUTES.PRODUCTS}
          className="mt-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const { displayPrice, originalPrice, discountPct, hasDiscount } =
    getProductPrice(product.list_price, product.offer_price);
  const inStock  = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-text-secondary">
          <Link
            href={ROUTES.HOME}
            className="hover:text-text-primary transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href={ROUTES.PRODUCTS}
            className="hover:text-text-primary transition-colors"
          >
            Products
          </Link>
          {product.collections?.[0] && (
            <>
              <span>/</span>
              <span>{product.collections[0].name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-text-primary font-medium truncate max-w-40">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image gallery */}
          <ImageGallery images={product.image_url ?? []} name={product.name} />

          {/* Product info */}
          <div className="flex flex-col gap-5">
            {/* Collections */}
            {product.collections?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.collections.map((c) => (
                  <Link
                    key={c.id}
                    href={`${ROUTES.PRODUCTS}?collection=${c.id}`}
                    className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-100 transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Name + SKU */}
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                {product.name}
              </h1>
              <p className="mt-1 font-mono text-xs text-text-muted">
                SKU: {product.sku}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-text-primary">
                {formatPrice(displayPrice)}
              </span>
              {originalPrice && (
                <>
                  <span className="text-lg text-text-muted line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">
                      -{discountPct}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Stock status */}
            <div
              className={`flex items-center gap-1.5 text-sm font-medium ${
                !inStock
                  ? "text-red-500"
                  : lowStock
                    ? "text-amber-500"
                    : "text-emerald-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${!inStock ? "bg-red-500" : lowStock ? "bg-amber-500" : "bg-emerald-500"}`}
              />
              {!inStock
                ? "Out of stock"
                : lowStock
                  ? `Only ${product.stock} left`
                  : "In stock"}
            </div>

            {/* Description */}
            {product.description && (
              <p className="border-t border-border pt-4 leading-relaxed text-text-secondary">
                {product.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-border pt-4">
              {inStock ? (
                <>
                  <div className="flex items-center gap-3">
                    {/* Quantity picker */}
                    <div className="flex items-center overflow-hidden rounded-xl border border-border">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="flex h-11 w-11 items-center justify-center text-lg text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-sm font-semibold text-text-primary">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity((q) => Math.min(product.stock, q + 1))
                        }
                        className="flex h-11 w-11 items-center justify-center text-lg text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition-all hover:bg-primary-700 active:scale-[.98] disabled:opacity-70"
                    >
                      {adding ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Adding…
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>

                  {/* Wishlist */}
                  <button
                    onClick={handleWishlist}
                    className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Save to Wishlist
                  </button>
                </>
              ) : (
                <div className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-center text-sm text-text-secondary">
                  This product is currently out of stock.
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="rounded-xl bg-surface-secondary p-4 text-xs text-text-secondary space-y-2">
              {[
                ["Free shipping", "on orders over $50"],
                ["Easy returns", "30-day hassle-free returns"],
                ["Secure checkout", "Your payment info is safe"],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-2">
                  <span className="w-28 font-medium text-text-primary shrink-0">
                    {title}
                  </span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auth gate modal — shown when guest clicks a protected action */}
      <AuthGateModal
        open={authGateOpen}
        onClose={closeAuthGate}
        message="Sign in to add items to your cart and track your orders."
        redirectTo={pathname}
      />
    </>
  );
}
