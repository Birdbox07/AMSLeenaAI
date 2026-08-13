import { EMPLOYEES } from "./employees.mock";

// Coarse role derivation for the "View As" role simulator (Settings page).
// Additive only — does not replace or duplicate the real manager/reportee
// scoping mechanism (useMyReportees()), which stays the source of truth for
// "who can approve whose requests". This just adds a demo-only permission
// layer on top (hide/show admin-only and manager-only UI).
export function getEmployeeRole(emp) {
  if (!emp) return "Employee";
  const isManagerTitle = /Manager|Director|VP/.test(emp.designation || "");
  if (emp.department === "Human Resources" && isManagerTitle) return "HR Admin";
  const hasReportee = EMPLOYEES.some(e => e.manager === emp.name);
  if (hasReportee || isManagerTitle) return "Manager";
  return "Employee";
}

export const ROLE_LEVEL = { "Employee": 0, "Manager": 1, "HR Admin": 2 };

export function roleAtLeast(role, minRole) {
  return (ROLE_LEVEL[role] ?? 0) >= (ROLE_LEVEL[minRole] ?? 0);
}
