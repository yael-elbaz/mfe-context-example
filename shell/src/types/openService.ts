export interface ServiceMeta {
  isTargetBlank?:    boolean;
  hasPrerequesties?: boolean;
  objectType?:       string;
  serviceSrc?:       string;
  isOverlay?:        boolean;
  idntMenuItem?:     string;
  textMenuItem?:     string;
  textMenu?:         string;
  idntMaarechet?:    string;
  textNativ?:        string;
  displaySettings?:  unknown;
  setup?:            unknown;
  QueryParamsUrl?:   string;
  sherutimUrlParams?: unknown;
  overlaySize?:      string;
  activeTab?:        string;
  overlayIcon?:      string;
}

export type OpenService = (meta: ServiceMeta) => void;
