import { Injectable, signal } from '@angular/core';
import { Permiso, Rol } from '../../../core/models/rol';

export interface VistaMenu {
  texto: string;
  acceso: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private _roles = signal<Rol[]>([
    { id_rol: 1, nombre: 'Administrador', descripcion: 'Acceso total a las 17 ventanas', usuarios: 3, icono: 'admin_panel_settings' },
    { id_rol: 2, nombre: 'Moderador', descripcion: 'Reportes, verificación y chats', usuarios: 5, icono: 'shield_person' },
    { id_rol: 3, nombre: 'Analista', descripcion: 'Métricas, IA e informes', usuarios: 4, icono: 'monitoring' }
  ]);

  private _permisos = signal<Permiso[]>([
    { modulo: 'Usuarios', puede_crear: false, puede_leer: true, puede_editar: false, puede_eliminar: false },
    { modulo: 'Trabajos', puede_crear: false, puede_leer: true, puede_editar: false, puede_eliminar: false },
    { modulo: 'Ofertas', puede_crear: false, puede_leer: false, puede_editar: false, puede_eliminar: false },
    { modulo: 'Contrataciones', puede_crear: false, puede_leer: false, puede_editar: false, puede_eliminar: false },
    { modulo: 'Pagos', puede_crear: false, puede_leer: false, puede_editar: false, puede_eliminar: false },
    { modulo: 'Reportes', puede_crear: false, puede_leer: true, puede_editar: true, puede_eliminar: false },
    { modulo: 'Categorías', puede_crear: false, puede_leer: true, puede_editar: false, puede_eliminar: false },
    { modulo: 'Auditoría', puede_crear: false, puede_leer: false, puede_editar: false, puede_eliminar: false }
  ]);

  private _menu = signal<VistaMenu[]>([
    { texto: 'Dashboard', acceso: 'completo' },
    { texto: 'Usuarios', acceso: 'lectura' },
    { texto: 'Verificación de identidad', acceso: 'completo' },
    { texto: 'Calificaciones', acceso: 'completo' },
    { texto: 'Trabajos', acceso: 'lectura' },
    { texto: 'Reportes', acceso: 'completo' },
    { texto: 'Chats y mensajes', acceso: 'completo' },
    { texto: 'Perfil', acceso: 'completo' },
    { texto: 'Pagos', acceso: 'ninguno' },
    { texto: 'Roles y permisos', acceso: 'ninguno' },
    { texto: 'Auditoría', acceso: 'ninguno' }
  ]);

  readonly roles = this._roles.asReadonly();
  readonly permisos = this._permisos.asReadonly();
  readonly menu = this._menu.asReadonly();
}
