import { toObjectTypeList } from '../types/openService';
import type { Service, ServiceSrc, DigitalService, ResolvedRoute, OverlaySize } from '../types/openService';
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
    objectType: toObjectTypeList(objectType),
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
  const serviceId = getServiceId(flat);
  const url = flat.objectType == null
    ? Helper.buildUrl(`sherutim/${flat.idntMenuItem}`, qs)
    : Helper.buildUrl(`/employee-portfolio/sherutim/${serviceId}`, qs);

  if (flat.isOverlay) {
    return {
      url,
      openType: 'overlay',
      overlay: {
        serviceId,
        title: flat.textMenuItem || String(flat.title ?? ''),
        mfeConfig: {
          remoteUrl: mfeConfig.remoteUrl,
          scope: toScalar(mfeConfig.scope) ?? '',
          module: toScalar(mfeConfig.module) ?? '',
        },
        params: { ...flat, idntSheryut: serviceId },
        size: toOverlaySize(flat.overlaySize),
      },
    };
  }

  return { url, state: { mfeConfig }, openType: 'navigate' };
}

/**
 * מזהה השירות. idntSheryut ו-idntMenuItem הם אותו ערך; כרגע ה-MFE של השירותים שולח
 * idntMenuItem: 0 ואת המזהה ב-menuParamsList כ-idntSheryut — לכן נופלים אליו כשאין idntMenuItem.
 */
function getServiceId(flat: DigitalService & Record<string, any>): string {
  return flat.idntMenuItem ? String(flat.idntMenuItem) : String(flat.idntSheryut ?? '');
}

function toOverlaySize(v: unknown): OverlaySize {
  const s = String(Array.isArray(v) ? v[0] : v ?? '').toLowerCase();
  return s === 's' || s === 'l' ? s : 'm';
}
