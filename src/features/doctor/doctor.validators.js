export function validateAppointmentForm(form) {
  const errors = {};
  if (!form.date) errors.date = "Please select a booking date";
  if (!form.start) errors.start = "Please select an available slot";
  return errors;
}
