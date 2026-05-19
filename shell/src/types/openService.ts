export interface ServiceSrc {
  remoteUrl: string;
  scope: string | string[];
  module: string | string[];
  src: string | null;
}

export interface MenuParams {
  codeSugParameter: string;
  parameterKey: string;
  parameterValue: string;
}

export interface Service {
  codeSugObject: number;
  textMenuItem: string;
  kamutknisot: number;
  isFavorite: boolean;
  description?: string;
  logiPnimi: boolean;
  openInIe: boolean;
  logiSugObjectMismach: boolean;
  categoryId: string;
  iconUrl?: string;
  url?: string;
  idntObject: number;
  idntMenuItemAv: number;
  idntMenuItem: number;
  menuParamsList: MenuParams[];
  textNativ: string;
  textMenu: string;
  textMenuTarget: string;
  idntMaarechet: number;
  Permission?: boolean;
}

export const OBJECT_TYPE = {
  employee: 1,
  customer: 2,
  mishtamesh: 3,
} as const;

export type PersonType = 'employee' | 'customer' | 'mishtamesh';

const reverseObjectType = Object.fromEntries(
  Object.entries(OBJECT_TYPE).map(([k, v]) => [String(v), k as PersonType])
);

export function toObjectTypeList(objectType: string | string[] | null | undefined): PersonType[] {
  if (objectType == null) return [];
  const arr = Array.isArray(objectType) ? objectType : [objectType];
  return arr.flatMap((s) => {
    const key = reverseObjectType[s];
    return key ? [key] : [];
  });
}

export interface DigitalService {
  isTargetBlank?: boolean;
  hasPrerequesties?: boolean;
  objectType?: PersonType[] | null;
  serviceSrc?: ServiceSrc;
  isOverlay?: boolean;
  idntMenuItem?: number;
  textMenuItem?: string;
  textMenu?: string;
  idntMaarechet?: number;
  textNativ?: string;
  displaySettings?: string;
  setup?: string;
  QueryParamsUrl?: string;
  sherutimUrlParams?: string;
  overlaySize?: string;
  activeTab?: string;
  overlayIcon?: string;
  isTaregtBlank: boolean;
  [key: string]: string | string[] | boolean | number | PersonType[] | null | undefined | ServiceSrc;
}

export type OpenService = (meta: Service) => void;

export type OpenType = 'navigate' | 'blank' | 'overlay';

export interface ResolvedRoute {
  url: string;
  state?: Record<string, any>;
  openType: OpenType;
  setup?: string;
}

