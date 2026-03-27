"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  // Placeholder until backend product endpoints are ready
  const product = {
    id: Number(id),
    name: `Product ${id}`,
    description:
      "This is a premium quality product crafted with care. Designed for durability and style, it's the perfect addition to your collection. Features include high-quality materials, modern design, and excellent value for money.",
    price: 99.99,
    category: "Electronics",
    stock: 25,
    image: "",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-xl bg-surface-tertiary">
          <div className="flex h-full items-center justify-center text-text-muted">
            <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Details */}
        <div>
          <Badge variant="info">{product.category}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-text-primary">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-primary-600">{formatPrice(product.price)}</p>

          <p className="mt-4 leading-relaxed text-text-secondary">{product.description}</p>

          <div className="mt-6">
            <p className="text-sm text-text-secondary">
              Availability:{" "}
              <span className={product.stock > 0 ? "text-success font-medium" : "text-error font-medium"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </p>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-text-secondary hover:text-text-primary"
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-2 text-text-secondary hover:text-text-primary"
              >
                +
              </button>
            </div>
            <Button size="lg" disabled={product.stock === 0}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
