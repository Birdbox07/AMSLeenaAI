import { DEPTS, seed, genDate } from "../../shared/mock/constants";

export const POLICY_TYPES = ["Company Policies", "HR Policies", "IT Policies"];

// Folder (topic) definitions per policy type, each with the article titles
// that belong to it — drives both the folder-grid view's article counts and
// the generated POLICIES list.
export const POLICY_FOLDERS_BY_TYPE = {
  "HR Policies": {
    "Attendance": ["Attendance & Punctuality Policy"],
    "Holiday": ["Holiday List Policy"],
    "Incentives": ["Sales Incentive Policy", "Referral Bonus Policy"],
    "Insurance": ["Medical Insurance Policy", "Group Term Life Insurance Policy"],
    "Internal Job Mobility": ["Internal Job Posting (IJP) Policy"],
    "Learning Management": ["Learning & Development Policy"],
    "Leave": ["Leave Policy", "Maternity & Paternity Leave Policy"],
    "Others": ["Employee Code of Conduct", "Grievance Redressal Policy", "Dress Code Policy"],
    "Payroll": ["Payroll Processing Policy"],
    "Payslip": ["Payslip Access Policy"],
    "Performance": ["Performance Management Policy", "Probation & Confirmation Policy", "Increment & Promotion Policy", "Performance Improvement Plan (PIP) Policy"],
    "PF": ["Provident Fund Policy"],
    "POSH": ["Prevention of Sexual Harassment (POSH) Policy"],
    "Relocation": ["Employee Relocation Policy"],
    "Salary": ["Salary Structure Policy", "Salary Advance Policy"],
    "Separation Management": ["Exit & Separation Policy"],
    "Travel": ["Domestic Travel Policy", "International Travel Policy"],
    "Vehicle": ["Vehicle & Fuel Reimbursement Policy"],
  },
  "IT Policies": {
    "Access & Security": ["IT Security Policy", "Password & Access Control Policy"],
    "Software & Licensing": ["Software Usage & Licensing Policy"],
    "Data Privacy": ["Data Privacy Policy"],
    "Asset Management": ["IT Asset Management Policy"],
    "Email & Communication": ["Email & Communication Usage Policy"],
    "Remote Access": ["VPN & Remote Access Policy"],
    "Others": ["Acceptable Use Policy"],
  },
  "Company Policies": {
    "Code of Conduct": ["Code of Conduct"],
    "Anti-Harassment": ["Anti-Harassment Policy"],
    "Whistleblower": ["Whistleblower Policy"],
    "Health & Safety": ["Health & Safety Policy"],
    "Social Media": ["Social Media Policy"],
    "Others": ["Employee Handbook"],
  },
};

// Only HR Policies ships with seed documents — IT Policies and Company
// Policies start empty (folders still defined above for the folder grid,
// just with 0 articles) until real documents are added via Add Policy.
export const SEEDED_POLICY_TYPES = ["HR Policies"];

export function genPolicies() {
  const policies = [];
  let i = 0;
  for (const policyType of SEEDED_POLICY_TYPES) {
    const folders = POLICY_FOLDERS_BY_TYPE[policyType];
    for (const [folder, titles] of Object.entries(folders)) {
      for (const policyName of titles) {
        policies.push({
          id: `POL${i + 1}`, policyName, policyType, folder,
          department: i < 10 ? "All" : DEPTS[i % DEPTS.length],
          version: `v${Math.floor(seed(i * 7) * 3) + 1}.${Math.floor(seed(i * 11) * 9)}`,
          effectiveDate: genDate(Math.floor(seed(i * 13) * 500) + 30),
          status: seed(i * 17) > 0.15 ? "Active" : "Archived",
        });
        i++;
      }
    }
  }
  return policies;
}

export const POLICIES = genPolicies();
