"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export function AppHeader({ admin = false }: { admin?: boolean }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href={admin ? "/admin" : "/dashboard"} className="flex items-center">
          <Logo className="h-9 w-auto" />
          {admin && (
            <span className="ml-3 rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-muted">
              Admin
            </span>
          )}
        </Link>

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
