import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export const CONFERENCE_LOCATIONS = [
  "Bangalore Corporate Office",
  "Banglore Factory",
  "Hosur Unit I",
  "Hosur Unit II",
  "Hosur Unit III",
  "Hosur Unit IV",
];

// Room -> location, inferred from the room names themselves: rooms that
// explicitly name a Hosur unit are scoped to that unit (the "I II & III"
// room is shared across all three), everything else is a floor of the one
// multi-floor building and is scoped to Bangalore Corporate Office. Banglore
// Factory has no dedicated conference room in the supplied list.
export const CONFERENCE_ROOMS_BY_LOCATION = {
  "Bangalore Corporate Office": [
    "First Floor-PUNARVASU-(Meeting Room)",
    "First Floor-RAMANUJAN-(Partition Room)",
    "Ground Floor-(Kanchi Meeting Room)",
    "Ground Floor-TOYAM-(Reception area)",
    "MEDICAL CONSULTANT ROOM 2nd floor",
    "Mezzanine-NALANDA",
    "Second Floor-AMBARAM-(Partition Room)",
    "Second Floor-VAYU-(Meeting Room)",
    "Third Floor-GURUKUL-(Training Room)",
    "Third Floor-MITHILA-(Meeting Room)",
    "Third Floor-PADMAVASINI-(Board Room)",
  ],
  "Banglore Factory": [],
  "Hosur Unit I": ["CONFERENCE ROOM Hosur Unit I II & III"],
  "Hosur Unit II": ["CONFERENCE ROOM Hosur Unit I II & III"],
  "Hosur Unit III": ["CONFERENCE ROOM Hosur Unit I II & III"],
  "Hosur Unit IV": ["CONFERENCE ROOM Hosur Unit IV"],
};

export const MEAL_OPTIONS = ["Not Required", "Required"];

// 8 AM - 8 PM in 15-minute increments, internal unit is minutes since midnight.
export const SLOT_START_MIN = 8 * 60;
export const SLOT_END_MIN = 20 * 60;
export const SLOT_INCREMENT_MIN = 15;

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

const PURPOSES = ["Sprint Planning", "Client Call", "1:1 Sync", "Budget Review", "Interview Panel", "Town Hall Prep", "Design Review", "Vendor Meeting"];

export function genBookings() {
  const bookings = [];
  let i = 0;
  for (const location of CONFERENCE_LOCATIONS) {
    const rooms = CONFERENCE_ROOMS_BY_LOCATION[location];
    for (const room of rooms) {
      const count = 2 + Math.floor(seed(i * 3) * 3);
      for (let n = 0; n < count; n++) {
        const emp = EMPLOYEES[Math.floor(seed(i * 7) * EMPLOYEES.length)];
        const dayOffset = Math.floor(seed(i * 11) * 7) - 2;
        const slotIndex = Math.floor(seed(i * 13) * (TIME_SLOTS.length - 4));
        const span = 1 + Math.floor(seed(i * 17) * 3);
        const start = TIME_SLOTS[slotIndex].start;
        const end = Math.min(SLOT_END_MIN, start + span * SLOT_INCREMENT_MIN);
        bookings.push({
          id: `BKG${i + 1}`, location, room,
          date: genDate(-dayOffset),
          start, end,
          employeeId: emp.id, employeeName: emp.name, contact: emp.mobile, email: emp.email,
          purpose: PURPOSES[i % PURPOSES.length],
          attendees: 2 + Math.floor(seed(i * 19) * 10),
          breakfast: seed(i * 23) > 0.7 ? "Required" : "Not Required",
          tea: seed(i * 29) > 0.5 ? "Required" : "Not Required",
          lunch: seed(i * 31) > 0.7 ? "Required" : "Not Required",
        });
        i++;
      }
    }
  }
  return bookings;
}

// Mutable in-memory store, actually written to by conference.service.js so
// a refetch after add/update/cancel reflects the real current state (unlike
// the read-only MOCK_ARRAY pattern used elsewhere in this app).
export const BOOKINGS = genBookings();
