import { SHIFT_CHANGE_REQUESTS } from "./shiftchange.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getShiftChangeRequests() {
  await delay();
  return SHIFT_CHANGE_REQUESTS;
}

export async function addShiftChangeRequest(req) {
  await delay();
  return req;
}

export async function updateShiftChangeRequest(id, patch) {
  await delay();
  return patch;
}
