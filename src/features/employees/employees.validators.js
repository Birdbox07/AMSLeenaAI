export function validateEmployeeForm(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) errors.name = "Please enter a name";
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Please enter a valid email";
  return errors;
}

export function isEmployeeFormValid(form) {
  return Object.keys(validateEmployeeForm(form)).length === 0;
}
