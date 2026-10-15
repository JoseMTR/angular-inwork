import { Component, inject } from '@angular/core';
import { IaService } from '../../services/ia';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ChatBubble } from '../../../../shared/components/chat-bubble/chat-bubble';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';
import { MonedaPipe } from '../../../../shared/pipes/moneda-pipe';

@Component({
  selector: 'app-ia-page',
  imports: [PageHeader, ChatBubble, GraficoBarras, MonedaPipe],
  templateUrl: './ia-page.html',
  styleUrl: './ia-page.css'
})
export class IaPage {
  iaService = inject(IaService);

  conversacionActiva = 1;
}
