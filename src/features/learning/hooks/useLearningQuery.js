import { useQuery } from "@tanstack/react-query";
import { COURSES } from "../learning.mock";
import { getCourses } from "../learning.service";

// Read-only — no progress-update or course CRUD in the Learning Portal UI
// (the "Open course" row action is a toast-only stub, unrelated to this
// data layer; nothing mutates the course list).
export const LEARNING_QUERY_KEY = ["learning", "courses"];

export function useLearningQuery() {
  return useQuery({
    queryKey: LEARNING_QUERY_KEY,
    queryFn: getCourses,
    initialData: COURSES,
  });
}
