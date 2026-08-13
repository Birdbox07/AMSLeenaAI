import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { handleError } from "../errors/errorHandler";

// One shared QueryClient for the whole app. Every feature's query/mutation
// hooks (`use<Feature>Query.js`) use this — errors from ANY query or mutation
// anywhere in the app funnel through the same central handler, so individual
// components never need their own try/catch around a query/mutation failure.
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => handleError(error, query?.queryKey?.join("/") || "query"),
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => handleError(error, mutation?.options?.mutationKey?.join("/") || "mutation"),
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
