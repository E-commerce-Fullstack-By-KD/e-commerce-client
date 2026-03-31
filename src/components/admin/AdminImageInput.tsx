"use client";

import { useRef, useEffect } from "react";
import { AdminBtn } from "./AdminBtn";

interface AdminImageInputProps {
  label?: string;
  /** Already-uploaded URL strings (shown when editing an existing product) */
  existingUrls: string[];
  onExistingUrlsChange: (urls: string[]) => void;
  /** Files selected by the user but not yet uploaded */
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
}

export function AdminImageInput({
  label = "Image URLs",
  existingUrls,
  onExistingUrlsChange,
  pendingFiles,
  onPendingFilesChange,
}: AdminImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  // Revoke blob URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      pendingFiles.forEach((f) => {
        const url = (f as File & { __preview?: string }).__preview;
        if (url) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles = Array.from(fileList).map((f) => {
      const blob = URL.createObjectURL(f);
      // Attach preview URL as a non-enumerable property so we can access it later
      Object.defineProperty(f, "__preview", { value: blob, writable: false });
      return f;
    });

    onPendingFilesChange([...pendingFiles, ...newFiles]);

    // Reset input so the same file can be re-selected if removed
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePending = (index: number) => {
    const file = pendingFiles[index] as File & { __preview?: string };
    if (file.__preview) URL.revokeObjectURL(file.__preview);
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index));
  };

  const removeExisting = (url: string) => {
    onExistingUrlsChange(existingUrls.filter((u) => u !== url));
  };

  const hasImages = existingUrls.length > 0 || pendingFiles.length > 0;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-400">{label}</p>

      {/* Upload trigger */}
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <AdminBtn
          type="button"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
        >
          Upload Images
        </AdminBtn>
        <span className="text-xs text-slate-500">PNG, JPG, WEBP</span>
      </div>

      {/* Preview list */}
      {hasImages ? (
        <div className="space-y-2">
          {/* Already-uploaded images (edit mode) */}
          {existingUrls.map((url, i) => (
            <div
              key={`existing-${i}`}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="h-10 w-10 rounded-md object-cover ring-1 ring-white/10 shrink-0"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  // Insert a placeholder next to the broken image
                  const placeholder = document.createElement("div");
                  placeholder.className =
                    "h-10 w-10 rounded-md bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-slate-600 shrink-0";
                  placeholder.innerHTML = `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                  img.parentElement?.insertBefore(placeholder, img);
                }}
              />
              <p className="flex-1 truncate text-xs text-slate-400">{url}</p>
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="shrink-0 rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <TrashIcon />
              </button>
            </div>
          ))}

          {/* Pending (not-yet-uploaded) images */}
          {pendingFiles.map((file, i) => {
            const preview =
              (file as File & { __preview?: string }).__preview ?? "";
            return (
              <div
                key={`pending-${i}`}
                className="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={file.name}
                  className="h-10 w-10 rounded-md object-cover ring-1 ring-orange-500/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs text-slate-400">{file.name}</p>
                  <p className="text-[10px] text-orange-400/70">
                    Pending upload
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="shrink-0 rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-600">No images added yet.</p>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
