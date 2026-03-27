import { Logo, LogoIcon } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left - Branding Panel */}
      <div
        className="hidden w-1/2 items-center justify-center lg:flex"
        style={{
          background: "linear-gradient(135deg, #FF9A2E 0%, #FF5C00 60%, #E04A00 100%)",
        }}
      >
        <div className="max-w-md px-8 text-center">
          {/* Big bag icon */}
          <div className="mx-auto mb-6 flex items-center justify-center">
            <LogoIcon size={96} />
          </div>

          {/* Wordmark */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow">
            ShopEase
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-orange-100">
            Discover amazing products at unbeatable prices.
            <br />
            Join thousands of happy shoppers today.
          </p>

          {/* Decorative dots */}
          <div className="mt-10 flex items-center justify-center gap-2">
            <span className="h-2 w-8 rounded-full bg-white/60" />
            <span className="h-2 w-2 rounded-full bg-white/40" />
            <span className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* Right - Form Panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 sm:px-8 lg:w-1/2">
        {/* Mobile-only logo (shown when left panel is hidden) */}
        <div className="mb-8 lg:hidden">
          <Logo size={40} linked={false} />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
