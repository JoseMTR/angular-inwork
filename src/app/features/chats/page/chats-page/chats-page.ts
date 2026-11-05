// CHATS Y MENSAJES: conversaciones entre clientes y trabajadores (solo lectura en el panel).
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { EnfoqueService } from '../../../../core/services/enfoque';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { ChatBubble } from '../../../../shared/components/chat-bubble/chat-bubble';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import * as f from '../../../../shared/utils/formato';

@Component({
  selector: 'app-chats-page',
  imports: [FormsModule, PageHeader, Avatar, ChatBubble, Cargando, EmptyState],
  templateUrl: './chats-page.html',
  styleUrl: './chats-page.css'
})
export class ChatsPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly enfoque = inject(EnfoqueService);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ chats: [], mensajes: [], usuarios: [], trabajos: [], reportes: [] });
  protected readonly seleccionado = signal<any>(null);
  protected readonly mensajes = signal<any[]>([]);
  protected readonly cargandoMensajes = signal(false);
  protected readonly busqueda = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      chats: this.api.get('/chats/'),
      mensajes: this.api.get('/mensajes/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : [],
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
      reportes: this.sesion.permiso('reportes') ? this.api.get('/reportes/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
    const pedido = this.enfoque.tomar('chat');
    let elegido = null;
    if (pedido) {
      elegido =
        datos.chats.find((c: any) => c.id_trabajo === pedido.id_trabajo && (!pedido.usuarios || pedido.usuarios.includes(c.id_trabajador))) ??
        datos.chats.find((c: any) => c.id_trabajo === pedido.id_trabajo);
    }
    this.elegir(elegido ?? this.chats()[0] ?? null);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  protected nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }
  protected trabajo(id: number): string {
    return this.trabajosPorId().get(id)?.titulo ?? 'Trabajo';
  }

  private ultimoMensaje(chat: any): any {
    const lista = this.d().mensajes.filter((m: any) => m.id_chat === chat.id_chat);
    return lista.sort((a: any, b: any) => f.ordenFecha(b.created) - f.ordenFecha(a.created))[0];
  }

  private reporteDe(chat: any): any {
    const partes = [chat.id_cliente, chat.id_trabajador];
    return this.d().reportes.find((r: any) => r.id_trabajo === chat.id_trabajo && partes.includes(r.id_reportante) && partes.includes(r.id_reportado));
  }

  protected readonly chats = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.d()
      .chats.map((c: any) => ({ ...c, ultimo: this.ultimoMensaje(c), reporte: this.reporteDe(c) }))
      .filter((c: any) => `${this.trabajo(c.id_trabajo)} ${this.nombre(c.id_cliente)} ${this.nombre(c.id_trabajador)}`.toLowerCase().includes(texto))
      .sort((a: any, b: any) => f.ordenFecha(b.ultimo?.created) - f.ordenFecha(a.ultimo?.created));
  });

  protected async elegir(chat: any): Promise<void> {
    this.seleccionado.set(chat ? { ...chat, reporte: this.reporteDe(chat) } : null);
    this.mensajes.set([]);
    if (!chat) return;
    this.cargandoMensajes.set(true);
    try {
      this.mensajes.set(await this.api.get(`/mensajes/chat/${chat.id_chat}`));
    } catch {
      this.mensajes.set(this.d().mensajes.filter((m: any) => m.id_chat === chat.id_chat));
    } finally {
      this.cargandoMensajes.set(false);
    }
  }

  protected verReporte(): void {
    this.enfoque.pedir({ modulo: 'reportes', id_reporte: this.seleccionado().reporte.id_reporte });
    this.router.navigateByUrl('/reportes');
  }

  protected verTrabajo(): void {
    this.enfoque.pedir({ modulo: 'trabajos', id_trabajo: this.seleccionado().id_trabajo });
    this.router.navigateByUrl('/trabajos');
  }
}
