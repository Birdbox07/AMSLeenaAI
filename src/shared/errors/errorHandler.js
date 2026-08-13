import { toast } from "sonner";

// Central place every error in the app funnels through — the axios response
// interceptor (api.js), TanStack Query's global QueryCache/MutationCache
// onError, and the ErrorBoundary's componentDidCatch all call this instead of
// each call site rolling its own try/catch + toast.
export function handleError(error, context) {
  const message = normalizeErrorMessage(error);
  console.error(context ? `[${context}]` : "[error]", error);
  toast.error(message);
  return message;
}

export function normalizeErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}
