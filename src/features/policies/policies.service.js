import { POLICIES } from "./policies.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getPolicies() {
  await delay();
  return POLICIES;
}

export async function addPolicy(policy) {
  await delay();
  return policy;
}

export async function updatePolicy(id, patch) {
  await delay();
  return { id, patch };
}
