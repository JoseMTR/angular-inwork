// Guards de las rutas del panel.
//  - authGuard: hay sesión, el token no venció y el rol es Administrador, Moderador o Analista.
//               La primera vez vuelve a pedir los módulos del rol (si el admin cambió permisos, el menú cambia).
//  - permisoGuard: el rol tiene permiso de leer el módulo de esa ruta según la tabla rol_modulo.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api';
import { ROLES_PANEL, SesionService, tokenVencido } from '../services/sesion';

export const authGuard: CanActivateFn = async () => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const api = inject(ApiService);

  const actual = sesion.sesion();
  if (!actual || tokenVencido(actual.token) || !ROLES_PANEL.includes(actual.id_rol)) {
    sesion.cerrar();
    return router.createUrlTree(['/'], { queryParams: { sesion: 'expirada' } });
  }

  if (!sesion.modulosActualizados) {
    try {
      sesion.ponerModulos(await api.get('/auth/mis-modulos'));
    } catch {
      // Si la API no responde se usa el menú guardado
    }
  }
  return sesion.sesion() ? true : router.createUrlTree(['/'], { queryParams: { sesion: 'expirada' } });
};

export const permisoGuard: CanActivateFn = (ruta) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const camino = '/' + (ruta.routeConfig?.path ?? '');
  return sesion.puedeAbrir(camino) ? true : router.createUrlTree(['/sin-permiso']);
};
