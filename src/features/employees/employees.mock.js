import { DEPTS, LOCS, DESIGS, FIRST_NAMES, LAST_NAMES, seed, genDate } from "../../shared/mock/constants";

export function genEmployees() {
  const names = Array.from({ length: 50 }, (_, i) => {
    const fi = Math.floor(seed(i * 3) * FIRST_NAMES.length);
    const li = Math.floor(seed(i * 7) * LAST_NAMES.length);
    return `${FIRST_NAMES[fi]} ${LAST_NAMES[li]}`;
  });
  return Array.from({ length: 50 }, (_, i) => {
    const name = names[i];
    const di = Math.floor(seed(i * 11) * DEPTS.length);
    const loi = Math.floor(seed(i * 13) * LOCS.length);
    const desi = Math.floor(seed(i * 17) * DESIGS.length);
    const mi = Math.floor(seed(i * 19) * 6);
    const dept = DEPTS[di];
    const statuses = ["Active","Active","Active","Active","Inactive","On Leave"];
    const sts = statuses[Math.floor(seed(i * 23) * statuses.length)];
    return {
      id: `EMP${String(i + 1).padStart(3,"0")}`,
      empCode: `AMS${String(1000 + i + 1)}`,
      name,
      designation: DESIGS[desi],
      department: dept,
      email: `${name.toLowerCase().replace(" ",".")}@company.com`,
      mobile: `+91 ${Math.floor(seed(i*29)*9000000000 + 6000000000)}`,
      manager: i === 0 ? "Board of Directors" : i < 6 ? `${names[0]} (CEO)` : names[mi],
      status: sts,
      location: LOCS[loi],
      joinDate: genDate(Math.floor(seed(i*31) * 1800 + 90)),
    };
  });
}

// Seed array — the source of truth used by other features' one-off derived
// lookups (attendance generation, MY_REPORTEES, etc). Live edits go through
// employees.store.js instead.
export const EMPLOYEES = genEmployees();
export const CURRENT_USER = EMPLOYEES[1];
export const MY_REPORTEES = EMPLOYEES.filter(e => e.manager === CURRENT_USER.name);

export function getReportingChain(emp) {
  const chain = [];
  let managerName = emp.manager;
  let guard = 0;
  while (managerName && guard < 10) {
    chain.push(managerName);
    if (managerName === "Board of Directors") break;
    const cleanName = managerName.replace(/\s*\(.*\)$/, "");
    const mgr = EMPLOYEES.find(e => e.name === cleanName);
    if (!mgr) break;
    managerName = mgr.manager;
    guard++;
  }
  return chain;
}
