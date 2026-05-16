// Role-Based Access Control for the CRM. Anything that needs to gate by
// role goes through one of these helpers so the rules are obvious and
// auditable in one place.

import { redirect } from "next/navigation";
import type { TeamRole, SessionSubject } from "../types";
import { readSession } from "./session";

export type RoleGate = TeamRole | "any_team";

const ROLE_GATES: Record<RoleGate, (subject: SessionSubject) => boolean> = {
  any_team: (s) => s.kind === "team",
  ceo: (s) => s.kind === "team" && s.role === "ceo",
  lead_qualifier: (s) => s.kind === "team" && (s.role === "lead_qualifier" || s.role === "ceo"),
  community_outreach: (s) => s.kind === "team" && (s.role === "community_outreach" || s.role === "ceo"),
  content_seo: (s) => s.kind === "team" && (s.role === "content_seo" || s.role === "ceo"),
  bdr: (s) => s.kind === "team" && (s.role === "bdr" || s.role === "ceo"),
  platform_ops: (s) => s.kind === "team" && (s.role === "platform_ops" || s.role === "ceo"),
  hr: (s) => s.kind === "team" && (s.role === "hr" || s.role === "ceo"),
};

export function hasRoleAccess(subject: SessionSubject, gate: RoleGate): boolean {
  return ROLE_GATES[gate](subject);
}

/**
 * Server Component / route guard. Redirects to /crm/login if not a team
 * member, or to /crm/dashboard if the team member's role doesn't qualify.
 */
export async function requireTeam(gate: RoleGate = "any_team"): Promise<{
  subject: Extract<SessionSubject, { kind: "team" }>;
}> {
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team") {
    redirect("/crm/login");
  }
  if (!hasRoleAccess(session.subject, gate)) {
    redirect("/crm/dashboard?denied=1");
  }
  return { subject: session.subject };
}

export async function requireBuyer(): Promise<{
  subject: Extract<SessionSubject, { kind: "buyer" }>;
}> {
  const session = await readSession("portal");
  if (!session || session.subject.kind !== "buyer") {
    redirect("/portal/login");
  }
  return { subject: session.subject };
}

// Friendly role names for nav / breadcrumbs.
export function roleHomePath(role: TeamRole): string {
  switch (role) {
    case "ceo":                return "/crm/dashboard";
    case "lead_qualifier":     return "/crm/leads";
    case "community_outreach": return "/crm/outreach";
    case "content_seo":        return "/crm/content";
    case "bdr":                return "/crm/buyers";
    case "platform_ops":       return "/crm/pipeline";
    case "hr":                 return "/crm/hr";
  }
}
