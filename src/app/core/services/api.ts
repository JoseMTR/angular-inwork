// Comunicación con las dos APIs usando HttpClient.
//  - api.get / post / put / del  -> API principal (FastAPI + PostgreSQL)
//  - api.pagos.get / post ...     -> API de pagos (Express + MySQL)
// El token JWT lo agrega el interceptor (core/interceptors/auth-interceptor.ts) y sirve en las dos.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_PAGOS, API_PRINCIPAL } from '../config';

export class ErrorApi extends Error {
  constructor(mensaje: string, readonly estado: number) {
    super(mensaje);
  }
}

function mensajeDeError(json: any, estado: number): string {
  if (json && typeof json === 'object') {
    if (typeof json.detail === 'string') return json.detail;
    if (Array.isArray(json.detail)) {
      return json.detail.map((d: any) => `${(d.loc || []).slice(-1)[0] ?? ''}: ${d.msg}`).join('. ');
    }
    if (json.mensaje) return json.mensaje;
  }
  if (estado === 0) {
    return 'No se pudo conectar con el servidor. Si la API estaba dormida en Render, espera unos segundos y vuelve a intentar.';
  }
  if (estado === 403) return 'Tu rol no tiene permiso para hacer esto';
  if (estado === 404) return 'No se encontró el registro';
  return `Error ${estado} en el servidor`;
}

export interface ClienteApi {
  get(ruta: string): Promise<any>;
  post(ruta: string, datos?: any): Promise<any>;
  put(ruta: string, datos?: any): Promise<any>;
  del(ruta: string): Promise<any>;
}

@Injectable({ providedIn: 'root' })
export class ApiService implements ClienteApi {
  private readonly http = inject(HttpClient);

  // Las lecturas se guardan 30 segundos para no pedir lo mismo varias veces al cambiar de página.
  // Cualquier cambio (POST, PUT, DELETE) borra esta memoria para que todos vean lo nuevo.
  private readonly memoria = new Map<string, Promise<any>>();

  readonly pagos: ClienteApi = this.cliente(API_PAGOS + '/api');
  private readonly principal: ClienteApi = this.cliente(API_PRINCIPAL);

  get(ruta: string): Promise<any> {
    return this.principal.get(ruta);
  }
  post(ruta: string, datos: any = {}): Promise<any> {
    return this.principal.post(ruta, datos);
  }
  put(ruta: string, datos: any = {}): Promise<any> {
    return this.principal.put(ruta, datos);
  }
  del(ruta: string): Promise<any> {
    return this.principal.del(ruta);
  }

  limpiarMemoria(): void {
    this.memoria.clear();
  }

  iniciarSesion(correo: string, password: string): Promise<any> {
    return this.pedir(API_PRINCIPAL + '/auth/login', 'POST', { correo, password });
  }

  // Para el indicador de "API en línea" del pie de página
  async estadoApis(): Promise<{ principal: boolean; pagos: boolean }> {
    const probar = async (url: string) => {
      try {
        const r = await fetch(url);
        return r.ok;
      } catch {
        return false;
      }
    };
    const [principal, pagos] = await Promise.all([probar(API_PRINCIPAL + '/'), probar(API_PAGOS + '/')]);
    return { principal, pagos };
  }

  private async pedir(url: string, metodo: string, datos?: any): Promise<any> {
    try {
      return await firstValueFrom(this.http.request(metodo, url, { body: datos }));
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        throw new ErrorApi(mensajeDeError(error.error, error.status), error.status);
      }
      throw error;
    }
  }

  private leer(url: string): Promise<any> {
    const guardada = this.memoria.get(url);
    if (guardada) return guardada;
    const promesa = this.pedir(url, 'GET').catch((error) => {
      this.memoria.delete(url);
      throw error;
    });
    this.memoria.set(url, promesa);
    setTimeout(() => this.memoria.delete(url), 30000);
    return promesa;
  }

  private async cambiar(url: string, metodo: string, datos?: any): Promise<any> {
    const respuesta = await this.pedir(url, metodo, datos);
    this.limpiarMemoria();
    return respuesta;
  }

  private cliente(base: string): ClienteApi {
    return {
      get: (ruta) => this.leer(base + ruta),
      post: (ruta, datos = {}) => this.cambiar(base + ruta, 'POST', datos),
      put: (ruta, datos = {}) => this.cambiar(base + ruta, 'PUT', datos),
      del: (ruta) => this.cambiar(base + ruta, 'DELETE')
    };
  }
}

// Carga varias cosas a la vez; si alguna falla (por ejemplo por permisos) devuelve [] en esa
export async function cargarVarios(pedidos: Record<string, any>): Promise<{ datos: any; errores: any[] }> {
  const claves = Object.keys(pedidos);
  const resultados = await Promise.allSettled(claves.map((c) => pedidos[c]));
  const datos: any = {};
  const errores: any[] = [];
  claves.forEach((clave, i) => {
    const resultado = resultados[i];
    if (resultado.status === 'fulfilled') {
      datos[clave] = resultado.value ?? [];
    } else {
      datos[clave] = [];
      errores.push(resultado.reason);
    }
  });
  return { datos, errores };
}
