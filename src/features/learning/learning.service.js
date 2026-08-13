import { COURSES } from "./learning.mock";

const delay = () => new Promise(r => setTimeout(r, 150));

export async function getCourses() {
  await delay();
  return COURSES;
}
