import { TAX_DECLARATIONS } from "./taxdeclaration.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getDeclarations() {
  await delay();
  return TAX_DECLARATIONS;
}

export async function addDeclaration(declaration) {
  await delay();
  return declaration;
}

export async function updateDeclaration(id, patch) {
  await delay();
  return patch;
}
