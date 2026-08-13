import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FAMILY_DETAILS } from "../family.mock";
import { getAll, add, update } from "../family.service";

// One family-details record per employee, keyed by employeeId. Consolidated
// model — see family.mock.js — replacing the old zustand family.store.js.
export const FAMILY_QUERY_KEY = ["family"];

export function useFamilyQuery(employeeId) {
  const query = useQuery({
    queryKey: FAMILY_QUERY_KEY,
    queryFn: getAll,
    initialData: FAMILY_DETAILS, // avoids a loading flash for this mock-data demo
  });

  const record = (query.data || []).find(f => f.employeeId === employeeId) || null;
  return record;
}

export function useFamilyMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: FAMILY_QUERY_KEY });
      const previous = queryClient.getQueryData(FAMILY_QUERY_KEY);
      queryClient.setQueryData(FAMILY_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(FAMILY_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (item) => add(item),
    ...withOptimisticUpdate((old, item) => [...old, item]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => update(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(r => (r.id === id ? { ...r, ...patch } : r))),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
  };
}
