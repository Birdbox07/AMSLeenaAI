import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LOCATION_CHECKINS } from "../location.mock";
import { getCheckIns, addCheckIn, updateCheckIn } from "../location.service";

// Same hybrid pattern as employees/hooks/useEmployeesQuery.js: TanStack Query
// owns the check-in list (server-state), fetched via location.service.js.
// Optimistic updates use queryClient.setQueryData with an onError rollback.
export const LOCATION_QUERY_KEY = ["location-checkins"];

export function useLocationQuery() {
  return useQuery({
    queryKey: LOCATION_QUERY_KEY,
    queryFn: getCheckIns,
    initialData: LOCATION_CHECKINS, // avoids a loading flash for this mock-data demo
  });
}

export function useLocationMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: LOCATION_QUERY_KEY });
      const previous = queryClient.getQueryData(LOCATION_QUERY_KEY);
      queryClient.setQueryData(LOCATION_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(LOCATION_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (checkIn) => addCheckIn(checkIn),
    ...withOptimisticUpdate((old, checkIn) => [checkIn, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateCheckIn(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(c => (c.id === id ? { ...c, ...patch } : c))),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
  };
}
