"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { collectionService } from "@/services/collection.service";
import { formatPrice, getProductPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { AdminProduct, Collection } from "@/types";

/* ── Mini Product Card ── */
function MiniProductCard({ product }: { product: AdminProduct }) {
  const { displayPrice, originalPrice } = getProductPrice(
    product.list_price,
    product.offer_price,
  );
  return (
    <Link
      href={ROUTES.PRODUCT_DETAIL(product.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary-200"
    >
      <div className="aspect-[4/3] overflow-hidden bg-surface-secondary">
        {product.image_url?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            <svg className="h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-text-primary line-clamp-1 group-hover:text-primary-600 transition-colors">{product.name}</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-bold text-text-primary">{formatPrice(displayPrice)}</span>
          {originalPrice && (
            <span className="text-xs text-text-muted line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Collection Card ── */
function CollectionCard({ collection, count, onClick }: { collection: Collection; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary-300"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 transition-colors group-hover:bg-primary-200">
        <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="mt-4 font-semibold text-text-primary">{collection.name}</h3>
      <p className="mt-1 text-sm text-text-secondary">{count} product{count !== 1 ? "s" : ""}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary-600">
        Browse
        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

export default function HomePage() {
  const [products,    setProducts]    = useState<AdminProduct[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([productService.getAll(), collectionService.getAll()])
      .then(([prodRes, colRes]) => {
        setProducts(prodRes.result?.products?.filter((p) => !p.is_deleted && p.status === "ACTIVE") ?? []);
        setCollections(colRes.result?.collection ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Shop Smarter,
              <br />
              <span className="text-primary-200">Live Better</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
              Discover curated products at unbeatable prices. Free shipping on orders over $50.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href={ROUTES.PRODUCTS}
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition hover:bg-primary-50"
              >
                Shop Now
              </Link>
              <Link
                href={ROUTES.PRODUCTS}
                className="rounded-lg border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { title: "Free Shipping", desc: "On orders over $50", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" },
            { title: "Secure Payment", desc: "100% secure checkout", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
            { title: "24/7 Support", desc: "Dedicated customer service", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 text-center sm:flex-col">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                </svg>
              </div>
              <div className="sm:mt-2">
                <h3 className="font-semibold text-text-primary">{f.title}</h3>
                <p className="text-sm text-text-secondary">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      {(loading || collections.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Shop by Collection</h2>
              <p className="mt-1 text-text-secondary">Browse products by category</p>
            </div>
            <Link href={ROUTES.PRODUCTS} className="text-sm font-medium text-primary-600 hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-surface-secondary" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {collections.map((col) => {
                const count = products.filter((p) => p.collections?.some((c) => c.id === col.id)).length;
                return (
                  <CollectionCard
                    key={col.id}
                    collection={col}
                    count={count}
                    onClick={() => {
                      window.location.href = `${ROUTES.PRODUCTS}?collection=${col.id}`;
                    }}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Featured Products */}
      {(loading || featured.length > 0) && (
        <section className="bg-surface-secondary">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Featured Products</h2>
                <p className="mt-1 text-text-secondary">Hand-picked just for you</p>
              </div>
              <Link href={ROUTES.PRODUCTS} className="text-sm font-medium text-primary-600 hover:underline">
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-52 animate-pulse rounded-xl bg-surface" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featured.map((p) => <MiniProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Ready to start shopping?</h2>
          <p className="mt-3 text-text-secondary">Create an account today and get 10% off your first order.</p>
          <Link
            href={ROUTES.SIGNUP}
            className="mt-6 inline-block rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-700"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
