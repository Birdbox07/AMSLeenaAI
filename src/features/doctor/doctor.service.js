import { APPOINTMENTS } from "./doctor.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

// Mutates APPOINTMENTS in place (see doctor.mock.js) so booking/cancelling
// survives the post-mutation refetch, same deviation as conference.service.js.
export async function getAppointments() {
  await delay();
  return APPOINTMENTS;
}

export async function addAppointment(appt) {
  await delay();
  APPOINTMENTS.unshift(appt);
  return appt;
}

export async function cancelAppointment(id) {
  await delay();
  const idx = APPOINTMENTS.findIndex(a => a.id === id);
  if (idx !== -1) APPOINTMENTS[idx] = { ...APPOINTMENTS[idx], status: "Cancelled" };
  return id;
}
