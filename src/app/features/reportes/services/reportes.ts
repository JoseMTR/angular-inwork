import { Injectable, signal } from '@angular/core';
import { Reporte } from '../../../core/models/reporte';
import { Estadistica } from '../../../shared/interfaces/estadistica';

export interface PasoReporte {
  titulo: string;
  fecha: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private _resumen = signal<Estadistica[]>([
    { titulo: 'Pendientes', valor: '12', variacion: '+4', sube: false, icono: 'flag', color: 'ambar', detalle: 'desde ayer' },
    { titulo: 'En revisión', valor: '5', variacion: '+1', sube: true, icono: 'manage_search', color: 'azul', detalle: 'desde ayer' },
    { titulo: 'Resueltos', valor: '318', variacion: '+22', sube: true, icono: 'gavel', color: 'verde', detalle: 'este mes' },
    { titulo: 'Rechazados', valor: '41', variacion: '-3', sube: true, icono: 'do_not_disturb_on', color: 'rojo', detalle: 'este mes' }
  ]);

  private _reportes = signal<Reporte[]>([
    { id_reporte: 77, motivo: 'incumplimiento', reportante: 'Jorge Díaz', reportado: 'Kevin Montes', trabajo: 'Pintar habitación', descripcion: 'Acordamos el sábado a las 8 a. m. y nunca llegó. Le escribí por el chat varias veces y no respondió. Ya había pagado a la custodia.', estado_reporte: 'en_revision', revisor: 'Andrés Ruiz', created: 'Hoy, 6:40 a. m.' },
    { id_reporte: 76, motivo: 'estafa', reportante: 'Laura Vega', reportado: 'Esteban Arias', trabajo: 'Configurar red wifi de oficina', descripcion: 'Me pidió que le pagara por fuera de la plataforma.', estado_reporte: 'pendiente', revisor: 'Sin asignar', created: 'Ayer, 9:15 p. m.' },
    { id_reporte: 75, motivo: 'lenguaje_inapropiado', reportante: 'Luisa Gómez', reportado: 'Natalia Pardo', trabajo: 'Limpieza de oficina', descripcion: 'Mensajes ofensivos en el chat.', estado_reporte: 'pendiente', revisor: 'Sin asignar', created: 'Ayer, 4:02 p. m.' },
    { id_reporte: 74, motivo: 'fraude', reportante: 'Paola Herrera', reportado: 'Iván Rojas', trabajo: 'Instalar lámparas en la sala', descripcion: 'Subió fotos de trabajos que no son suyos.', estado_reporte: 'resuelto', revisor: 'Jose Torregrosa', created: '11 oct' },
    { id_reporte: 73, motivo: 'otro', reportante: 'Samuel Ortiz', reportado: 'María López', trabajo: 'Podar jardín y retirar ramas', descripcion: 'Canceló el trabajo a última hora.', estado_reporte: 'rechazado', revisor: 'Andrés Ruiz', created: '10 oct' }
  ]);

  private _historial = signal<PasoReporte[]>([
    { titulo: 'Reporte creado por Jorge Díaz', fecha: 'Hoy, 6:40 a. m.', estado: 'hecho' },
    { titulo: 'Andrés Ruiz tomó el reporte', fecha: 'Hoy, 7:05 a. m.', estado: 'hecho' },
    { titulo: 'Revisando el chat del trabajo', fecha: 'Ahora', estado: 'actual' }
  ]);

  readonly resumen = this._resumen.asReadonly();
  readonly reportes = this._reportes.asReadonly();
  readonly historial = this._historial.asReadonly();
}
