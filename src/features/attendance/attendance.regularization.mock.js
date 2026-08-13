import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export const SESSIONS = ["Full Day", "First Half", "Second Half"];

const REASONS = [
  "Forgot to swipe at entry",
  "Forgot to swipe at exit",
  "Biometric device malfunction",
  "Worked from client site",
  "Worked from home",
];

export function genRegularizationRequests() {
  const pool = EMPLOYEES.slice(0, 30);
  const statuses = ["Pending", "Approved", "Approved", "Rejected"];
  return Array.from({ length: 20 }, (_, i) => {
    const emp = pool[Math.floor(seed(i * 5) * pool.length)];
    const daysAgo = Math.floor(seed(i * 9) * 25) + 1;
    const session = SESSIONS[Math.floor(seed(i * 13) * SESSIONS.length)];
    const reason = REASONS[Math.floor(seed(i * 17) * REASONS.length)];
    // First few requests are always Pending so approval UI has real data.
    const status = i < 6 ? "Pending" : statuses[Math.floor(seed(i * 21) * statuses.length)];
    return {
      id: `REG${i + 1}`,
      requestNumber: `REGN${String(2024001 + i)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      manager: emp.manager,
      date: genDate(daysAgo),
      session,
      reason,
      remarks: "",
      status,
      createdAt: genDate(daysAgo + 1),
    };
  });
}

export const REGULARIZATION_REQUESTS = genRegularizationRequests();
