import { Component, inject } from '@angular/core';
import { CalificacionesService } from '../../services/calificaciones';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';

@Component({
  selector: 'app-calificaciones-page',
  imports: [PageHeader, StatCard, Tarjeta, FilterBar, Avatar, GraficoBarras],
  templateUrl: './calificaciones-page.html',
  styleUrl: './calificaciones-page.css'
})
export class CalificacionesPage {
  calificacionesService = inject(CalificacionesService);

  estrellas: number[] = [1, 2, 3, 4, 5];
}
