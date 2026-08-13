import { seed, genDate } from "../../shared/mock/constants";
import { EMPLOYEES } from "../employees/employees.mock";

export const SLOT_TIMES = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];

export const CONFERENCE_ROOMS = [
  { id:"CR01", name:"Falcon", location:"Mumbai", floor:"3rd Floor", capacity:6, amenities:["TV Screen","Whiteboard"] },
  { id:"CR02", name:"Eagle", location:"Mumbai", floor:"5th Floor", capacity:12, amenities:["Video Conf","Projector","Whiteboard"] },
  { id:"CR03", name:"Phoenix", location:"Delhi", floor:"2nd Floor", capacity:8, amenities:["TV Screen","Video Conf"] },
  { id:"CR04", name:"Griffin", location:"Delhi", floor:"4th Floor", capacity:20, amenities:["Video Conf","Projector","Sound System"] },
  { id:"CR05", name:"Sparrow", location:"Bangalore", floor:"1st Floor", capacity:4, amenities:["Whiteboard"] },
  { id:"CR06", name:"Kestrel", location:"Bangalore", floor:"6th Floor", capacity:10, amenities:["TV Screen","Video Conf","Whiteboard"] },
  { id:"CR07", name:"Hawk", location:"Chennai", floor:"2nd Floor", capacity:6, amenities:["TV Screen"] },
  { id:"CR08", name:"Osprey", location:"Hyderabad", floor:"3rd Floor", capacity:15, amenities:["Video Conf","Projector"] },
  { id:"CR09", name:"Kite", location:"Pune", floor:"1st Floor", capacity:8, amenities:["TV Screen","Whiteboard"] },
];

export function genRoomBookings() {
  const subjects = ["Sprint Planning","Client Call","1:1 Sync","Budget Review","Interview Panel","Town Hall Prep","Design Review","Vendor Meeting"];
  return Array.from({ length: 24 }, (_, i) => {
    const room = CONFERENCE_ROOMS[Math.floor(seed(i*7)*CONFERENCE_ROOMS.length)];
    const emp = EMPLOYEES[Math.floor(seed(i*11)*EMPLOYEES.length)];
    const startHour = 9 + Math.floor(seed(i*13)*8);
    return {
      id: `BKG${i+1}`, roomId: room.id, bookedBy: emp.name,
      date: genDate(Math.floor(seed(i*17)*10) - 5),
      startTime: `${String(startHour).padStart(2,"0")}:00`,
      endTime: `${String(startHour+1).padStart(2,"0")}:00`,
      subject: subjects[i % subjects.length],
    };
  });
}

export const ROOM_BOOKINGS = genRoomBookings();
