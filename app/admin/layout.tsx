import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

// Server-side admin gate. The proxy already requires login; this additionally
// requires the admin role (read from the Supabase JWT's app_metadata). The API
// enforces the same check independently via require_admin — this is just so the
// UI doesn't render for non-admins.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.app_metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <>
      <AppHeader admin />
      {children}
    </>
  );
}
