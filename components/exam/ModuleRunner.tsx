"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveResponse, submitModule } from "@/lib/exam-api";
import type { AttemptState, PublicQuestion } from "@/lib/types";

const SECTION_LABEL: Record<string, string> = {
  rw: "Reading and Writing",
  math: "Math",
};

interface Local {
  selected: string | null;
  flagged: boolean;
}

function fmt(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function ModuleRunner({
  state,
  onAdvance,
}: {
  state: AttemptState;
  onAdvance: () => void;
}) {
  const moduleId = state.module_id!;
  const questions = state.questions;

  // Local answer state, seeded from the server's saved responses.
  const [answers, setAnswers] = useState<Map<number, Local>>(() => {
    const m = new Map<number, Local>();
    for (const q of questions) m.set(q.id, { selected: null, flagged: false });
    for (const r of state.responses) {
      m.set(r.question_id, {
        selected: r.selected_answer,
        flagged: r.is_flagged,
      });
    }
    return m;
  });
  const [eliminated, setEliminated] = useState<Map<number, Set<string>>>(
    new Map(),
  );
  const [idx, setIdx] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [seconds, setSeconds] = useState(state.seconds_remaining ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const current = questions[idx] as PublicQuestion | undefined;

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await submitModule(moduleId);
    } finally {
      onAdvance();
    }
  }, [moduleId, onAdvance]);

  // Server-authoritative countdown: tick locally, auto-submit at zero.
  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          void handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [handleSubmit]);

  function persist(questionId: number, patch: Partial<Local>) {
    setAnswers((prev) => {
      const next = new Map(prev);
      const cur = next.get(questionId) ?? { selected: null, flagged: false };
      next.set(questionId, { ...cur, ...patch });
      return next;
    });
    // Fire-and-forget save to the server.
    void saveResponse(moduleId, {
      question_id: questionId,
      selected_answer: patch.selected,
      is_flagged: patch.flagged,
    }).catch(() => {});
  }

  function selectChoice(q: PublicQuestion, choiceId: string) {
    persist(q.id, { selected: choiceId });
  }

  function setSpr(q: PublicQuestion, value: string) {
    setAnswers((prev) => {
      const next = new Map(prev);
      const cur = next.get(q.id) ?? { selected: null, flagged: false };
      next.set(q.id, { ...cur, selected: value });
      return next;
    });
  }

  function toggleFlag(q: PublicQuestion) {
    const cur = answers.get(q.id);
    persist(q.id, { flagged: !cur?.flagged });
  }

  function toggleEliminate(qid: number, choiceId: string) {
    setEliminated((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(qid) ?? []);
      if (set.has(choiceId)) set.delete(choiceId);
      else set.add(choiceId);
      next.set(qid, set);
      return next;
    });
  }

  const answeredCount = useMemo(
    () =>
      [...answers.values()].filter(
        (a) => a.selected != null && a.selected !== "",
      ).length,
    [answers],
  );

  const lowTime = seconds <= 300; // last 5 minutes

  if (!current && !reviewing) return null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-line px-6 py-3">
        <div className="font-semibold text-ink">
          {SECTION_LABEL[state.section ?? ""]} — Module {state.module}
        </div>
        <div
          className={`rounded-lg px-3 py-1 font-mono text-lg font-semibold ${
            lowTime ? "bg-red-50 text-red-700" : "text-ink"
          }`}
        >
          {fmt(seconds)}
        </div>
        <button
          onClick={() => setReviewing(true)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-surface"
        >
          Review
        </button>
      </header>

      {/* Body */}
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {reviewing ? (
          <ReviewScreen
            questions={questions}
            answers={answers}
            onJump={(i) => {
              setIdx(i);
              setReviewing(false);
            }}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : current ? (
          <div className={current.passage ? "grid gap-8 lg:grid-cols-2" : ""}>
            {current.passage && (
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                {current.passage}
              </div>
            )}

            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded bg-ink px-2 py-0.5 text-sm font-semibold text-white">
                  {idx + 1}
                </span>
                <button
                  onClick={() => toggleFlag(current)}
                  className={`text-sm ${
                    answers.get(current.id)?.flagged
                      ? "text-accent-orange"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {answers.get(current.id)?.flagged
                    ? "★ Flagged"
                    : "☆ Mark for review"}
                </button>
              </div>

              <p className="mb-5 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                {current.stem}
              </p>

              {current.type === "mc" && current.choices ? (
                <div className="space-y-2">
                  {current.choices.map((c) => {
                    const isSel = answers.get(current.id)?.selected === c.id;
                    const isElim = eliminated.get(current.id)?.has(c.id);
                    return (
                      <div key={c.id} className="flex items-center gap-2">
                        <button
                          onClick={() => selectChoice(current, c.id)}
                          className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                            isSel
                              ? "border-brand bg-brand/5"
                              : "border-line hover:border-brand/50"
                          } ${isElim ? "opacity-40" : ""}`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                              isSel
                                ? "border-brand bg-brand text-white"
                                : "border-line text-muted"
                            }`}
                          >
                            {c.id}
                          </span>
                          <span
                            className={`text-[15px] text-ink ${isElim ? "line-through" : ""}`}
                          >
                            {c.text}
                          </span>
                        </button>
                        <button
                          onClick={() => toggleEliminate(current.id, c.id)}
                          title="Cross out"
                          className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:bg-surface"
                        >
                          {c.id}̶
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <input
                  value={answers.get(current.id)?.selected ?? ""}
                  onChange={(e) => setSpr(current, e.target.value)}
                  onBlur={() =>
                    persist(current.id, {
                      selected: answers.get(current.id)?.selected ?? "",
                    })
                  }
                  placeholder="Enter your answer"
                  className="w-48 rounded-xl border border-line px-4 py-3 text-[15px] outline-none focus:border-brand"
                />
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom bar */}
      {!reviewing && (
        <footer className="flex items-center justify-between border-t border-line px-6 py-3">
          <span className="text-sm text-muted">
            {answeredCount} of {questions.length} answered
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface disabled:opacity-40"
            >
              Back
            </button>
            {idx < questions.length - 1 ? (
              <button
                onClick={() => setIdx((i) => i + 1)}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setReviewing(true)}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Review &amp; submit
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

function ReviewScreen({
  questions,
  answers,
  onJump,
  onSubmit,
  submitting,
}: {
  questions: PublicQuestion[];
  answers: Map<number, Local>;
  onJump: (i: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-ink">Review your answers</h2>
      <p className="mt-1 text-sm text-muted">
        Tap a question to go back to it. Unanswered questions are marked.
      </p>

      <div className="mt-6 grid grid-cols-6 gap-2 sm:grid-cols-9">
        {questions.map((q, i) => {
          const a = answers.get(q.id);
          const answered = a?.selected != null && a.selected !== "";
          return (
            <button
              key={q.id}
              onClick={() => onJump(i)}
              className={`relative h-11 rounded-lg border text-sm font-medium ${
                answered
                  ? "border-brand bg-brand/5 text-ink"
                  : "border-dashed border-line text-muted"
              }`}
            >
              {i + 1}
              {a?.flagged && (
                <span className="absolute -right-1 -top-1 text-accent-orange">
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="mt-8 rounded-lg bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit module"}
      </button>
    </div>
  );
}
