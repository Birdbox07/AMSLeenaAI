import { ATTENDANCE } from "./attendance.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

// Attendance has no CRUD in the UI — read-only.
export async function getAttendance() {
  await delay();
  return ATTENDANCE;
}
