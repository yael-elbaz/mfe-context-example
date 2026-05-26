import type { DigitalService } from '../types/openService';
import { useSelectedPersonStore } from '../store/personStore';
import { useAppContext } from '../store/appContext';

function buildBaseUrl(textNativ: string): string {
  return textNativ.includes('http') ? textNativ : `https://${textNativ}`;
}

async function fetchUrlWithParams(queryParamsUrl: string): Promise<string> {
  const person = useSelectedPersonStore.getState().person;
  const unit = useAppContext.getState().selectedUnit;

  const params = new URLSearchParams({
    employee_id: person?.id ?? '',
    employee_name: person ? `${person.firstName} ${person.lastName}` : '',
    unit_id: unit?.id ?? '',
    unit_name: unit?.name ?? '',
  });

  const res = await fetch(`${queryParamsUrl}?${params}`, { credentials: 'include' });
  const data = await res.json();
  return String(data);
}

async function resolveUrlWithParams(flat: DigitalService & Record<string, any>, baseUrl: string): Promise<string> {
  const person = useSelectedPersonStore.getState().person;
  const unit = useAppContext.getState().selectedUnit;
  const fullName = person ? `${person.firstName} ${person.lastName}` : '';

  const types = flat.objectType ?? [];
  const onlyEmployee = types.length > 0 && types.every((t) => t === 'employee');
  const onlyCustomer = types.length > 0 && types.every((t) => t === 'customer');
  const hasBoth = types.includes('employee') && types.includes('customer');

  if (hasBoth) {
    return flat.QueryParamsUrl ? fetchUrlWithParams(flat.QueryParamsUrl) : baseUrl;
  }

  if (onlyEmployee) {
    return baseUrl
      .replace('[asas]', person?.id ?? '')
      .replace('[ddd]',  fullName)
      .replace('[www]',  unit?.id   ?? '')
      .replace('[aasss]', unit?.name ?? '');
  }

  if (onlyCustomer) {
    return baseUrl
      .replace('[asas]',  person?.id ?? '')
      .replace('[ddd]', fullName)
      .replace('[www]', unit?.id   ?? '')
      .replace('[aasss]', unit?.name ?? '');
  }

  return baseUrl;
}

export async function resolveBlankUrl(flat: DigitalService): Promise<string> {
  const baseUrl = buildBaseUrl(String(flat.textNativ ?? ''));
  return resolveUrlWithParams(flat, baseUrl);
}

export async function openInBlank(flat: DigitalService): Promise<void> {
  const url = await resolveBlankUrl(flat);
  window.open(url, '_blank', String(flat.setup ?? ''));
}
