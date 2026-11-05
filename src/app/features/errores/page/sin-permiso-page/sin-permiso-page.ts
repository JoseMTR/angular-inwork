import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

// Se muestra cuando el rol no tiene el módulo en la tabla rol_modulo (lo decide permisoGuard)
@Component({
  selector: 'app-sin-permiso-page',
  imports: [EmptyState, RouterLink],
  templateUrl: './sin-permiso-page.html',
  styleUrl: './sin-permiso-page.css'
})
export class SinPermisoPage {}
