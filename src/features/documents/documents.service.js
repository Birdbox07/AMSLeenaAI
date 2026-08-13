import { DOCUMENTS } from "./documents.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getDocuments() {
  await delay();
  return DOCUMENTS;
}

export async function addDocument(doc) {
  await delay();
  return doc;
}

export async function updateDocument(id, patch) {
  await delay();
  return patch;
}

export async function removeDocument(id) {
  await delay();
  return id;
}
