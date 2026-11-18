// Chat del equipo en tiempo real con WebSocket.
// Se conecta a la API principal (FastAPI) en /ws/chat-equipo con el mismo token JWT del login.
// El navegador no deja poner el encabezado Authorization en un WebSocket, por eso el token va en la URL.
//
// La API manda mensajes JSON con un "tipo":
//   historial  -> los últimos mensajes guardados (al conectarse)
//   mensaje    -> alguien escribió (le llega a todos, también al que lo envió)
//   conectados -> la lista de quienes tienen el chat abierto
//   aviso      -> "Mariana Castro Vega (Moderador) se unió al chat", etc.
//   error      -> algo salió mal (token vencido, mensaje muy largo...)
import { Injectable, inject, signal } from '@angular/core';
import { API_PRINCIPAL } from '../config';
import { SesionService } from './sesion';

export type EstadoChat = 'desconectado' | 'conectando' | 'conectado';

export interface MensajeEquipo {
  id_mensaje_equipo: number;
  id_remitente: number;
  nombre: string;
  rol: string;
  mensaje: string;
  created: string;
}

export interface UsuarioConectado {
  id_usuario: number;
  nombre: string;
  rol: string;
}

// Lo que se pinta en la conversación: un mensaje de alguien o un aviso (entró / salió)
export interface ItemChat {
  clave: string;
  tipo: 'mensaje' | 'aviso';
  texto: string;
  created: string;
  mensaje?: MensajeEquipo;
}

export const MAXIMO_CARACTERES = 1000;

// http://localhost:8000 -> ws://localhost:8000   |   https://... -> wss://...
export function direccionChat(): string {
  return API_PRINCIPAL.replace(/^http/, 'ws') + '/ws/chat-equipo';
}

@Injectable({ providedIn: 'root' })
export class ChatEquipoService {
  private readonly sesion = inject(SesionService);

  private socket: WebSocket | null = null;
  private cerradoPorElUsuario = false;
  private temporizador: ReturnType<typeof setTimeout> | undefined;
  private contador = 0;

  readonly estado = signal<EstadoChat>('desconectado');
  readonly items = signal<ItemChat[]>([]);
  readonly conectados = signal<UsuarioConectado[]>([]);
  readonly error = signal('');

  conectar(): void {
    const token = this.sesion.sesion()?.token;
    if (!token) {
      this.error.set('No hay una sesión iniciada');
      return;
    }
    // Si ya está conectado o conectándose no se abre otra conexión
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;

    clearTimeout(this.temporizador);
    this.cerradoPorElUsuario = false;
    this.error.set('');
    this.estado.set('conectando');

    const socket = new WebSocket(`${direccionChat()}?token=${encodeURIComponent(token)}`);
    this.socket = socket;

    socket.onopen = () => {
      this.estado.set('conectado');
      this.error.set('');
    };

    socket.onmessage = (evento) => this.recibir(evento.data);

    socket.onclose = (evento) => {
      if (this.socket !== socket) return; // es una conexión vieja que ya se reemplazó
      this.socket = null;
      this.estado.set('desconectado');
      this.conectados.set([]);

      // 4401 = token vencido o inválido, 4403 = el rol no puede usar el chat: no se reintenta
      if (evento.code === 4401 || evento.code === 4403 || this.cerradoPorElUsuario) return;

      // Se cayó la conexión (internet, la API se reinició o estaba dormida en Render): reintentar
      this.error.set('Se perdió la conexión con el chat. Reintentando en 3 segundos...');
      this.temporizador = setTimeout(() => this.conectar(), 3000);
    };
  }

  desconectar(): void {
    this.cerradoPorElUsuario = true;
    clearTimeout(this.temporizador);
    const socket = this.socket;
    this.socket = null;
    socket?.close(1000, 'El usuario salió del chat');
    this.estado.set('desconectado');
    this.conectados.set([]);
  }

  // Devuelve true si se pudo enviar
  enviar(texto: string): boolean {
    const limpio = texto.trim();
    if (!limpio || limpio.length > MAXIMO_CARACTERES) return false;
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify({ tipo: 'mensaje', texto: limpio }));
    return true;
  }

  private recibir(texto: string): void {
    let datos: any;
    try {
      datos = JSON.parse(texto);
    } catch {
      return;
    }

    switch (datos.tipo) {
      case 'historial':
        this.items.set((datos.mensajes ?? []).map((m: MensajeEquipo) => this.itemMensaje(m)));
        break;
      case 'mensaje':
        this.items.update((lista) => [...lista, this.itemMensaje(datos.mensaje)]);
        break;
      case 'aviso':
        this.items.update((lista) => [...lista, { clave: 'aviso-' + ++this.contador, tipo: 'aviso', texto: datos.texto, created: datos.created }]);
        break;
      case 'conectados':
        this.conectados.set(datos.usuarios ?? []);
        break;
      case 'error':
        this.error.set(datos.texto ?? 'Error en el chat');
        break;
    }
  }

  private itemMensaje(m: MensajeEquipo): ItemChat {
    return { clave: 'mensaje-' + m.id_mensaje_equipo, tipo: 'mensaje', texto: m.mensaje, created: m.created, mensaje: m };
  }
}
