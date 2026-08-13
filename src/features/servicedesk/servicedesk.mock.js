import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export const TICKET_CATS = [
  "Admin","Login Issue","Medical Insurance","Payroll/Salary","Provident Fund/PF","Relocation",
  "Access Request/ID Card","Visitor Lunch","Stationery","Repair and Maintenance","Onboarding","IJP",
  "Learning & Development","Statutory Compliance","Talent Management","Performance Management",
  "Prestige Stars","Others",
];
export const TICKET_SUBJECTS = [
  "Laptop not turning on","VPN access issue","Salary discrepancy","New software installation",
  "Office chair replacement","Travel reimbursement pending","ID card lost","Policy clarification needed",
  "Email not working","Printer setup required","Password reset","Leave balance incorrect",
];

export function genTickets() {
  const agents = ["Suresh IT","Anjali HR","Vikram Finance","Meera Admin"];
  return Array.from({ length: 60 }, (_, i) => {
    const emp = EMPLOYEES[Math.floor(seed(i*7)*EMPLOYEES.length)];
    const pris = ["Low","Medium","Medium","High","Critical"];
    const sts = ["Open","In Progress","In Progress","Resolved","Closed"];
    return {
      id: `TKT${i+1}`, ticketNumber: `TKT${String(10001+i)}`,
      employeeId: emp.id, employeeName: emp.name, category: TICKET_CATS[i%TICKET_CATS.length],
      priority: pris[Math.floor(seed(i*11)*pris.length)],
      status: sts[Math.floor(seed(i*13)*sts.length)],
      assignedTo: agents[Math.floor(seed(i*17)*agents.length)],
      createdDate: genDate(Math.floor(seed(i*19)*60)),
      subject: TICKET_SUBJECTS[i%TICKET_SUBJECTS.length],
    };
  });
}

export const TICKETS = genTickets();
