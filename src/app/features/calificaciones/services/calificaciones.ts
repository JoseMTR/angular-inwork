import { Injectable, signal } from '@angular/core';
import { Calificacion } from '../../../core/models/calificacion';
import { Estadistica } from '../../../shared/interfaces/estadistica';
import { Barra } from '../../../shared/interfaces/grafico';

export interface UsuarioVigilado {
  nombre: string;
  promedio: number;
  resenas: number;
  reportes: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalificacionesService {
  private _resumen = signal<Estadistica[]>([
    { titulo: 'Calificación promedio', valor: '4,62', variacion: '+0,04', sube: true, icono: 'star', color: 'ambar', detalle: 'vs. mes anterior' },
    { titulo: 'Total de reseñas', valor: '18.940', variacion: '+1.212', sube: true, icono: 'reviews', color: 'azul', detalle: 'este mes' },
    { titulo: 'Reseñas de 4 y 5 estrellas', valor: '89%', variacion: '+2%', sube: true, icono: 'thumb_up', color: 'verde', detalle: 'vs. mes anterior' }
  ]);

  private _distribucion = signal<Barra[]>([
    { etiqueta: '5 estrellas', valor: 12480 },
    { etiqueta: '4 estrellas', valor: 4380 },
    { etiqueta: '3 estrellas', valor: 1210 },
    { etiqueta: '2 estrellas', valor: 520 },
    { etiqueta: '1 estrella', valor: 350 }
  ]);

  private _calificaciones = signal<Calificacion[]>([
    { id_calificacion: 1, calificador: 'María López', calificado: 'Carlos Pérez', trabajo: 'Arreglar tubería de la cocina', puntuacion: 5, comentario: 'Llegó puntual y dejó todo limpio.', created: 'Hoy' },
    { id_calificacion: 2, calificador: 'Carlos Pérez', calificado: 'María López', trabajo: 'Arreglar tubería de la cocina', puntuacion: 4, comentario: 'Clienta clara con lo que necesitaba.', created: 'Hoy' },
    { id_calificacion: 3, calificador: 'Sofía Méndez', calificado: 'Luisa Gómez', trabajo: 'Limpieza profunda de apartamento', puntuacion: 5, comentario: 'Excelente trabajo, la vuelvo a contratar.', created: 'Ayer' },
    { id_calificacion: 4, calificador: 'Jorge Díaz', calificado: 'Kevin Montes', trabajo: 'Instalar lámparas en la sala', puntuacion: 1, comentario: 'No llegó el día acordado y no respondió mensajes.', created: 'Ayer' },
    { id_calificacion: 5, calificador: 'Paola Herrera', calificado: 'Andrés Ruiz', trabajo: 'Revisar tablero eléctrico', puntuacion: 5, comentario: 'Explicó todo con paciencia.', created: '12 oct' },
    { id_calificacion: 6, calificador: 'Laura Vega', calificado: 'Kevin Montes', trabajo: 'Pintar habitación', puntuacion: 2, comentario: 'Quedaron manchas en el piso.', created: '11 oct' }
  ]);

  private _vigilados = signal<UsuarioVigilado[]>([
    { nombre: 'Kevin Montes', promedio: 2.4, resenas: 9, reportes: 3 },
    { nombre: 'Esteban Arias', promedio: 2.9, resenas: 14, reportes: 1 },
    { nombre: 'Natalia Pardo', promedio: 3.1, resenas: 22, reportes: 2 }
  ]);

  readonly resumen = this._resumen.asReadonly();
  readonly distribucion = this._distribucion.asReadonly();
  readonly calificaciones = this._calificaciones.asReadonly();
  readonly vigilados = this._vigilados.asReadonly();
}
