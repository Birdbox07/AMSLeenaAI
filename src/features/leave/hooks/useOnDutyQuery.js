import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ON_DUTY_REQUESTS } from "../leave.onduty.mock";
import { getOnDutyRequests, addOnDutyRequest, updateOnDutyRequest, removeOnDutyRequest } from "../leave.onduty.service";

export const ON_DUTY_QUERY_KEY = ["onDutyRequests"];

export function useOnDutyQuery() {
  return useQuery({
    queryKey: ON_DUTY_QUERY_KEY,
    queryFn: getOnDutyRequests,
    initialData: ON_DUTY_REQUESTS, // avoids a loading flash for this mock-data demo
  });
}

export function useOnDutyMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ON_DUTY_QUERY_KEY });
      const previous = queryClient.getQueryData(ON_DUTY_QUERY_KEY);
      queryClient.setQueryData(ON_DUTY_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(ON_DUTY_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ON_DUTY_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (item) => addOnDutyRequest(item),
    ...withOptimisticUpdate((old, item) => [item, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateOnDutyRequest(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(d => (d.id === id ? { ...d, ...patch } : d))),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => removeOnDutyRequest(id),
    ...withOptimisticUpdate((old, id) => old.filter(d => d.id !== id)),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
    remove: removeMutation.mutate,
  };
}
