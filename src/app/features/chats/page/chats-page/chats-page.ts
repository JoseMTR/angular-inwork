import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatsService } from '../../services/chats';
import { Chat } from '../../../../core/models/chat';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ChatBubble } from '../../../../shared/components/chat-bubble/chat-bubble';

@Component({
  selector: 'app-chats-page',
  imports: [RouterLink, PageHeader, Avatar, ChatBubble],
  templateUrl: './chats-page.html',
  styleUrl: './chats-page.css'
})
export class ChatsPage {
  chatsService = inject(ChatsService);

  seleccionado: Chat = this.chatsService.chats()[0];
}
