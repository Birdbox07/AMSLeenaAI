import { ORG_TREE } from "./org.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getOrgTree() {
  await delay();
  return ORG_TREE;
}
