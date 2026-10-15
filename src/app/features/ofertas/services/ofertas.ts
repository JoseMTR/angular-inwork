import { Injectable, signal } from '@angular/core';
import { Oferta } from '../../../core/models/oferta';
import { Estadistica } from '../../../shared/interfaces/estadistica';

@Injectable({
  providedIn: 'root'
})
export class OfertasService {
  private _resumen = signal<Estadistica[]>([
    { titulo: 'Total de ofertas', valor: '63.220', variacion: '+11,0%', sube: true, icono: 'local_offer', color: 'naranja', detalle: 'este mes' },
    { titulo: 'Pendientes', valor: '2.904', variacion: '+4,5%', sube: true, icono: 'pending', color: 'ambar', detalle: 'por responder' },
    { titulo: 'Aceptadas', valor: '9.874', variacion: '+6,2%', sube: true, icono: 'thumb_up', color: 'verde', detalle: 'este mes' },
    { titulo: 'Tasa de aceptación', valor: '15,6%', variacion: '-0,8%', sube: false, icono: 'percent', color: 'azul', detalle: 'vs. mes anterior' }
  ]);

  private _ofertas = signal<Oferta[]>([
    { id_oferta: 5501, trabajo: 'Arreglar tubería de la cocina', trabajador: 'Carlos Pérez', valor_oferta: 140000, presupuesto: 150000, mensaje: 'Tengo 8 años de experiencia en plomería. Puedo ir el jueves a primera hora y llevo los repuestos.', fecha_oferta: 'Hoy, 7:12 a. m.', estado_oferta: 'aceptada' },
    { id_oferta: 5502, trabajo: 'Arreglar tubería de la cocina', trabajador: 'Andrés Ruiz', valor_oferta: 135000, presupuesto: 150000, mensaje: 'Puedo ir en la tarde, el sifón lo compras tú.', fecha_oferta: 'Hoy, 7:40 a. m.', estado_oferta: 'rechazada' },
    { id_oferta: 5503, trabajo: 'Limpieza profunda de apartamento', trabajador: 'Luisa Gómez', valor_oferta: 240000, presupuesto: 220000, mensaje: 'Incluye productos y aspiradora industrial.', fecha_oferta: 'Hoy, 8:05 a. m.', estado_oferta: 'pendiente' },
    { id_oferta: 5504, trabajo: 'Mudanza de un apartaestudio', trabajador: 'Jorge Díaz', valor_oferta: 360000, presupuesto: 380000, mensaje: 'Camión pequeño y dos ayudantes.', fecha_oferta: 'Ayer, 6:20 p. m.', estado_oferta: 'pendiente' },
    { id_oferta: 5505, trabajo: 'Configurar red wifi de oficina', trabajador: 'Andrés Ruiz', valor_oferta: 250000, presupuesto: 260000, mensaje: 'Dejo la red con contraseña para invitados.', fecha_oferta: 'Ayer, 2:15 p. m.', estado_oferta: 'pendiente' },
    { id_oferta: 5506, trabajo: 'Podar jardín y retirar ramas', trabajador: 'Kevin Montes', valor_oferta: 95000, presupuesto: 90000, mensaje: 'Me retiro, no tengo disponibilidad.', fecha_oferta: '9 oct, 4:00 p. m.', estado_oferta: 'retirada' }
  ]);

  readonly resumen = this._resumen.asReadonly();
  readonly ofertas = this._ofertas.asReadonly();
}
