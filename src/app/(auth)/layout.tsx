import { config } from "@/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left - Branding Panel */}
      <div className="hidden w-1/2 items-center justify-center bg-primary-600 lg:flex">
        <div className="max-w-md px-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{config.appName}</h1>
          <p className="mt-3 text-lg text-primary-100">
            Discover amazing products at unbeatable prices. Join thousands of happy shoppers today.
          </p>
        </div>
      </div>

      {/* Right - Form Panel */}
      <div className="flex w-full items-center justify-center px-4 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
