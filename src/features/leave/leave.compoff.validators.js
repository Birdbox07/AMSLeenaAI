export function validateCompOffAvailForm(form, balance) {
  const errors = {};
  if (!form.date) errors.date = "Please select a date";
  if (!form.days || Number(form.days) <= 0) errors.days = "Days must be greater than 0";
  if (!form.reason || !form.reason.trim()) errors.reason = "Reason is required";
  if (form.days && Number(form.days) > balance) errors.days = `Insufficient comp-off balance (available: ${balance})`;
  return errors;
}
