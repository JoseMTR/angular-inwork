import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionService } from '../../../../core/services/sesion';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Avatar } from '../../../../shared/components/avatar/avatar';

@Component({
  selector: 'app-perfil-page',
  imports: [RouterLink, PageHeader, Tarjeta, Avatar],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css'
})
export class PerfilPage {
  sesionService = inject(SesionService);
}
