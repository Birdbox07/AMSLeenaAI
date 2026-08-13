import { HOLIDAY_DATA } from "./holidays.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getHolidays() {
  await delay();
  return HOLIDAY_DATA;
}
