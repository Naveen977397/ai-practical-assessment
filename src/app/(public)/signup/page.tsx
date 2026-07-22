import { redirect } from "next/navigation";
import { SignupForm } from "@/components/SignupForm";
import { getSessionUser } from "@/lib/auth/session";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/tickets");
  }

  return <SignupForm />;
}
