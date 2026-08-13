import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UNIFORM_RECORDS } from "../uniform.mock";
import { getAll, add } from "../uniform.service";

// Uniform Size Declaration records — one per employee, one-time submit then
// locked/read-only. Replaces the old zustand uniform.store.js.
export const UNIFORM_QUERY_KEY = ["uniform"];

export function useUniformQuery() {
  return useQuery({
    queryKey: UNIFORM_QUERY_KEY,
    queryFn: getAll,
    initialData: UNIFORM_RECORDS, // avoids a loading flash for this mock-data demo
  });
}

export function useUniformMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (item) => add(item),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: UNIFORM_QUERY_KEY });
      const previous = queryClient.getQueryData(UNIFORM_QUERY_KEY);
      queryClient.setQueryData(UNIFORM_QUERY_KEY, (old = []) => [...old, item]);
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous) queryClient.setQueryData(UNIFORM_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: UNIFORM_QUERY_KEY }),
  });

  return {
    add: addMutation.mutate,
  };
}
