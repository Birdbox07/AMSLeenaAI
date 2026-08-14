// Two years of holiday data (current + previous) so the year toggle on the
// Holiday Calendar has something real to compare. `day` is derived from
// `date` rather than hand-maintained.
const dayOf = (dateStr) => new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });

const HOLIDAY_TEMPLATES = [
  { name: "New Year's Day", type: "National", location: "All", "2025": "2025-01-01", "2026": "2026-01-01" },
  { name: "Makar Sankranti", type: "Regional", location: "Bangalore,Mumbai", "2025": "2025-01-14", "2026": "2026-01-14" },
  { name: "Republic Day", type: "National", location: "All", "2025": "2025-01-26", "2026": "2026-01-26" },
  { name: "Maha Shivratri", type: "National", location: "All", "2025": "2025-02-26", "2026": "2026-02-15" },
  { name: "Holi", type: "National", location: "All", "2025": "2025-03-14", "2026": "2026-03-04" },
  { name: "Eid ul-Fitr", type: "National", location: "All", "2025": "2025-03-31", "2026": "2026-03-20" },
  { name: "Ram Navami", type: "National", location: "All", "2025": "2025-04-06", "2026": "2026-03-26" },
  { name: "Good Friday", type: "National", location: "All", "2025": "2025-04-18", "2026": "2026-04-03" },
  { name: "Dr. Ambedkar Jayanti", type: "National", location: "All", "2025": "2025-04-14", "2026": "2026-04-14" },
  { name: "Maharashtra Day", type: "Regional", location: "Mumbai,Pune", "2025": "2025-05-01", "2026": "2026-05-01" },
  { name: "Buddha Purnima", type: "National", location: "All", "2025": "2025-05-12", "2026": "2026-05-31" },
  { name: "Eid ul-Adha", type: "National", location: "All", "2025": "2025-06-07", "2026": "2026-05-27" },
  { name: "Muharram", type: "National", location: "All", "2025": "2025-07-06", "2026": "2026-06-16" },
  { name: "Independence Day", type: "National", location: "All", "2025": "2025-08-15", "2026": "2026-08-15" },
  { name: "Janmashtami", type: "National", location: "All", "2025": "2025-08-16", "2026": "2026-09-04" },
  { name: "Ganesh Chaturthi", type: "Regional", location: "Mumbai,Pune,Bangalore", "2025": "2025-08-27", "2026": "2026-09-14" },
  { name: "Gandhi Jayanti", type: "National", location: "All", "2025": "2025-10-02", "2026": "2026-10-02" },
  { name: "Dussehra", type: "National", location: "All", "2025": "2025-10-02", "2026": "2026-10-20" },
  { name: "Diwali", type: "National", location: "All", "2025": "2025-10-20", "2026": "2026-11-08" },
  { name: "Diwali (Padwa)", type: "Regional", location: "Mumbai,Pune", "2025": "2025-10-21", "2026": "2026-11-10" },
  { name: "Guru Nanak Jayanti", type: "National", location: "All", "2025": "2025-11-05", "2026": "2026-11-24" },
  { name: "Christmas Day", type: "National", location: "All", "2025": "2025-12-25", "2026": "2026-12-25" },
];

export function genHolidays() {
  const holidays = [];
  let i = 0;
  for (const t of HOLIDAY_TEMPLATES) {
    for (const year of ["2025", "2026"]) {
      const date = t[year];
      holidays.push({
        id: `H${++i}`, name: t.name, date, day: dayOf(date), type: t.type, location: t.location,
      });
    }
  }
  return holidays;
}

export const HOLIDAY_DATA = genHolidays();
