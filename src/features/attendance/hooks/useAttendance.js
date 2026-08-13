import { useAttendanceQuery } from "./useAttendanceQuery";

export function useAttendance() {
  return useAttendanceQuery().data;
}
