import { Component, inject } from '@angular/core';
import { AuditoriaService } from '../../services/auditoria';
import { Auditoria } from '../../../../core/models/auditoria';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';

@Component({
  selector: 'app-auditoria-page',
  imports: [PageHeader, Tarjeta, FilterBar, Avatar, StatusPill],
  templateUrl: './auditoria-page.html',
  styleUrl: './auditoria-page.css'
})
export class AuditoriaPage {
  auditoriaService = inject(AuditoriaService);

  seleccionado: Auditoria = this.auditoriaService.eventos()[0];
}
