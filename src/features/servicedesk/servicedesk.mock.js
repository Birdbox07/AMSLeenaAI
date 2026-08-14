import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export const TICKET_CATS = [
  "Admin","Login Issue","Medical Insurance","Payroll/Salary","Provident Fund/PF","Relocation",
  "Access Request/ID Card","Visitor Lunch","Stationery","Repair and Maintenance","Onboarding",
  "Internal Job Posting (IJP)","Learning & Development","Statutory Compliance","Performance Management",
  "Prestige Stars","Talent Management","Others",
];

// These 4 categories use a dedicated multi-field form (ported from the legacy
// "Call Register" screens) instead of the generic Category + Sub Category flow.
export const BESPOKE_CATS = ["Access Request/ID Card", "Visitor Lunch", "Stationery", "Repair and Maintenance"];

// Categories that have no meaningful sub-category breakdown — the Sub
// Category field is hidden/disabled entirely for these two.
export const NO_SUBCATEGORY_CATS = ["Others", "Talent Management"];

// Category -> Sub Category cascading dropdown data, ported verbatim from the
// LEENA AI ticketing form. "Leave" is included for completeness even though
// it isn't one of TICKET_CATS (leave requests go through Leave Management,
// not HR-SUPPORT) — harmless, simply unreachable via the Category dropdown.
export const SUB_CATEGORIES_BY_CATEGORY = {
  "Admin": ["Any admin issue"],
  "Internal Job Posting (IJP)": ["Information update", "Others", "Position availablity at Branches", "Position availablity at Head Office"],
  "Learning & Development": ["Harappa", "iAspire", "Others", "Training"],
  "Leave": ["Attendance Regularization", "Holidays", "Leave Addition/Deletion/Approval", "Leave Balance", "Leave carry forward", "Leave Eligibilty", "Leave summary", "On Duty / Forgot to Swipe", "Others", "Pro rota calculation"],
  "Login Issue": ["AMS Login issue", "Darwin Box Login issue", "iAspire login issue", "PrestigeOne Login issue"],
  "Medical Insurance": ["Add Spouse/Child details", "Calculation query", "Cashless Claim", "Coverage", "Eligibility GMC and GPA", "Hospitalization", "Login issue", "Post Hospitalization", "Room Rent", "Topup"],
  "Onboarding": ["Identity Card/Business Card", "Induction", "Joining document updation", "Joining Formalities", "New Laptop Request", "Others"],
  "Payroll/Salary": ["Bonus and Variable Pay", "Change in Account details", "Exit clerance", "Flexi Benefit Plan", "Form 16", "Full & Final Settlement", "Investment declaration", "Investment proof upload", "LTA Taxfree/Taxable", "Notice period - F&F", "Payslip", "Previous Income declaration", "Relieving Letter", "Salary calculation", "Tax slip", "Taxation and Investment declaration", "UAN and PF"],
  "Performance Management": ["Darwin Box", "Performance Management", "Process Related"],
  "Prestige Stars": ["Darwin Box", "Process Related"],
  "Provident Fund/PF": ["Approval error on PF portal", "PF number", "PF transfer", "UAN", "UAN activation"],
  "Relocation": ["Others", "Relocation expense"],
  "Statutory Compliance": ["Factory Act", "Others", "Shop Act"],
  "Others": [],
  "Talent Management": [],
};

// Bespoke-form option lists (Visitor Lunch, Repair and Maintenance, Access Request/ID Card, Stationery).
export const LUNCH_REQUEST_TYPES = ["Self Lunch", "Guest Lunch", "Team Lunch", "Others"];
export const REPAIR_ITEMS = ["AC", "Chair", "Desk", "Electrical", "Plumbing", "Others"];
export const FLOORS = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor"];
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const STATIONERY_CATEGORIES = ["Writing Instruments", "Paper Products", "Filing & Organization", "Desk Accessories", "Printing Supplies", "Others"];
export const STATIONERY_CATEGORY_ITEMS = {
  "Writing Instruments": ["Pen", "Pencil", "Marker", "Highlighter"],
  "Paper Products": ["A4 Paper", "Notepad", "Sticky Notes", "Register"],
  "Filing & Organization": ["File Folder", "Binder", "Envelope", "Clip Board"],
  "Desk Accessories": ["Stapler", "Tape Dispenser", "Scissors", "Paper Weight"],
  "Printing Supplies": ["Toner Cartridge", "Ink Cartridge", "Printer Paper"],
  "Others": ["Others"],
};
export const STATIONERY_UNITS = ["Piece", "Pack", "Box", "Ream", "Set"];

export const TICKET_SUBJECTS = [
  "Laptop not turning on","VPN access issue","Salary discrepancy","New software installation",
  "Office chair replacement","Travel reimbursement pending","ID card lost","Policy clarification needed",
  "Email not working","Printer setup required","Password reset","Leave balance incorrect",
];

export function genTickets() {
  const agents = ["Suresh IT","Anjali HR","Vikram Finance","Meera Admin"];
  return Array.from({ length: 60 }, (_, i) => {
    const emp = EMPLOYEES[Math.floor(seed(i*7)*EMPLOYEES.length)];
    const sts = ["Open","In Progress","In Progress","Resolved","Closed"];
    return {
      id: `TKT${i+1}`, ticketNumber: `TKT${String(10001+i)}`,
      employeeId: emp.id, employeeName: emp.name, category: TICKET_CATS[i%TICKET_CATS.length],
      status: sts[Math.floor(seed(i*13)*sts.length)],
      assignedTo: agents[Math.floor(seed(i*17)*agents.length)],
      createdDate: genDate(Math.floor(seed(i*19)*60)),
      subject: TICKET_SUBJECTS[i%TICKET_SUBJECTS.length],
    };
  });
}

export const TICKETS = genTickets();
