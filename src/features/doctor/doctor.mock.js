import { seed } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

// The visiting doctor holds clinic every Friday, 2:30 PM - 5:30 PM, in
// 15-minute slots (ported from the legacy "Booking Doctor Appointment" form).
export const SLOT_START_MIN = 14 * 60 + 30;
export const SLOT_END_MIN = 17 * 60 + 30;
export const SLOT_INCREMENT_MIN = 15;
export const CLINIC_WEEKDAY = 5; // Friday

export function minutesToLabel(totalMinutes) {
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function buildTimeSlots() {
  const slots = [];
  for (let t = SLOT_START_MIN; t + SLOT_INCREMENT_MIN <= SLOT_END_MIN; t += SLOT_INCREMENT_MIN) {
    slots.push({ start: t, end: t + SLOT_INCREMENT_MIN, label: minutesToLabel(t) });
  }
  return slots;
}

export const TIME_SLOTS = buildTimeSlots();

// Next `count` upcoming clinic (Friday) dates from today, as YYYY-MM-DD.
export function upcomingClinicDates(count = 4) {
  const dates = [];
  const d = new Date();
  while (dates.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === CLINIC_WEEKDAY) dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// The shared Employee model has neither an age nor a gender field yet, so
// (mirroring the same pattern used in settings/uniform.mock.js) both are
// derived deterministically from the employeeId, self-contained to this
// feature, purely to populate the legacy form's read-only fields.
export function deriveAge(employeeId) {
  const n = parseInt(String(employeeId).replace(/\D/g, ""), 10) || 0;
  return 24 + Math.floor(seed(n * 53) * 30);
}
export function deriveGender(employeeId) {
  const n = parseInt(String(employeeId).replace(/\D/g, ""), 10) || 0;
  return seed(n * 41) < 0.5 ? "Male" : "Female";
}

export function genAppointments() {
  const appts = [];
  for (let i = 0; i < 20; i++) {
    const emp = EMPLOYEES[Math.floor(seed(i * 7) * EMPLOYEES.length)];
    const slot = TIME_SLOTS[Math.floor(seed(i * 11) * TIME_SLOTS.length)];
    const d = new Date();
    d.setDate(d.getDate() - (i + 1) * 3);
    appts.push({
      id: `DOC${i + 1}`,
      employeeId: emp.id, employeeName: emp.name, employeeNumber: emp.empCode,
      age: deriveAge(emp.id), department: emp.department, gender: deriveGender(emp.id),
      date: d.toISOString().split("T")[0], start: slot.start, end: slot.end,
      status: "Completed",
    });
  }
  return appts;
}

// Mutable in-memory store, actually written to by doctor.service.js (same
// deviation as conference.service.js) so a booking/cancel survives the
// post-mutation refetch instead of reverting.
export const APPOINTMENTS = genAppointments();
