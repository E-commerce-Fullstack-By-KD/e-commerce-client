"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { productService } from "@/services/product.service";
import { collectionService } from "@/services/collection.service";
import { formatPrice, getProductPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { AdminProduct, Collection } from "@/types";

/* ── Product Card ── */
function ProductCard({ product }: { product: AdminProduct }) {
  const { displayPrice, originalPrice, discountPct, hasDiscount } =
    getProductPrice(product.list_price, product.offer_price);

  return (
    <Link
      href={ROUTES.PRODUCT_DETAIL(product.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 hover:border-primary-300"
    >
      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-surface-secondary">
        {product.image_url?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            <svg
              className="h-12 w-12 opacity-30"
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
        )}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            -{discountPct}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Collections */}
        {product.collections?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.collections.slice(0, 2).map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-600"
              >
                {c.name}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-semibold text-text-primary line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-text-secondary line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-text-primary">
            {formatPrice(displayPrice)}
          </span>
          {originalPrice && (
            <span className="text-sm text-text-muted line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface animate-pulse">
      <div className="aspect-4/3 bg-surface-secondary" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded bg-surface-secondary" />
        <div className="h-4 w-3/4 rounded bg-surface-secondary" />
        <div className="h-3 w-full rounded bg-surface-secondary" />
        <div className="h-5 w-24 rounded bg-surface-secondary" />
      </div>
    </div>
  );
}

/* ── Main Page ── */
function ProductsPageInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCol, setActiveCol] = useState<number | null>(() => {
    const c = searchParams.get("collection");
    return c ? Number(c) : null;
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, colRes] = await Promise.all([
          productService.getAll(),
          collectionService.getAll(),
        ]);
        setProducts(
          prodRes.result?.products?.filter(
            (p) => !p.is_deleted && p.status === "ACTIVE",
          ) ?? [],
        );
        setCollections(colRes.result?.collection ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = products;

    if (activeCol !== null) {
      list = list.filter((p) => p.collections?.some((c) => c.id === activeCol));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.collections?.some((c) => c.name.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [products, activeCol, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Shop All Products
        </h1>
        <p className="mt-1 text-text-secondary">
          {loading
            ? "Loading…"
            : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — collections filter */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Collections
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveCol(null)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeCol === null
                  ? "bg-primary-600 text-white"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              }`}
            >
              All Products
              <span
                className={`ml-1.5 text-xs ${activeCol === null ? "text-primary-200" : "text-text-muted"}`}
              >
                ({products.length})
              </span>
            </button>
            {collections.map((col) => {
              const count = products.filter((p) =>
                p.collections?.some((c) => c.id === col.id),
              ).length;
              return (
                <button
                  key={col.id}
                  onClick={() => setActiveCol(col.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    activeCol === col.id
                      ? "bg-primary-600 text-white"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  }`}
                >
                  {col.name}
                  <span
                    className={`ml-1.5 text-xs ${activeCol === col.id ? "text-primary-200" : "text-text-muted"}`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search + mobile collection pills */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
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
              )}
            </div>

            {/* Mobile collection pills */}
            {collections.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                <button
                  onClick={() => setActiveCol(null)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCol === null
                      ? "bg-primary-600 text-white"
                      : "border border-border text-text-secondary"
                  }`}
                >
                  All
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setActiveCol(col.id)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeCol === col.id
                        ? "bg-primary-600 text-white"
                        : "border border-border text-text-secondary"
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active collection heading */}
          {activeCol !== null && (
            <div className="mb-5 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary">
                {collections.find((c) => c.id === activeCol)?.name}
              </h2>
              <button
                onClick={() => setActiveCol(null)}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Clear ×
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <svg
                className="h-14 w-14 text-text-muted opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-lg font-semibold text-text-primary">
                No products found
              </p>
              <p className="text-sm text-text-secondary">
                {search
                  ? "Try a different search term."
                  : "No products in this collection yet."}
              </p>
              {(search || activeCol !== null) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCol(null);
                  }}
                  className="mt-1 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  );
}
