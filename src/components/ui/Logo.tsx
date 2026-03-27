import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Show just the bag icon, or bag + text */
  variant?: "icon" | "full";
  /** Size of the bag icon in pixels */
  size?: number;
  className?: string;
  /** Wrap in a <Link> to home? Default true */
  linked?: boolean;
}

/** Inline SVG bag icon — matches the orange ShopEase bag style */
export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ShopEase logo"
    >
      <defs>
        <linearGradient id="bagBody" x1="8" y1="16" x2="40" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFBE3D" />
          <stop offset="1" stopColor="#FF7A00" />
        </linearGradient>
        <linearGradient id="bagHandle" x1="16" y1="6" x2="32" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A2E" />
          <stop offset="1" stopColor="#E05A00" />
        </linearGradient>
        <linearGradient id="swoosh" x1="0" y1="30" x2="48" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A2E" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FF7A00" />
          <stop offset="1" stopColor="#FF9A2E" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Swoosh / orbit ring */}
      <ellipse
        cx="24"
        cy="32"
        rx="20"
        ry="6"
        stroke="url(#swoosh)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 2"
        opacity="0.85"
      />

      {/* Bag body */}
      <rect x="9" y="17" width="30" height="24" rx="4" fill="url(#bagBody)" />

      {/* Bag handle */}
      <path
        d="M17 17V13C17 9.686 20.134 7 24 7C27.866 7 31 9.686 31 13V17"
        stroke="url(#bagHandle)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Smile on bag */}
      <path
        d="M19 27 Q24 32 29 27"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Sparkle top-right */}
      <g transform="translate(35, 10)">
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#FFE08A" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="-4" y1="0" x2="4" y2="0" stroke="#FFE08A" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" stroke="#FFE08A" strokeWidth="1" strokeLinecap="round" />
        <line x1="2.8" y1="-2.8" x2="-2.8" y2="2.8" stroke="#FFE08A" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Sparkle small top-left */}
      <g transform="translate(11, 13)">
        <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="#FFD060" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="#FFD060" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Full logo: icon + "ShopEase" wordmark */
export function Logo({ variant = "full", size = 36, className, linked = true }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <LogoIcon size={size} />
      {variant === "full" && (
        <span
          className="font-extrabold tracking-tight"
          style={{
            fontSize: size * 0.56,
            background: "linear-gradient(135deg, #FF9A2E 0%, #FF5C00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ShopEase
        </span>
      )}
    </span>
  );

  if (!linked) return content;

  return (
    <Link href={ROUTES.HOME} className="inline-flex items-center gap-2">
      {content}
    </Link>
  );
}
