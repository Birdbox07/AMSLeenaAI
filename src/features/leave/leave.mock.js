import { LEAVE_TYPES, seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export function genLeaves() {
  const approvers = ["Priya Verma","Amit Singh","Sneha Gupta","Vikram Kumar"];
  return Array.from({ length: 50 }, (_, i) => {
    const emp = EMPLOYEES[Math.floor(seed(i*7)*EMPLOYEES.length)];
    const lt = LEAVE_TYPES[Math.floor(seed(i*11)*LEAVE_TYPES.length)];
    const days = Math.floor(seed(i*13)*4) + 1;
    const fromOffset = Math.floor(seed(i*17)*60) - 30;
    const fromDate = genDate(-fromOffset);
    const toD = new Date(fromDate);
    toD.setDate(toD.getDate() + days - 1);
    const statuses = ["Pending","Approved","Approved","Rejected"];
    return {
      id: `LV${i+1}`, leaveNumber: `LVN${String(2024001+i)}`,
      employeeId: emp.id, employeeName: emp.name, department: emp.department,
      leaveType: lt, fromDate, toDate: toD.toISOString().split("T")[0], days,
      status: statuses[Math.floor(seed(i*19)*statuses.length)],
      approver: approvers[Math.floor(seed(i*23)*approvers.length)],
    };
  });
}

export const LEAVES = genLeaves();

export const LEAVE_TYPE_BY_EMP_DATE = new Map();
LEAVES.forEach(l => {
  const d = new Date(l.fromDate);
  const end = new Date(l.toDate);
  while (d <= end) {
    LEAVE_TYPE_BY_EMP_DATE.set(`${l.employeeId}_${d.toISOString().split("T")[0]}`, l.leaveType);
    d.setDate(d.getDate() + 1);
  }
});

export const LEAVE_ALLOCATION = {
  "Casual Leave": 12, "Sick Leave": 12, "Earned Leave": 15,
  "Maternity Leave": 180, "Paternity Leave": 15, "Compensatory Leave": 5,
};

export function getLeaveBalance(employeeId, leaves) {
  return LEAVE_TYPES.map(type => {
    const used = leaves
      .filter(l => l.employeeId === employeeId && l.leaveType === type && l.status === "Approved")
      .reduce((sum, l) => sum + l.days, 0);
    const allocated = LEAVE_ALLOCATION[type] ?? 12;
    return { type, allocated, used, balance: Math.max(allocated - used, 0) };
  });
}
