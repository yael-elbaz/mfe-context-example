// Backward-compatibility shim for mfe-employee-portfolio.
// Uses const assignments (not re-exports) so Rollup creates a real chunk for this module.
import { useCurrentEmployee, useIsLoadingPerson } from './personStore';
export type { EmployeeProfile } from './personStore';

export const useEmployee = useCurrentEmployee;
export const useEmployeeLoading = useIsLoadingPerson;
