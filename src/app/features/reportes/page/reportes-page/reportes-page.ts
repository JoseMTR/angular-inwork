import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportesService } from '../../services/reportes';
import { Reporte } from '../../../../core/models/reporte';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';

@Component({
  selector: 'app-reportes-page',
  imports: [RouterLink, PageHeader, StatCard, Tarjeta, FilterBar, Avatar, StatusPill],
  templateUrl: './reportes-page.html',
  styleUrl: './reportes-page.css'
})
export class ReportesPage {
  reportesService = inject(ReportesService);

  seleccionado: Reporte = this.reportesService.reportes()[0];

  motivo(texto: string): string {
    const limpio = texto.replace('_', ' ');
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  }
}
