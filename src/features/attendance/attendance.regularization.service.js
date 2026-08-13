import { REGULARIZATION_REQUESTS } from "./attendance.regularization.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getRegularizationRequests() {
  await delay();
  return REGULARIZATION_REQUESTS;
}

export async function addRegularizationRequest(req) {
  await delay();
  return req;
}

export async function updateRegularizationRequest(id, patch) {
  await delay();
  return patch;
}
