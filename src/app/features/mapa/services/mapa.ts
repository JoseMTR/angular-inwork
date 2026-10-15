import { Injectable, signal } from '@angular/core';

export interface Marcador {
  id_trabajo: number;
  titulo: string;
  categoria: string;
  presupuesto: number;
  estado: string;
  x: number;
  y: number;
}

export interface ConteoCiudad {
  ciudad: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapaService {
  private _marcadores = signal<Marcador[]>([
    { id_trabajo: 1201, titulo: 'Arreglar tubería de la cocina', categoria: 'Hogar', presupuesto: 150000, estado: 'asignado', x: 34, y: 38 },
    { id_trabajo: 1202, titulo: 'Limpieza profunda de apartamento', categoria: 'Limpieza', presupuesto: 220000, estado: 'publicado', x: 52, y: 30 },
    { id_trabajo: 1210, titulo: 'Reparar nevera', categoria: 'Hogar', presupuesto: 170000, estado: 'publicado', x: 44, y: 52 },
    { id_trabajo: 1211, titulo: 'Clases de matemáticas', categoria: 'Otros', presupuesto: 60000, estado: 'publicado', x: 63, y: 46 },
    { id_trabajo: 1212, titulo: 'Montar un escritorio', categoria: 'Hogar', presupuesto: 80000, estado: 'publicado', x: 28, y: 62 },
    { id_trabajo: 1213, titulo: 'Paseo de perros', categoria: 'Cuidado', presupuesto: 40000, estado: 'asignado', x: 71, y: 64 },
    { id_trabajo: 1214, titulo: 'Fumigar casa', categoria: 'Limpieza', presupuesto: 130000, estado: 'publicado', x: 57, y: 72 },
    { id_trabajo: 1215, titulo: 'Cambiar chapa de la puerta', categoria: 'Hogar', presupuesto: 70000, estado: 'publicado', x: 40, y: 24 }
  ]);

  private _ciudades = signal<ConteoCiudad[]>([
    { ciudad: 'Barranquilla', total: 612 },
    { ciudad: 'Bogotá', total: 548 },
    { ciudad: 'Medellín', total: 402 },
    { ciudad: 'Cali', total: 287 },
    { ciudad: 'Cartagena', total: 214 },
    { ciudad: 'Santa Marta', total: 96 }
  ]);

  readonly marcadores = this._marcadores.asReadonly();
  readonly ciudades = this._ciudades.asReadonly();
}
