export interface Pago {
  id_pago: number;
  referencia: string;
  id_contratacion: number;
  monto: number;
  comision_plataforma: number;
  metodo_pago: string;
  estado_pago: string;
  fecha_pago: string;
}
