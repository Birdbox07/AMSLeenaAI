export function validateApplyLeaveForm(form) {
  const errors = {};
  if (!form.leaveType) { errors.leaveType = "Leave type is required"; return errors; }

  if (form.leaveType === "Forgot to Swipe") {
    if (!form.singleDate) errors.date = "Please select a date";
    if (!form.forgotReason) errors.forgotReason = "Please select a reason";
    return errors;
  }

  if (!form.startDate || !form.endDate) errors.dates = "Please select start and end dates";
  if (form.startDate && form.endDate && form.endDate < form.startDate) errors.dates = "End date cannot be before start date";
  return errors;
}
