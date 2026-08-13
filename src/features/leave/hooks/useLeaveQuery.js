import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LEAVES } from "../leave.mock";
import { getLeaves, addLeave, updateLeave, removeLeave } from "../leave.service";

export const LEAVE_QUERY_KEY = ["leaves"];

export function useLeaveQuery() {
  return useQuery({
    queryKey: LEAVE_QUERY_KEY,
    queryFn: getLeaves,
    initialData: LEAVES, // avoids a loading flash for this mock-data demo
  });
}

export function useLeaveMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: LEAVE_QUERY_KEY });
      const previous = queryClient.getQueryData(LEAVE_QUERY_KEY);
      queryClient.setQueryData(LEAVE_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(LEAVE_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (leave) => addLeave(leave),
    ...withOptimisticUpdate((old, leave) => [leave, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateLeave(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(d => (d.id === id ? { ...d, ...patch } : d))),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => removeLeave(id),
    ...withOptimisticUpdate((old, id) => old.filter(d => d.id !== id)),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
    remove: removeMutation.mutate,
  };
}
