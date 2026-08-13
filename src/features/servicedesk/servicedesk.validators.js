export function validateNewTicketForm(form) {
  const errors = {};
  if (!form.subject || !form.subject.trim()) errors.subject = "Please enter a subject";
  if (!form.category) errors.category = "Please select a category";
  if (!form.priority) errors.priority = "Please select a priority";
  return errors;
}
