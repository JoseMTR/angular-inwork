// Interceptor: pone el token JWT en cada petición a las dos APIs.
// Si la API responde 401 (token vencido o el rol cambió) cierra la sesión y vuelve al login.
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_PAGOS, API_PRINCIPAL } from '../config';
import { SesionService } from '../services/sesion';

export const authInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const sesion = inject(SesionService);
  const router = inject(Router);

  const token = sesion.sesion()?.token;
  const esApi = peticion.url.startsWith(API_PRINCIPAL) || peticion.url.startsWith(API_PAGOS);
  const conToken = !!token && esApi && !peticion.url.endsWith('/auth/login');

  const conEncabezado = conToken ? peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : peticion;

  return siguiente(conEncabezado).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && conToken) {
        sesion.cerrar();
        router.navigate(['/'], { queryParams: { sesion: 'expirada' } });
      }
      return throwError(() => error);
    })
  );
};
