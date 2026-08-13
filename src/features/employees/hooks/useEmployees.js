import { useEmployeesQuery } from "./useEmployeesQuery";
import { CURRENT_USER, MY_REPORTEES, getReportingChain } from "../employees.mock";

export function useEmployees() {
  return useEmployeesQuery().data;
}

export function useCurrentUser() {
  return CURRENT_USER;
}

export function useMyReportees() {
  return MY_REPORTEES;
}

export { getReportingChain };
