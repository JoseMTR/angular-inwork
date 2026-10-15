import { Injectable, signal } from '@angular/core';

export interface UsuarioSesion {
  nombre: string;
  correo: string;
  telefono: string;
  ciudad: string;
  rol: string;
  ultima_sesion: string;
}

@Injectable({
  providedIn: 'root'
})
export class SesionService {
  private _usuario = signal<UsuarioSesion>({
    nombre: 'Jose Torregrosa',
    correo: 'admin@inwork.co',
    telefono: '300 512 7788',
    ciudad: 'Barranquilla',
    rol: 'Administrador',
    ultima_sesion: 'Hoy, 8:42 a. m.'
  });

  readonly usuario = this._usuario.asReadonly();
}
