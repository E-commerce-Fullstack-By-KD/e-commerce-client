"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post, patch, del } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/store/toast-context";
import { formatPrice } from "@/lib/utils";
import type { AdminProduct, CreateProductPayload, ProductStatus } from "@/types";

/* ── Inline helpers ── */
function AdminInput({ label, value, onChange, type = "text", placeholder, disabled }: {
  label?: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50"
      />
    </div>
  );
}

function AdminSelect({ label, value, onChange, options }: {
  label?: string; value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#16181f] px-3 py-2 text-sm text-white focus:border-orange-500/50 focus:outline-none"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function AdminBtn({ children, onClick, variant = "primary", disabled, loading, type = "button" }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "ghost" | "danger"; disabled?: boolean;
  loading?: boolean; type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50",
    ghost:   "border border-white/10 text-slate-300 hover:bg-white/5",
    danger:  "bg-red-500/10 text-red-400 hover:bg-red-500/20",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${styles[variant]}`}>
      {loading && <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>}
      {children}
    </button>
  );
}

const STATUS_BADGE: Record<ProductStatus, string> = {
  ACTIVE:   "bg-emerald-500/15 text-emerald-400",
  INACTIVE: "bg-slate-500/15 text-slate-400",
  DRAFT:    "bg-amber-500/15 text-amber-400",
};

const EMPTY_FORM: CreateProductPayload = {
  name: "", sku: "", list_price: 0, offer_price: 0, stock: 0, status: "DRAFT",
};

/* ── Main Page ── */
export default function AdminProductsPage() {
  const { showToast } = useToast();

  const [products, setProducts]   = useState<AdminProduct[]>([]);
  const [fetching, setFetching]   = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);

  const [form, setForm]           = useState<CreateProductPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const f = (key: keyof CreateProductPayload) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: key.includes("price") || key === "stock" ? Number(v) : v }));

  /* fetch */
  const fetchProducts = useCallback(async () => {
    setFetching(true);
    try {
      const res = await get<{ result?: { products?: AdminProduct[] } }>(API_ENDPOINTS.ADMIN.PRODUCT.LIST);
      setProducts(res.result?.products ?? []);
    } catch {
      // Backend product endpoints not yet available — show empty state gracefully
      setProducts([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* open create */
  const openCreate = () => { setForm(EMPTY_FORM); setEditProduct(null); setShowForm(true); };

  /* open edit */
  const openEdit = (p: AdminProduct) => {
    setForm({
      name: p.name, sku: p.sku,
      list_price: p.list_price, offer_price: p.offer_price,
      stock: p.stock, status: p.status,
    });
    setEditProduct(p);
    setShowForm(true);
  };

  /* submit */
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.sku.trim()) { showToast("Name and SKU are required", "error"); return; }
    setSubmitting(true);
    try {
      if (editProduct) {
        await patch(API_ENDPOINTS.ADMIN.PRODUCT.UPDATE(editProduct.id), form);
        showToast("Product updated!", "success");
      } else {
        await post(API_ENDPOINTS.ADMIN.PRODUCT.CREATE, form);
        showToast("Product created!", "success");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Operation failed";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* delete */
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await del(API_ENDPOINTS.ADMIN.PRODUCT.DELETE(id));
      showToast("Product deleted!", "success");
      fetchProducts();
    } catch { showToast("Failed to delete", "error"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Products</h2>
          <p className="text-xs text-slate-400">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <AdminBtn onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Product
        </AdminBtn>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="rounded-xl border border-orange-500/20 bg-[#16181f] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-white">
              {editProduct ? "Edit Product" : "Create Product"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput label="Product Name *" value={form.name}    onChange={f("name")}        placeholder="iPhone 15 Pro" />
            <AdminInput label="SKU *"          value={form.sku}     onChange={f("sku")}         placeholder="IPH-15-PRO-128" />
            <AdminInput label="List Price"     value={form.list_price}  onChange={f("list_price")}  type="number" placeholder="0.00" />
            <AdminInput label="Offer Price"    value={form.offer_price} onChange={f("offer_price")} type="number" placeholder="0.00" />
            <AdminInput label="Stock"          value={form.stock}   onChange={f("stock")}       type="number" placeholder="0" />
            <AdminSelect
              label="Status"
              value={form.status}
              onChange={f("status")}
              options={[
                { label: "Draft",    value: "DRAFT"    },
                { label: "Active",   value: "ACTIVE"   },
                { label: "Inactive", value: "INACTIVE" },
              ]}
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <AdminBtn variant="ghost" onClick={() => setShowForm(false)}>Cancel</AdminBtn>
            <AdminBtn onClick={handleSubmit} loading={submitting}>
              {editProduct ? "Save Changes" : "Create Product"}
            </AdminBtn>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-[#16181f] overflow-hidden">
        {fetching ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-500">
            <svg className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm">No products yet. Create your first one.</p>
            <button onClick={openCreate} className="mt-1 text-xs text-orange-400 hover:underline">
              + New Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">List Price</th>
                  <th className="px-5 py-3">Offer Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p, i) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-white">{p.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{p.sku}</td>
                    <td className="px-5 py-3 text-slate-300">{formatPrice(p.list_price)}</td>
                    <td className="px-5 py-3 font-semibold text-orange-400">{formatPrice(p.offer_price)}</td>
                    <td className="px-5 py-3 text-slate-300">{p.stock}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <AdminBtn variant="ghost" onClick={() => openEdit(p)}>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          Edit
                        </AdminBtn>
                        <AdminBtn variant="danger" loading={deletingId === p.id} onClick={() => handleDelete(p.id)}>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Delete
                        </AdminBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
