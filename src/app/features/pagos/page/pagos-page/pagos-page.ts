import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PagosService } from '../../services/pagos';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';
import { GraficoDona } from '../../../../shared/components/grafico-dona/grafico-dona';
import { MonedaPipe } from '../../../../shared/pipes/moneda-pipe';

@Component({
  selector: 'app-pagos-page',
  imports: [RouterLink, PageHeader, StatCard, Tarjeta, FilterBar, StatusPill, GraficoBarras, GraficoDona, MonedaPipe],
  templateUrl: './pagos-page.html',
  styleUrl: './pagos-page.css'
})
export class PagosPage {
  pagosService = inject(PagosService);

  nombreMetodo(metodo: string): string {
    switch (metodo) {
      case 'pse':
        return 'PSE';
      case 'nequi':
        return 'Nequi';
      case 'daviplata':
        return 'Daviplata';
      case 'tarjeta':
        return 'Tarjeta';
      default:
        return 'Efectivo';
    }
  }

  icono(metodo: string): string {
    switch (metodo) {
      case 'tarjeta':
        return 'credit_card';
      case 'pse':
        return 'account_balance';
      case 'efectivo':
        return 'payments';
      default:
        return 'smartphone';
    }
  }
}
