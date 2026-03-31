import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "right" | "center";
  render: (row: T, index: number) => ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  keyExtractor: (row: T) => string | number;
}

export function AdminTable<T>({
  columns,
  data,
  loading,
  emptyTitle = "No records found",
  emptyDescription,
  emptyAction,
  keyExtractor,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
        <svg
          className="h-12 w-12 opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <div className="text-center">
          <p className="font-medium text-slate-400">{emptyTitle}</p>
          {emptyDescription && (
            <p className="mt-1 text-xs">{emptyDescription}</p>
          )}
        </div>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500",
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                      ? "text-center"
                      : "text-left",
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, i) => (
            <tr
              key={keyExtractor(row)}
              className="group transition-colors hover:bg-white/3"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-slate-300",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "",
                  )}
                >
                  {col.render(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
