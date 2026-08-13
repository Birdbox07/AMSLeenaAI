import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FEEDBACK_LOG } from "../feedback.mock";
import { getAll, add } from "../feedback.service";

// Append-only log of employee feedback submissions — replaces the old
// zustand feedback.store.js.
export const FEEDBACK_QUERY_KEY = ["feedback"];

export function useFeedbackQuery() {
  return useQuery({
    queryKey: FEEDBACK_QUERY_KEY,
    queryFn: getAll,
    initialData: FEEDBACK_LOG, // avoids a loading flash for this mock-data demo
  });
}

export function useFeedbackMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (item) => add(item),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: FEEDBACK_QUERY_KEY });
      const previous = queryClient.getQueryData(FEEDBACK_QUERY_KEY);
      queryClient.setQueryData(FEEDBACK_QUERY_KEY, (old = []) => [...old, item]);
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous) queryClient.setQueryData(FEEDBACK_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEY }),
  });

  return {
    add: addMutation.mutate,
  };
}
