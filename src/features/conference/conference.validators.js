export function validateBookingForm(form, existingBookings = []) {
  const errors = {};
  if (!form.roomId) errors.roomId = "Please select a room";
  if (!form.date) errors.date = "Please select a date";
  if (!form.subject || !form.subject.trim()) errors.subject = "Meeting subject is required";
  if (!form.startTime || !form.endTime) errors.time = "Please select a time slot";
  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.time = "End time must be after start time";
  }
  if (!errors.time && form.roomId && form.date && form.startTime) {
    const doubleBooked = existingBookings.some(b =>
      b.roomId === form.roomId && b.date === form.date && b.startTime === form.startTime
    );
    if (doubleBooked) errors.time = "This room is already booked at that time";
  }
  return errors;
}
