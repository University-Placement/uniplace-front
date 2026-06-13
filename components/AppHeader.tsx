"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

const STUDENT_NAV = [
  { href: "/dashboard", label: "Mockdays" },
  { href: "/results", label: "My Results" },
  { href: "/board", label: "Study Board" },
];

export function AppHeader({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={admin ? "/admin" : "/dashboard"} className="flex items-center">
            <Logo className="h-9 w-auto" />
            {admin && (
              <span className="ml-3 rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                Admin
              </span>
            )}
          </Link>

          {!admin && (
            <nav className="hidden items-center gap-1 sm:flex">
              {STUDENT_NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      active
                        ? "bg-brand/10 text-brand"
                        : "text-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <button
          onClick={signOut}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
