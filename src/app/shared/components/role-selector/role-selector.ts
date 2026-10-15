import { Component, Input } from '@angular/core';

interface OpcionRol {
  nombre: string;
  icono: string;
  descripcion: string;
}

@Component({
  selector: 'app-role-selector',
  imports: [],
  templateUrl: './role-selector.html',
  styleUrl: './role-selector.css'
})
export class RoleSelector {
  @Input() seleccionado = 'Administrador';

  roles: OpcionRol[] = [
    { nombre: 'Administrador', icono: 'admin_panel_settings', descripcion: 'Acceso total' },
    { nombre: 'Moderador', icono: 'shield_person', descripcion: 'Reportes y verificación' },
    { nombre: 'Analista', icono: 'monitoring', descripcion: 'Métricas e informes' }
  ];
}
