import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";
import { CURRENT_USER, MY_REPORTEES } from "../employees/employees.mock";

// Comp-off ledger: a running list of Credit (earned, e.g. worked a holiday/
// weekly-off) and Debit (availed/consumed) entries per employee. Only
// Approved debit entries count against the running balance — Pending debit
// entries are avail-requests awaiting manager approval (same lifecycle as
// leave requests), Rejected debits never counted.
const CREDIT_REASONS = ["Worked on public holiday", "Worked on weekly-off", "Worked on Sunday support rotation"];
const DEBIT_REASONS = ["Personal work", "Family function", "Half-day errand", "Extended weekend"];

export function genCompOffLedger() {
  const pool = [CURRENT_USER, ...MY_REPORTEES, ...EMPLOYEES.slice(0, 15)];
  const entries = [];
  let id = 1;
  for (let i = 0; i < 30; i++) {
    const emp = pool[Math.floor(seed(i * 5) * pool.length)];
    const isCredit = seed(i * 9) > 0.4 || i < 2;
    const days = seed(i * 13) > 0.7 ? 0.5 : 1;
    const daysAgo = Math.floor(seed(i * 17) * 90);
    const isLastFew = i >= 27; // a couple of pending avail-requests
    const type = isCredit ? "Credit" : "Debit";
    entries.push({
      id: `CO${id++}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date: genDate(daysAgo),
      type,
      days,
      reason: isCredit
        ? CREDIT_REASONS[Math.floor(seed(i * 19) * CREDIT_REASONS.length)]
        : DEBIT_REASONS[Math.floor(seed(i * 23) * DEBIT_REASONS.length)],
      status: isCredit ? "Approved" : (isLastFew ? "Pending" : (seed(i * 29) > 0.2 ? "Approved" : "Rejected")),
      approver: emp.manager,
    });
  }
  return entries;
}

export const COMP_OFF_LEDGER = genCompOffLedger();

// Running balance = sum(Approved/always-approved Credits) - sum(Approved Debits)
export function getCompOffBalance(employeeId, entries) {
  const credits = entries.filter(e => e.employeeId === employeeId && e.type === "Credit").reduce((s, e) => s + e.days, 0);
  const debits = entries.filter(e => e.employeeId === employeeId && e.type === "Debit" && e.status === "Approved").reduce((s, e) => s + e.days, 0);
  return { credits, debits, balance: Math.max(credits - debits, 0) };
}
