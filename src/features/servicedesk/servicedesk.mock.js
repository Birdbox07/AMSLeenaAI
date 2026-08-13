import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export const TICKET_CATS = [
  "Admin","Login Issue","Medical Insurance","Payroll/Salary","Provident Fund/PF","Relocation",
  "Access Request/ID Card","Visitor Lunch","Stationery","Repair and Maintenance","Onboarding","IJP",
  "Learning & Development","Statutory Compliance","Talent Management","Performance Management",
  "Prestige Stars","Others",
];

// These 4 categories use a dedicated multi-field form (ported from the legacy
// "Call Register" screens) instead of the generic Category + Sub Category flow.
export const BESPOKE_CATS = ["Access Request/ID Card", "Visitor Lunch", "Stationery", "Repair and Maintenance"];

// Sub Category options for every non-bespoke category (ported from the LEENA
// AI ticketing form). Every list ends in "Others" as a catch-all.
export const SUB_CATEGORIES_BY_CATEGORY = {
  "Admin": ["Seating Arrangement", "Access Card", "Housekeeping", "Courier/Dispatch", "Others"],
  "Login Issue": ["Password Reset", "Account Locked", "MFA/OTP Issue", "Portal Access", "Others"],
  "Medical Insurance": ["Calculation query", "Cashless Claim", "Coverage", "Eligibility GMC and GPA", "Hospitalization", "Login issue", "Others"],
  "Payroll/Salary": ["Notice period - F&F", "Payslip", "Previous Income declaration", "Relieving Letter", "Salary calculation", "Tax slip", "Taxation and Investment declaration", "Others"],
  "Provident Fund/PF": ["PF Withdrawal", "UAN Query", "Balance Query", "Transfer Request", "Others"],
  "Relocation": ["Relocation Request", "Reimbursement Query", "Documentation", "Others"],
  "Onboarding": ["Identity Card/Business Card", "Induction", "Joining document updation", "Joining Formalities", "New Laptop Request", "Others"],
  "IJP": ["Job Posting Query", "Application Status", "Eligibility Criteria", "Others"],
  "Learning & Development": ["Course Enrollment", "Certification Reimbursement", "Training Calendar", "Others"],
  "Statutory Compliance": ["PT Query", "ESIC Query", "TDS Query", "Others"],
  "Talent Management": ["Succession Planning", "Internal Transfer", "Skill Assessment", "Others"],
  "Performance Management": ["Goal Setting", "Appraisal Cycle", "Rating Dispute", "Others"],
  "Prestige Stars": ["Nomination", "Award Query", "Points Redemption", "Others"],
  "Others": ["General Query", "Feedback", "Others"],
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
