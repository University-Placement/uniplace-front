"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveResponse, submitModule } from "@/lib/exam-api";
import type { AttemptState, PublicQuestion } from "@/lib/types";
import { DesmosCalculator } from "@/components/exam/DesmosCalculator";
import { ReferenceSheet } from "@/components/exam/ReferenceSheet";

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
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
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
  const isMath = state.section === "math";

  const [answers, setAnswers] = useState<Map<number, Local>>(() => {
    const m = new Map<number, Local>();
    for (const q of questions) m.set(q.id, { selected: null, flagged: false });
    for (const r of state.responses)
      m.set(r.question_id, { selected: r.selected_answer, flagged: r.is_flagged });
    return m;
  });
  const [eliminated, setEliminated] = useState<Map<number, Set<string>>>(new Map());
  const [idx, setIdx] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [seconds, setSeconds] = useState(state.seconds_remaining ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [hideTimer, setHideTimer] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showRef, setShowRef] = useState(false);
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
    void saveResponse(moduleId, {
      question_id: questionId,
      selected_answer: patch.selected,
      is_flagged: patch.flagged,
    }).catch(() => {});
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
    () => [...answers.values()].filter((a) => a.selected != null && a.selected !== "").length,
    [answers],
  );
  const lowTime = seconds <= 300;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ---- Top bar ---- */}
      <header className="grid grid-cols-3 items-center border-b border-line px-6 py-3">
        <div className="text-[15px] font-semibold text-ink">
          {SECTION_LABEL[state.section ?? ""]} — Module {state.module}
        </div>
        <div className="flex flex-col items-center">
          <span
            className={`font-mono text-2xl font-semibold tabular-nums ${
              lowTime ? "text-red-600" : "text-ink"
            }`}
          >
            {hideTimer ? "•••" : fmt(seconds)}
          </span>
          <button
            onClick={() => setHideTimer((h) => !h)}
            className="text-xs text-muted underline-offset-2 hover:underline"
          >
            {hideTimer ? "Show" : "Hide"}
          </button>
        </div>
        <div className="flex items-center justify-end gap-2">
          {isMath && (
            <>
              <ToolButton onClick={() => setShowCalc((v) => !v)} active={showCalc}>
                Calculator
              </ToolButton>
              <ToolButton onClick={() => setShowRef(true)}>Reference</ToolButton>
            </>
          )}
        </div>
      </header>

      {/* ---- Body ---- */}
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
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
            section={state.section ?? ""}
            module={state.module ?? 0}
          />
        ) : current ? (
          <>
            {/* question number + flag */}
            <div className="mb-4 flex items-center justify-between border-b border-line pb-2">
              <span className="rounded bg-ink px-2 py-0.5 text-sm font-bold text-white">
                {idx + 1}
              </span>
              <button
                onClick={() => persist(current.id, { flagged: !answers.get(current.id)?.flagged })}
                className={`flex items-center gap-1.5 text-sm font-medium ${
                  answers.get(current.id)?.flagged ? "text-accent-orange" : "text-muted hover:text-ink"
                }`}
              >
                <span>{answers.get(current.id)?.flagged ? "★" : "☆"}</span>
                Mark for Review
              </button>
            </div>

            {/* stem image */}
            {current.stem_image ? (
              <img
                src={current.stem_image}
                alt={`Question ${idx + 1}`}
                className="mb-6 w-full"
              />
            ) : (
              <p className="mb-6 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                {current.stem}
              </p>
            )}

            {/* choices or grid-in */}
            {current.type === "mc" && current.choices ? (
              <div className="space-y-2.5">
                {current.choices.map((c) => {
                  const isSel = answers.get(current.id)?.selected === c.id;
                  const isElim = eliminated.get(current.id)?.has(c.id);
                  // Math choice images are cropped without the "A." label, so the
                  // UI draws a consistent letter circle. R&W images keep their label.
                  const showLetter = current.section === "math";
                  return (
                    <div key={c.id} className="flex items-center gap-2">
                      <button
                        onClick={() => persist(current.id, { selected: c.id })}
                        className={`flex flex-1 items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition ${
                          isSel ? "border-brand bg-brand/5" : "border-line hover:border-brand/40"
                        } ${isElim ? "opacity-40" : ""}`}
                      >
                        {showLetter && (
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                              isSel ? "border-brand bg-brand text-white" : "border-line text-muted"
                            }`}
                          >
                            {c.id}
                          </span>
                        )}
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={`Choice ${c.id}`}
                            className={`${
                              current.section === "math"
                                ? "max-h-14 max-w-full object-contain object-left"
                                : "w-full"
                            } ${isElim ? "line-through" : ""}`}
                          />
                        ) : (
                          <span className={`text-[15px] text-ink ${isElim ? "line-through" : ""}`}>
                            {c.text}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => toggleEliminate(current.id, c.id)}
                        title="Cross out"
                        className={`h-8 w-8 shrink-0 rounded-full border text-xs font-semibold ${
                          isElim ? "border-ink bg-ink text-white" : "border-line text-muted hover:bg-surface"
                        }`}
                      >
                        {c.id}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm text-muted">Enter your answer</label>
                <input
                  value={answers.get(current.id)?.selected ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => {
                      const next = new Map(prev);
                      const cur = next.get(current.id) ?? { selected: null, flagged: false };
                      next.set(current.id, { ...cur, selected: e.target.value });
                      return next;
                    })
                  }
                  onBlur={() => persist(current.id, { selected: answers.get(current.id)?.selected ?? "" })}
                  className="w-56 rounded-xl border-2 border-line px-4 py-2.5 text-lg outline-none focus:border-brand"
                />
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* ---- Bottom bar ---- */}
      {!reviewing && (
        <footer className="relative flex items-center justify-between border-t border-line px-6 py-3">
          <span className="w-40 text-sm text-muted">
            {answeredCount} of {questions.length} answered
          </span>

          <div className="relative">
            <button
              onClick={() => setNavOpen((v) => !v)}
              className="rounded-lg bg-ink px-4 py-1.5 text-sm font-medium text-white"
            >
              Question {idx + 1} of {questions.length} ▾
            </button>
            {navOpen && (
              <Navigator
                questions={questions}
                answers={answers}
                currentIdx={idx}
                onJump={(i) => {
                  setIdx(i);
                  setNavOpen(false);
                }}
                onReview={() => {
                  setReviewing(true);
                  setNavOpen(false);
                }}
              />
            )}
          </div>

          <div className="flex w-40 justify-end gap-2">
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="rounded-full border border-line px-5 py-1.5 text-sm font-medium hover:bg-surface disabled:opacity-40"
            >
              Back
            </button>
            {idx < questions.length - 1 ? (
              <button
                onClick={() => setIdx((i) => i + 1)}
                className="rounded-full bg-brand px-5 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setReviewing(true)}
                className="rounded-full bg-brand px-5 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Review
              </button>
            )}
          </div>
        </footer>
      )}

      {showCalc && <DesmosCalculator onClose={() => setShowCalc(false)} />}
      {showRef && <ReferenceSheet onClose={() => setShowRef(false)} />}
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
        active ? "border-brand bg-brand/10 text-brand" : "border-line text-ink hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

function Navigator({
  questions,
  answers,
  currentIdx,
  onJump,
  onReview,
}: {
  questions: PublicQuestion[];
  answers: Map<number, Local>;
  currentIdx: number;
  onJump: (i: number) => void;
  onReview: () => void;
}) {
  return (
    <div className="absolute bottom-12 left-1/2 z-30 w-80 -translate-x-1/2 rounded-2xl border border-line bg-white p-4 shadow-2xl">
      <div className="grid grid-cols-7 gap-2">
        {questions.map((q, i) => {
          const a = answers.get(q.id);
          const answered = a?.selected != null && a.selected !== "";
          const isCur = i === currentIdx;
          return (
            <button
              key={q.id}
              onClick={() => onJump(i)}
              className={`relative h-9 rounded-md border text-sm font-medium ${
                isCur
                  ? "border-ink bg-ink text-white"
                  : answered
                    ? "border-brand bg-brand/5 text-ink"
                    : "border-dashed border-line text-muted"
              }`}
            >
              {i + 1}
              {a?.flagged && (
                <span className="absolute -right-1 -top-1 text-[10px] text-accent-orange">★</span>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={onReview}
        className="mt-3 w-full rounded-lg border border-line py-1.5 text-sm font-medium hover:bg-surface"
      >
        Go to Review Page
      </button>
    </div>
  );
}

function ReviewScreen({
  questions,
  answers,
  onJump,
  onSubmit,
  submitting,
  section,
  module,
}: {
  questions: PublicQuestion[];
  answers: Map<number, Local>;
  onJump: (i: number) => void;
  onSubmit: () => void;
  submitting: boolean;
  section: string;
  module: number;
}) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-ink">Check Your Work</h2>
      <p className="mt-1 text-sm text-muted">
        {SECTION_LABEL[section]} — Module {module}. On test day you won&apos;t be
        able to move on after time expires.
      </p>

      <div className="mx-auto mt-8 grid max-w-md grid-cols-7 gap-2">
        {questions.map((q, i) => {
          const a = answers.get(q.id);
          const answered = a?.selected != null && a.selected !== "";
          return (
            <button
              key={q.id}
              onClick={() => onJump(i)}
              className={`relative h-10 rounded-md border text-sm font-medium ${
                answered ? "border-brand bg-brand/5 text-ink" : "border-dashed border-line text-muted"
              }`}
            >
              {i + 1}
              {a?.flagged && (
                <span className="absolute -right-1 -top-1 text-[10px] text-accent-orange">★</span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="mt-8 rounded-full bg-brand px-8 py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit Module"}
      </button>
    </div>
  );
}
