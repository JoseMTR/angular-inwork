// ROLES Y PERMISOS: el administrador decide qué puede hacer cada rol en cada módulo.
// Cada interruptor es un campo de la tabla rol_modulo (puede_crear, puede_leer, puede_editar, puede_eliminar).
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { SesionService } from '../../../../core/services/sesion';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { Modal } from '../../../../shared/components/modal/modal';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import { ICONOS_ROL, infoModulo } from '../../../../shared/utils/menu';

const CAMPOS = ['puede_crear', 'puede_leer', 'puede_editar', 'puede_eliminar'];
const TEXTO_ACCESO: Record<string, string> = { lectura: 'Solo lectura', ninguno: 'Sin acceso', parcial: 'Algunas acciones', completo: 'Completo' };

@Component({
  selector: 'app-roles-page',
  imports: [FormsModule, PageHeader, Tarjeta, TablaDatos, Modal, Cargando],
  templateUrl: './roles-page.html',
  styleUrl: './roles-page.css'
})
export class RolesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  protected readonly sesion = inject(SesionService);
  protected readonly iconosRol: Partial<Record<number, string>> = ICONOS_ROL;
  protected readonly textoAcceso = TEXTO_ACCESO;

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ roles: [], modulos: [], permisos: [], usuarios: [] });
  protected readonly rolElegido = signal<any>(null);
  protected readonly filas = signal<any[]>([]); // una fila por módulo con los 4 permisos (copia editable)
  protected readonly guardando = signal(false);

  protected readonly modalRol = signal(false);
  protected readonly editandoRol = signal<any>(null);
  protected readonly errorRol = signal('');
  protected formRol = { nombre: '', descripcion: '' };

  protected readonly puedeEditar = computed(() => this.sesion.permiso('roles', 'editar'));
  protected readonly esAdmin = computed(() => this.rolElegido()?.id_rol === 1);
  protected readonly cambios = computed(() => this.filas().filter((x) => CAMPOS.some((c) => x[c] !== x.original[c])));

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      roles: this.api.get('/roles/'),
      modulos: this.api.get('/modulos/'),
      permisos: this.api.get('/rol-modulo/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
    const anterior = this.rolElegido();
    this.elegirRol(datos.roles.find((r: any) => r.id_rol === anterior?.id_rol) ?? datos.roles.find((r: any) => r.id_rol === 2) ?? datos.roles[0]);
  }

  protected elegirRol(rol: any): void {
    if (!rol) return;
    this.rolElegido.set(rol);
    this.filas.set(
      this.d().modulos.map((m: any) => {
        const actual = this.d().permisos.find((p: any) => p.id_rol === rol.id_rol && p.id_modulo === m.id_modulo);
        const valores = Object.fromEntries(CAMPOS.map((c) => [c, !!actual?.[c]]));
        return {
          id_modulo: m.id_modulo,
          nombre: m.nombre,
          descripcion: m.descripcion,
          ruta: m.ruta,
          id_rol_modulo: actual?.id_rol_modulo ?? null,
          original: { ...valores },
          ...valores
        };
      })
    );
  }

  private interruptor(fila: any, campo: string): string {
    const bloqueado = !this.puedeEditar() || this.esAdmin();
    return `<button type="button" class="interruptor-boton${fila[campo] !== fila.original[campo] ? ' cambiado' : ''}" data-clic="${campo}" aria-pressed="${fila[campo]}" aria-label="${campo.replace('puede_', '')} en ${f.escapar(fila.nombre)}"${bloqueado ? ' disabled' : ''}></button>`;
  }

  protected readonly columnas: Columna[] = [
    {
      titulo: 'Módulo',
      valor: (fila) => infoModulo(fila).texto,
      html: (fila) => `<strong class="bloque-texto">${f.escapar(infoModulo(fila).texto)}</strong><small class="texto-3">${f.escapar(fila.ruta ?? '')}</small>`
    },
    { titulo: 'Crear', valor: (fila) => (fila.puede_crear ? 1 : 0), html: (fila) => this.interruptor(fila, 'puede_crear'), clase: 'centro' },
    { titulo: 'Leer', valor: (fila) => (fila.puede_leer ? 1 : 0), html: (fila) => this.interruptor(fila, 'puede_leer'), clase: 'centro' },
    { titulo: 'Editar', valor: (fila) => (fila.puede_editar ? 1 : 0), html: (fila) => this.interruptor(fila, 'puede_editar'), clase: 'centro' },
    { titulo: 'Eliminar', valor: (fila) => (fila.puede_eliminar ? 1 : 0), html: (fila) => this.interruptor(fila, 'puede_eliminar'), clase: 'centro' }
  ];

  protected readonly alternar = (fila: any, campo: string) => {
    if (!this.puedeEditar() || this.esAdmin()) return;
    this.filas.update((lista) =>
      lista.map((x) => {
        if (x.id_modulo !== fila.id_modulo) return x;
        const nueva = { ...x, [campo]: !x[campo] };
        // Sin leer no tiene sentido crear, editar ni eliminar
        if (campo === 'puede_leer' && !nueva.puede_leer) {
          nueva.puede_crear = nueva.puede_editar = nueva.puede_eliminar = false;
        }
        if (campo !== 'puede_leer' && nueva[campo]) nueva.puede_leer = true;
        return nueva;
      })
    );
  };

  protected async guardar(): Promise<void> {
    this.guardando.set(true);
    const rol = this.rolElegido();
    try {
      for (const fila of this.cambios()) {
        const cuerpo = { id_rol: rol.id_rol, id_modulo: fila.id_modulo, ...Object.fromEntries(CAMPOS.map((c) => [c, fila[c]])) };
        if (fila.id_rol_modulo) await this.api.put(`/rol-modulo/${fila.id_rol_modulo}`, cuerpo);
        else await this.api.post('/rol-modulo/', cuerpo);
      }
      this.avisos.avisar(`Permisos de ${rol.nombre} guardados. Sus usuarios verán el menú nuevo al recargar.`);
      this.sesion.ponerModulos(await this.api.get('/auth/mis-modulos'));
      await this.cargar();
    } catch (e: any) {
      this.avisos.avisar(e.message, 'error');
    } finally {
      this.guardando.set(false);
    }
  }

  protected textoGuardar(): string {
    const n = this.cambios().length;
    if (this.guardando()) return 'Guardando...';
    return n ? `Guardar ${n} cambio${n === 1 ? '' : 's'}` : 'Guardar cambios';
  }

  // Vista previa del menú con la configuración actual
  protected readonly menu = computed(() =>
    this.filas().map((fila) => ({
      texto: infoModulo(fila).texto,
      acceso: !fila.puede_leer
        ? 'ninguno'
        : fila.puede_crear && fila.puede_editar && fila.puede_eliminar
          ? 'completo'
          : fila.puede_crear || fila.puede_editar || fila.puede_eliminar
            ? 'parcial'
            : 'lectura'
    }))
  );

  protected usuariosDe(rol: any): number {
    return this.d().usuarios.filter((u: any) => u.id_rol === rol.id_rol).length;
  }

  protected abrirRol(rol: any = null): void {
    this.editandoRol.set(rol);
    this.formRol = { nombre: rol?.nombre ?? '', descripcion: rol?.descripcion ?? '' };
    this.errorRol.set('');
    this.modalRol.set(true);
  }

  protected async guardarRol(): Promise<void> {
    if (!this.formRol.nombre.trim()) {
      this.errorRol.set('Escribe el nombre del rol.');
      return;
    }
    const cuerpo = { nombre: this.formRol.nombre.trim(), descripcion: this.formRol.descripcion.trim() || null };
    const editando = this.editandoRol();
    try {
      if (editando) await this.api.put(`/roles/${editando.id_rol}`, cuerpo);
      else await this.api.post('/roles/', cuerpo);
      this.avisos.avisar(editando ? 'Rol actualizado' : 'Rol creado. Ahora dale permisos.');
      this.modalRol.set(false);
      await this.cargar();
    } catch (e: any) {
      this.errorRol.set(e.message);
    }
  }
}
