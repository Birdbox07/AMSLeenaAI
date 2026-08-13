import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { REGULARIZATION_REQUESTS } from "../attendance.regularization.mock";
import {
  getRegularizationRequests,
  addRegularizationRequest,
  updateRegularizationRequest,
} from "../attendance.regularization.service";

export const REGULARIZATION_QUERY_KEY = ["regularization"];

export function useRegularizationQuery() {
  return useQuery({
    queryKey: REGULARIZATION_QUERY_KEY,
    queryFn: getRegularizationRequests,
    initialData: REGULARIZATION_REQUESTS, // avoids a loading flash for this mock-data demo
  });
}

export function useRegularizationMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: REGULARIZATION_QUERY_KEY });
      const previous = queryClient.getQueryData(REGULARIZATION_QUERY_KEY);
      queryClient.setQueryData(REGULARIZATION_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(REGULARIZATION_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: REGULARIZATION_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (req) => addRegularizationRequest(req),
    ...withOptimisticUpdate((old, req) => [req, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateRegularizationRequest(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(r => (r.id === id ? { ...r, ...patch } : r))),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
  };
}
