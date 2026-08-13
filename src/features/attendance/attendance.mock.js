import { seed } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

// Allowed attendance status values: Present, Absent, Late, Leave, Holiday.

export function genAttendance() {
  const records = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = today.getDate();
  let id = 1;
  EMPLOYEES.slice(0, 30).forEach((emp) => {
    for (let d = 1; d <= Math.min(todayDate, daysInMonth); d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;
      const s = seed(id * 7);
      const statuses = ["Present","Present","Present","Present","Present","Late","Absent","Leave"];
      const st = statuses[Math.floor(s * statuses.length)];
      const checkIn = st === "Present" ? "09:00" : st === "Late" ? `0${9 + Math.floor(seed(id)*2)}:${Math.floor(seed(id*3)*59).toString().padStart(2,"0")}` : "-";
      const checkOut = (st === "Present" || st === "Late") ? "18:00" : "-";
      const hours = (st === "Present" || st === "Late") ? 9 : 0;
      records.push({
        id: `ATT${id++}`, employeeId: emp.id, employeeName: emp.name,
        department: emp.department, location: emp.location,
        date: `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,
        checkIn, checkOut, status: st, hours, overtime: hours > 9 ? 1 : 0,
      });
    }
  });
  return records;
}

export const ATTENDANCE = genAttendance();
