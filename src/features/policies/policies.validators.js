export function validatePolicyForm(form) {
  const errors = {};
  if (!form.policyName || !form.policyName.trim()) errors.policyName = "Policy name is required";
  if (!form.category) errors.category = "Category is required";
  if (!form.department) errors.department = "Department is required";
  if (!form.effectiveDate) errors.effectiveDate = "Effective date is required";
  return errors;
}
