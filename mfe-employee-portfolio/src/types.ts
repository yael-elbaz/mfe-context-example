export interface RawMenuParam {
  CODE_SUG_PARAMETER: string;
  PARAMETER_KEY: string;
  PARAMETER_VALUE: string;
}

export interface RawTabConfig {
  CODE_SUG_OBJECT: number;
  ICON_URL: string;
  IDNT_MENU_ITEM: number;
  IDNT_MENU_ITEM_AV: string;
  IDNT_OBJECT: string;
  LOGI_HTTPS: boolean;
  LOGI_PARTIAL_ICON_URL: boolean;
  LOGI_PARTIAL_URL: boolean;
  LOGI_PNIMI: boolean;
  LOGI_SUG_OBJECT_MISMACH: boolean;
  Menu_Params_list: RawMenuParam[];
  OPEN_IN_IE: boolean;
  ORDER_BY: string;
  TEXT_MENU: string;
  TEXT_MENU_ITEM: string;
  TEXT_MENU_TARGET: string;
  TEXT_NATIV: string;
  TEXT_OBJECT_NAME: string;
}

export interface TabConfig {
  id: number;
  objectName: string;
  displayName: string;
  title: string;
  color: string;
  order: number;
  dataUrl: string;
  iconUrl: string;
  isInternal: boolean;
}

export interface TabData {
  basicData: Record<string, string>;
  murchavData: Record<string, string>;
  hatrraa: Record<string, string>;
  links: Record<string, string>;
}

export interface MoreDataTab {
  label: string;
  dataUrl: string;
  color?: string;
  order?: number;
  setAsActive?: boolean;
}

