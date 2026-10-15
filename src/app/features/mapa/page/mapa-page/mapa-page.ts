import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapaService, Marcador } from '../../services/mapa';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { MonedaPipe } from '../../../../shared/pipes/moneda-pipe';

@Component({
  selector: 'app-mapa-page',
  imports: [RouterLink, PageHeader, Tarjeta, FilterBar, StatusPill, MonedaPipe],
  templateUrl: './mapa-page.html',
  styleUrl: './mapa-page.css'
})
export class MapaPage {
  mapaService = inject(MapaService);

  seleccionado: Marcador = this.mapaService.marcadores()[0];
}
