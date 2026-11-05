import { Component, input } from '@angular/core';

// propio = mensaje a la derecha (naranja). ia = respuesta del asistente.
@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.html',
  styleUrl: './chat-bubble.css'
})
export class ChatBubble {
  readonly autor = input('');
  readonly hora = input('');
  readonly propio = input(false);
  readonly ia = input(false);
}
