import { FAMILY_DETAILS } from "./family.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getAll() {
  await delay();
  return FAMILY_DETAILS;
}

export async function add(item) {
  await delay();
  return item;
}

export async function update(id, patch) {
  await delay();
  return patch;
}

export async function remove(id) {
  await delay();
  return id;
}
