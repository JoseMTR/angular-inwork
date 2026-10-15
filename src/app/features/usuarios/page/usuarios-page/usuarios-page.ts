import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../services/usuarios';
import { Usuario } from '../../../../core/models/usuario';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';

@Component({
  selector: 'app-usuarios-page',
  imports: [RouterLink, PageHeader, StatCard, Tarjeta, FilterBar, Avatar, StatusPill, GraficoBarras],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.css'
})
export class UsuariosPage {
  usuariosService = inject(UsuariosService);

  seleccionado: Usuario = this.usuariosService.usuarios()[0];

  pestanas: string[] = ['Resumen', 'Trabajos', 'Contrataciones', 'Ofertas', 'Calificaciones', 'Reportes'];
}
