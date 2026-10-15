export interface Auditoria {
  id_auditoria: number;
  created: string;
  usuario: string;
  tabla: string;
  accion: string;
  id_registro: number;
  ip: string;
}
