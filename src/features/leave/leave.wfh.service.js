import { WFH_REQUESTS } from "./leave.wfh.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getWfhRequests() {
  await delay();
  return WFH_REQUESTS;
}

export async function addWfhRequest(item) {
  await delay();
  return item;
}

export async function updateWfhRequest(id, patch) {
  await delay();
  return patch;
}

export async function removeWfhRequest(id) {
  await delay();
  return id;
}
