import type { ServiceMeta } from '../types/openService';

export function flattenMeta(
  obj: ServiceMeta,
  result: Record<string, any> = {}
): Record<string, any> {
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === 'object') {
      flattenMeta(value as ServiceMeta, result);
    } else if (key in result) {
      result[key] = Array.isArray(result[key])
        ? [...result[key], value]
        : [result[key], value];
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function resolveRoute(flat: Record<string, any>): { url: string; state: Record<string, any> } {
  switch (flat.type) {
    case 'sherut':
      return {
        url: `/employee-portfolio/sherutim/${flat.idntSheryut}?employeeId=${flat.id ?? ''}`,
        state: {
          mfeConfig: {
            remoteUrl: flat.mfeUrl,
            scope:     flat.mfeScope,
            module:    flat.mfeModule,
          },
        },
      };

    case 'employee':
      return {
        url: `/employee-portfolio?employeeId=${flat.id ?? ''}`,
        state: {},
      };

    case 'section':
      return {
        url: `/employee-portfolio/${flat.sectionId}?employeeId=${flat.employeeId ?? ''}`,
        state: {},
      };

    case 'home':
      return { url: '/', state: {} };

    default:
      throw new Error(`openService: unknown type "${flat.type}"`);
  }
}
