import { Component, inject } from '@angular/core';
import { RolesService } from '../../services/roles';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';

@Component({
  selector: 'app-roles-page',
  imports: [PageHeader, Tarjeta],
  templateUrl: './roles-page.html',
  styleUrl: './roles-page.css'
})
export class RolesPage {
  rolesService = inject(RolesService);

  rolSeleccionado = 'Moderador';
}
