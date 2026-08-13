import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TICKETS } from "../servicedesk.mock";
import { getTickets, addTicket, updateTicket, removeTicket } from "../servicedesk.service";

// Same hybrid pattern as employees/hooks/useEmployeesQuery.js: TanStack Query
// owns the ticket list (server-state), fetched via servicedesk.service.js.
// Optimistic updates use queryClient.setQueryData with an onError rollback.
export const SERVICEDESK_QUERY_KEY = ["servicedesk-tickets"];

export function useServiceDeskQuery() {
  return useQuery({
    queryKey: SERVICEDESK_QUERY_KEY,
    queryFn: getTickets,
    initialData: TICKETS, // avoids a loading flash for this mock-data demo
  });
}

export function useServiceDeskMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: SERVICEDESK_QUERY_KEY });
      const previous = queryClient.getQueryData(SERVICEDESK_QUERY_KEY);
      queryClient.setQueryData(SERVICEDESK_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(SERVICEDESK_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: SERVICEDESK_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (ticket) => addTicket(ticket),
    ...withOptimisticUpdate((old, ticket) => [ticket, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateTicket(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(t => (t.id === id ? { ...t, ...patch } : t))),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => removeTicket(id),
    ...withOptimisticUpdate((old, id) => old.filter(t => t.id !== id)),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
    remove: removeMutation.mutate,
  };
}
