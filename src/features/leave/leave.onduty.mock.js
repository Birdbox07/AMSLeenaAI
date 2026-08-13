import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES, CURRENT_USER, MY_REPORTEES } from "../employees/employees.mock";

const REASONS = ["Client meeting", "External training", "Vendor site visit", "Conference attendance", "Audit visit"];

export function genOnDutyRequests() {
  const pool = [CURRENT_USER, ...MY_REPORTEES, ...EMPLOYEES.slice(0, 10)];
  const statuses = ["Pending", "Approved", "Approved", "Rejected"];
  return Array.from({ length: 20 }, (_, i) => {
    const emp = pool[Math.floor(seed(i * 5) * pool.length)];
    const days = Math.floor(seed(i * 7) * 3) + 1;
    const fromOffset = Math.floor(seed(i * 11) * 45) - 15;
    const fromDate = genDate(fromOffset);
    const toD = new Date(fromDate);
    toD.setDate(toD.getDate() + days - 1);
    return {
      id: `OD${i + 1}`,
      requestNumber: `ODN${String(2024001 + i)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      fromDate,
      toDate: toD.toISOString().split("T")[0],
      days,
      reason: REASONS[Math.floor(seed(i * 13) * REASONS.length)],
      status: statuses[Math.floor(seed(i * 17) * statuses.length)],
      approver: emp.manager,
    };
  });
}

export const ON_DUTY_REQUESTS = genOnDutyRequests();
