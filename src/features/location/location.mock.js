import { seed, genDate, LOCS } from "../../shared/mock/constants";
import { EMPLOYEES, CURRENT_USER, MY_REPORTEES } from "../employees/employees.mock";

// Rough coordinate anchors for the known office locations — used to give
// mock check-ins a plausible lat/long when we're not using a real browser
// geolocation reading.
export const LOCATION_COORDS = {
  Mumbai: { lat: 19.0760, long: 72.8777 },
  Delhi: { lat: 28.7041, long: 77.1025 },
  Bangalore: { lat: 12.9716, long: 77.5946 },
  Chennai: { lat: 13.0827, long: 80.2707 },
  Hyderabad: { lat: 17.3850, long: 78.4867 },
  Pune: { lat: 18.5204, long: 73.8567 },
};

function jitter(n, spread = 0.05) {
  return (seed(n) - 0.5) * spread;
}

export function genLocationCheckIns() {
  // Pool: current user + reportees + a handful of other employees so the
  // list isn't only two people.
  const pool = [
    CURRENT_USER,
    ...MY_REPORTEES,
    ...EMPLOYEES.slice(0, 10),
  ].filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i);

  const statuses = ["Pending", "Approved", "Approved", "Rejected"];
  const records = [];
  let id = 1;
  const count = 25;

  for (let i = 0; i < count; i++) {
    const emp = pool[Math.floor(seed(i * 7) * pool.length)];
    const daysAgo = Math.floor(seed(i * 11) * 20);
    const date = genDate(daysAgo);
    const hour = 9 + Math.floor(seed(i * 13) * 2);
    const min = Math.floor(seed(i * 17) * 59);
    const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const loc = LOCS[Math.floor(seed(i * 19) * LOCS.length)];
    const base = LOCATION_COORDS[loc];
    const lat = +(base.lat + jitter(i * 23)).toFixed(6);
    const long = +(base.long + jitter(i * 29)).toFixed(6);
    const status = statuses[Math.floor(seed(i * 31) * statuses.length)];

    records.push({
      id: `LOC${id++}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date,
      time,
      lat,
      long,
      address: `${loc} — Lat ${lat}, Long ${long}`,
      status,
    });
  }

  // Ensure current user has at least a few of their own history records.
  return records;
}

export const LOCATION_CHECKINS = genLocationCheckIns();
