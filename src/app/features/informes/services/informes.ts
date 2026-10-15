import { Injectable, signal } from '@angular/core';
import { Informe, Programacion } from '../../../core/models/informe';

export interface Hallazgo {
  icono: string;
  texto: string;
  tono: string;
}

@Injectable({
  providedIn: 'root'
})
export class InformesService {
  private _informes = signal<Informe[]>([
    {
      id_informe: 31,
      tipo: 'diario',
      titulo: 'Informe diario, 14 oct 2026',
      generado: 'Hoy, 11:59 p. m.',
      estado: 'programado',
      resumen: 'Se generará esta noche con la actividad de todo el día.',
      cifras: []
    },
    {
      id_informe: 30,
      tipo: 'diario',
      titulo: 'Informe diario, 13 oct 2026',
      generado: 'Ayer, 11:59 p. m.',
      estado: 'generado',
      resumen: 'Día fuerte en Hogar: los trabajos de plomería subieron 22% y se cerraron 64 contrataciones. Hubo 3 pagos fallidos por PSE.',
      cifras: [
        { etiqueta: 'Trabajos nuevos', valor: '138', variacion: '+14%', sube: true },
        { etiqueta: 'Contrataciones', valor: '64', variacion: '+9%', sube: true },
        { etiqueta: 'Comisión', valor: '$ 2,1 M', variacion: '-3%', sube: false }
      ]
    },
    {
      id_informe: 29,
      tipo: 'diario',
      titulo: 'Informe diario, 12 oct 2026',
      generado: '12 oct, 11:59 p. m.',
      estado: 'generado',
      resumen: 'Domingo tranquilo, con menos publicaciones pero más calificaciones de 5 estrellas que el promedio de la semana.',
      cifras: [
        { etiqueta: 'Trabajos nuevos', valor: '91', variacion: '-18%', sube: false },
        { etiqueta: 'Contrataciones', valor: '41', variacion: '-6%', sube: false },
        { etiqueta: 'Comisión', valor: '$ 1,6 M', variacion: '+2%', sube: true }
      ]
    }
  ]);

  private _programaciones = signal<Programacion[]>([
    { tipo: 'Diario', descripcion: 'Todos los días', hora: '11:59 p. m.', proximo: 'En 6 h 12 min', activo: true },
    { tipo: 'Semanal', descripcion: 'Los domingos', hora: '11:59 p. m.', proximo: 'En 4 días', activo: true },
    { tipo: 'Mensual', descripcion: 'Último día del mes', hora: '11:59 p. m.', proximo: 'En 17 días', activo: false }
  ]);

  private _hallazgos = signal<Hallazgo[]>([
    { icono: 'trending_up', texto: 'Los trabajos de plomería subieron 22% frente al lunes anterior.', tono: 'verde' },
    { icono: 'warning', texto: 'Los 3 pagos fallidos fueron por PSE entre las 6 y las 8 p. m.', tono: 'ambar' },
    { icono: 'lightbulb', texto: 'Conviene revisar los 2 reportes por estafa abiertos hace más de 48 horas.', tono: 'naranja' }
  ]);

  readonly informes = this._informes.asReadonly();
  readonly programaciones = this._programaciones.asReadonly();
  readonly hallazgos = this._hallazgos.asReadonly();
}
