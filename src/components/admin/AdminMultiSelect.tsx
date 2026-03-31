"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  label: string;
  value: number;
}

interface AdminMultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  selected: number[];
  onChange: (values: number[]) => void;
  placeholder?: string;
  error?: string;
  loading?: boolean;
}

export function AdminMultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select options…",
  error,
  loading,
}: AdminMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: number) => {
    onChange(
      selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val],
    );
  };

  const selectedLabels = options?.filter((o) => selected?.includes(o.value));

  return (
    <div className="space-y-1" ref={ref}>
      {label && (
        <label className="block text-xs font-medium text-slate-400">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex min-h-9.5 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
          "focus:outline-none focus:ring-1",
          error
            ? "border-red-500/50 focus:ring-red-500/20"
            : open
              ? "border-orange-500/50 ring-1 ring-orange-500/20"
              : "border-white/10 hover:border-white/20",
        )}
      >
        {/* Pills or placeholder */}
        <div className="flex flex-1 flex-wrap gap-1">
          {loading ? (
            <span className="text-sm text-slate-500">Loading…</span>
          ) : selectedLabels.length === 0 ? (
            <span className="text-sm text-slate-500">{placeholder}</span>
          ) : (
            selectedLabels.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 rounded-md bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-300"
              >
                {o.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(o.value);
                  }}
                  className="ml-0.5 rounded hover:text-orange-100"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        {/* Chevron */}
        <svg
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform",
            open && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-white/10 bg-[#1c1e27] py-1 shadow-2xl">
          {options.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-slate-500">
              No collections found
            </div>
          ) : (
            options.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors",
                    checked
                      ? "bg-orange-500/10 text-orange-300"
                      : "text-slate-300 hover:bg-white/5",
                  )}
                >
                  {/* Checkbox */}
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      checked
                        ? "border-orange-500 bg-orange-500"
                        : "border-white/20 bg-transparent",
                    )}
                  >
                    {checked && (
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
