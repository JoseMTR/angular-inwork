import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-bubble',
  imports: [],
  templateUrl: './chat-bubble.html',
  styleUrl: './chat-bubble.css'
})
export class ChatBubble {
  @Input() autor = '';
  @Input() hora = '';
  @Input() propio = false;
  @Input() ia = false;
}
