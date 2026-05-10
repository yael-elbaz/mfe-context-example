import type { DigitalService } from '../types/openService';
import { OBJECT_TYPE } from '../types/openService';
import { useEmployeeStore } from '../store/employeeStore';
import { useAppContext } from '../store/appContext';

function buildBaseUrl(textNativ: string): string {
  return textNativ.includes('http') ? textNativ : `https://${textNativ}`;
}

function toObjectTypeList(objectType: unknown): number[] {
  if (objectType == null) return [];
  const arr = Array.isArray(objectType) ? objectType : [objectType];
  return arr.map(Number).filter((n) => !isNaN(n));
}

function resolveUrlWithParams(flat: DigitalService & Record<string, any>, baseUrl: string): string {
  const employee = useEmployeeStore.getState().employee;
  const unit = useAppContext.getState().selectedUnit;
  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : '';

  const types = toObjectTypeList(flat.objectType);
  const onlyEmployee = types.length > 0 && types.every((t) => t === OBJECT_TYPE.employee);
  const onlyCustomer = types.length > 0 && types.every((t) => t === OBJECT_TYPE.customer);

  if (onlyEmployee) {
    return baseUrl
      .replace('[asas]', employee?.id ?? '')
      .replace('[ddd]',  fullName)
      .replace('[www]',  unit?.id   ?? '')
      .replace('[aasss]', unit?.name ?? '');
  }

  if (onlyCustomer) {
    return baseUrl
      .replace('[vbg]',  employee?.id ?? '')
      .replace('[sfde]', fullName)
      .replace('[qqqq]', unit?.id   ?? '')
      .replace('[iuyj]', unit?.name ?? '');
  }

  return baseUrl;
}

export function openInBlank(flat: DigitalService): void {
  const baseUrl = buildBaseUrl(String(flat.textNativ ?? ''));
  const resolvedUrl = resolveUrlWithParams(flat, baseUrl);
  window.open(resolvedUrl, '_blank', String(flat.setup ?? ''));
}
