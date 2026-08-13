import { DEPTS, seed, genDate } from "../../shared/mock/constants";

export const POLICY_NAMES = [
  "Work From Home Policy","Leave Policy","Code of Conduct","IT Security Policy","Anti-Harassment Policy",
  "Travel & Expense Policy","Performance Management","Onboarding Policy","Data Privacy Policy","Social Media Policy",
  "Attendance & Punctuality","Dress Code Policy","Grievance Redressal","Compensation & Benefits","Health & Safety",
  "Recruitment Policy","Training & Development","Exit Policy","Asset Management","Whistleblower Policy"
];

export function genPolicies() {
  return POLICY_NAMES.map((name, i) => ({
    id: `POL${i+1}`, policyName: name,
    department: i < 8 ? "All" : DEPTS[i % DEPTS.length],
    category: ["HR","IT","Finance","Operations","Compliance"][i % 5],
    version: `v${Math.floor(seed(i*7)*3)+1}.${Math.floor(seed(i*11)*9)}`,
    effectiveDate: genDate(Math.floor(seed(i*13)*500)+30),
    status: seed(i*17) > 0.15 ? "Active" : "Archived",
  }));
}

export const POLICIES = genPolicies();
