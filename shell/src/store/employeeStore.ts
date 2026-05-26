// Backward-compatibility re-exports for mfe-employee-portfolio.
// That MFE imports { useEmployee, useEmployeeLoading, EmployeeProfile } from 'shell/employeeStore'
// and requires no changes as long as these names are exported here.
export type { EmployeeProfile } from './personStore';
export { useCurrentEmployee as useEmployee, useIsLoadingPerson as useEmployeeLoading } from './personStore';
