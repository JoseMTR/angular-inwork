import { Injectable, signal } from '@angular/core';
import { Contratacion } from '../../../core/models/contratacion';
import { Estadistica } from '../../../shared/interfaces/estadistica';

export interface PasoContratacion {
  titulo: string;
  detalle: string;
  estado: string;
}

export interface PagoVinculado {
  referencia: string;
  tipo: string;
  monto: number;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContratacionesService {
  private _resumen = signal<Estadistica[]>([
    { titulo: 'Activas', valor: '418', variacion: '+5,1%', sube: true, icono: 'pending_actions', color: 'azul', detalle: 'en curso hoy' },
    { titulo: 'Finalizadas', valor: '8.912', variacion: '+9,8%', sube: true, icono: 'task_alt', color: 'verde', detalle: 'en total' },
    { titulo: 'Canceladas', valor: '544', variacion: '+1,2%', sube: false, icono: 'cancel', color: 'rojo', detalle: 'en total' }
  ]);

  private _contrataciones = signal<Contratacion[]>([
    { id_contratacion: 1042, trabajo: 'Arreglar tubería de la cocina', cliente: 'María López', trabajador: 'Carlos Pérez', valor: 140000, fecha_contratacion: 'Hoy, 7:30 a. m.', estado_contratacion: 'activa' },
    { id_contratacion: 1041, trabajo: 'Instalar lámparas en la sala', cliente: 'Paola Herrera', trabajador: 'Andrés Ruiz', valor: 115000, fecha_contratacion: '11 oct, 9:00 a. m.', estado_contratacion: 'finalizada' },
    { id_contratacion: 1040, trabajo: 'Limpieza de oficina', cliente: 'Laura Vega', trabajador: 'Luisa Gómez', valor: 180000, fecha_contratacion: '10 oct, 4:45 p. m.', estado_contratacion: 'finalizada' },
    { id_contratacion: 1039, trabajo: 'Pintar habitación', cliente: 'Jorge Díaz', trabajador: 'Kevin Montes', valor: 200000, fecha_contratacion: '9 oct, 11:20 a. m.', estado_contratacion: 'cancelada' },
    { id_contratacion: 1038, trabajo: 'Mudanza de un apartaestudio', cliente: 'Sofía Méndez', trabajador: 'Jorge Díaz', valor: 360000, fecha_contratacion: '8 oct, 8:10 a. m.', estado_contratacion: 'activa' }
  ]);

  private _pasos = signal<PasoContratacion[]>([
    { titulo: 'Oferta aceptada', detalle: 'Hoy, 7:30 a. m.', estado: 'hecho' },
    { titulo: 'Custodia creada en la API de pagos', detalle: 'Hoy, 7:30 a. m.', estado: 'hecho' },
    { titulo: 'Pago asegurado por el cliente', detalle: 'Hoy, 7:52 a. m., por Nequi', estado: 'hecho' },
    { titulo: 'Confirmación del cliente y del trabajador', detalle: 'Esperando que terminen el trabajo', estado: 'actual' },
    { titulo: 'Pago liberado al trabajador', detalle: 'Pendiente', estado: '' },
    { titulo: 'Calificaciones', detalle: 'Pendiente', estado: '' }
  ]);

  private _pagos = signal<PagoVinculado[]>([
    { referencia: 'PAG-1760449920-312', tipo: 'Depósito del cliente', monto: 140000, estado: 'retenido' }
  ]);

  readonly resumen = this._resumen.asReadonly();
  readonly contrataciones = this._contrataciones.asReadonly();
  readonly pasos = this._pasos.asReadonly();
  readonly pagos = this._pagos.asReadonly();
}
