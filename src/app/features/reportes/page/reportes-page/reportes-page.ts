// REPORTES: denuncias entre usuarios. El moderador los toma, los resuelve o los rechaza.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { EnfoqueService } from '../../../../core/services/enfoque';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { Confirmar } from '../../../../shared/components/confirmar/confirmar';
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

const MOTIVOS: Record<string, string> = {
  fraude: 'Fraude',
  incumplimiento: 'Incumplimiento',
  lenguaje_inapropiado: 'Lenguaje inapropiado',
  estafa: 'Estafa',
  suplantacion: 'Suplantación',
  otro: 'Otro'
};

@Component({
  selector: 'app-reportes-page',
  imports: [FormsModule, PageHeader, StatCard, Tarjeta, TablaDatos, Avatar, StatusPill, Confirmar, Cargando, EmptyState],
  templateUrl: './reportes-page.html',
  styleUrl: './reportes-page.css'
})
export class ReportesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  private readonly enfoque = inject(EnfoqueService);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ reportes: [], usuarios: [], trabajos: [], adjuntos: [] });
  protected readonly seleccionado = signal<any>(null);
  protected resolucion = '';
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly confirmarSuspender = signal(false);

  // El cambio de estado del reporte lo hacen administrador y moderador
  protected readonly puedeGestionar = computed(() => this.sesion.permiso('reportes', 'editar') && [1, 2].includes(this.sesion.sesion()?.id_rol ?? 0));

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      reportes: this.api.get('/reportes/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : [],
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
      adjuntos: this.sesion.permiso('adjuntos') ? this.api.get('/adjuntos/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
    const pedido = this.enfoque.tomar('reportes');
    const id = pedido?.id_reporte ?? this.seleccionado()?.id_reporte;
    const pendientes = [...datos.reportes]
      .filter((r: any) => r.estado_reporte === 'pendiente')
      .sort((a: any, b: any) => f.ordenFecha(a.created) - f.ordenFecha(b.created));
    this.elegir(datos.reportes.find((r: any) => r.id_reporte === id) ?? pendientes[0] ?? datos.reportes[0] ?? null);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  protected nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }
  protected trabajo(id: number): string {
    return this.trabajosPorId().get(id)?.titulo ?? 'Trabajo';
  }
  protected motivo(m: string): string {
    return MOTIVOS[m] ?? f.capitalizar(m);
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const lista = this.d().reportes;
    const cuantos = (e: string) => lista.filter((r: any) => r.estado_reporte === e).length;
    return [
      { titulo: 'Reportes', valor: lista.length, icono: 'flag', color: 'naranja', detalle: 'recibidos en total' },
      { titulo: 'Pendientes', valor: cuantos('pendiente'), icono: 'hourglass_top', color: 'ambar', detalle: 'nadie los ha tomado' },
      { titulo: 'En revisión', valor: cuantos('en_revision'), icono: 'manage_search', color: 'azul', detalle: 'un moderador los está viendo' },
      { titulo: 'Resueltos', valor: cuantos('resuelto'), icono: 'gavel', color: 'verde', detalle: 'con decisión tomada' }
    ];
  });

  protected readonly columnas: Columna[] = [
    { titulo: 'Motivo', valor: (r) => this.motivo(r.motivo), html: (r) => h.chip(this.motivo(r.motivo)) },
    { titulo: 'Reportante', valor: (r) => this.nombre(r.id_reportante) },
    { titulo: 'Reportado', valor: (r) => this.nombre(r.id_reportado), html: (r) => `<strong>${f.escapar(this.nombre(r.id_reportado))}</strong>` },
    { titulo: 'Trabajo', valor: (r) => this.trabajo(r.id_trabajo), html: (r) => h.suave(this.trabajo(r.id_trabajo)) },
    { titulo: 'Estado', valor: (r) => f.textoEstado(r.estado_reporte), html: (r) => h.pill(r.estado_reporte) },
    { titulo: 'Fecha', valor: (r) => f.ordenFecha(r.created), html: (r) => h.suave(f.fecha(r.created), 'texto-3 fecha') }
  ];

  protected readonly elegir = (reporte: any) => {
    const actual = reporte ? (this.d().reportes.find((r: any) => r.id_reporte === reporte.id_reporte) ?? reporte) : null;
    this.seleccionado.set(actual);
    this.resolucion = actual?.resolucion ?? '';
    this.error.set('');
  };

  protected readonly evidencias = computed(() => {
    const sel = this.seleccionado();
    return sel ? this.d().adjuntos.filter((a: any) => a.tipo_entidad === 'reporte' && a.id_entidad === sel.id_reporte) : [];
  });

  protected readonly historial = computed(() => {
    const r = this.seleccionado();
    if (!r) return [];
    const pasos = [{ titulo: `${this.nombre(r.id_reportante)} envió el reporte`, fecha: f.fechaHora(r.created), estado: 'hecho' }];
    if (r.estado_reporte === 'pendiente') pasos.push({ titulo: 'Esperando que un moderador lo tome', fecha: 'Pendiente', estado: 'actual' });
    if (r.id_admin_revisor)
      pasos.push({
        titulo: `${this.nombre(r.id_admin_revisor)} lo revisó`,
        fecha: r.estado_reporte === 'en_revision' ? 'En revisión' : 'Revisado',
        estado: r.estado_reporte === 'en_revision' ? 'actual' : 'hecho'
      });
    if (['resuelto', 'rechazado'].includes(r.estado_reporte))
      pasos.push({ titulo: r.estado_reporte === 'resuelto' ? 'Reporte resuelto' : 'Reporte rechazado', fecha: f.fechaHora(r.fecha_resolucion ?? r.updated), estado: 'hecho' });
    return pasos;
  });

  protected async cambiarEstado(estado: 'en_revision' | 'resuelto' | 'rechazado'): Promise<void> {
    this.error.set('');
    if (estado !== 'en_revision' && !this.resolucion.trim()) {
      this.error.set('Explica qué se decidió y por qué.');
      return;
    }
    this.guardando.set(true);
    try {
      await this.api.put(`/reportes/${this.seleccionado().id_reporte}/resolver`, { estado_reporte: estado, resolucion: this.resolucion.trim() || null });
      const textos = { en_revision: 'Tomaste el reporte', resuelto: 'Reporte resuelto', rechazado: 'Reporte rechazado' };
      this.avisos.avisar(textos[estado]);
      await this.cargar();
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.guardando.set(false);
    }
  }

  protected textoSuspender(): string {
    const sel = this.seleccionado();
    return `${sel ? this.nombre(sel.id_reportado) : ''} no podrá volver a iniciar sesión en InWork.`;
  }

  protected readonly suspender = async () => {
    const sel = this.seleccionado();
    await this.api.del(`/usuarios/${sel.id_reportado}`);
    this.avisos.avisar(`La cuenta de ${this.nombre(sel.id_reportado)} quedó suspendida`);
    await this.cargar();
  };

  protected abrirChat(): void {
    const sel = this.seleccionado();
    this.enfoque.pedir({ modulo: 'chat', id_trabajo: sel.id_trabajo, usuarios: [sel.id_reportante, sel.id_reportado] });
    this.router.navigateByUrl('/chat');
  }
}
