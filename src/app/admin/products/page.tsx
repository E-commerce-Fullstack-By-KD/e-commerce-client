"use client";

import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { adminProductService } from "@/services/admin-product.service";
import { collectionService } from "@/services/collection.service";
import { post } from "@/lib/api";
import { useToast } from "@/store/toast-context";
import { formatPrice, getProductPrice } from "@/lib/utils";
import {
  AdminBtn,
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminMultiSelect,
  AdminImageInput,
  AdminDrawer,
  AdminTable,
  ProductStatusBadge,
} from "@/components/admin";
import type {
  AdminProduct,
  ApiResponse,
  Collection,
  CreateProductPayload,
} from "@/types";
import type { Column } from "@/components/admin/AdminTable";

const STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const EMPTY_FORM: CreateProductPayload = {
  name: "",
  sku: "",
  description: "",
  image_url: [],
  list_price: 0,
  offer_price: null,   // null = no offer price
  stock: 0,
  status: "DRAFT",
  collectionIds: [],
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function AdminProductsPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [fetching, setFetching] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<CreateProductPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  /* helpers */
  const setField = <K extends keyof CreateProductPayload>(
    key: K,
    value: CreateProductPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const setNumericField =
    (key: "list_price" | "stock") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setField(key, raw === "" ? 0 : Number(raw));
    };

  // offer_price: empty string → null (no offer), otherwise a number
  const setOfferPrice = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setField("offer_price", raw === "" ? null : Number(raw));
  };

  /* fetch */
  const fetchProducts = useCallback(async () => {
    setFetching(true);
    try {
      const res = await adminProductService.getAll();
      setProducts(res.result?.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setFetching(false);
    }
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await collectionService.getAll();
      setCollections(res.result?.collection ?? []);
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, [fetchProducts, fetchCollections]);

  /* open drawer */
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditProduct(null);
    setPendingFiles([]);
    setDrawerOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description ?? "",
      image_url: p.image_url ?? [],
      list_price: toNumber(p.list_price),
      offer_price: p.offer_price != null ? toNumber(p.offer_price) : null,
      stock: toNumber(p.stock),
      status: p.status,
      collectionIds: p.collections?.map((c) => c.id) ?? [],
    });
    setEditProduct(p);
    setPendingFiles([]);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditProduct(null);
    setPendingFiles([]);
  };
  /* upload pending files and return their URLs */
  const uploadPendingFiles = async (): Promise<string[]> => {
    if (pendingFiles.length === 0) return [];

    const formData = new FormData();
    pendingFiles.forEach((file) => formData.append("files", file));

    const res = await post<ApiResponse<{ urls: string[] }>>("upload", formData);
    return res.result?.urls ?? [];
  };

  /* submit */
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.sku.trim()) {
      showToast("Name and SKU are required", "error");
      return;
    }
    setSubmitting(true);
    try {
      // Upload pending images first, then merge with existing URLs
      const uploadedUrls = await uploadPendingFiles();
      const allImageUrls = [...(form.image_url ?? []), ...uploadedUrls];

      const payload: CreateProductPayload = {
        ...form,
        list_price: toNumber(form.list_price),
        // send null explicitly to clear offer_price, or the number if set & > 0
        offer_price:
          form.offer_price != null && form.offer_price > 0
            ? toNumber(form.offer_price)
            : null,
        stock: toNumber(form.stock),
        description: form.description?.trim() || undefined,
        image_url: allImageUrls.length ? allImageUrls : undefined,
        collectionIds: form.collectionIds?.length
          ? form.collectionIds
          : undefined,
      };

      if (editProduct) {
        await adminProductService.update(editProduct.id, payload);
        showToast("Product updated!", "success");
      } else {
        await adminProductService.create(payload);
        showToast("Product created!", "success");
      }
      closeDrawer();
      fetchProducts();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Operation failed";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* delete */
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await adminProductService.remove(id);
      showToast("Product deleted!", "success");
      fetchProducts();
    } catch {
      showToast("Failed to delete product", "error");
    } finally {
      setDeletingId(null);
    }
  };

  /* table columns */
  const columns: Column<AdminProduct>[] = [
    {
      key: "image",
      header: "",
      width: "70px",
      render: (p) =>
        p.image_url?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url[0]}
            alt={p.name}
            className="h-9 w-9 rounded-md object-cover ring-1 ring-white/10 shrink-0"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
              const placeholder = document.createElement("div");
              placeholder.className =
                "size-9 rounded-md bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-slate-600";
              placeholder.innerHTML = `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
              img.parentElement?.insertBefore(placeholder, img);
            }}
          />
        ) : (
          <div className="size-9 rounded-md bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-slate-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ),
    },
    {
      key: "name",
      header: "Product",
      render: (p) => (
        <div>
          <p className="font-medium text-white">{p.name}</p>
          <p className="text-xs font-mono text-slate-500">{p.sku}</p>
        </div>
      ),
    },
    {
      key: "collections",
      header: "Collections",
      render: (p) =>
        p.collections?.length ? (
          <div className="flex flex-wrap gap-1">
            {p.collections.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400 ring-1 ring-white/10 whitespace-nowrap"
              >
                {c.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-600">—</span>
        ),
    },
    {
      key: "pricing",
      header: "Price",
      align: "right",
      render: (p) => {
        const { displayPrice, originalPrice } = getProductPrice(p.list_price, p.offer_price);
        return (
          <div className="text-right">
            <p className="font-semibold text-orange-400">{formatPrice(displayPrice)}</p>
            {originalPrice && (
              <p className="text-xs text-slate-500 line-through">{formatPrice(originalPrice)}</p>
            )}
          </div>
        );
      },
    },
    {
      key: "stock",
      header: "Stock",
      align: "center",
      render: (p) => (
        <span className={p.stock === 0 ? "text-red-400" : "text-slate-300"}>
          {p.stock}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (p) => <ProductStatusBadge status={p.status} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "120px",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <AdminBtn size="sm" variant="ghost" onClick={() => openEdit(p)}>
            Edit
          </AdminBtn>
          <AdminBtn
            size="sm"
            variant="danger"
            loading={deletingId === p.id}
            onClick={() => handleDelete(p.id)}
          >
            Delete
          </AdminBtn>
        </div>
      ),
    },
  ];

  /* collection options for multiselect */
  const collectionOptions = collections.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Products</h2>
          <p className="text-xs text-slate-400">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <AdminBtn onClick={openCreate}>
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
          New Product
        </AdminBtn>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-[#16181f] overflow-hidden">
        <AdminTable
          columns={columns}
          data={products}
          loading={fetching}
          keyExtractor={(p) => p.id}
          emptyTitle="No products yet"
          emptyDescription="Create your first product to get started."
          emptyAction={
            <AdminBtn onClick={openCreate} size="sm">
              + New Product
            </AdminBtn>
          }
        />
      </div>

      {/* Create / Edit Drawer */}
      <AdminDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editProduct ? "Edit Product" : "New Product"}
        subtitle={
          editProduct
            ? `Editing: ${editProduct.name}`
            : "Fill in the details below"
        }
        width="xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <AdminBtn variant="ghost" onClick={closeDrawer}>
              Cancel
            </AdminBtn>
            <AdminBtn onClick={handleSubmit} loading={submitting}>
              {editProduct ? "Save Changes" : "Create Product"}
            </AdminBtn>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Product Name *"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="iPhone 15 Pro"
            />
            <AdminInput
              label="SKU *"
              value={form.sku}
              onChange={(e) => setField("sku", e.target.value)}
              placeholder="IPH-15-PRO-128"
            />
          </div>

          {/* Description */}
          <AdminTextarea
            label="Description"
            value={form.description ?? ""}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Describe the product…"
            rows={3}
          />

          {/* Pricing + Stock */}
          <div className="grid grid-cols-3 gap-4">
            <AdminInput
              label="List Price"
              type="number"
              value={String(form.list_price)}
              onChange={setNumericField("list_price")}
              placeholder="0.00"
            />
            <AdminInput
              label="Offer Price (optional)"
              type="number"
              value={form.offer_price != null ? String(form.offer_price) : ""}
              onChange={setOfferPrice}
              placeholder="Leave empty for no discount"
            />
            <AdminInput
              label="Stock"
              type="number"
              value={String(form.stock)}
              onChange={setNumericField("stock")}
              placeholder="0"
            />
          </div>

          {/* Status */}
          <AdminSelect
            label="Status"
            value={form.status ?? "DRAFT"}
            onChange={(v) =>
              setField("status", v as CreateProductPayload["status"])
            }
            options={STATUS_OPTIONS}
          />

          {/* Collections */}
          <AdminMultiSelect
            label="Collections"
            options={collectionOptions}
            selected={form.collectionIds ?? []}
            onChange={(ids) => setField("collectionIds", ids)}
            placeholder="Select collections…"
          />

          {/* Images */}
          <AdminImageInput
            label="Images"
            existingUrls={form.image_url ?? []}
            onExistingUrlsChange={(urls) => setField("image_url", urls)}
            pendingFiles={pendingFiles}
            onPendingFilesChange={setPendingFiles}
          />
        </div>
      </AdminDrawer>
    </div>
  );
}
