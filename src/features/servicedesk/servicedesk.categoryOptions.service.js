import {
  ID_CARD_REQUEST_TYPES, LUNCH_REQUEST_TYPES, REPAIR_ITEMS, FLOORS,
  STATIONARY_UNITS, STATIONARY_CATEGORIES, STATIONARY_CATEGORY_ITEMS,
} from "./servicedesk.categoryOptions.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getServiceDeskCategoryOptions() {
  await delay();
  return {
    idCardRequestTypes: ID_CARD_REQUEST_TYPES,
    lunchRequestTypes: LUNCH_REQUEST_TYPES,
    repairItems: REPAIR_ITEMS,
    floors: FLOORS,
    stationaryUnits: STATIONARY_UNITS,
    stationaryCategories: STATIONARY_CATEGORIES,
    stationaryCategoryItems: STATIONARY_CATEGORY_ITEMS,
  };
}
