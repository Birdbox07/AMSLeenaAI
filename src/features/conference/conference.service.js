import { CONFERENCE_ROOMS, ROOM_BOOKINGS } from "./conference.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getRooms() {
  await delay();
  return CONFERENCE_ROOMS;
}

export async function getBookings() {
  await delay();
  return ROOM_BOOKINGS;
}

export async function addBooking(booking) {
  await delay();
  return booking;
}
