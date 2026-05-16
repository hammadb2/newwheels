// /crm — redirect to the role's home screen if logged in, else /crm/login.

import { redirect } from "next/navigation";
import { readSession } from "@/lib/crm/auth/session";
import { roleHomePath } from "@/lib/crm/auth/rbac";

export const dynamic = "force-dynamic";

export default async function CrmRootPage() {
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team") {
    redirect("/crm/login");
  }
  redirect(roleHomePath(session.subject.role));
}
