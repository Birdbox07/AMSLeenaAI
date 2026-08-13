import { create } from "zustand";
import { CURRENT_USER } from "../../features/employees/employees.mock";
import { getEmployeeRole, roleAtLeast } from "../../features/employees/employees.roles";

// Plain zustand store (not an entity list, so createEntityStore doesn't
// apply) holding the currently *simulated* role for demo purposes — this app
// has no login, so CURRENT_USER never changes; only the simulated permission
// level does. Defaults to CURRENT_USER's naturally-derived role.
export const useRoleStore = create((set) => ({
  simulatedRole: getEmployeeRole(CURRENT_USER),
  setSimulatedRole: (role) => set({ simulatedRole: role }),
}));

export function useSimulatedRole() {
  return useRoleStore(s => s.simulatedRole);
}

export function useRoleActions() {
  return useRoleStore(s => ({ setSimulatedRole: s.setSimulatedRole }));
}

export function useHasRole(minRole) {
  return useRoleStore(s => roleAtLeast(s.simulatedRole, minRole));
}
