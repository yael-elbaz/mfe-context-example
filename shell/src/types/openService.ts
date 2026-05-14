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

export interface DigitalService {
  isTargetBlank?: boolean;
  hasPrerequesties?: boolean;
  objectType?: string | string[] | null;
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
  [key: string]: string | string[] | boolean | number | null | undefined | ServiceSrc;
}

export type OpenService = (meta: Service) => void;

export type OpenType = 'navigate' | 'blank' | 'overlay';

export interface ResolvedRoute {
  url: string;
  state?: Record<string, any>;
  openType: OpenType;
  setup?: string;
}

// Set actual numeric values to match the legacy OBJECT_TYPE constants
export const OBJECT_TYPE = {
  employee: 1,
  customer: 2,
  mishtamesh: 3,
} as const;
