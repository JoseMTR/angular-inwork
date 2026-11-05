// Datos de una tarjeta de estadística (StatCard)
export interface Estadistica {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
  detalle?: string;
  variacion?: string;
  sube?: boolean;
}
