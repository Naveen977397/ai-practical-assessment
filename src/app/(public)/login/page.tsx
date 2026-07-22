import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
import { getSessionUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/tickets");
  }

  return (
    <Suspense fallback={<p className="app-muted">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}
