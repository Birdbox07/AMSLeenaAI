import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TAX_DECLARATIONS } from "../taxdeclaration.mock";
import { getDeclarations, addDeclaration, updateDeclaration } from "../taxdeclaration.service";

// Same pattern as employees/hooks/useEmployeesQuery.js: TanStack Query owns
// the declarations list (server-state), optimistic mutations via
// queryClient.setQueryData with onError rollback + onSettled invalidation.
export const TAX_DECLARATIONS_QUERY_KEY = ["taxDeclarations"];

export function useTaxDeclarationQuery() {
  return useQuery({
    queryKey: TAX_DECLARATIONS_QUERY_KEY,
    queryFn: getDeclarations,
    initialData: TAX_DECLARATIONS, // avoids a loading flash for this mock-data demo
  });
}

export function useTaxDeclarationMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: TAX_DECLARATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData(TAX_DECLARATIONS_QUERY_KEY);
      queryClient.setQueryData(TAX_DECLARATIONS_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(TAX_DECLARATIONS_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TAX_DECLARATIONS_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (declaration) => addDeclaration(declaration),
    ...withOptimisticUpdate((old, declaration) => [declaration, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateDeclaration(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(d => (d.id === id ? { ...d, ...patch } : d))),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
  };
}
