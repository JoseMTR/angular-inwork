export interface Trabajo {
  id_trabajo: number;
  titulo: string;
  descripcion: string;
  cliente: string;
  categoria: string;
  ciudad: string;
  direccion: string;
  fecha_trabajo: string;
  hora_inicio: string;
  hora_fin: string;
  presupuesto: number;
  estado_trabajo: string;
  total_ofertas: number;
}
