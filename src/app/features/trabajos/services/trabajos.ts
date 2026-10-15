import { Injectable, signal } from '@angular/core';
import { Trabajo } from '../../../core/models/trabajo';
import { Estadistica } from '../../../shared/interfaces/estadistica';

export interface OfertaRecibida {
  trabajador: string;
  valor: number;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrabajosService {
  private _resumen = signal<Estadistica[]>([
    { titulo: 'Publicados', valor: '1.846', variacion: '+12,6%', sube: true, icono: 'campaign', color: 'azul', detalle: 'este mes' },
    { titulo: 'Asignados', valor: '812', variacion: '+6,3%', sube: true, icono: 'assignment_ind', color: 'morado', detalle: 'este mes' },
    { titulo: 'Finalizados', valor: '640', variacion: '+9,8%', sube: true, icono: 'task_alt', color: 'verde', detalle: 'este mes' },
    { titulo: 'Cancelados', valor: '120', variacion: '+2,1%', sube: false, icono: 'cancel', color: 'rojo', detalle: 'este mes' }
  ]);

  private _trabajos = signal<Trabajo[]>([
    { id_trabajo: 1201, titulo: 'Arreglar tubería de la cocina', descripcion: 'Hay una fuga debajo del lavaplatos y el agua sale por el mueble. Necesito cambiar el sifón y revisar las conexiones.', cliente: 'María López', categoria: 'Hogar', ciudad: 'Barranquilla', direccion: 'Cl 85 # 52-30, apto 402', fecha_trabajo: '16 oct 2026', hora_inicio: '8:00 a. m.', hora_fin: '12:00 p. m.', presupuesto: 150000, estado_trabajo: 'asignado', total_ofertas: 6 },
    { id_trabajo: 1202, titulo: 'Limpieza profunda de apartamento', descripcion: 'Apartamento de 3 habitaciones después de una remodelación.', cliente: 'Sofía Méndez', categoria: 'Limpieza', ciudad: 'Cartagena', direccion: 'Bocagrande, Cra 3 # 6-40', fecha_trabajo: '17 oct 2026', hora_inicio: '7:00 a. m.', hora_fin: '3:00 p. m.', presupuesto: 220000, estado_trabajo: 'publicado', total_ofertas: 11 },
    { id_trabajo: 1203, titulo: 'Mudanza de un apartaestudio', descripcion: 'Trasteo dentro de la ciudad, sin ascensor.', cliente: 'Jorge Díaz', categoria: 'Mudanzas', ciudad: 'Medellín', direccion: 'Cra 43A # 1-50', fecha_trabajo: '18 oct 2026', hora_inicio: '9:00 a. m.', hora_fin: '1:00 p. m.', presupuesto: 380000, estado_trabajo: 'publicado', total_ofertas: 4 },
    { id_trabajo: 1204, titulo: 'Instalar lámparas en la sala', descripcion: 'Son 4 lámparas colgantes.', cliente: 'Paola Herrera', categoria: 'Hogar', ciudad: 'Bogotá', direccion: 'Cl 127 # 19-40', fecha_trabajo: '12 oct 2026', hora_inicio: '2:00 p. m.', hora_fin: '5:00 p. m.', presupuesto: 120000, estado_trabajo: 'finalizado', total_ofertas: 7 },
    { id_trabajo: 1205, titulo: 'Configurar red wifi de oficina', descripcion: 'Oficina pequeña con 8 equipos.', cliente: 'Laura Vega', categoria: 'Tecnología', ciudad: 'Cali', direccion: 'Av 6N # 23-45', fecha_trabajo: '20 oct 2026', hora_inicio: '10:00 a. m.', hora_fin: '2:00 p. m.', presupuesto: 260000, estado_trabajo: 'publicado', total_ofertas: 3 },
    { id_trabajo: 1206, titulo: 'Podar jardín y retirar ramas', descripcion: 'Patio de 40 m².', cliente: 'Samuel Ortiz', categoria: 'Jardinería', ciudad: 'Santa Marta', direccion: 'Cra 4 # 10-22', fecha_trabajo: '10 oct 2026', hora_inicio: '7:00 a. m.', hora_fin: '11:00 a. m.', presupuesto: 90000, estado_trabajo: 'cancelado', total_ofertas: 2 }
  ]);

  private _habilidades = signal<string[]>(['Plomería', 'Instalación de sifones', 'Revisión de fugas']);

  private _ofertasRecibidas = signal<OfertaRecibida[]>([
    { trabajador: 'Carlos Pérez', valor: 140000, estado: 'aceptada' },
    { trabajador: 'Andrés Ruiz', valor: 135000, estado: 'rechazada' },
    { trabajador: 'Kevin Montes', valor: 110000, estado: 'rechazada' }
  ]);

  readonly resumen = this._resumen.asReadonly();
  readonly trabajos = this._trabajos.asReadonly();
  readonly habilidades = this._habilidades.asReadonly();
  readonly ofertasRecibidas = this._ofertasRecibidas.asReadonly();
}
