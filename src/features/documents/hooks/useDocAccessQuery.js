import { useQuery } from "@tanstack/react-query";
import { DOC_ACCESS } from "../documents.access.mock";
import { getAll } from "../documents.access.service";

// Read-only: one document-panel access record per employee, keyed by
// employeeId. No mutations — this is a gate, not something the UI edits.
export const DOC_ACCESS_QUERY_KEY = ["documentsAccess"];

export function useDocAccessQuery() {
  return useQuery({
    queryKey: DOC_ACCESS_QUERY_KEY,
    queryFn: getAll,
    initialData: DOC_ACCESS, // avoids a loading flash for this mock-data demo
  });
}
