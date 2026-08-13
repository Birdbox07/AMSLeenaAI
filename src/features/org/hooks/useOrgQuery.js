import { useQuery } from "@tanstack/react-query";
import { ORG_TREE } from "../org.mock";
import { getOrgTree } from "../org.service";

// Read-only — no CRUD in the Org Hierarchy UI, just a tree render.
export const ORG_QUERY_KEY = ["org", "tree"];

export function useOrgQuery() {
  return useQuery({
    queryKey: ORG_QUERY_KEY,
    queryFn: getOrgTree,
    initialData: ORG_TREE,
  });
}
