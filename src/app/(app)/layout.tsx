import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/AuthProvider";
import { AppHeader } from "@/components/AppHeader";
import { getSessionUser } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider initialUser={user}>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </AuthProvider>
  );
}
