import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DOCUMENTS } from "../documents.mock";
import { getDocuments, addDocument, updateDocument, removeDocument } from "../documents.service";

// Same pattern as employees/hooks/useEmployeesQuery.js: TanStack Query owns
// the documents list (server-state), optimistic mutations via
// queryClient.setQueryData with onError rollback + onSettled invalidation.
export const DOCUMENTS_QUERY_KEY = ["documents"];

export function useDocumentsQuery() {
  return useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: getDocuments,
    initialData: DOCUMENTS, // avoids a loading flash for this mock-data demo
  });
}

export function useDocumentMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      const previous = queryClient.getQueryData(DOCUMENTS_QUERY_KEY);
      queryClient.setQueryData(DOCUMENTS_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(DOCUMENTS_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (doc) => addDocument(doc),
    ...withOptimisticUpdate((old, doc) => [doc, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateDocument(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(d => (d.id === id ? { ...d, ...patch } : d))),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => removeDocument(id),
    ...withOptimisticUpdate((old, id) => old.filter(d => d.id !== id)),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
    remove: removeMutation.mutate,
  };
}
