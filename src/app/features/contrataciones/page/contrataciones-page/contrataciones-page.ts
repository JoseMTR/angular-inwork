import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContratacionesService } from '../../services/contrataciones';
import { Contratacion } from '../../../../core/models/contratacion';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { MonedaPipe } from '../../../../shared/pipes/moneda-pipe';

@Component({
  selector: 'app-contrataciones-page',
  imports: [RouterLink, PageHeader, StatCard, Tarjeta, FilterBar, Avatar, StatusPill, MonedaPipe],
  templateUrl: './contrataciones-page.html',
  styleUrl: './contrataciones-page.css'
})
export class ContratacionesPage {
  contratacionesService = inject(ContratacionesService);

  seleccionada: Contratacion = this.contratacionesService.contrataciones()[0];
}
