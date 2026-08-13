const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(v) {
  return !v || (DATE_RE.test(v) && !isNaN(new Date(v).getTime()));
}

export function validateFamilyForm(form) {
  const errors = {};
  if (!isValidDate(form.fatherDob)) errors.fatherDob = "Please enter a valid date (YYYY-MM-DD)";
  if (!isValidDate(form.motherDob)) errors.motherDob = "Please enter a valid date (YYYY-MM-DD)";

  if (form.maritalStatus === "Married") {
    if (!form.spouseName || !form.spouseName.trim()) errors.spouseName = "Please enter spouse name";
    if (!isValidDate(form.spouseDob)) errors.spouseDob = "Please enter a valid date (YYYY-MM-DD)";
  }

  (form.children || []).forEach((c, i) => {
    if (c && (c.name || c.dob) && !isValidDate(c.dob)) {
      errors[`child${i}Dob`] = "Please enter a valid date (YYYY-MM-DD)";
    }
  });

  return errors;
}

export function isFamilyFormValid(form) {
  return Object.keys(validateFamilyForm(form)).length === 0;
}
