import { DOC_ACCESS } from "./documents.access.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

// Async functions shaped like a future real fetch() call, resolving from
// the mock data module for now.
export async function getAll() {
  await delay();
  return DOC_ACCESS;
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


