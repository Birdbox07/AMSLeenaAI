import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SHIFT_CHANGE_REQUESTS } from "../shiftchange.mock";
import {
  getShiftChangeRequests,
  addShiftChangeRequest,
  updateShiftChangeRequest,
} from "../shiftchange.service";

export const SHIFT_CHANGE_QUERY_KEY = ["shiftChange"];

export function useShiftChangeQuery() {
  return useQuery({
    queryKey: SHIFT_CHANGE_QUERY_KEY,
    queryFn: getShiftChangeRequests,
    initialData: SHIFT_CHANGE_REQUESTS, // avoids a loading flash for this mock-data demo
  });
}

export function useShiftChangeMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: SHIFT_CHANGE_QUERY_KEY });
      const previous = queryClient.getQueryData(SHIFT_CHANGE_QUERY_KEY);
      queryClient.setQueryData(SHIFT_CHANGE_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(SHIFT_CHANGE_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: SHIFT_CHANGE_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (req) => addShiftChangeRequest(req),
    ...withOptimisticUpdate((old, req) => [req, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateShiftChangeRequest(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(r => (r.id === id ? { ...r, ...patch } : r))),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
  };
}
