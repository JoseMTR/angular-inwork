import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InformesService } from '../../services/informes';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';

@Component({
  selector: 'app-informes-page',
  imports: [RouterLink, PageHeader, Tarjeta, StatusPill],
  templateUrl: './informes-page.html',
  styleUrl: './informes-page.css'
})
export class InformesPage {
  informesService = inject(InformesService);

  pestanas: string[] = ['Diarios', 'Semanales', 'Mensuales'];
  pestanaActiva = 'Diarios';
}
