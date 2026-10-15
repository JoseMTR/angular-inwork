import { Injectable, signal } from '@angular/core';
import { Verificacion } from '../../../core/models/verificacion';
import { Estadistica } from '../../../shared/interfaces/estadistica';

export interface HistorialVerificacion {
  fecha: string;
  estado: string;
  observacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class VerificacionService {
  private _contadores = signal<Estadistica[]>([
    { titulo: 'Pendientes', valor: '8', variacion: '+3', sube: false, icono: 'hourglass_top', color: 'ambar', detalle: 'desde ayer' },
    { titulo: 'Aprobadas', valor: '1.204', variacion: '+48', sube: true, icono: 'verified_user', color: 'verde', detalle: 'este mes' },
    { titulo: 'Rechazadas', valor: '96', variacion: '-12', sube: true, icono: 'gpp_bad', color: 'rojo', detalle: 'este mes' }
  ]);

  private _solicitudes = signal<Verificacion[]>([
    { id_verificacion: 210, usuario: 'Kevin Montes', correo: 'kevin.montes@gmail.com', tipo_identificacion: 'Cédula', numero_identificacion: '1.143.556.019', ciudad: 'Barranquilla', estado_verificacion: 'pendiente', created: 'Hace 2 días' },
    { id_verificacion: 214, usuario: 'Paola Herrera', correo: 'paola.herrera@gmail.com', tipo_identificacion: 'Cédula', numero_identificacion: '1.001.874.223', ciudad: 'Bogotá', estado_verificacion: 'pendiente', created: 'Hace 1 día' },
    { id_verificacion: 215, usuario: 'Samuel Ortiz', correo: 'samuel.ortiz@gmail.com', tipo_identificacion: 'Pasaporte', numero_identificacion: 'PA 112 908', ciudad: 'Medellín', estado_verificacion: 'pendiente', created: 'Hace 20 h' },
    { id_verificacion: 216, usuario: 'Laura Vega', correo: 'laura.vega@gmail.com', tipo_identificacion: 'Cédula', numero_identificacion: '52.990.118', ciudad: 'Cali', estado_verificacion: 'pendiente', created: 'Hace 6 h' },
    { id_verificacion: 205, usuario: 'Sofía Méndez', correo: 'sofia.mendez@gmail.com', tipo_identificacion: 'Pasaporte', numero_identificacion: 'AX 482 117', ciudad: 'Cartagena', estado_verificacion: 'aprobada', created: '11 oct' },
    { id_verificacion: 203, usuario: 'Iván Rojas', correo: 'ivan.rojas@gmail.com', tipo_identificacion: 'Cédula', numero_identificacion: '1.098.332.447', ciudad: 'Bucaramanga', estado_verificacion: 'rechazada', created: '10 oct' }
  ]);

  private _historial = signal<HistorialVerificacion[]>([
    { fecha: '02 ago 2025', estado: 'rechazada', observacion: 'La selfie estaba borrosa y no se veía el rostro completo.' },
    { fecha: '13 oct 2026', estado: 'pendiente', observacion: 'Subió de nuevo los documentos.' }
  ]);

  readonly contadores = this._contadores.asReadonly();
  readonly solicitudes = this._solicitudes.asReadonly();
  readonly historial = this._historial.asReadonly();
}
