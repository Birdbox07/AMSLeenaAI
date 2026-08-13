import { ON_DUTY_REQUESTS } from "./leave.onduty.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getOnDutyRequests() {
  await delay();
  return ON_DUTY_REQUESTS;
}

export async function addOnDutyRequest(item) {
  await delay();
  return item;
}

export async function updateOnDutyRequest(id, patch) {
  await delay();
  return patch;
}

export async function removeOnDutyRequest(id) {
  await delay();
  return id;
}
