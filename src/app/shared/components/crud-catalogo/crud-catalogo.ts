// Tabla + formulario para los catálogos (países, ciudades, categorías, habilidades...).
// Crea, edita y desactiva según los permisos del rol en la tabla rol_modulo.
//
// campos = [{ nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text' | 'textarea' | 'select', opciones: [{ valor, texto }], requerido: true }]
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api';
import { AvisosService } from '../../../core/services/avisos';
import { SesionService } from '../../../core/services/sesion';
import { AccionTabla, Columna } from '../../interfaces/tabla';
import { Confirmar } from '../confirmar/confirmar';
import { Modal } from '../modal/modal';
import { TablaDatos } from '../tabla-datos/tabla-datos';
import { Tarjeta } from '../tarjeta/tarjeta';

export interface CampoCatalogo {
  nombre: string;
  etiqueta: string;
  tipo?: 'text' | 'textarea' | 'select';
  opciones?: { valor: any; texto: string }[];
  requerido?: boolean;
  ayuda?: string;
}

@Component({
  selector: 'app-crud-catalogo',
  imports: [FormsModule, Tarjeta, TablaDatos, Modal, Confirmar],
  templateUrl: './crud-catalogo.html',
  styleUrl: './crud-catalogo.css'
})
export class CrudCatalogo {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  protected readonly sesion = inject(SesionService);

  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
  readonly singular = input.required<string>();
  readonly datos = input<any[]>([]);
  readonly columnas = input<Columna[]>([]);
  readonly campos = input<CampoCatalogo[]>([]);
  readonly ruta = input.required<string>(); // ej: '/paises/'
  readonly clave = input.required<string>(); // ej: 'id_pais' (solo se usa por dentro)
  readonly modulo = input.required<string>(); // ej: 'ubicacion'
  readonly alCambiar = input<() => unknown>(() => {});
  readonly textoEliminar = input<(fila: any) => string>((fila) => `Se va a desactivar «${fila.nombre}».`);

  protected readonly abierto = signal(false);
  protected readonly confirmar = signal(false);
  protected readonly editando = signal<any>(null);
  protected readonly error = signal('');
  protected readonly guardando = signal(false);
  protected form: any = {};
  protected readonly idForm = 'form-' + Math.random().toString(36).slice(2, 8);

  protected readonly accionesTabla = computed<AccionTabla[]>(() => [
    ...(this.sesion.permiso(this.modulo(), 'editar') ? [{ texto: 'Editar', icono: 'edit', soloIcono: true, alHacer: (fila: any) => this.abrirEditar(fila) }] : []),
    ...(this.sesion.permiso(this.modulo(), 'eliminar')
      ? [
          {
            texto: 'Desactivar',
            icono: 'delete',
            tono: 'peligro' as const,
            soloIcono: true,
            alHacer: (fila: any) => {
              this.editando.set(fila);
              this.confirmar.set(true);
            }
          }
        ]
      : [])
  ]);

  protected tituloModal(): string {
    const singular = this.singular().toLowerCase();
    return this.editando() ? `Editar ${singular}` : `Nuevo ${singular}`;
  }

  private vacio(): any {
    const valores: any = {};
    for (const campo of this.campos()) valores[campo.nombre] = campo.tipo === 'select' ? (campo.opciones?.[0]?.valor ?? null) : '';
    return valores;
  }

  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form = this.vacio();
    this.error.set('');
    this.abierto.set(true);
  }

  private abrirEditar(fila: any): void {
    this.editando.set(fila);
    this.form = Object.fromEntries(this.campos().map((c) => [c.nombre, fila[c.nombre] ?? '']));
    this.error.set('');
    this.abierto.set(true);
  }

  protected async guardar(): Promise<void> {
    for (const campo of this.campos()) {
      if (campo.requerido !== false && (this.form[campo.nombre] === '' || this.form[campo.nombre] === null)) {
        this.error.set(`Completa el campo «${campo.etiqueta}».`);
        return;
      }
    }
    const cuerpo: any = {};
    for (const campo of this.campos()) {
      const valor = this.form[campo.nombre];
      cuerpo[campo.nombre] = campo.tipo === 'select' && valor !== null ? Number(valor) : typeof valor === 'string' ? valor.trim() : valor;
    }
    this.guardando.set(true);
    try {
      const editando = this.editando();
      if (editando) {
        await this.api.put(`${this.ruta()}${editando[this.clave()]}`, cuerpo);
        this.avisos.avisar(`${this.singular()} actualizado`);
      } else {
        await this.api.post(this.ruta(), cuerpo);
        this.avisos.avisar(`${this.singular()} creado`);
      }
      this.abierto.set(false);
      await this.alCambiar()();
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.guardando.set(false);
    }
  }

  protected readonly eliminar = async () => {
    await this.api.del(`${this.ruta()}${this.editando()[this.clave()]}`);
    this.avisos.avisar(`${this.singular()} desactivado`);
    await this.alCambiar()();
  };

  protected textoConfirmar(): string {
    const fila = this.editando();
    return fila ? this.textoEliminar()(fila) : '';
  }
}
