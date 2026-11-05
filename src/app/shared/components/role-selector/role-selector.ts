import { Component, input, output } from '@angular/core';

export interface CuentaDemo {
  nombre: string;
  icono: string;
  descripcion: string;
  correo: string;
}

// Atajos para probar el panel con una cuenta de cada rol (las de DB.sql).
@Component({
  selector: 'app-role-selector',
  templateUrl: './role-selector.html',
  styleUrl: './role-selector.css'
})
export class RoleSelector {
  readonly seleccionado = input('');
  readonly elegir = output<CuentaDemo>();

  readonly roles: CuentaDemo[] = [
    { nombre: 'Administrador', icono: 'admin_panel_settings', descripcion: 'Acceso total', correo: 'sebastian.rojas@inwork.com.co' },
    { nombre: 'Moderador', icono: 'shield_person', descripcion: 'Reportes y verificación', correo: 'mariana.castro@inwork.com.co' },
    { nombre: 'Analista', icono: 'monitoring', descripcion: 'Métricas e informes', correo: 'jorge.pertuz@inwork.com.co' }
  ];
}
