import { useQuery } from "@tanstack/react-query";
import { getServiceDeskCategoryOptions } from "../servicedesk.categoryOptions.service";
import {
  ID_CARD_REQUEST_TYPES, LUNCH_REQUEST_TYPES, REPAIR_ITEMS, FLOORS,
  STATIONARY_UNITS, STATIONARY_CATEGORIES, STATIONARY_CATEGORY_ITEMS,
} from "../servicedesk.categoryOptions.mock";

export const SERVICEDESK_CATEGORY_OPTIONS_QUERY_KEY = ["servicedesk-category-options"];

// initialData mirrors the shape servicedesk.categoryOptions.service.js resolves,
// avoiding a loading flash since this is still mock data (see CLAUDE.md's Data
// layer section) — swap the service body for a real API call when one exists.
const INITIAL_DATA = {
  idCardRequestTypes: ID_CARD_REQUEST_TYPES,
  lunchRequestTypes: LUNCH_REQUEST_TYPES,
  repairItems: REPAIR_ITEMS,
  floors: FLOORS,
  stationaryUnits: STATIONARY_UNITS,
  stationaryCategories: STATIONARY_CATEGORIES,
  stationaryCategoryItems: STATIONARY_CATEGORY_ITEMS,
};

export function useServiceDeskCategoryOptionsQuery() {
  return useQuery({
    queryKey: SERVICEDESK_CATEGORY_OPTIONS_QUERY_KEY,
    queryFn: getServiceDeskCategoryOptions,
    initialData: INITIAL_DATA,
  });
}
