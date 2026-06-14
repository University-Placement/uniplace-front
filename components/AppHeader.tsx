"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

const STUDENT_NAV = [
  { href: "/dashboard", label: "Mockdays" },
  { href: "/plan", label: "Class Plan" },
  { href: "/results", label: "My Results" },
  { href: "/board", label: "Study Board" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppHeader({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata as { full_name?: string } | undefined;
      setEmail(user.email ?? "");
      setName(meta?.full_name || (user.email ?? "").split("@")[0]);
    });
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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

        {/* Profile chip */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-surface"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
              {name ? initials(name) : "·"}
            </span>
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink sm:block">
              {name || "Account"}
            </span>
            <svg
              className={`h-4 w-4 text-muted transition ${open ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-line bg-white p-1.5 shadow-xl">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium text-ink">{name}</p>
                <p className="truncate text-xs text-muted">{email}</p>
                <span className="mt-1 inline-block rounded bg-surface px-1.5 py-0.5 text-[11px] font-medium text-muted">
                  {admin ? "Admin" : "Student"}
                </span>
              </div>
              <div className="my-1 border-t border-line" />
              <button
                onClick={signOut}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted transition hover:bg-surface hover:text-ink"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
