export function validateApplyLeaveForm(form) {
  const errors = {};
  if (!form.leaveType) errors.leaveType = "Leave type is required";
  if (!form.fromDate || !form.toDate) errors.dates = "Please select from and to dates";
  if (form.fromDate && form.toDate && form.toDate < form.fromDate) errors.dates = "To date cannot be before from date";
  return errors;
}
