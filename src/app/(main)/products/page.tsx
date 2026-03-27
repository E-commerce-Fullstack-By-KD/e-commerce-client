"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, EmptyState } from "@/components/ui";
import { useDebounce } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

// Placeholder products until backend is ready
const PLACEHOLDER_PRODUCTS: Product[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  description: "A high-quality product you'll love.",
  price: Math.floor(Math.random() * 200) + 20,
  image: "",
  category: ["Electronics", "Clothing", "Home", "Sports"][i % 4],
  stock: Math.floor(Math.random() * 50) + 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const products = PLACEHOLDER_PRODUCTS;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary">{filtered.length} products found</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search to find what you're looking for."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={ROUTES.PRODUCT_DETAIL(product.id)}
              className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:shadow-lg"
            >
              <div className="aspect-square bg-surface-tertiary">
                <div className="flex h-full items-center justify-center text-text-muted">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-primary-600">
                  {product.category}
                </p>
                <h3 className="mt-1 font-semibold text-text-primary group-hover:text-primary-600">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                  {product.description}
                </p>
                <p className="mt-3 text-lg font-bold text-text-primary">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
