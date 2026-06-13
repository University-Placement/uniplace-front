"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ModuleRunner } from "@/components/exam/ModuleRunner";
import { getAttemptState, startModule } from "@/lib/exam-api";
import type { AttemptState } from "@/lib/types";

const SECTION_LABEL: Record<string, string> = {
  rw: "Reading and Writing",
  math: "Math",
};

export default function ExamPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = Number(params.attemptId);

  const [state, setState] = useState<AttemptState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setState(await getAttemptState(attemptId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [attemptId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function begin() {
    setStarting(true);
    setError(null);
    try {
      setState(await startModule(attemptId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start module");
    } finally {
      setStarting(false);
    }
  }

  if (error) {
    return (
      <Centered>
        <p className="text-red-700">{error}</p>
      </Centered>
    );
  }

  if (!state) {
    return (
      <Centered>
        <p className="text-muted">Loading…</p>
      </Centered>
    );
  }

  if (state.phase === "module") {
    // key forces a fresh ModuleRunner (and timer) per module.
    return <ModuleRunner key={state.module_id} state={state} onAdvance={refresh} />;
  }

  if (state.phase === "complete") {
    return <ScoreReport state={state} />;
  }

  // ready or break
  const isBreak = state.phase === "break";
  return (
    <Centered>
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
        {isBreak ? (
          <>
            <h1 className="text-xl font-semibold text-ink">Break time</h1>
            <BreakTimer seconds={state.break_seconds ?? 600} />
            <p className="mt-2 text-sm text-muted">
              Take a 10-minute break. When you&apos;re ready, begin the{" "}
              {SECTION_LABEL[state.next_section ?? ""]} section.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-ink">
              {SECTION_LABEL[state.next_section ?? ""]} — Module{" "}
              {state.next_module}
            </h1>
            <p className="mt-2 text-sm text-muted">
              The timer starts as soon as you begin. Your answers save
              automatically.
            </p>
          </>
        )}
        <button
          onClick={begin}
          disabled={starting}
          className="mt-6 w-full rounded-lg bg-brand px-5 py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {starting
            ? "Starting…"
            : isBreak
              ? "Begin section"
              : "Begin module"}
        </button>
      </div>
    </Centered>
  );
}

function BreakTimer({ seconds }: { seconds: number }) {
  const [s, setS] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setS((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return (
    <p className="mt-4 font-mono text-4xl font-semibold text-brand">
      {m}:{String(r).padStart(2, "0")}
    </p>
  );
}

function ScoreReport({ state }: { state: AttemptState }) {
  const router = useRouter();
  void state;
  return (
    <Centered>
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
          ✓
        </div>
        <h1 className="text-2xl font-semibold text-ink">All done!</h1>
        <p className="mt-2 text-muted">
          Your responses have been submitted. Scores are reviewed by the UniPlace
          team and shared with you afterward — they won&apos;t appear here.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 w-full rounded-lg bg-brand px-5 py-3 font-medium text-white hover:bg-brand-dark"
        >
          Back to dashboard
        </button>
      </div>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      {children}
    </main>
  );
}
