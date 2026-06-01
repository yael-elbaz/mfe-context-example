// Backward-compatibility shim for mfe-employee-portfolio.
// Must contain real function declarations (not just re-export syntax) so the
// federation plugin emits a proper chunk for shell/employeeStore.
import { useCurrentEmployee, useIsLoadingPerson } from './personStore';
export type { EmployeeProfile } from './personStore';

export const useEmployee = () => useCurrentEmployee();
export const useEmployeeLoading = () => useIsLoadingPerson();
