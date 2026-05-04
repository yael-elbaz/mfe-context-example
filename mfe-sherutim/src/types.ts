export type ServiceMeta = {
  [key: string]: string | number | boolean | ServiceMeta;
};

export type OpenService = (meta: ServiceMeta) => void;

export interface Sherut {
  id: string;
  idntSheryut: string;
  title: string;
  status: 'פתוח' | 'ממתין' | 'הושלם';
  mfeUrl: string;
  mfeScope: string;
  mfeModule: string;
}
