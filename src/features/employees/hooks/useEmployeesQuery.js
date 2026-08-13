import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPLOYEES } from "../employees.mock";
import { getEmployees, addEmployee, updateEmployee, removeEmployee } from "../employees.service";

// Reference pattern for this app's "hybrid" data layer: TanStack Query owns
// the server-state (the employee list, fetched via employees.service.js —
// already shaped like a future real API call), while any purely local/UI
// state (filters, selected tab, open modal) stays in plain useState/zustand
// in the page components themselves. Optimistic updates use
// queryClient.setQueryData with an onError rollback, so the UI still updates
// instantly like the old zustand store did — but now through one consistent,
// cache-aware mechanism instead of a hand-rolled store per feature.
export const EMPLOYEES_QUERY_KEY = ["employees"];

export function useEmployeesQuery() {
  return useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: getEmployees,
    initialData: EMPLOYEES, // avoids a loading flash for this mock-data demo
  });
}

export function useEmployeeMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      const previous = queryClient.getQueryData(EMPLOYEES_QUERY_KEY);
      queryClient.setQueryData(EMPLOYEES_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(EMPLOYEES_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (employee) => addEmployee(employee),
    ...withOptimisticUpdate((old, employee) => [employee, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateEmployee(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(e => (e.id === id ? { ...e, ...patch } : e))),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => removeEmployee(id),
    ...withOptimisticUpdate((old, id) => old.filter(e => e.id !== id)),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
    remove: removeMutation.mutate,
  };
}
