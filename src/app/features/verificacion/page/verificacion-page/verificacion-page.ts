// VERIFICACIÓN DE IDENTIDAD: el moderador compara el documento con la selfie y aprueba o rechaza.
// El analista solo puede ver.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Estadistica } from '../../../../shared/interfaces/estadistica';
import { Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

const ESTADO_FILTRO: Record<string, string> = { Pendientes: 'pendiente', Aprobadas: 'aprobada', Rechazadas: 'rechazada' };

@Component({
  selector: 'app-verificacion-page',
  imports: [FormsModule, PageHeader, StatCard, Tarjeta, TablaDatos, Avatar, StatusPill, Cargando, EmptyState],
  templateUrl: './verificacion-page.html',
  styleUrl: './verificacion-page.css'
})
export class VerificacionPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  private readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly filtros = ['Pendientes', 'Aprobadas', 'Rechazadas', 'Todas'];
  protected readonly documentos = [
    { campo: 'url_documento_frente', texto: 'Documento, frente', icono: 'badge' },
    { campo: 'url_documento_reverso', texto: 'Documento, reverso', icono: 'flip' },
    { campo: 'url_selfie', texto: 'Selfie', icono: 'face' }
  ];

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ verificaciones: [], usuarios: [] });
  protected readonly filtro = signal('Pendientes');
  protected readonly seleccionada = signal<any>(null);
  protected observacion = '';
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly fotosFallidas = signal<Record<string, boolean>>({});

  protected readonly puedeRevisar = computed(() => this.sesion.permiso('verificaciones', 'editar'));

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      verificaciones: this.api.get('/verificaciones-identidad/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
    const actual = this.seleccionada();
    const sigue = actual && datos.verificaciones.find((v: any) => v.id_verificacion === actual.id_verificacion);
    this.elegir(sigue ?? this.lista()[0] ?? datos.verificaciones[0] ?? null);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  protected nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }

  // Las más antiguas primero, para atenderlas en orden
  protected readonly lista = computed(() =>
    [...this.d().verificaciones]
      .filter((v: any) => this.filtro() === 'Todas' || v.estado_verificacion === ESTADO_FILTRO[this.filtro()])
      .sort((a: any, b: any) => f.ordenFecha(a.created) - f.ordenFecha(b.created))
  );

  protected readonly resumen = computed<Estadistica[]>(() => {
    const lista = this.d().verificaciones;
    const cuantos = (e: string) => lista.filter((v: any) => v.estado_verificacion === e).length;
    return [
      { titulo: 'Pendientes', valor: cuantos('pendiente'), icono: 'hourglass_top', color: 'ambar', detalle: 'esperando revisión' },
      { titulo: 'Aprobadas', valor: cuantos('aprobada'), icono: 'verified', color: 'verde', detalle: 'identidad confirmada' },
      { titulo: 'Rechazadas', valor: cuantos('rechazada'), icono: 'gpp_bad', color: 'rojo', detalle: 'deben enviar de nuevo' }
    ];
  });

  protected readonly usuarioSel = computed(() => {
    const sel = this.seleccionada();
    return sel ? this.usuariosPorId().get(sel.id_usuario) : null;
  });

  protected readonly historial = computed(() => {
    const sel = this.seleccionada();
    return sel
      ? this.d()
          .verificaciones.filter((v: any) => v.id_usuario === sel.id_usuario)
          .sort((a: any, b: any) => f.ordenFecha(b.created) - f.ordenFecha(a.created))
      : [];
  });

  protected readonly elegir = (v: any) => {
    this.seleccionada.set(v);
    this.observacion = v?.observacion ?? '';
    this.error.set('');
    this.fotosFallidas.set({});
  };

  protected fotoFallo(campo: string): void {
    this.fotosFallidas.update((actual) => ({ ...actual, [campo]: true }));
  }

  protected async revisar(estado: 'aprobada' | 'rechazada'): Promise<void> {
    this.error.set('');
    if (estado === 'rechazada' && !this.observacion.trim()) {
      this.error.set('Escribe el motivo del rechazo para que la persona sepa qué corregir.');
      return;
    }
    this.guardando.set(true);
    const sel = this.seleccionada();
    try {
      await this.api.put(`/verificaciones-identidad/${sel.id_verificacion}/revisar`, {
        estado_verificacion: estado,
        observacion: this.observacion.trim() || null
      });
      this.avisos.avisar(estado === 'aprobada' ? `Identidad de ${this.nombre(sel.id_usuario)} aprobada` : 'Solicitud rechazada');
      await this.cargar();
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.guardando.set(false);
    }
  }

  protected readonly columnas: Columna[] = [
    { titulo: 'Usuario', valor: (v) => this.nombre(v.id_usuario), html: (v) => h.persona(this.nombre(v.id_usuario), this.usuariosPorId().get(v.id_usuario)?.correo ?? '') },
    { titulo: 'Documento', valor: (v) => this.usuariosPorId().get(v.id_usuario)?.numero_identificacion ?? '' },
    { titulo: 'Estado', valor: (v) => v.estado_verificacion, html: (v) => h.pill(v.estado_verificacion) },
    { titulo: 'Enviada', valor: (v) => f.ordenFecha(v.created), html: (v) => h.suave(f.fecha(v.created), 'texto-3 fecha') },
    { titulo: 'Revisada por', valor: (v) => (v.id_admin_revisor ? this.nombre(v.id_admin_revisor) : 'Sin revisar') },
    { titulo: 'Observación', valor: (v) => v.observacion ?? '', html: (v) => h.recortado(v.observacion ?? '—') }
  ];
}
