"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getAttemptReview,
  type AttemptReview,
  type AttemptReviewQuestion,
} from "@/lib/admin-api";

const MOD_LABEL = (s: string, m: number) => `${s === "rw" ? "R&W" : "Math"} M${m}`;

type FilterKey = "all" | "incorrect" | "unanswered";

export default function AttemptReviewPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = Number(params.attemptId);
  const search = useSearchParams();
  const backHref = search.get("mockday")
    ? `/admin/mockdays/${search.get("mockday")}/results`
    : "/admin/mockdays";

  const [data, setData] = useState<AttemptReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  const load = useCallback(async () => {
    try {
      setData(await getAttemptReview(attemptId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [attemptId]);

  useEffect(() => {
    void load();
  }, [load]);

  const shown = useMemo(() => {
    if (!data) return [];
    if (filter === "incorrect") return data.questions.filter((q) => q.answered && !q.is_correct);
    if (filter === "unanswered") return data.questions.filter((q) => !q.answered);
    return data.questions;
  }, [data, filter]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 text-red-700">{error}</main>
    );
  }
  if (!data) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 text-muted">Loading…</main>
    );
  }

  const { student, mockday, attempt, summary } = data;
  const pct = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <Link href={backHref} className="text-sm text-muted hover:text-ink">
        ← Back to results
      </Link>

      <div className="mt-2">
        <h1 className="text-2xl font-semibold text-ink">
          {student.full_name ?? student.email ?? `Attempt ${attempt.id}`}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {student.email}
          {mockday ? ` · ${mockday.name}` : ""} · status <b>{attempt.status}</b>
        </p>
      </div>

      {/* summary tiles */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Correct" value={`${summary.correct}/${summary.total}`} accent />
        <Stat label="Accuracy" value={`${pct}%`} />
        <Stat
          label="R&W correct"
          value={`${summary.rw.correct}/${summary.rw.total}`}
          sub={summary.rw.answered < summary.rw.total ? `${summary.rw.total - summary.rw.answered} blank` : undefined}
        />
        <Stat
          label="Math correct"
          value={`${summary.math.correct}/${summary.math.total}`}
          sub={summary.math.answered < summary.math.total ? `${summary.math.total - summary.math.answered} blank` : undefined}
        />
      </div>

      {/* filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(
          [
            ["all", `All (${data.questions.length})`],
            ["incorrect", `Incorrect (${data.questions.filter((q) => q.answered && !q.is_correct).length})`],
            ["unanswered", `Blank (${data.questions.filter((q) => !q.answered).length})`],
          ] as [FilterKey, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === key
                ? "bg-brand text-white"
                : "border border-line text-muted hover:bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* questions grouped by section/module */}
      <div className="mt-6 space-y-3">
        {shown.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface/40 px-4 py-8 text-center text-muted">
            Nothing to show for this filter.
          </p>
        ) : (
          shown.map((q, i) => {
            const prev = shown[i - 1];
            const newGroup = !prev || prev.section !== q.section || prev.module !== q.module;
            return (
              <Fragment key={q.number}>
                {newGroup && (
                  <h2 className="pt-3 text-sm font-semibold uppercase tracking-wide text-muted">
                    {MOD_LABEL(q.section, q.module)}
                  </h2>
                )}
                <QuestionCard q={q} />
              </Fragment>
            );
          })
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className={`text-xl font-semibold tabular-nums ${accent ? "text-brand" : "text-ink"}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-muted">{label}</div>
      {sub && <div className="text-[11px] text-amber-600">{sub}</div>}
    </div>
  );
}

function QuestionCard({ q }: { q: AttemptReviewQuestion }) {
  const state = !q.answered ? "blank" : q.is_correct ? "correct" : "wrong";
  const border =
    state === "correct"
      ? "border-green-300"
      : state === "wrong"
      ? "border-red-300"
      : "border-line";
  const badge =
    state === "correct"
      ? "bg-green-100 text-green-700"
      : state === "wrong"
      ? "bg-red-100 text-red-700"
      : "bg-surface text-muted";
  const badgeText = state === "correct" ? "Correct" : state === "wrong" ? "Incorrect" : "Blank";

  return (
    <div className={`rounded-2xl border ${border} bg-white p-4`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-ink px-1.5 text-xs font-semibold text-white">
            {q.number}
          </span>
          {q.domain && <span className="text-xs text-muted">{q.domain}</span>}
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}>{badgeText}</span>
      </div>

      {q.stem_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={q.stem_image} alt={`Question ${q.number}`} className="mb-4 max-w-full" />
      )}

      {q.type === "mc" && q.choices ? (
        <div className="space-y-2">
          {q.choices.map((c) => {
            const isCorrect = c.id === q.correct_answer;
            const isPicked = c.id === q.selected_answer;
            const cls = isCorrect
              ? "border-green-400 bg-green-50"
              : isPicked
              ? "border-red-400 bg-red-50"
              : "border-line";
            return (
              <div
                key={c.id}
                className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3 py-2 ${cls}`}
              >
                <div className="min-w-0 flex-1">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt={`Choice ${c.id}`}
                      className={
                        q.section === "math"
                          ? "max-h-7 max-w-full object-contain object-left"
                          : "w-full"
                      }
                    />
                  ) : (
                    <span className="text-[15px] text-ink">
                      {c.id}. {c.text}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium">
                  {isPicked && (
                    <span className={isCorrect ? "text-green-700" : "text-red-700"}>picked</span>
                  )}
                  {isCorrect && <span className="text-green-700">✓ correct</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // grid-in / student-produced response
        <div className="flex flex-wrap gap-3">
          <div
            className={`rounded-xl border-2 px-4 py-2 ${
              q.is_correct ? "border-green-400 bg-green-50" : q.answered ? "border-red-400 bg-red-50" : "border-line"
            }`}
          >
            <div className="text-[11px] text-muted">Student answer</div>
            <div className="text-lg font-semibold tabular-nums text-ink">
              {q.answered ? q.selected_answer : "— (blank)"}
            </div>
          </div>
          <div className="rounded-xl border-2 border-green-400 bg-green-50 px-4 py-2">
            <div className="text-[11px] text-muted">Accepted answer(s)</div>
            <div className="text-lg font-semibold tabular-nums text-green-800">
              {(q.correct_answer ?? "").split("|").join("  ·  ")}
            </div>
          </div>
        </div>
      )}

      {(q.skill || q.difficulty) && (
        <div className="mt-3 flex gap-3 text-[11px] text-muted">
          {q.skill && <span>Skill: {q.skill}</span>}
          {q.difficulty && <span>Difficulty: {q.difficulty}</span>}
        </div>
      )}
    </div>
  );
}
