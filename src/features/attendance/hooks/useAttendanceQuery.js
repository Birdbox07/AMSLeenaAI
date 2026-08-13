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

// Attendance has no CRUD UI of its own — read-only, derived from the mock data.
