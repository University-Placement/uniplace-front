"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Logo } from "@/components/Logo";
import {
  getMyResults,
  getMyReview,
  type MyResult,
  type ReviewQuestion,
} from "@/lib/student-api";

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
  const [review, setReview] = useState<ReviewQuestion[] | null>(null);
  const [open, setOpen] = useState(false);
  const [missedOnly, setMissedOnly] = useState(true);
  const [loadingReview, setLoadingReview] = useState(false);

  async function toggleReview() {
    const next = !open;
    setOpen(next);
    if (next && review === null) {
      setLoadingReview(true);
      try {
        setReview(await getMyReview(r.attempt_id));
      } finally {
        setLoadingReview(false);
      }
    }
  }

  const shown = (review ?? []).filter((q) => (missedOnly ? !q.is_correct : true));
  const missedCount = (review ?? []).filter((q) => !q.is_correct).length;

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

      {/* Per-question review */}
      <div className="mt-6 border-t border-line pt-4">
        <button
          onClick={toggleReview}
          className="text-sm font-medium text-brand hover:underline"
        >
          {open ? "Hide question review" : "Review my answers"} →
        </button>

        {open && (
          <div className="mt-4">
            {loadingReview ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : (
              <>
                <div className="mb-4 inline-flex rounded-lg border border-line p-0.5 text-sm">
                  <button
                    onClick={() => setMissedOnly(true)}
                    className={`rounded-md px-3 py-1 ${missedOnly ? "bg-brand text-white" : "text-muted"}`}
                  >
                    Missed ({missedCount})
                  </button>
                  <button
                    onClick={() => setMissedOnly(false)}
                    className={`rounded-md px-3 py-1 ${!missedOnly ? "bg-brand text-white" : "text-muted"}`}
                  >
                    All ({review?.length ?? 0})
                  </button>
                </div>

                {shown.length === 0 ? (
                  <p className="rounded-lg bg-green-50 px-3 py-4 text-center text-sm text-green-700">
                    🎉 Nothing missed here — great work!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {shown.map((q) => (
                      <ReviewItem key={q.number} q={q} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewItem({ q }: { q: ReviewQuestion }) {
  return (
    <div className="rounded-xl border border-line">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface/60 px-4 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
          {q.number}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
            q.section === "rw" ? "bg-brand/10 text-brand" : "bg-accent-orange/15 text-accent-orange"
          }`}
        >
          {q.section === "rw" ? "R&W" : "MATH"} · M{q.module}
        </span>
        {q.domain && (
          <span className="rounded bg-surface px-1.5 py-0.5 text-[11px] text-muted">
            {q.domain}
          </span>
        )}
        {q.skill && (
          <span className="rounded bg-surface px-1.5 py-0.5 text-[11px] text-muted">
            {q.skill}
          </span>
        )}
        <span
          className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${
            q.is_correct ? "bg-green-100 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {q.is_correct ? "Correct" : "Incorrect"}
        </span>
      </div>

      <div className="space-y-3 p-4">
        {q.stem_image && (
          <img src={q.stem_image} alt={`Question ${q.number}`} className="w-full" />
        )}

        <div className="flex flex-wrap gap-2 text-sm">
          <span
            className={`rounded-lg px-2.5 py-1 ${
              q.is_correct ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            Your answer: <b>{q.selected_answer || "—"}</b>
          </span>
          {!q.is_correct && (
            <span className="rounded-lg bg-green-50 px-2.5 py-1 text-green-700">
              Correct answer: <b>{q.correct_answer}</b>
            </span>
          )}
        </div>

        {(q.explanation_image || q.explanation) && (
          <details className="rounded-lg bg-surface/60 p-3">
            <summary className="cursor-pointer text-sm font-medium text-ink">
              Explanation
            </summary>
            <div className="mt-2">
              {q.explanation_image ? (
                <img src={q.explanation_image} alt="Explanation" className="w-full" />
              ) : (
                <p className="text-sm leading-relaxed text-ink">{q.explanation}</p>
              )}
            </div>
          </details>
        )}
      </div>
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
