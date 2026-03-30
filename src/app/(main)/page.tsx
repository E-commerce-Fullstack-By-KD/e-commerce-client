import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Shop Smarter,
              <br />
              <span className="text-primary-200">Live Better</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
              Discover curated products at unbeatable prices. Free shipping on
              orders over $50.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href={ROUTES.PRODUCTS}
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition hover:bg-primary-50"
              >
                Shop Now
              </Link>
              <Link
                href={ROUTES.PRODUCTS}
                className="rounded-lg border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              title: "Free Shipping",
              desc: "On orders over $50",
              icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8",
            },
            {
              title: "Secure Payment",
              desc: "100% secure checkout",
              icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
            },
            {
              title: "24/7 Support",
              desc: "Dedicated customer service",
              icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 text-center sm:flex-col"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d={feature.icon}
                  />
                </svg>
              </div>
              <div className="sm:mt-2">
                <h3 className="font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-secondary">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Ready to start shopping?
          </h2>
          <p className="mt-3 text-text-secondary">
            Create an account today and get 10% off your first order.
          </p>
          <Link
            href={ROUTES.SIGNUP}
            className="mt-6 inline-block rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-700"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
