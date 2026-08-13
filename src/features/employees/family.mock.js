import { EMPLOYEES } from "./employees.mock";
import { FIRST_NAMES, LAST_NAMES, seed, genDate } from "../../shared/mock/constants";

// Generates one family-details record for roughly 1 in every 15-20 employees
// (partial data coverage, matching the legacy system's real-world sparsity).
//
// Consolidated model: the legacy app had two overlapping tables for near-identical
// dependent data (a "family details" table and a separate "Mediclaim insured
// dependents" table, both tracking spouse/children with name+DOB+gender). Here
// they're merged into one record per employee — each dependent (self/spouse/child)
// just carries an `insured` flag for whether they're covered under Mediclaim,
// instead of living in a second duplicate data model.
export const RELATIONSHIP_ORDER = ["Self", "Spouse", "Son", "Daughter", "Other"];

function genName(n) {
  const fi = Math.floor(seed(n * 41) * FIRST_NAMES.length);
  const li = Math.floor(seed(n * 43) * LAST_NAMES.length);
  return `${FIRST_NAMES[fi]} ${LAST_NAMES[li]}`;
}

export function genFamilyDetails() {
  const records = [];
  EMPLOYEES.forEach((emp, i) => {
    // ~1 in 17 employees have a family details record on file
    if (i % 17 !== 3) return;

    const married = seed(i * 53) > 0.35;
    const numChildren = married ? Math.floor(seed(i * 59) * 5) : 0; // 0-4
    const selfInsured = seed(i * 151) > 0.3;

    const children = Array.from({ length: Math.min(numChildren, 4) }, (_, ci) => ({
      name: genName(i * 7 + ci),
      dob: genDate(Math.floor(seed(i * 61 + ci) * 6000) + 1000),
      gender: seed(i * 67 + ci) > 0.5 ? "Male" : "Female",
      insured: selfInsured && seed(i * 157 + ci) > 0.3,
    }));

    records.push({
      id: `FAM${String(i + 1).padStart(3, "0")}`,
      employeeId: emp.id,
      fatherName: genName(i * 71),
      fatherDob: genDate(Math.floor(seed(i * 73) * 8000) + 8000),
      motherName: genName(i * 79),
      motherDob: genDate(Math.floor(seed(i * 83) * 8000) + 7500),
      maritalStatus: married ? "Married" : "Single",
      spouseName: married ? genName(i * 89) : "",
      spouseDob: married ? genDate(Math.floor(seed(i * 97) * 6000) + 6000) : "",
      spouseGender: married ? (seed(i * 101) > 0.5 ? "Male" : "Female") : "",
      spouseInsured: married ? selfInsured && seed(i * 103) > 0.2 : false,
      selfInsured,
      children,
    });
  });
  return records;
}

export const FAMILY_DETAILS = genFamilyDetails();

// Derives the Mediclaim-style insured-dependents view (Self -> Spouse -> Son ->
// Daughter -> Other) from a family-details record, replacing the old separate
// mediclaim data model.
export function getInsuredDependents(record, employeeName) {
  if (!record) return [];
  const list = [];
  if (record.selfInsured) {
    list.push({ relationship: "Self", name: employeeName, dob: "", gender: "", maritalStatus: record.maritalStatus });
  }
  if (record.spouseInsured && record.spouseName) {
    list.push({ relationship: "Spouse", name: record.spouseName, dob: record.spouseDob, gender: record.spouseGender, maritalStatus: "Married" });
  }
  (record.children || []).forEach(c => {
    if (c.insured) {
      list.push({ relationship: c.gender === "Male" ? "Son" : "Daughter", name: c.name, dob: c.dob, gender: c.gender, maritalStatus: "Single" });
    }
  });
  return list.sort((a, b) => RELATIONSHIP_ORDER.indexOf(a.relationship) - RELATIONSHIP_ORDER.indexOf(b.relationship));
}
