import { useQuery } from "@tanstack/react-query";
import { HOLIDAY_DATA } from "../holidays.mock";
import { getHolidays } from "../holidays.service";

// Read-only — no CRUD in the Holidays UI (table/calendar views only).
export const HOLIDAYS_QUERY_KEY = ["holidays"];

export function useHolidaysQuery() {
  return useQuery({
    queryKey: HOLIDAYS_QUERY_KEY,
    queryFn: getHolidays,
    initialData: HOLIDAY_DATA,
  });
}
