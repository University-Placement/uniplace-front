import { AppHeader } from "@/components/AppHeader";

// Placeholder student dashboard. Phase 3 wires this to the API: it will list the
// student's upcoming/live Mockdays and let them enter when a session is "live".
export default function DashboardPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Your Mockdays</h1>
        <p className="mt-1 text-muted">
          When a Mockday is live, you&apos;ll be able to start it from here.
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-muted">
            No Mockday is live right now. Check back during your scheduled time
            block.
          </p>
        </div>
      </main>
    </>
  );
}
