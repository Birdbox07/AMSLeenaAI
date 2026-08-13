import { seed } from "../../shared/mock/constants";

// Uniform Size Declaration records — one per employee, keyed by employeeId.
// No submissions pre-seeded (each employee starts unsubmitted).
export const UNIFORM_RECORDS = [];

// Legacy `frmUniform.aspx.cs` gated this form to male employees only.
// The shared Employee model (employees.mock.js) has no `gender` field yet
// and is off-limits to edit here (other agents are touching that file
// concurrently), so we derive a small deterministic per-employee
// "gender-like" eligibility flag from the employeeId itself — self-contained
// to this feature. A real `Employee.gender` field would be the better long
// term home for this once that file is safe to touch again.
export function isUniformEligible(employeeId) {
  if (!employeeId) return false;
  const n = parseInt(String(employeeId).replace(/\D/g, ""), 10) || 0;
  // Deterministic pseudo-gender split (~roughly half male) derived from id.
  return seed(n * 41) < 0.5;
}
