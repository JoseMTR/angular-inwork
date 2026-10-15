import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { GraficoArea } from '../../../../shared/components/grafico-area/grafico-area';
import { GraficoDona } from '../../../../shared/components/grafico-dona/grafico-dona';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, PageHeader, StatCard, Tarjeta, GraficoArea, GraficoDona, GraficoBarras, Avatar, StatusPill],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPage {
  dashboardService = inject(DashboardService);

  series: string[] = ['Ingresos', 'Usuarios', 'Verificaciones'];
}
