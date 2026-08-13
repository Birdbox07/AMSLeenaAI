import { useMemo } from "react";
import { useLocationQuery, useLocationMutations } from "./useLocationQuery";
import { useCurrentUser, useMyReportees } from "../../employees/hooks/useEmployees";

export function useLocationCheckIns() {
  const { data } = useLocationQuery();
  return data;
}

export function useLocationActions() {
  const { add, update } = useLocationMutations();
  return { add, update };
}

// Current user's own check-in history (self-scoped, all statuses).
export function useMyCheckIns() {
  const items = useLocationCheckIns();
  const CURRENT_USER = useCurrentUser();
  return useMemo(
    () => items.filter(c => c.employeeId === CURRENT_USER.id),
    [items, CURRENT_USER]
  );
}

// Pending check-ins from the current user's direct reportees only
// (single-level manager scoping, same convention used across the app).
export function useMyReporteesPendingCheckIns() {
  const items = useLocationCheckIns();
  const MY_REPORTEES = useMyReportees();
  return useMemo(() => {
    const ids = new Set(MY_REPORTEES.map(e => e.id));
    return items.filter(c => ids.has(c.employeeId) && c.status === "Pending");
  }, [items, MY_REPORTEES]);
}
