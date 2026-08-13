export function validateRegularizationForm(form) {
  const errors = {};
  const today = new Date().toISOString().split("T")[0];
  if (!form.date) errors.date = "Date is required";
  else if (form.date > today) errors.date = "Date cannot be in the future";
  if (!form.session) errors.session = "Session is required";
  if (!form.reason || !form.reason.trim()) errors.reason = "Reason is required";
  return errors;
}

// Client-side duplicate guard: no second Pending request for the same
// employee + date + session.
export function hasDuplicatePendingRequest(requests, employeeId, date, session) {
  return requests.some(r =>
    r.employeeId === employeeId &&
    r.date === date &&
    r.session === session &&
    r.status === "Pending"
  );
}
