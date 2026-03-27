import Link from "next/link";
import { ROUTES } from "@/lib/constants";

const stats = [
  { label: "Total Revenue",   value: "—",  sub: "Coming soon", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 9v1m-6-5a9 9 0 1118 0 9 9 0 01-18 0z", color: "text-emerald-400 bg-emerald-500/10" },
  { label: "Total Orders",    value: "—",  sub: "Coming soon", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",      color: "text-blue-400  bg-blue-500/10"  },
  { label: "Total Products",  value: "—",  sub: "Coming soon", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",                                                                       color: "text-purple-400 bg-purple-500/10"},
  { label: "Total Users",     value: "—",  sub: "Coming soon", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "text-pink-400   bg-pink-500/10"  },
];

const quickLinks = [
  { label: "Manage Products",   href: ROUTES.ADMIN.PRODUCTS,    desc: "Create, edit, remove products",       icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { label: "Manage Collections", href: ROUTES.ADMIN.COLLECTIONS, desc: "Organise products into collections", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-white">Welcome back 👋</h2>
        <p className="mt-1 text-sm text-slate-400">Here&apos;s what&apos;s happening in your store.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-[#16181f] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{s.label}</p>
              <div className={`rounded-lg p-2 ${s.color}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-[#16181f] p-5 transition-all hover:border-orange-500/40 hover:bg-orange-500/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={q.icon} />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white group-hover:text-orange-300">{q.label}</p>
                <p className="text-xs text-slate-400">{q.desc}</p>
              </div>
              <svg className="ml-auto h-4 w-4 text-slate-600 group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
