const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRAN_REGEX = /^[0-9]{12}$/;
const COMPANY_EMAIL_DOMAIN = "@company.com";

export const SECTION_80C_FIELDS = [
  { key: "epfVpf", label: "EPF / VPF" },
  { key: "ppf", label: "PPF" },
  { key: "lifeInsurance", label: "Life Insurance Premium" },
  { key: "elss", label: "ELSS" },
  { key: "nsc", label: "NSC" },
  { key: "homeLoanPrincipal", label: "Home Loan Principal" },
  { key: "tuitionFees", label: "Tuition Fees" },
  { key: "fixedDeposit5yr", label: "Fixed Deposit (5yr)" },
];

export function computeSection80CTotal(form) {
  const s = form.section80C || {};
  return SECTION_80C_FIELDS.reduce((sum, f) => sum + (Number(s[f.key]) || 0), 0);
}

export function computeDeductionsTotal(form) {
  if (form.regime !== "Old") return 0;
  const section80CTotal = computeSection80CTotal(form);
  const housingLoanInterest = Number(form.housingLoanInterest) || 0;
  const otherDeductions = Number(form.otherDeductions) || 0;
  return section80CTotal + housingLoanInterest + otherDeductions;
}

export function computeSummary(form) {
  const monthlyRent = Number(form.monthlyRent) || 0;
  const annualRent = monthlyRent * 12;
  const basicPct = Number(form.npsContributionPct) || 0;
  const ltaPct = form.ltaOpted ? (Number(form.ltaPct) || 0) : 0;
  return {
    regime: form.regime,
    pan: form.pan,
    npsEnrolled: !!form.npsEnrolled,
    npsContributionPct: form.npsEnrolled ? basicPct : 0,
    annualRent: form.regime === "Old" ? annualRent : 0,
    ltaPct,
    section80CTotal: form.regime === "Old" ? computeSection80CTotal(form) : 0,
    housingLoanInterest: form.regime === "Old" ? (Number(form.housingLoanInterest) || 0) : 0,
    otherDeductions: form.regime === "Old" ? (Number(form.otherDeductions) || 0) : 0,
    otherDeductionsLabel: form.otherDeductionsLabel || "",
    totalDeductions: computeDeductionsTotal(form),
  };
}

export function validateDeclaration(form) {
  const errors = {};

  if (!form.regime) errors.regime = "Please select a tax regime";

  if (!form.pan || !PAN_REGEX.test(form.pan.trim().toUpperCase())) {
    errors.pan = "PAN must be in format ABCDE1234F";
  }

  // NPS
  if (form.npsEnrolled === undefined || form.npsEnrolled === null) {
    errors.npsEnrolled = "Please indicate NPS enrollment";
  }

  if (form.npsEnrolled) {
    if (form.npsExistingSubscriber === undefined || form.npsExistingSubscriber === null) {
      errors.npsExistingSubscriber = "Please indicate if you are an existing NPS subscriber";
    }

    const pct = Number(form.npsContributionPct);
    if (form.npsContributionPct === "" || form.npsContributionPct === undefined || form.npsContributionPct === null || Number.isNaN(pct)) {
      errors.npsContributionPct = "% of Basic contribution is required";
    } else if (pct < 0 || pct > 100) {
      errors.npsContributionPct = "Must be between 0 and 100";
    }

    if (form.npsType === "Active" && !form.npsInvestmentOption) {
      errors.npsInvestmentOption = "Investment option is required for Active NPS";
    }

    if (form.npsExistingSubscriber === false) {
      if (!form.npsPran || !PRAN_REGEX.test(String(form.npsPran).trim())) {
        errors.npsPran = "PRAN must be exactly 12 digits";
      }
      if (!form.npsFundManager) {
        errors.npsFundManager = "Please select a fund manager";
      }
      const email = (form.npsPersonalEmail || "").trim().toLowerCase();
      if (!email || !EMAIL_REGEX.test(email)) {
        errors.npsPersonalEmail = "A valid personal email is required";
      } else if (email.endsWith(COMPANY_EMAIL_DOMAIN)) {
        errors.npsPersonalEmail = `Please use a personal email, not your ${COMPANY_EMAIL_DOMAIN} address`;
      }
    }
  }

  // Old regime deduction fields
  if (form.regime === "Old") {
    const rent = Number(form.monthlyRent) || 0;
    if (rent * 12 > 100000) {
      if (!form.landlordPan || !PAN_REGEX.test(form.landlordPan.trim().toUpperCase())) {
        errors.landlordPan = "Landlord PAN must be in format ABCDE1234F";
      }
      if (!form.landlordName || !form.landlordName.trim()) {
        errors.landlordName = "Landlord name is required";
      }
      if (!form.houseAddress || !form.houseAddress.trim()) {
        errors.houseAddress = "House address is required";
      }
    }

    if (form.ltaOpted) {
      const ltaPct = Number(form.ltaPct);
      if (form.ltaPct === "" || form.ltaPct === undefined || form.ltaPct === null || Number.isNaN(ltaPct)) {
        errors.ltaPct = "% of Basic for LTA is required";
      } else if (ltaPct < 0 || ltaPct > 100) {
        errors.ltaPct = "Must be between 0 and 100";
      }
    }

    if (form.housingLoanInterest !== "" && form.housingLoanInterest !== undefined && form.housingLoanInterest !== null) {
      const hli = Number(form.housingLoanInterest);
      if (Number.isNaN(hli) || hli < 0) {
        errors.housingLoanInterest = "Must be a valid non-negative amount";
      }
    }

    const otherDed = Number(form.otherDeductions) || 0;
    if (otherDed > 0 && (!form.otherDeductionsLabel || !form.otherDeductionsLabel.trim())) {
      errors.otherDeductionsLabel = "Please describe this deduction";
    }
  }

  if (!form.termsAccepted) {
    errors.termsAccepted = "You must accept the Terms & Conditions";
  }

  return errors;
}

// Field groupings per wizard step, used for per-step validation before advancing.
const STEP_FIELDS = {
  1: ["pan"],
  2: ["regime"],
  3: ["npsEnrolled", "npsExistingSubscriber", "npsContributionPct", "npsInvestmentOption", "npsPran", "npsFundManager", "npsPersonalEmail"],
  4: ["landlordPan", "landlordName", "houseAddress", "ltaPct", "housingLoanInterest", "otherDeductionsLabel"],
  5: ["termsAccepted"],
};

/**
 * Validate only the fields relevant to a given wizard step (1-5), so the wizard
 * can block "Next" on the current step without needing the whole form to be valid yet.
 */
export function validateStep(step, form) {
  const allErrors = validateDeclaration(form);
  const fields = STEP_FIELDS[step] || [];
  const errors = {};
  for (const key of fields) {
    if (allErrors[key]) errors[key] = allErrors[key];
  }
  return errors;
}
