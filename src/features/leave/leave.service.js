import { LEAVES } from "./leave.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getLeaves() {
  await delay();
  return LEAVES;
}

export async function addLeave(leave) {
  await delay();
  return leave;
}

export async function updateLeave(id, patch) {
  await delay();
  return patch;
}

export async function removeLeave(id) {
  await delay();
  return id;
}
