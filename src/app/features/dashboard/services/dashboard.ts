import { Injectable, signal } from '@angular/core';
import { Estadistica } from '../../../shared/interfaces/estadistica';
import { Barra, Segmento } from '../../../shared/interfaces/grafico';

export interface TrabajadorDestacado {
  nombre: string;
  oficio: string;
  calificacion: number;
  trabajos: number;
}

export interface Alerta {
  icono: string;
  titulo: string;
  detalle: string;
  ruta: string;
  tono: string;
}

export interface Actividad {
  usuario: string;
  correo: string;
  accion: string;
  modulo: string;
  estado: string;
  hora: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private _metricas = signal<Estadistica[]>([
    { titulo: 'Usuarios activos', valor: '42.890', variacion: '+8,2%', sube: true, icono: 'group', color: 'azul', detalle: 'vs. mes anterior' },
    { titulo: 'Trabajos publicados', valor: '3.418', variacion: '+12,6%', sube: true, icono: 'work', color: 'naranja', detalle: 'vs. mes anterior' },
    { titulo: 'Contrataciones', valor: '1.276', variacion: '+5,1%', sube: true, icono: 'handshake', color: 'verde', detalle: 'vs. mes anterior' },
    { titulo: 'Ingresos por comisión', valor: '$ 48,9 M', variacion: '+9,4%', sube: true, icono: 'payments', color: 'morado', detalle: 'vs. mes anterior' },
    { titulo: 'Tasa de finalización', valor: '87,3%', variacion: '-1,2%', sube: false, icono: 'task_alt', color: 'ambar', detalle: 'vs. mes anterior' }
  ]);

  private _ingresos = signal<number[]>([18, 21, 19, 26, 24, 29, 27, 33, 31, 38, 36, 48.9]);

  private _meses = signal<string[]>(['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct']);

  private _trabajosPorEstado = signal<Segmento[]>([
    { nombre: 'Publicados', valor: 1846, color: '#f2541b' },
    { nombre: 'Asignados', valor: 812, color: '#2f7cf6' },
    { nombre: 'Finalizados', valor: 640, color: '#12a067' },
    { nombre: 'Cancelados', valor: 120, color: '#b6bcc8' }
  ]);

  private _categorias = signal<Barra[]>([
    { etiqueta: 'Hogar', valor: 812 },
    { etiqueta: 'Limpieza', valor: 640 },
    { etiqueta: 'Mudanzas', valor: 498 },
    { etiqueta: 'Tecnología', valor: 412 },
    { etiqueta: 'Jardinería', valor: 296 },
    { etiqueta: 'Eventos', valor: 241 }
  ]);

  private _mejoresTrabajadores = signal<TrabajadorDestacado[]>([
    { nombre: 'Carlos Pérez', oficio: 'Plomería', calificacion: 4.98, trabajos: 126 },
    { nombre: 'Luisa Gómez', oficio: 'Limpieza', calificacion: 4.95, trabajos: 214 },
    { nombre: 'Andrés Ruiz', oficio: 'Electricidad', calificacion: 4.93, trabajos: 98 },
    { nombre: 'Valentina Ríos', oficio: 'Pintura', calificacion: 4.9, trabajos: 77 },
    { nombre: 'Jorge Díaz', oficio: 'Mudanzas', calificacion: 4.88, trabajos: 143 }
  ]);

  private _alertas = signal<Alerta[]>([
    { icono: 'flag', titulo: '12 reportes pendientes', detalle: '3 son por posible estafa', ruta: '/admin/reportes', tono: 'rojo' },
    { icono: 'badge', titulo: '8 verificaciones por revisar', detalle: 'La más antigua lleva 2 días', ruta: '/admin/verificacion', tono: 'ambar' },
    { icono: 'credit_card_off', titulo: '3 pagos fallidos hoy', detalle: 'Todos por PSE', ruta: '/admin/pagos', tono: 'morado' }
  ]);

  private _actividad = signal<Actividad[]>([
    { usuario: 'María López', correo: 'maria.lopez@gmail.com', accion: 'Publicó un trabajo de plomería', modulo: 'Trabajos', estado: 'publicado', hora: 'Hace 4 min' },
    { usuario: 'Carlos Pérez', correo: 'carlos.perez@gmail.com', accion: 'Envió una oferta por $ 140.000', modulo: 'Ofertas', estado: 'pendiente', hora: 'Hace 12 min' },
    { usuario: 'Sofía Méndez', correo: 'sofia.mendez@gmail.com', accion: 'Pagó la contratación #1042', modulo: 'Pagos', estado: 'retenido', hora: 'Hace 25 min' },
    { usuario: 'Jorge Díaz', correo: 'jorge.diaz@gmail.com', accion: 'Reportó a un trabajador', modulo: 'Reportes', estado: 'en_revision', hora: 'Hace 1 h' },
    { usuario: 'Luisa Gómez', correo: 'luisa.gomez@gmail.com', accion: 'Finalizó un trabajo de limpieza', modulo: 'Contrataciones', estado: 'finalizada', hora: 'Hace 2 h' }
  ]);

  readonly metricas = this._metricas.asReadonly();
  readonly ingresos = this._ingresos.asReadonly();
  readonly meses = this._meses.asReadonly();
  readonly trabajosPorEstado = this._trabajosPorEstado.asReadonly();
  readonly categorias = this._categorias.asReadonly();
  readonly mejoresTrabajadores = this._mejoresTrabajadores.asReadonly();
  readonly alertas = this._alertas.asReadonly();
  readonly actividad = this._actividad.asReadonly();
}
