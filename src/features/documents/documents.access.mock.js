import { seed } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

// Per-employee document-panel access flags, ported from the legacy
// Employee_Doc_Upload.aspx.cs gating logic. Most employees can see/use every
// panel; a small minority (~1 in 10) have one or two flags turned off to
// simulate real-world gating variance.
export function genDocAccess() {
  return EMPLOYEES.map((emp, i) => {
    const restricted = seed(i * 31 + 3) < 0.1;
    const flag = (n) => !restricted || seed(i * 31 + n) > 0.5;
    return {
      id: `DOCACC${emp.id}`,
      employeeId: emp.id,
      canPayslip: flag(5),
      canEmployeeDoc: flag(7),
      canMediclaim: flag(11),
      canForm16A: flag(13),
      canForm16B: flag(17),
    };
  });
}

export const DOC_ACCESS = genDocAccess();
