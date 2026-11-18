// CHAT DEL EQUIPO: conversación en tiempo real (WebSocket) entre Administrador, Moderador y Analista.
// La conexión la maneja core/services/chat-equipo.ts; esta página solo muestra y envía.
import { Component, ElementRef, OnDestroy, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatEquipoService, MAXIMO_CARACTERES } from '../../../../core/services/chat-equipo';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ChatBubble } from '../../../../shared/components/chat-bubble/chat-bubble';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import * as f from '../../../../shared/utils/formato';

@Component({
  selector: 'app-chat-equipo-page',
  imports: [FormsModule, PageHeader, Avatar, ChatBubble, EmptyState],
  templateUrl: './chat-equipo-page.html',
  styleUrl: './chat-equipo-page.css'
})
export class ChatEquipoPage implements OnInit, OnDestroy {
  protected readonly chat = inject(ChatEquipoService);
  private readonly sesion = inject(SesionService);
  protected readonly f = f;
  protected readonly maximo = MAXIMO_CARACTERES;

  protected readonly texto = signal('');
  protected readonly miId = computed(() => this.sesion.sesion()?.id_usuario);
  protected readonly puedeEnviar = computed(() => this.chat.estado() === 'conectado' && this.texto().trim().length > 0);
  protected readonly textoEstado = computed(() => {
    const estados = { conectado: 'Conectado', conectando: 'Conectando...', desconectado: 'Desconectado' };
    return estados[this.chat.estado()];
  });

  private readonly caja = viewChild<ElementRef<HTMLElement>>('caja');

  constructor() {
    // Cada vez que llega un mensaje o un aviso, la conversación baja hasta el final
    effect(() => {
      this.chat.items();
      const elemento = this.caja()?.nativeElement;
      if (elemento) setTimeout(() => (elemento.scrollTop = elemento.scrollHeight));
    });
  }

  ngOnInit(): void {
    this.chat.conectar();
  }

  // Al salir de la página se cierra la conexión y los demás ven que el usuario salió del chat
  ngOnDestroy(): void {
    this.chat.desconectar();
  }

  protected enviar(): void {
    if (!this.puedeEnviar()) return;
    if (this.chat.enviar(this.texto())) this.texto.set('');
  }

  // Enter envía; Shift + Enter hace un salto de línea
  protected enterParaEnviar(evento: Event): void {
    evento.preventDefault();
    this.enviar();
  }
}
