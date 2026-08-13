import { LOCATION_CHECKINS } from "./location.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getCheckIns() {
  await delay();
  return LOCATION_CHECKINS;
}

export async function addCheckIn(checkIn) {
  await delay();
  return checkIn;
}

export async function updateCheckIn(id, patch) {
  await delay();
  return patch;
}
