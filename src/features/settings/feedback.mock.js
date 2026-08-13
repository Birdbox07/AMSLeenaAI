import { LOCS } from "../../shared/mock/constants";

// Location-scoped HR feedback recipients (legacy resolved recipients by the
// employee's office location).
export const FEEDBACK_RECIPIENTS = {
  Mumbai: ["Priya HR - Mumbai"],
  Delhi: ["Anjali HR - Delhi"],
  Bangalore: ["Kavya HR - Bangalore", "Suresh HR - Bangalore"],
  Chennai: ["Meera HR - Chennai"],
  Hyderabad: ["Deepa HR - Hyderabad"],
  Pune: ["Nisha HR - Pune", "Rohit HR - Pune"],
};

export function getRecipientsForLocation(location) {
  return FEEDBACK_RECIPIENTS[location] || LOCS.flatMap(l => FEEDBACK_RECIPIENTS[l] || []);
}

// Append-only feedback log — no pre-seeded entries.
export const FEEDBACK_LOG = [];
