import { Component, inject } from '@angular/core';
import { VerificacionService } from '../../services/verificacion';
import { Verificacion } from '../../../../core/models/verificacion';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';

@Component({
  selector: 'app-verificacion-page',
  imports: [PageHeader, StatCard, Tarjeta, Avatar, StatusPill],
  templateUrl: './verificacion-page.html',
  styleUrl: './verificacion-page.css'
})
export class VerificacionPage {
  verificacionService = inject(VerificacionService);

  seleccionada: Verificacion = this.verificacionService.solicitudes()[0];

  filtros: string[] = ['Todas', 'Pendientes', 'Aprobadas', 'Rechazadas'];
}
