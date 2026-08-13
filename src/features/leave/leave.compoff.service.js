import { COMP_OFF_LEDGER } from "./leave.compoff.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getCompOffEntries() {
  await delay();
  return COMP_OFF_LEDGER;
}

export async function addCompOffEntry(entry) {
  await delay();
  return entry;
}

export async function updateCompOffEntry(id, patch) {
  await delay();
  return patch;
}

export async function removeCompOffEntry(id) {
  await delay();
  return id;
}
