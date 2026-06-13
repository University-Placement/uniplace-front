"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent-yellow/15"
        />

        <div className="relative">
          <span className="text-sm font-medium uppercase tracking-widest text-white/70">
            UniPlace
          </span>
        </div>

        <div className="relative">
          <Logo variant="mark" priority className="mb-8 h-32 w-auto" />
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="text-white">Uni</span>
            <span className="text-accent-yellow">Place</span>
          </h1>
          <p className="mt-3 text-lg font-medium text-white/90">
            University Placement · Digital SAT Hub
          </p>
          <p className="mt-4 max-w-md text-white/70">
            Practice the digital SAT the way test day really feels — adaptive
            modules, real timing, and your scores and study plan all in one place.
          </p>
        </div>

        <div className="relative flex gap-8 text-sm text-white/70">
          <div>
            <div className="text-2xl font-bold text-white">2h 14m</div>
            full-length exam
          </div>
          <div>
            <div className="text-2xl font-bold text-white">400–1600</div>
            scored like the real thing
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-surface px-4 py-12">
        <div className="w-full max-w-sm">
          {/* logo for small screens */}
          <Logo
            priority
            variant="full"
            className="mx-auto mb-8 h-12 w-auto lg:hidden"
          />

          <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-ink">Welcome back</h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              Sign in with the email and password from UniPlace.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2.5 pr-16 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-muted hover:text-ink"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            Trouble signing in? Reach out to the UniPlace team.
          </p>
        </div>
      </div>
    </main>
  );
}
