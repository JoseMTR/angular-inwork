// ARCHIVOS ADJUNTOS: fotos y documentos de trabajos, mensajes y reportes (se guarda la URL).
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { SesionService } from '../../../../core/services/sesion';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { Confirmar } from '../../../../shared/components/confirmar/confirmar';
import { Modal } from '../../../../shared/components/modal/modal';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Estadistica } from '../../../../shared/interfaces/estadistica';
import { AccionTabla, Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

const ENTIDADES: Record<string, string> = { trabajo: 'Trabajo', mensaje: 'Mensaje', reporte: 'Reporte' };

@Component({
  selector: 'app-adjuntos-page',
  imports: [FormsModule, PageHeader, StatCard, Tarjeta, TablaDatos, Modal, Confirmar, Cargando],
  templateUrl: './adjuntos-page.html',
  styleUrl: './adjuntos-page.css'
})
export class AdjuntosPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  protected readonly sesion = inject(SesionService);

  protected readonly entidades = Object.entries(ENTIDADES).map(([valor, texto]) => ({ valor, texto }));
  protected readonly nombresEntidad: Partial<Record<string, string>> = ENTIDADES;
  protected readonly tiposMime = [
    { valor: 'image/jpeg', texto: 'Imagen JPG' },
    { valor: 'image/png', texto: 'Imagen PNG' },
    { valor: 'application/pdf', texto: 'Documento PDF' }
  ];

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ adjuntos: [], usuarios: [], trabajos: [], reportes: [], mensajes: [] });
  protected readonly modal = signal(false);
  protected readonly editando = signal<any>(null);
  protected readonly guardando = signal(false);
  protected readonly errorForm = signal('');
  protected readonly confirmar = signal(false);
  protected readonly objetivo = signal<any>(null);
  protected form: any = {};

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      adjuntos: this.api.get('/adjuntos/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : [],
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
      reportes: this.sesion.permiso('reportes') ? this.api.get('/reportes/') : [],
      mensajes: [1, 2].includes(this.sesion.sesion()?.id_rol ?? 0) ? this.api.get('/mensajes/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  private readonly reportesPorId = computed(() => f.mapaPor(this.d().reportes, 'id_reporte'));
  private readonly mensajesPorId = computed(() => f.mapaPor(this.d().mensajes, 'id_mensaje'));
  private nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }

  // Texto para saber a qué pertenece el archivo, sin mostrar ids
  private perteneceA(a: any): string {
    if (a.tipo_entidad === 'trabajo') return this.trabajosPorId().get(a.id_entidad)?.titulo ?? 'Trabajo';
    if (a.tipo_entidad === 'reporte') {
      const r = this.reportesPorId().get(a.id_entidad);
      return r ? `Reporte de ${this.nombre(r.id_reportante)} a ${this.nombre(r.id_reportado)}` : 'Reporte';
    }
    const m = this.mensajesPorId().get(a.id_entidad);
    return m ? `Mensaje de ${this.nombre(m.id_remitente)}: «${m.mensaje.slice(0, 40)}»` : 'Mensaje de un chat';
  }

  protected archivo(url: string): string {
    return decodeURIComponent(String(url).split('/').pop()?.split('?')[0] || 'archivo');
  }
  private esImagen(a: any): boolean {
    return (a.tipo_mime ?? '').startsWith('image');
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const lista = this.d().adjuntos;
    return [
      { titulo: 'Archivos', valor: lista.length, icono: 'attach_file', color: 'naranja', detalle: 'subidos a la plataforma' },
      { titulo: 'Imágenes', valor: lista.filter((a: any) => this.esImagen(a)).length, icono: 'image', color: 'azul', detalle: 'fotos de trabajos y pruebas' },
      { titulo: 'Documentos', valor: lista.filter((a: any) => !this.esImagen(a)).length, icono: 'description', color: 'morado', detalle: 'PDF y otros' }
    ];
  });

  protected readonly columnas: Columna[] = [
    {
      titulo: 'Archivo',
      valor: (a) => this.archivo(a.url),
      html: (a) =>
        `<div class="celda-persona"><span class="icono-archivo"><span class="material-symbols-rounded">${this.esImagen(a) ? 'image' : 'description'}</span></span><div><strong>${f.escapar(this.archivo(a.url))}</strong><small>${f.escapar(a.tipo_mime ?? 'Sin tipo')}</small></div></div>`
    },
    { titulo: 'Pertenece a', valor: (a) => this.perteneceA(a), html: (a) => `${h.chip(ENTIDADES[a.tipo_entidad])}<small class="bajo">${f.escapar(this.perteneceA(a))}</small>` },
    { titulo: 'Subido por', valor: (a) => this.nombre(a.id_subido_por) },
    { titulo: 'Fecha', valor: (a) => f.ordenFecha(a.created), html: (a) => h.suave(f.fecha(a.created), 'texto-3 fecha') }
  ];

  protected readonly acciones = computed<AccionTabla[]>(() => [
    { texto: 'Abrir', icono: 'open_in_new', soloIcono: true, alHacer: (a: any) => window.open(a.url, '_blank', 'noopener') },
    ...(this.sesion.permiso('adjuntos', 'editar') ? [{ texto: 'Editar', icono: 'edit', soloIcono: true, alHacer: (a: any) => this.abrirEditar(a) }] : []),
    ...(this.sesion.permiso('adjuntos', 'eliminar')
      ? [
          {
            texto: 'Eliminar',
            icono: 'delete',
            tono: 'peligro' as const,
            soloIcono: true,
            alHacer: (a: any) => {
              this.objetivo.set(a);
              this.confirmar.set(true);
            }
          }
        ]
      : [])
  ]);

  // Opciones del formulario: se elige por nombre, nunca escribiendo ids
  protected readonly opcionesEntidad = computed<Partial<Record<string, { valor: number; texto: string }[]>>>(() => ({
    trabajo: this.d().trabajos.map((t: any) => ({ valor: t.id_trabajo, texto: t.titulo })),
    reporte: this.d().reportes.map((r: any) => ({ valor: r.id_reporte, texto: `Reporte de ${this.nombre(r.id_reportante)} a ${this.nombre(r.id_reportado)}` })),
    mensaje: this.d().mensajes.map((m: any) => ({ valor: m.id_mensaje, texto: `${this.nombre(m.id_remitente)}: ${m.mensaje.slice(0, 50)}` }))
  }));

  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form = { tipo_entidad: 'trabajo', id_entidad: this.opcionesEntidad()['trabajo']?.[0]?.valor ?? null, url: '', tipo_mime: 'image/jpeg' };
    this.errorForm.set('');
    this.modal.set(true);
  }

  private abrirEditar(a: any): void {
    this.editando.set(a);
    this.form = { tipo_entidad: a.tipo_entidad, id_entidad: a.id_entidad, url: a.url, tipo_mime: a.tipo_mime ?? 'image/jpeg' };
    this.errorForm.set('');
    this.modal.set(true);
  }

  protected cambiarEntidad(): void {
    this.form.id_entidad = this.opcionesEntidad()[this.form.tipo_entidad]?.[0]?.valor ?? null;
  }

  protected async guardar(): Promise<void> {
    if (!/^https?:\/\/\S+$/.test(this.form.url.trim())) {
      this.errorForm.set('Escribe la dirección completa del archivo (empieza por https://).');
      return;
    }
    if (!this.form.id_entidad) {
      this.errorForm.set('Elige a qué pertenece el archivo.');
      return;
    }
    this.guardando.set(true);
    this.errorForm.set('');
    try {
      const cuerpo = { tipo_entidad: this.form.tipo_entidad, id_entidad: Number(this.form.id_entidad), url: this.form.url.trim(), tipo_mime: this.form.tipo_mime };
      const editando = this.editando();
      if (editando) await this.api.put(`/adjuntos/${editando.id_adjunto}`, cuerpo);
      else await this.api.post('/adjuntos/', cuerpo);
      this.avisos.avisar(editando ? 'Archivo actualizado' : 'Archivo registrado');
      this.modal.set(false);
      await this.cargar();
    } catch (e: any) {
      this.errorForm.set(e.message);
    } finally {
      this.guardando.set(false);
    }
  }

  protected textoConfirmar(): string {
    const o = this.objetivo();
    return `Se quitará «${o ? this.archivo(o.url) : ''}» de la plataforma.`;
  }

  protected readonly eliminar = async () => {
    await this.api.del(`/adjuntos/${this.objetivo().id_adjunto}`);
    this.avisos.avisar('Archivo eliminado');
    await this.cargar();
  };
}
