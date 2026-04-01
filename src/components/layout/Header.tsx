"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/auth-context";
import { useCart } from "@/store/cart-context";
import { ROUTES } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";

const navLinks = [
  { label: "Home",     href: ROUTES.HOME },
  { label: "Products", href: ROUTES.PRODUCTS },
  { label: "Orders",   href: ROUTES.ORDERS },
];

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Logo size={36} />

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Admin Panel Button */}
              {isAdmin && (
                <Link
                  href={ROUTES.ADMIN.ROOT}
                  className={cn(
                    "group relative hidden items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 sm:flex",
                    pathname.startsWith("/admin")
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-orange-200 bg-linear-to-br from-orange-50 to-amber-50 text-orange-600 hover:border-orange-400 hover:from-orange-100 hover:to-amber-100",
                  )}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                  </span>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin
                </Link>
              )}

              {/* Cart icon with live badge */}
              <Link
                href={ROUTES.CART}
                className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                aria-label={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ""}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {/* Avatar */}
              <Link
                href={ROUTES.PROFILE}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-offset-1 transition-opacity hover:opacity-80",
                  isAdmin
                    ? "bg-linear-to-br from-orange-400 to-amber-500 text-white ring-orange-300"
                    : "bg-primary-100 text-primary-700 ring-primary-200",
                )}
                title={isAdmin ? `${user?.name} (Admin)` : user?.name}
              >
                {user ? getInitials(user.name) : "U"}
              </Link>

              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href={ROUTES.SIGNUP}>
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="rounded-lg p-2 text-text-secondary hover:bg-surface-tertiary md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className="border-t border-border px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium",
                pathname === link.href
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-secondary hover:bg-surface-tertiary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
