import type { Service, ServiceSrc, DigitalService, ResolvedRoute } from '../types/openService';
import { Helper } from '../utils/urlHelper';
import { resolveBlankUrl } from './openInBlank';

function toScalar(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function getSreviceSrcFromSrcParams(
  meta: Service,
  scope: string | string[] | undefined,
  module: string | string[] | undefined
): ServiceSrc | undefined {
  if (!scope && !module) return undefined;
  return {
    remoteUrl: meta.url ?? '',
    scope: scope ?? '',
    module: module ?? '',
    src: meta.url ?? null,
  };
}

export function flattenMeta(meta: Service): DigitalService {
  const params: Record<string, string | string[]> = {};
  for (const p of meta.menuParamsList) {
    if (p.parameterKey in params) {
      const existing = params[p.parameterKey];
      params[p.parameterKey] = Array.isArray(existing)
        ? [...existing, p.parameterValue]
        : [existing, p.parameterValue];
    } else {
      params[p.parameterKey] = p.parameterValue;
    }
  }

  const { scope, module, categories, displaySettings, objectType, ...rest } = params;

  const serviceSrc = getSreviceSrcFromSrcParams(meta, scope, module);

  return {
    ...rest,
    serviceSrc,
    objectType: objectType ?? null,
    textMenu: meta.textMenu,
    textNativ: meta.textNativ,
    textMenuItem: meta.textMenuItem,
    idntMaarechet: meta.idntMaarechet,
    idntMenuItem: meta.idntMenuItem,
    isTaregtBlank: meta.textMenuTarget === 'blank',
    isOverlay: toScalar(displaySettings) === 'overlay',
  } as DigitalService;
}

export async function resolveRoute(flat: DigitalService & Record<string, any>): Promise<ResolvedRoute> {
  if (flat.isTaregtBlank) {
    const url = await resolveBlankUrl(flat);
    return { url, openType: 'blank', setup: String(flat.setup ?? '') };
  }

  const qs = Helper.buildQParam(flat.sherutimUrlParams);
  const mfeConfig = {
    remoteUrl: flat.serviceSrc?.remoteUrl ?? '',
    scope:     flat.serviceSrc?.scope     ?? '',
    module:    flat.serviceSrc?.module    ?? '',
  };
  const url = flat.objectType == null
    ? Helper.buildUrl(`sherutim/${flat.idntMenuItem}`, qs)
    : Helper.buildUrl(`/employee-portfolio/sherutim/${flat.idntSheryut}`, qs);

  return {
    url,
    state: { mfeConfig },
    openType: flat.isOverlay ? 'overlay' : 'navigate',
  };
}
