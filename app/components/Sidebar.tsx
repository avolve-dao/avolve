"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const routes = [
  { label: "Dashboard", path: "/(authenticated)/dashboard", color: "bg-blue-500" },
  { label: "Profile", path: "/(authenticated)/profile", color: "bg-violet-500" },
  { label: "Teams", path: "/(authenticated)/teams", color: "bg-emerald-500" },
  { label: "Tokens", path: "/(authenticated)/tokens", color: "bg-yellow-500" },
  { label: "Subscription", path: "/(authenticated)/subscription", color: "bg-orange-500" },
  { label: "Participation", path: "/(authenticated)/participation", color: "bg-pink-400" },
  { label: "Admin Users", path: "/(authenticated)/admin/users", color: "bg-rose-500" },
  { label: "Admin Analytics", path: "/(authenticated)/admin/analytics", color: "bg-red-500" },
  { label: "Admin Content", path: "/(authenticated)/admin/content", color: "bg-green-500" },
  { label: "Admin Security", path: "/(authenticated)/admin/security", color: "bg-zinc-500" },
  { label: "Developer Portal", path: "/(authenticated)/developer-portal", color: "bg-cyan-500" },
  { label: "Welcome", path: "/(unauthenticated)/welcome", color: "bg-indigo-400" },
  { label: "Onboarding", path: "/(unauthenticated)/onboarding", color: "bg-indigo-300" },
];

export default function Sidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col py-8 px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Avolve</h2>
          <div className="text-xs text-zinc-400 mt-1">Invitation Only</div>
        </div>
        <nav className="flex flex-col gap-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${pathname === route.path ? route.color + " text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
            >
              <span className={`w-2 h-2 rounded-full ${route.color} mr-2`}></span>
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8 text-xs text-zinc-600">
          <span> {new Date().getFullYear()} Avolve</span>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-zinc-950">{children}</main>
    </div>
  );
}
