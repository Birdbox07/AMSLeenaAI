import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

// Working hours the legacy Conference Room Booking screen enforces: 8 AM - 8 PM in 15-min increments.
export const SLOT_START_HOUR = 8;
export const SLOT_END_HOUR = 20;
export const SLOT_INCREMENT_MIN = 15;

// Locations where catering can't be requested for a booking (Breakfast/Tea/Lunch
// lock to "Not Required") - ported from the legacy system's CRPO-only meal
// restriction rule, mapped onto one of this app's own locations.
export const MEAL_RESTRICTED_LOCATIONS = ["Chennai"];

export const MEAL_OPTIONS = ["Not Required", "Required"];

export const CONFERENCE_ROOMS = [
  { id:"CR01", name:"Falcon", location:"Mumbai", floor:"3rd Floor", capacity:6, amenities:["TV Screen","Whiteboard"] },
  { id:"CR02", name:"Eagle", location:"Mumbai", floor:"5th Floor", capacity:12, amenities:["Video Conf","Projector","Whiteboard"] },
  { id:"CR03", name:"Phoenix", location:"Delhi", floor:"2nd Floor", capacity:8, amenities:["TV Screen","Video Conf"] },
  { id:"CR04", name:"Griffin", location:"Delhi", floor:"4th Floor", capacity:20, amenities:["Video Conf","Projector","Sound System"] },
  { id:"CR05", name:"Sparrow", location:"Bangalore", floor:"1st Floor", capacity:4, amenities:["Whiteboard"] },
  { id:"CR06", name:"Kestrel", location:"Bangalore", floor:"6th Floor", capacity:10, amenities:["TV Screen","Video Conf","Whiteboard"] },
  { id:"CR07", name:"Hawk", location:"Chennai", floor:"2nd Floor", capacity:6, amenities:["TV Screen"] },
  { id:"CR08", name:"Merlin", location:"Chennai", floor:"3rd Floor", capacity:10, amenities:["Video Conf","Whiteboard"] },
  { id:"CR09", name:"Osprey", location:"Hyderabad", floor:"3rd Floor", capacity:15, amenities:["Video Conf","Projector"] },
  { id:"CR10", name:"Harrier", location:"Hyderabad", floor:"2nd Floor", capacity:8, amenities:["TV Screen","Whiteboard"] },
  { id:"CR11", name:"Kite", location:"Pune", floor:"1st Floor", capacity:8, amenities:["TV Screen","Whiteboard"] },
  { id:"CR12", name:"Kingfisher", location:"Pune", floor:"2nd Floor", capacity:12, amenities:["Video Conf","Projector"] },
];

export function buildTimeSlots() {
  const slots = [];
  const startMin = SLOT_START_HOUR * 60;
  const endMin = SLOT_END_HOUR * 60;
  for (let t = startMin; t + SLOT_INCREMENT_MIN <= endMin; t += SLOT_INCREMENT_MIN) {
    slots.push({ start: t, end: t + SLOT_INCREMENT_MIN });
  }
  return slots;
}

// One entry per bookable 15-min slot, 08:00 -> 19:45 (48 slots/day).
export const TIME_SLOTS = buildTimeSlots();

export function minutesToLabel(mins) {
  const hh = Math.floor(mins / 60), mm = mins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// Every valid slot-boundary label, 08:00 -> 20:00 (49 labels) - used for both
// the Start Time and End Time selects in the booking modal.
export const TIME_OPTIONS = [...TIME_SLOTS.map(s => s.start), SLOT_END_HOUR * 60].map(minutesToLabel);

export function labelToMinutes(label) {
  const [hh, mm] = label.split(":").map(Number);
  return hh * 60 + mm;
}

export function genRoomBookings() {
  const purposes = ["Sprint Planning","Client Call","1:1 Sync","Budget Review","Interview Panel","Town Hall Prep","Design Review","Vendor Meeting"];
  return Array.from({ length: 30 }, (_, i) => {
    const room = CONFERENCE_ROOMS[Math.floor(seed(i * 7) * CONFERENCE_ROOMS.length)];
    const emp = EMPLOYEES[Math.floor(seed(i * 11) * EMPLOYEES.length)];
    const date = genDate(Math.floor(seed(i * 17) * 10) - 4); // ~4 days future .. ~5 days past
    const slotIdx = Math.floor(seed(i * 13) * (TIME_SLOTS.length - 4));
    const durationSlots = 1 + Math.floor(seed(i * 19) * 4); // 15-60 min
    const startMin = TIME_SLOTS[slotIdx].start;
    const endMin = Math.min(startMin + durationSlots * SLOT_INCREMENT_MIN, SLOT_END_HOUR * 60);
    const restricted = MEAL_RESTRICTED_LOCATIONS.includes(room.location);
    return {
      id: `BKG${i + 1}`, roomId: room.id,
      employeeId: emp.id, employeeName: emp.name, contact: emp.mobile, email: emp.email,
      date, startMin, endMin,
      purpose: purposes[i % purposes.length],
      attendees: 2 + Math.floor(seed(i * 23) * 10),
      breakfast: restricted ? "Not Required" : (seed(i * 29) > 0.7 ? "Required" : "Not Required"),
      tea: restricted ? "Not Required" : (seed(i * 31) > 0.6 ? "Required" : "Not Required"),
      lunch: restricted ? "Not Required" : (seed(i * 37) > 0.75 ? "Required" : "Not Required"),
    };
  });
}

export const ROOM_BOOKINGS = genRoomBookings();
