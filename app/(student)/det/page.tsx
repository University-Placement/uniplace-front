import { AppHeader } from "@/components/AppHeader";

export default function DetPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">DET</h1>
        <p className="mt-1 text-muted">
          Your space to prep for the Duolingo English Test.
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface/60 p-12 text-center">
          <p className="text-lg font-medium text-ink">Coming soon</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            We&apos;re putting together your DET practice and resources. Check
            back here shortly.
          </p>
        </div>
      </main>
    </>
  );
}
