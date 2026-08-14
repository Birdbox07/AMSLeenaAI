export function validateBookingForm(form) {
  const errors = {};
  if (!form.roomId) errors.roomId = "Please select a room";
  if (!form.date) errors.date = "Please select a date";
  if (form.startMin == null) errors.startMin = "Please select a start time";
  if (form.endMin == null) errors.endMin = "Please select an end time";
  if (form.startMin != null && form.endMin != null && form.endMin <= form.startMin) {
    errors.endMin = "End time must be after start time";
  }
  if (!form.purpose || !form.purpose.trim()) errors.purpose = "Please enter a purpose";
  else if (form.purpose.trim().length > 50) errors.purpose = "Purpose must be 50 characters or fewer";
  if (!form.attendees || Number(form.attendees) <= 0) errors.attendees = "Please enter the number of attendees";
  if (!form.breakfast) errors.breakfast = "Please select a breakfast option";
  if (!form.tea) errors.tea = "Please select a tea option";
  if (!form.lunch) errors.lunch = "Please select a lunch option";
  return errors;
}

// Two bookings on the same room/date conflict if their [startMin, endMin) ranges overlap.
export function hasBookingConflict(bookings, { roomId, date, startMin, endMin, excludeId }) {
  return bookings.some(b =>
    b.roomId === roomId && b.date === date && b.id !== excludeId &&
    startMin < b.endMin && endMin > b.startMin
  );
}

export function isPastSlot(dateStr, startMin, todayStr, nowMinutes) {
  if (dateStr < todayStr) return true;
  if (dateStr === todayStr) return startMin < nowMinutes;
  return false;
}
