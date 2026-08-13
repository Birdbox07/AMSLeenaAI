export function validateCheckIn(form) {
  const errors = {};
  if (form.lat === undefined || form.lat === null || form.lat === "") errors.lat = "Latitude is required";
  if (form.long === undefined || form.long === null || form.long === "") errors.long = "Longitude is required";
  if (!form.address) errors.address = "Address is required";
  return errors;
}
