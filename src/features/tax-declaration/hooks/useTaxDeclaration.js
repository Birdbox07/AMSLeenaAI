import { useMemo } from "react";
import { useCurrentUser } from "../../employees/hooks/useEmployees";
import { useTaxDeclarationQuery, useTaxDeclarationMutations } from "./useTaxDeclarationQuery";
import { CURRENT_FY } from "../taxdeclaration.mock";

export function useMyDeclaration() {
  const CURRENT_USER = useCurrentUser();
  const { data: items } = useTaxDeclarationQuery();
  return useMemo(
    () => items.find(d => d.employeeId === CURRENT_USER.id && d.financialYear === CURRENT_FY) || null,
    [items, CURRENT_USER]
  );
}

export function useTaxDeclarationActions() {
  const { add, update } = useTaxDeclarationMutations();
  return { add, update };
}
