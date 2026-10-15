import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OfertasService } from '../../services/ofertas';
import { Oferta } from '../../../../core/models/oferta';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { MonedaPipe } from '../../../../shared/pipes/moneda-pipe';

@Component({
  selector: 'app-ofertas-page',
  imports: [RouterLink, PageHeader, StatCard, Tarjeta, FilterBar, Avatar, StatusPill, MonedaPipe],
  templateUrl: './ofertas-page.html',
  styleUrl: './ofertas-page.css'
})
export class OfertasPage {
  ofertasService = inject(OfertasService);

  seleccionada: Oferta = this.ofertasService.ofertas()[0];

  diferencia(oferta: Oferta): number {
    return Math.round(((oferta.valor_oferta - oferta.presupuesto) / oferta.presupuesto) * 100);
  }
}
