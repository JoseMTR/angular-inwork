import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrabajosService } from '../../services/trabajos';
import { Trabajo } from '../../../../core/models/trabajo';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { MonedaPipe } from '../../../../shared/pipes/moneda-pipe';

@Component({
  selector: 'app-trabajos-page',
  imports: [RouterLink, PageHeader, StatCard, Tarjeta, FilterBar, Avatar, StatusPill, MonedaPipe],
  templateUrl: './trabajos-page.html',
  styleUrl: './trabajos-page.css'
})
export class TrabajosPage {
  trabajosService = inject(TrabajosService);

  seleccionado: Trabajo = this.trabajosService.trabajos()[0];
}
