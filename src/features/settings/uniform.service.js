import { UNIFORM_RECORDS } from "./uniform.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getAll() {
  await delay();
  return UNIFORM_RECORDS;
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
