import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { POLICIES } from "../policies.mock";
import { getPolicies, addPolicy, updatePolicy } from "../policies.service";

export const POLICIES_QUERY_KEY = ["policies"];

export function usePoliciesQuery() {
  return useQuery({
    queryKey: POLICIES_QUERY_KEY,
    queryFn: getPolicies,
    initialData: POLICIES,
  });
}

export function usePolicyMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: POLICIES_QUERY_KEY });
      const previous = queryClient.getQueryData(POLICIES_QUERY_KEY);
      queryClient.setQueryData(POLICIES_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(POLICIES_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: POLICIES_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (policy) => addPolicy(policy),
    ...withOptimisticUpdate((old, policy) => [policy, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updatePolicy(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(p => (p.id === id ? { ...p, ...patch } : p))),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
  };
}
