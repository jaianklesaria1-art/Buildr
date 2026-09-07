"use client";

import { signOut } from "next-auth/react";

const NAV = [
  { key: "feed", label: "Discover", href: "/feed" },
  { key: "matches", label: "Matches", href: "/matches" },
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
] as const;

export default function AppHeader({
  active,
  userName,
}: {
  active: "feed" | "matches" | "dashboard";
  userName: string;
}) {
  return (
    <>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      Skip to content
    </a>
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <a href="/feed" className="text-lg font-bold tracking-tight">
            buildr.
          </a>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active === item.key
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-500 sm:inline">{userName}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            Log out
          </button>
        </div>
      </div>
      <nav className="flex items-center gap-1 border-t border-neutral-100 px-4 py-2 sm:hidden">
        {NAV.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={`flex min-h-[44px] flex-1 items-center justify-center rounded-full px-3 text-center text-sm font-medium transition-colors ${
              active === item.key ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
    </>
  );
}
