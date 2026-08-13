import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { COMP_OFF_LEDGER } from "../leave.compoff.mock";
import { getCompOffEntries, addCompOffEntry, updateCompOffEntry, removeCompOffEntry } from "../leave.compoff.service";

export const COMP_OFF_QUERY_KEY = ["compOffEntries"];

export function useCompOffQuery() {
  return useQuery({
    queryKey: COMP_OFF_QUERY_KEY,
    queryFn: getCompOffEntries,
    initialData: COMP_OFF_LEDGER, // avoids a loading flash for this mock-data demo
  });
}

export function useCompOffMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: COMP_OFF_QUERY_KEY });
      const previous = queryClient.getQueryData(COMP_OFF_QUERY_KEY);
      queryClient.setQueryData(COMP_OFF_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(COMP_OFF_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: COMP_OFF_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (entry) => addCompOffEntry(entry),
    ...withOptimisticUpdate((old, entry) => [entry, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateCompOffEntry(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(d => (d.id === id ? { ...d, ...patch } : d))),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => removeCompOffEntry(id),
    ...withOptimisticUpdate((old, id) => old.filter(d => d.id !== id)),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
    remove: removeMutation.mutate,
  };
}
