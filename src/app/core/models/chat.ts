export interface Mensaje {
  id_mensaje: number;
  remitente: string;
  mensaje: string;
  hora: string;
  del_cliente: boolean;
}

export interface Chat {
  id_chat: number;
  trabajo: string;
  cliente: string;
  trabajador: string;
  ultimo_mensaje: string;
  hora: string;
  tiene_reporte: boolean;
}
