declare module 'shell/openService' {
  export type ServiceMeta = {
    [key: string]: string | number | boolean | ServiceMeta;
  };
  export type OpenService = (meta: ServiceMeta) => void;
}
