// Sesión del usuario: el token JWT que entrega la API (POST /auth/login), su rol
// y los módulos de su rol (tabla rol_modulo, GET /auth/mis-modulos).
import { Injectable, computed, signal } from '@angular/core';

export interface Sesion {
  token: string;
  id_usuario: number;
  nombre: string;
  id_rol: number;
  rol: string;
  inicio: string;
}

// Una fila de GET /auth/mis-modulos
export interface ModuloPermiso {
  nombre: string;
  descripcion: string | null;
  ruta: string;
  puede_crear: boolean;
  puede_leer: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
}

export type Accion = 'crear' | 'leer' | 'editar' | 'eliminar';

const CLAVE_SESION = 'inwork_sesion';
const CLAVE_MODULOS = 'inwork_modulos';

// Solo estos roles pueden entrar al panel de administración
export const ROLES_PANEL = [1, 2, 3];

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const texto = localStorage.getItem(clave) ?? sessionStorage.getItem(clave);
    return texto ? (JSON.parse(texto) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

function recordarEnLocal(): boolean {
  try {
    return localStorage.getItem('inwork_recordar') !== 'no';
  } catch {
    return true;
  }
}

function guardar(clave: string, valor: unknown): void {
  try {
    localStorage.removeItem(clave);
    sessionStorage.removeItem(clave);
    if (valor === null) return;
    const almacen = recordarEnLocal() ? localStorage : sessionStorage;
    almacen.setItem(clave, JSON.stringify(valor));
  } catch {
    // Si el navegador no deja guardar, la sesión dura mientras la pestaña esté abierta
  }
}

// Lee la fecha de vencimiento que trae el JWT
export function tokenVencido(token: string): boolean {
  try {
    const datos = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !datos.exp || datos.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly _sesion = signal<Sesion | null>(leer<Sesion | null>(CLAVE_SESION, null));
  private readonly _modulos = signal<ModuloPermiso[]>(leer<ModuloPermiso[]>(CLAVE_MODULOS, []));

  readonly sesion = this._sesion.asReadonly();
  readonly modulos = this._modulos.asReadonly();
  readonly esAdmin = computed(() => this._sesion()?.id_rol === 1);

  // Se vuelven a pedir los módulos una vez cada vez que se abre el panel
  modulosActualizados = false;

  iniciar(datos: any, recordar = true): void {
    try {
      localStorage.setItem('inwork_recordar', recordar ? 'si' : 'no');
    } catch {
      /* nada */
    }
    const nueva: Sesion = {
      token: datos.access_token,
      id_usuario: datos.id_usuario,
      nombre: datos.nombre,
      id_rol: datos.id_rol,
      rol: datos.rol,
      inicio: new Date().toISOString()
    };
    this._sesion.set(nueva);
    guardar(CLAVE_SESION, nueva);
  }

  cambiarNombre(nombre: string): void {
    const actual = this._sesion();
    if (!actual) return;
    const nueva = { ...actual, nombre };
    this._sesion.set(nueva);
    guardar(CLAVE_SESION, nueva);
  }

  ponerModulos(lista: ModuloPermiso[]): void {
    this._modulos.set(lista ?? []);
    this.modulosActualizados = true;
    guardar(CLAVE_MODULOS, lista && lista.length ? lista : null);
  }

  cerrar(): void {
    this._sesion.set(null);
    this._modulos.set([]);
    this.modulosActualizados = false;
    guardar(CLAVE_SESION, null);
    guardar(CLAVE_MODULOS, null);
  }

  // permiso('usuarios', 'editar') -> true / false, según la tabla rol_modulo
  permiso(modulo: string, accion: Accion = 'leer'): boolean {
    const actual = this._sesion();
    if (!actual) return false;
    if (actual.id_rol === 1) return true; // el administrador puede todo
    const fila: any = this._modulos().find((m) => m.nombre === modulo);
    return !!fila && !!fila['puede_' + accion];
  }

  // Inicio, Perfil y Sin permiso son de todos; lo demás debe estar en rol_modulo con permiso de leer
  puedeAbrir(ruta: string): boolean {
    if (['/inicio', '/perfil', '/sin-permiso'].includes(ruta)) return true;
    if (this._sesion()?.id_rol === 1) return true;
    const modulo = this._modulos().find((m) => ruta === m.ruta || ruta.startsWith(m.ruta + '/'));
    return !!modulo && modulo.puede_leer;
  }
}
