"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { cartService } from "@/services/cart.service";
import { useAuth } from "@/store/auth-context";
import { useToast } from "@/store/toast-context";
import type { CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  itemCount: number;       // total quantity across all rows
  total: number;           // sum of (offer_price × quantity)
  loading: boolean;
  adding: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (cartId: number, quantity: number) => Promise<void>;
  removeItem: (cartId: number) => Promise<void>;
  clearItems: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [items,   setItems]   = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding,  setAdding]  = useState(false);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total     = items.reduce((sum, i) => {
    // Use offer_price when valid (set + less than list_price), else list_price
    const p = i.product;
    const unitPrice =
      p?.offer_price != null && p.offer_price > 0 && p.offer_price < p.list_price
        ? p.offer_price
        : (p?.list_price ?? 0);
    return sum + unitPrice * i.quantity;
  }, 0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); return; }
    setLoading(true);
    try {
      const res = await cartService.getAll();
      setItems(res.result?.carts ?? []);
    } catch {
      // silently fail — not critical
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart whenever auth state changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      setAdding(true);
      try {
        await cartService.addItem(productId, quantity);
        showToast("Added to cart!", "success");
        await refresh();
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to add to cart";
        showToast(msg, "error");
        throw err;
      } finally {
        setAdding(false);
      }
    },
    [refresh, showToast],
  );

  const updateItem = useCallback(
    async (cartId: number, quantity: number) => {
      try {
        await cartService.updateItem(cartId, quantity);
        // Optimistic update in state
        setItems((prev) =>
          prev.map((i) => (i.id === cartId ? { ...i, quantity } : i)),
        );
      } catch {
        showToast("Failed to update cart", "error");
        await refresh(); // re-sync on failure
      }
    },
    [refresh, showToast],
  );

  const removeItem = useCallback(
    async (cartId: number) => {
      // Optimistic remove
      setItems((prev) => prev.filter((i) => i.id !== cartId));
      try {
        await cartService.removeItem(cartId);
      } catch {
        showToast("Failed to remove item", "error");
        await refresh(); // re-sync on failure
      }
    },
    [refresh, showToast],
  );

  const clearItems = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        loading,
        adding,
        refresh,
        addItem,
        updateItem,
        removeItem,
        clearItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
