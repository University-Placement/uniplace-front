"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { FlipWord } from "@/components/FlipWord";

const NAV = ["Home", "About", "Resources", "Contact"];

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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top nav */}
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo variant="wordmark" priority className="h-7 w-auto" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink/80 md:flex">
            {NAV.map((item) => (
              <a key={item} href="#" className="transition hover:text-brand">
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-12 lg:grid-cols-2">
        {/* Left: headline + description + sign-in card */}
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Your path to
            <br />
            ace the{" "}
            <FlipWord
              words={["DSAT", "DET"]}
              className="text-brand underline decoration-brand decoration-4 underline-offset-[6px]"
            />{" "}
            starts here.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            UniPlace is Lala&apos;s hub for the Digital SAT and the Duolingo
            English Test — guidance, practice, and support in one place.
          </p>

          {/* Sign-in card */}
          <div className="mt-8 w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Sign in to your hub</h2>
            <p className="mb-5 mt-1 text-sm text-muted">
              Use the email and password from UniPlace.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Email"
              />
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2.5 pr-16 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-muted hover:text-ink"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
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
                {loading ? "Signing in…" : "Get Started"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: mascot */}
        <div className="flex justify-center lg:justify-end">
          <Logo variant="mark" className="h-72 w-auto sm:h-80" />
        </div>
      </main>
    </div>
  );
}
