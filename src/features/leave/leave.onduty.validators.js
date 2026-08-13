export function validateOnDutyForm(form) {
  const errors = {};
  if (!form.fromDate || !form.toDate) errors.dates = "Please select from and to dates";
  if (form.fromDate && form.toDate && form.toDate < form.fromDate) errors.dates = "To date cannot be before from date";
  if (!form.reason || !form.reason.trim()) errors.reason = "Reason is required";
  return errors;
}
