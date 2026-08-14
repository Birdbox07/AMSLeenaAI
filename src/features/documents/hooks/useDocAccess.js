import { useDocAccessQuery } from "./useDocAccessQuery";

const ALL_TRUE = { canPayslip: true, canEmployeeDoc: true, canMediclaim: true, canForm16A: true, canForm16B: true };

// Legacy GetPanelAccess() equivalent: Payslip first if allowed, else
// Mediclaim, else the first allowed panel, else null.
function computeDefaultPanel(flags) {
  if (flags.canPayslip) return "Payslip";
  if (flags.canMediclaim) return "Mediclaim";
  if (flags.canEmployeeDoc) return "Employee Documents";
  if (flags.canForm16A) return "Form 16 Part-A";
  if (flags.canForm16B) return "Form 16 Part-B";
  return null;
}

// Maps this feature's DOC_TYPES (documents.mock.js) to the legacy access
// flags, since the legacy panels (Payslip / Employee Documents / Mediclaim /
// Form 16 A / Form 16 B) don't line up 1:1 with today's document types.
export function isDocTypeAllowed(flags, docType) {
  switch (docType) {
    case "Payslip": return flags.canPayslip;
    case "Mediclaim": return flags.canMediclaim;
    case "Form 16 Part-A": return flags.canForm16A;
    case "Form 16 Part-B": return flags.canForm16B;
    default: return flags.canEmployeeDoc;
  }
}

// Returns the access flags for an employeeId (defaults to all-true if no
// record exists, so nothing breaks for employees without an explicit
// record), plus a computed defaultPanel matching the legacy panel-selection
// logic.
export function useDocAccess(employeeId) {
  const { data: items } = useDocAccessQuery();

  const record = items.find(a => a.employeeId === employeeId);
  const flags = record
    ? {
        canPayslip: record.canPayslip,
        canEmployeeDoc: record.canEmployeeDoc,
        canMediclaim: record.canMediclaim,
        canForm16A: record.canForm16A,
        canForm16B: record.canForm16B,
      }
    : ALL_TRUE;

  return { ...flags, defaultPanel: computeDefaultPanel(flags) };
}
