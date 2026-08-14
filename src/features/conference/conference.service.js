import { BOOKINGS } from "./conference.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

// Unlike most feature services in this app (which resolve a static mock
// array and so lose any add/update/cancel on the next refetch), these
// actually mutate the shared BOOKINGS array in place, so the booking
// calendar keeps working after TanStack Query's post-mutation invalidate.
export async function getBookings() {
  await delay();
  return BOOKINGS;
}

export async function addBooking(booking) {
  await delay();
  BOOKINGS.unshift(booking);
  return booking;
}

export async function updateBooking(id, patch) {
  await delay();
  const idx = BOOKINGS.findIndex(b => b.id === id);
  if (idx !== -1) BOOKINGS[idx] = { ...BOOKINGS[idx], ...patch };
  return patch;
}

export async function cancelBooking(id) {
  await delay();
  const idx = BOOKINGS.findIndex(b => b.id === id);
  if (idx !== -1) BOOKINGS.splice(idx, 1);
  return id;
}
