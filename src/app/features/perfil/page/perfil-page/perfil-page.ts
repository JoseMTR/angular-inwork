// PERFIL: datos de la cuenta con la que se inició sesión (GET /auth/me),
// cambio de contraseña (PUT /auth/cambiar-password) y los permisos del rol.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import * as f from '../../../../shared/utils/formato';
import { ICONOS_ROL, infoModulo } from '../../../../shared/utils/menu';

@Component({
  selector: 'app-perfil-page',
  imports: [FormsModule, RouterLink, PageHeader, Tarjeta, Avatar, Cargando],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css'
})
export class PerfilPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;
  protected readonly iconosRol: Partial<Record<number, string>> = ICONOS_ROL;

  protected readonly acciones = [
    { campo: 'puede_crear', texto: 'Crear' },
    { campo: 'puede_leer', texto: 'Ver' },
    { campo: 'puede_editar', texto: 'Editar' },
    { campo: 'puede_eliminar', texto: 'Eliminar' }
  ];

  protected readonly cargando = signal(true);
  protected readonly yo = signal<any>(null);
  protected readonly ciudades = signal<any[]>([]);
  protected readonly errorDatos = signal('');
  protected readonly guardandoDatos = signal(false);
  protected readonly errorClave = signal('');
  protected readonly guardandoClave = signal(false);
  protected form: any = {};
  protected clave = { actual: '', nueva: '', confirmar: '' };

  protected readonly puedeEditar = computed(() => this.sesion.permiso('usuarios', 'editar'));

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos, errores } = await cargarVarios({
      yo: this.api.get('/auth/me'),
      ciudades: this.sesion.permiso('ubicacion') ? this.api.get('/ciudades/') : []
    });
    if (errores.length && !datos.yo?.id_usuario) this.avisos.avisar(errores[0].message, 'error');
    this.yo.set(datos.yo?.id_usuario ? datos.yo : null);
    this.ciudades.set([...(datos.ciudades ?? [])].sort((a: any, b: any) => a.nombre.localeCompare(b.nombre)));
    this.llenarFormulario();
    this.cargando.set(false);
  }

  protected llenarFormulario(): void {
    const yo = this.yo();
    this.form = {
      nombre: yo?.nombre ?? '',
      apellido: yo?.apellido ?? '',
      telefono: yo?.telefono ?? '',
      id_ciudad: yo?.id_ciudad ?? null,
      direccion: yo?.direccion ?? '',
      descripcion: yo?.descripcion ?? ''
    };
  }

  protected nombreCiudad(): string {
    return this.ciudades().find((c) => c.id_ciudad === this.yo()?.id_ciudad)?.nombre ?? 'Sin ciudad';
  }

  protected readonly misModulos = computed(() => this.sesion.modulos().map((m: any) => ({ ...m, info: infoModulo(m) })));

  protected tiene(modulo: any, campo: string): boolean {
    return this.sesion.esAdmin() || !!modulo[campo];
  }

  protected hayCambios(): boolean {
    const yo = this.yo();
    if (!yo) return false;
    return ['nombre', 'apellido', 'telefono', 'direccion', 'descripcion'].some((c) => (this.form[c] ?? '') !== (yo[c] ?? '')) || this.form.id_ciudad !== yo.id_ciudad;
  }

  protected async guardarDatos(): Promise<void> {
    this.errorDatos.set('');
    if (!this.form.nombre.trim() || !this.form.apellido.trim()) {
      this.errorDatos.set('Escribe tu nombre y apellido.');
      return;
    }
    if (!/^3\d{9}$/.test(this.form.telefono.trim())) {
      this.errorDatos.set('El teléfono debe tener 10 dígitos y empezar por 3.');
      return;
    }
    this.guardandoDatos.set(true);
    const yo = this.yo();
    try {
      await this.api.put(`/usuarios/${yo.id_usuario}`, {
        id_ciudad: this.form.id_ciudad ? Number(this.form.id_ciudad) : null,
        nombre: this.form.nombre.trim(),
        apellido: this.form.apellido.trim(),
        telefono: this.form.telefono.trim(),
        foto_perfil: yo.foto_perfil ?? null,
        descripcion: this.form.descripcion.trim() || null,
        direccion: this.form.direccion.trim() || null
      });
      this.sesion.cambiarNombre(`${this.form.nombre.trim()} ${this.form.apellido.trim()}`);
      this.avisos.avisar('Tus datos se actualizaron');
      await this.cargar();
    } catch (e: any) {
      this.errorDatos.set(e.message);
    } finally {
      this.guardandoDatos.set(false);
    }
  }

  protected async cambiarClave(): Promise<void> {
    this.errorClave.set('');
    if (!this.clave.actual) {
      this.errorClave.set('Escribe tu contraseña actual.');
      return;
    }
    if (this.clave.nueva.length < 8) {
      this.errorClave.set('La nueva contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    if (this.clave.nueva !== this.clave.confirmar) {
      this.errorClave.set('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (this.clave.nueva === this.clave.actual) {
      this.errorClave.set('La nueva contraseña debe ser diferente a la actual.');
      return;
    }
    this.guardandoClave.set(true);
    try {
      await this.api.put('/auth/cambiar-password', { password_actual: this.clave.actual, password_nueva: this.clave.nueva });
      this.clave = { actual: '', nueva: '', confirmar: '' };
      this.avisos.avisar('Contraseña actualizada. Úsala la próxima vez que inicies sesión.');
    } catch (e: any) {
      this.errorClave.set(e.message);
    } finally {
      this.guardandoClave.set(false);
    }
  }

  protected salir(): void {
    this.sesion.cerrar();
    this.router.navigateByUrl('/');
  }
}
