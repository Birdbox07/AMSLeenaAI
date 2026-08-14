export function validateBookingForm(form, existingBookings = [], excludeId = null) {
  const errors = {};
  if (!form.location) errors.location = "Please select a location";
  if (!form.room) errors.room = "Please select a room";
  if (!form.date) errors.date = "Please select a date";
  if (!form.purpose || !form.purpose.trim()) errors.purpose = "Enter a purpose";
  if (form.purpose && form.purpose.length > 50) errors.purpose = "Max 50 characters";
  if (!form.attendees || form.attendees <= 0) errors.attendees = "Enter number of attendees";
  if (form.start == null || form.end == null) errors.time = "Please select a time slot";
  if (form.start != null && form.end != null && form.start >= form.end) {
    errors.time = "End time must be after start time";
  }

  if (!errors.time && !errors.location && !errors.room && !errors.date) {
    const overlap = existingBookings.some(b =>
      b.id !== excludeId && b.location === form.location && b.room === form.room && b.date === form.date &&
      form.start < b.end && form.end > b.start
    );
    if (overlap) errors.time = "This room is already booked for part of that time";
  }

  return errors;
}
