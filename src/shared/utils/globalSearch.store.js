import { create } from "zustand";

// Bridges TopNav's global search to a target module's own table search —
// set once on navigation, consumed once on the target page's mount.
export const useGlobalSearchStore = create((set, get) => ({
  pendingQuery: {},

  setPending: (module, query) => {
    set(state => ({ pendingQuery: { ...state.pendingQuery, [module]: query } }));
  },

  consumePending: (module) => {
    const query = get().pendingQuery[module];
    if (query !== undefined) {
      set(state => {
        const next = { ...state.pendingQuery };
        delete next[module];
        return { pendingQuery: next };
      });
    }
    return query;
  },
}));
