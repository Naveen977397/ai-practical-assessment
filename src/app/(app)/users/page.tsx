import { redirect } from "next/navigation";
import { UserManagementPanel } from "@/components/UserManagementPanel";
import { requireRole } from "@/lib/auth/session";

export default async function UsersPage() {
  try {
    await requireRole("Admin");
  } catch {
    redirect("/tickets");
  }

  return <UserManagementPanel />;
}
