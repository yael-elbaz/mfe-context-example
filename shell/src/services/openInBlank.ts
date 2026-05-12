import type { DigitalService } from '../types/openService';
import { OBJECT_TYPE } from '../types/openService';
import { useEmployeeStore } from '../store/employeeStore';
import { useAppContext } from '../store/appContext';

function buildBaseUrl(textNativ: string): string {
  return textNativ.includes('http') ? textNativ : `https://${textNativ}`;
}

function toObjectTypeList(objectType: string | string[] | null | undefined): number[] {
  if (objectType == null) return [];
  const arr = Array.isArray(objectType) ? objectType : [objectType];
  return arr.map(Number).filter((n) => !isNaN(n));
}

async function fetchUrlWithParams(queryParamsUrl: string): Promise<string> {
  const employee = useEmployeeStore.getState().employee;
  const unit = useAppContext.getState().selectedUnit;

  const params = new URLSearchParams({
    employee_id: employee?.id ?? '',
    employee_name: employee ? `${employee.firstName} ${employee.lastName}` : '',
    unit_id: unit?.id ?? '',
    unit_name: unit?.name ?? '',
  });

  const res = await fetch(`${queryParamsUrl}?${params}`, { credentials: 'include' });
  const data = await res.json();
  return String(data);
}

async function resolveUrlWithParams(flat: DigitalService & Record<string, any>, baseUrl: string): Promise<string> {
  const employee = useEmployeeStore.getState().employee;
  const unit = useAppContext.getState().selectedUnit;
  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : '';

  const types = toObjectTypeList(flat.objectType);
  const onlyEmployee = types.length > 0 && types.every((t) => t === OBJECT_TYPE.employee);
  const onlyCustomer = types.length > 0 && types.every((t) => t === OBJECT_TYPE.customer);
  const hasBoth =
    types.some((t) => t === OBJECT_TYPE.employee) &&
    types.some((t) => t === OBJECT_TYPE.customer);

  if (hasBoth) {
    return flat.QueryParamsUrl ? fetchUrlWithParams(flat.QueryParamsUrl) : baseUrl;
  }

  if (onlyEmployee) {
    return baseUrl
      .replace('[asas]', employee?.id ?? '')
      .replace('[ddd]',  fullName)
      .replace('[www]',  unit?.id   ?? '')
      .replace('[aasss]', unit?.name ?? '');
  }

  if (onlyCustomer) {
    return baseUrl
      .replace('[asas]',  employee?.id ?? '')
      .replace('[ddd]', fullName)
      .replace('[www]', unit?.id   ?? '')
      .replace('[aasss]', unit?.name ?? '');
  }

  return baseUrl;
}

export async function openInBlank(flat: DigitalService): Promise<void> {
  const baseUrl = buildBaseUrl(String(flat.textNativ ?? ''));
  const resolvedUrl = await resolveUrlWithParams(flat, baseUrl);
  window.open(resolvedUrl, '_blank', String(flat.setup ?? ''));
}
