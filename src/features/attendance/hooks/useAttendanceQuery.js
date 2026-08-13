import { useQuery } from "@tanstack/react-query";
import { ATTENDANCE } from "../attendance.mock";
import { getAttendance } from "../attendance.service";

export const ATTENDANCE_QUERY_KEY = ["attendance"];

export function useAttendanceQuery() {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEY,
    queryFn: getAttendance,
    initialData: ATTENDANCE,
  });
}

// Attendance has no CRUD UI of its own — the one exception is the WFH
// approval flow (leave.wfh.store.js), which flips an existing record's status
// to "WFH" for approved date ranges. It calls this directly against the
// shared queryClient (see src/shared/api/queryClient.js) rather than going
// through a mutation hook, since there's no component triggering it locally.
export function patchAttendanceRecord(queryClient, id, patch) {
  queryClient.setQueryData(ATTENDANCE_QUERY_KEY, (old = []) => old.map(d => (d.id === id ? { ...d, ...patch } : d)));
}
