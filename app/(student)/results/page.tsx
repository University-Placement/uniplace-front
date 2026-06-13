"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Logo } from "@/components/Logo";
import { getMyResults, type MyResult } from "@/lib/student-api";

export default function ResultsPage() {
  const [results, setResults] = useState<MyResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyResults()
      .then(setResults)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">My Results</h1>
        <p className="mt-1 text-muted">
          Scores appear here once the UniPlace team has reviewed and released them.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {results === null ? (
          <p className="mt-8 text-muted">Loading…</p>
        ) : results.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
            <Logo variant="mark" className="mb-4 h-20 w-auto opacity-90" />
            <p className="font-medium text-ink">No results released yet</p>
            <p className="mt-1 text-sm text-muted">
              After a Mockday, your score shows up here once it&apos;s released.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {results.map((r) => (
              <ResultCard key={r.attempt_id} r={r} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function ResultCard({ r }: { r: MyResult }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-semibold text-ink">{r.mockday}</h2>
          {r.submitted_at && (
            <p className="text-xs text-muted">
              {new Date(r.submitted_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-brand">{r.total_scaled}</div>
          <div className="text-xs text-muted">out of 1600</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Section label="Reading & Writing" score={r.rw_scaled} />
        <Section label="Math" score={r.math_scaled} />
      </div>

      {r.domains.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-ink">
            Areas to focus on
          </h3>
          <div className="space-y-2">
            {r.domains.map((d) => (
              <div key={d.domain} className="flex items-center gap-3">
                <span className="w-44 shrink-0 truncate text-sm text-ink">
                  {d.domain}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                  <div
                    className={`h-full rounded-full ${
                      d.pct >= 70
                        ? "bg-green-500"
                        : d.pct >= 40
                          ? "bg-accent-yellow"
                          : "bg-accent-orange"
                    }`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-sm tabular-nums text-muted">
                  {d.correct}/{d.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="text-2xl font-semibold text-ink">{score ?? "—"}</div>
      <div className="mt-1 text-xs text-muted">{label} · /800</div>
    </div>
  );
}
