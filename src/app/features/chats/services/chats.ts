import { Injectable, signal } from '@angular/core';
import { Chat, Mensaje } from '../../../core/models/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  private _chats = signal<Chat[]>([
    { id_chat: 31, trabajo: 'Pintar habitación', cliente: 'Jorge Díaz', trabajador: 'Kevin Montes', ultimo_mensaje: '¿Vas a venir hoy? Ya son las 10.', hora: '10:02 a. m.', tiene_reporte: true },
    { id_chat: 30, trabajo: 'Arreglar tubería de la cocina', cliente: 'María López', trabajador: 'Carlos Pérez', ultimo_mensaje: 'Listo, mañana a las 8 estoy allá.', hora: '9:40 a. m.', tiene_reporte: false },
    { id_chat: 29, trabajo: 'Configurar red wifi de oficina', cliente: 'Laura Vega', trabajador: 'Esteban Arias', ultimo_mensaje: 'Mejor págame por Nequi directo.', hora: 'Ayer', tiene_reporte: true },
    { id_chat: 28, trabajo: 'Limpieza profunda de apartamento', cliente: 'Sofía Méndez', trabajador: 'Luisa Gómez', ultimo_mensaje: 'Gracias, quedó perfecto.', hora: 'Ayer', tiene_reporte: false },
    { id_chat: 27, trabajo: 'Mudanza de un apartaestudio', cliente: 'Sofía Méndez', trabajador: 'Jorge Díaz', ultimo_mensaje: 'El camión llega a las 9.', hora: '12 oct', tiene_reporte: false }
  ]);

  private _mensajes = signal<Mensaje[]>([
    { id_mensaje: 1, remitente: 'Jorge Díaz', mensaje: 'Hola Kevin, ¿confirmamos el sábado a las 8 a. m.?', hora: 'Jue, 4:10 p. m.', del_cliente: true },
    { id_mensaje: 2, remitente: 'Kevin Montes', mensaje: 'Sí señor, allá estaré con la pintura.', hora: 'Jue, 4:25 p. m.', del_cliente: false },
    { id_mensaje: 3, remitente: 'Jorge Díaz', mensaje: 'Perfecto. Ya hice el pago, quedó asegurado en InWork.', hora: 'Jue, 4:31 p. m.', del_cliente: true },
    { id_mensaje: 4, remitente: 'Jorge Díaz', mensaje: 'Buenos días, ¿ya vienes en camino?', hora: 'Sáb, 8:20 a. m.', del_cliente: true },
    { id_mensaje: 5, remitente: 'Jorge Díaz', mensaje: '¿Vas a venir hoy? Ya son las 10.', hora: 'Sáb, 10:02 a. m.', del_cliente: true }
  ]);

  readonly chats = this._chats.asReadonly();
  readonly mensajes = this._mensajes.asReadonly();
}
