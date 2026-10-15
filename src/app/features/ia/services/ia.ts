import { Injectable, signal } from '@angular/core';
import { Barra } from '../../../shared/interfaces/grafico';

export interface Conversacion {
  id: number;
  titulo: string;
  fecha: string;
}

export interface FilaComparacion {
  categoria: string;
  anterior: number;
  actual: number;
  cambio: string;
}

@Injectable({
  providedIn: 'root'
})
export class IaService {
  private _conversaciones = signal<Conversacion[]>([
    { id: 1, titulo: 'Ingresos de octubre vs. septiembre', fecha: 'Hoy' },
    { id: 2, titulo: 'Usuarios nuevos por ciudad', fecha: 'Hoy' },
    { id: 3, titulo: 'Trabajos cancelados en Barranquilla', fecha: 'Ayer' },
    { id: 4, titulo: 'Ranking de trabajadores de limpieza', fecha: 'Ayer' },
    { id: 5, titulo: 'Reportes por estafa del trimestre', fecha: '12 oct' },
    { id: 6, titulo: 'Comisiones por método de pago', fecha: '10 oct' }
  ]);

  private _sugerencias = signal<string[]>([
    'Compara este mes con el anterior',
    'Usuarios nuevos por ciudad',
    'Trabajos por categoría',
    'Ingresos por semana'
  ]);

  private _crecimiento = signal<Barra[]>([
    { etiqueta: 'Hogar', valor: 42 },
    { etiqueta: 'Mudanzas', valor: 38 },
    { etiqueta: 'Limpieza', valor: 21 },
    { etiqueta: 'Tecnología', valor: 12 }
  ]);

  private _comparacion = signal<FilaComparacion[]>([
    { categoria: 'Hogar', anterior: 9800000, actual: 13916000, cambio: '+42%' },
    { categoria: 'Mudanzas', anterior: 7400000, actual: 10212000, cambio: '+38%' },
    { categoria: 'Limpieza', anterior: 8100000, actual: 9801000, cambio: '+21%' },
    { categoria: 'Tecnología', anterior: 5200000, actual: 5824000, cambio: '+12%' }
  ]);

  readonly conversaciones = this._conversaciones.asReadonly();
  readonly sugerencias = this._sugerencias.asReadonly();
  readonly crecimiento = this._crecimiento.asReadonly();
  readonly comparacion = this._comparacion.asReadonly();
}
