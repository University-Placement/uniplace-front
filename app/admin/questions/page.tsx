import { AppHeader } from "@/components/AppHeader";

// Phase 2: question authoring UI (CRUD over the question bank).
export default function QuestionsPage() {
  return (
    <>
      <AppHeader admin />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Question bank</h1>
        <p className="mt-1 text-muted">Authoring UI lands in Phase 2.</p>
      </main>
    </>
  );
}
