import { type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  color?: string; // optional dot color e.g. "bg-emerald-400"
}

interface AdminSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

export function AdminSelect({
  label,
  error,
  hint,
  options,
  onChange,
  className,
  id,
  ...props
}: AdminSelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-400">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-lg border bg-[#1c1e27] px-3 py-2 pr-8 text-sm text-white transition-colors",
            "focus:outline-none focus:ring-1",
            error
              ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
              : "border-white/10 focus:border-orange-500/50 focus:ring-orange-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1c1e27]">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
