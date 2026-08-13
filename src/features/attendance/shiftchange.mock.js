import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export const SHIFTS = [
  { code: "G0", label: "General (G0)", window: "09:00 - 18:00" },
  { code: "G1", label: "Morning (G1)", window: "06:00 - 15:00" },
  { code: "G2", label: "Evening (G2)", window: "14:00 - 23:00" },
  { code: "G3", label: "Night (G3)", window: "22:00 - 07:00" },
];

const REASONS = [
  "Personal commitment change",
  "Medical reason",
  "Requested by department",
  "Commute constraints",
  "Team coverage requirement",
];

export function genShiftChangeRequests() {
  const pool = EMPLOYEES.slice(0, 30);
  const statuses = ["Pending", "Approved", "Approved", "Rejected"];
  return Array.from({ length: 15 }, (_, i) => {
    const emp = pool[Math.floor(seed(i * 3) * pool.length)];
    const currentShift = SHIFTS[Math.floor(seed(i * 7) * SHIFTS.length)];
    let requestedShift = SHIFTS[Math.floor(seed(i * 11) * SHIFTS.length)];
    if (requestedShift.code === currentShift.code) {
      requestedShift = SHIFTS[(SHIFTS.indexOf(requestedShift) + 1) % SHIFTS.length];
    }
    const effOffset = Math.floor(seed(i * 15) * 20) - 10;
    const status = i < 5 ? "Pending" : statuses[Math.floor(seed(i * 19) * statuses.length)];
    return {
      id: `SFT${i + 1}`,
      requestNumber: `SFTN${String(2024001 + i)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      manager: emp.manager,
      currentShift: currentShift.code,
      requestedShift: requestedShift.code,
      effectiveDate: genDate(-effOffset),
      reason: REASONS[Math.floor(seed(i * 23) * REASONS.length)],
      status,
      createdAt: genDate(Math.floor(seed(i * 27) * 15) + 1),
    };
  });
}

export const SHIFT_CHANGE_REQUESTS = genShiftChangeRequests();
