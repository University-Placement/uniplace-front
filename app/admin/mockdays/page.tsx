import { AppHeader } from "@/components/AppHeader";

// Phase 2/3: Mockday builder + go-live controls.
export default function MockdaysPage() {
  return (
    <>
      <AppHeader admin />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Mockdays</h1>
        <p className="mt-1 text-muted">
          Form assembly, scheduling, and go-live controls land in Phase 2–3.
        </p>
      </main>
    </>
  );
}
