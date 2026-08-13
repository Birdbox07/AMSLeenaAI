export function validateShiftChangeForm(form) {
  const errors = {};
  const today = new Date().toISOString().split("T")[0];
  if (!form.requestedShift) errors.requestedShift = "New shift is required";
  else if (form.requestedShift === form.currentShift) errors.requestedShift = "Choose a different shift";
  if (!form.effectiveDate) errors.effectiveDate = "Effective date is required";
  else if (form.effectiveDate < today) errors.effectiveDate = "Effective date cannot be in the past";
  if (!form.reason || !form.reason.trim()) errors.reason = "Reason is required";
  return errors;
}
