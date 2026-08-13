import { useFamilyQuery, useFamilyMutations } from "./useFamilyQuery";

// Lookup by employeeId + CRUD wrappers over the family details query/mutations.
// Kept as a thin wrapper with the original names for drop-in compatibility
// with existing consumers (FamilyDetailsModal.jsx).
export function useFamilyDetails(employeeId) {
  return useFamilyQuery(employeeId);
}

export function useFamilyStoreActions() {
  const { add, update } = useFamilyMutations();
  return { add, update };
}
