import { EMPLOYEES } from "../employees/employees.mock";
import { CURRENT_USER } from "../employees/employees.mock";

export const NPS_OPTIONS = ["Conservative", "Moderate", "Aggressive"];
export const FUND_MANAGERS = ["HDFC Pension", "ICICI Pension", "SBI Pension", "LIC Pension"];

export const CURRENT_FY = (() => {
  const now = new Date();
  const y = now.getFullYear();
  // Indian FY: Apr - Mar. If month (0-indexed) >= 3 (April) it's y-(y+1), else (y-1)-y.
  return now.getMonth() >= 3 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
})();

function findEmployee(name) {
  return EMPLOYEES.find(e => e.name === name);
}

export function genDeclarations() {
  const declarations = [];

  // 1. A pre-existing declaration for CURRENT_USER (Old regime, with rent + 80C + NPS existing subscriber)
  declarations.push({
    id: "TD1",
    employeeId: CURRENT_USER.id,
    employeeName: CURRENT_USER.name,
    financialYear: CURRENT_FY,
    regime: "Old",
    pan: "ABCDE1234F",
    npsEnrolled: true,
    npsExistingSubscriber: true,
    npsType: "Active",
    npsContributionPct: 10,
    npsInvestmentOption: "Moderate",
    npsPran: "",
    npsFundManager: "",
    npsPersonalEmail: "",
    monthlyRent: 15000,
    landlordPan: "PQRSX5678L",
    landlordName: "Ramesh Kohli",
    houseAddress: "12 MG Road, Bangalore",
    ltaOpted: true,
    ltaPct: 8,
    section80C: {
      epfVpf: 45000,
      ppf: 20000,
      lifeInsurance: 15000,
      elss: 10000,
      nsc: 0,
      homeLoanPrincipal: 0,
      tuitionFees: 24000,
      fixedDeposit5yr: 0,
    },
    termsAccepted: true,
    status: "Submitted",
    submittedOn: new Date().toISOString().split("T")[0],
  });

  // 2-3. Declarations for two other (non-current-user) employees, one Old, one New regime
  const others = EMPLOYEES.filter(e => e.id !== CURRENT_USER.id).slice(0, 2);
  if (others[0]) {
    const emp = others[0];
    declarations.push({
      id: "TD2",
      employeeId: emp.id,
      employeeName: emp.name,
      financialYear: CURRENT_FY,
      regime: "Old",
      pan: "BCDEF2345G",
      npsEnrolled: false,
      npsExistingSubscriber: false,
      npsType: "",
      npsContributionPct: 0,
      npsInvestmentOption: "",
      npsPran: "",
      npsFundManager: "",
      npsPersonalEmail: "",
      monthlyRent: 5000,
      landlordPan: "",
      landlordName: "",
      houseAddress: "",
      ltaOpted: false,
      ltaPct: 0,
      section80C: {
        epfVpf: 30000, ppf: 0, lifeInsurance: 8000, elss: 0, nsc: 0,
        homeLoanPrincipal: 0, tuitionFees: 0, fixedDeposit5yr: 0,
      },
      termsAccepted: true,
      status: "Submitted",
      submittedOn: new Date().toISOString().split("T")[0],
    });
  }
  if (others[1]) {
    const emp = others[1];
    declarations.push({
      id: "TD3",
      employeeId: emp.id,
      employeeName: emp.name,
      financialYear: CURRENT_FY,
      regime: "New",
      pan: "CDEFG3456H",
      npsEnrolled: true,
      npsExistingSubscriber: false,
      npsType: "Active",
      npsContributionPct: 5,
      npsInvestmentOption: "Aggressive",
      npsPran: "123456789012",
      npsFundManager: "HDFC Pension",
      npsPersonalEmail: `${emp.name.toLowerCase().replace(" ", ".")}@gmail.com`,
      monthlyRent: 0,
      landlordPan: "",
      landlordName: "",
      houseAddress: "",
      ltaOpted: false,
      ltaPct: 0,
      section80C: {
        epfVpf: 0, ppf: 0, lifeInsurance: 0, elss: 0, nsc: 0,
        homeLoanPrincipal: 0, tuitionFees: 0, fixedDeposit5yr: 0,
      },
      termsAccepted: true,
      status: "Submitted",
      submittedOn: new Date().toISOString().split("T")[0],
    });
  }

  return declarations;
}

export const TAX_DECLARATIONS = genDeclarations();
