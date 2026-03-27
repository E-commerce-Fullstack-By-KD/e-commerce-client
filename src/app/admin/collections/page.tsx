"use client";

import { useState, useEffect, useCallback } from "react";
import { collectionService } from "@/services/collection.service";
import { useToast } from "@/store/toast-context";
import type { Collection } from "@/types";

/* ── tiny inline components so the file stays self-contained ── */

function AdminInput({ value, onChange, placeholder, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50"
    />
  );
}

function AdminBtn({ children, onClick, variant = "primary", disabled, loading }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "ghost" | "danger"; disabled?: boolean; loading?: boolean;
}) {
  const styles = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50",
    ghost:   "border border-white/10 text-slate-300 hover:bg-white/5",
    danger:  "bg-red-500/10 text-red-400 hover:bg-red-500/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${styles[variant]}`}
    >
      {loading && (
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      {children}
    </button>
  );
}

/* ── Main Page ── */
export default function AdminCollectionsPage() {
  const { showToast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [fetching, setFetching]     = useState(true);

  // Create form
  const [newName, setNewName]       = useState("");
  const [creating, setCreating]     = useState(false);

  // Inline edit
  const [editId, setEditId]         = useState<number | null>(null);
  const [editName, setEditName]     = useState("");
  const [saving, setSaving]         = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* fetch */
  const fetchCollections = useCallback(async () => {
    setFetching(true);
    try {
      const res = await collectionService.getAll();
      setCollections(res.result?.collection ?? []);
    } catch {
      showToast("Failed to load collections", "error");
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  /* create */
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await collectionService.create(newName.trim());
      showToast("Collection created!", "success");
      setNewName("");
      fetchCollections();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create";
      showToast(msg, "error");
    } finally {
      setCreating(false);
    }
  };

  /* update */
  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return;
    setSaving(true);
    try {
      await collectionService.update(editId, editName.trim());
      showToast("Collection updated!", "success");
      setEditId(null);
      fetchCollections();
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  /* delete */
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await collectionService.remove(id);
      showToast("Collection deleted!", "success");
      fetchCollections();
    } catch {
      showToast("Failed to delete", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Collections</h2>
          <p className="text-xs text-slate-400">{collections.length} collection{collections.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Create form */}
      <div className="rounded-xl border border-white/10 bg-[#16181f] p-5">
        <p className="mb-3 text-sm font-semibold text-white">New Collection</p>
        <div className="flex gap-2">
          <AdminInput
            value={newName}
            onChange={setNewName}
            placeholder="e.g. Summer Sale, New Arrivals…"
          />
          <AdminBtn
            onClick={handleCreate}
            loading={creating}
            disabled={!newName.trim()}
          >
            Create
          </AdminBtn>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-[#16181f] overflow-hidden">
        {fetching ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Loading collections…
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-500">
            <svg className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm">No collections yet. Create your first one above.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 w-12">#</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3 w-44 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {collections.map((col, i) => (
                <tr key={col.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-slate-500">{i + 1}</td>

                  {/* Name / inline edit */}
                  <td className="px-5 py-3 text-white">
                    {editId === col.id ? (
                      <AdminInput value={editName} onChange={setEditName} />
                    ) : (
                      <span className="font-medium">{col.name}</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editId === col.id ? (
                        <>
                          <AdminBtn onClick={handleUpdate} loading={saving} disabled={!editName.trim()}>
                            Save
                          </AdminBtn>
                          <AdminBtn variant="ghost" onClick={() => setEditId(null)}>
                            Cancel
                          </AdminBtn>
                        </>
                      ) : (
                        <>
                          <AdminBtn
                            variant="ghost"
                            onClick={() => { setEditId(col.id); setEditName(col.name); }}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Edit
                          </AdminBtn>
                          <AdminBtn
                            variant="danger"
                            loading={deletingId === col.id}
                            onClick={() => handleDelete(col.id)}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Delete
                          </AdminBtn>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
