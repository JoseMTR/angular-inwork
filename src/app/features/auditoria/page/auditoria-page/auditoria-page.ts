// AUDITORÍA: quién creó, editó o borró qué y cuándo (la API la llena sola).
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Estadistica } from '../../../../shared/interfaces/estadistica';
import { Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

const TABLAS: Record<string, string> = {
  categorias: 'Una categoría',
  habilidades: 'Una habilidad',
  pais: 'Un país',
  ciudades: 'Una ciudad',
  calificaciones: 'Una calificación',
  reportes: 'Un reporte',
  verificaciones_identidad: 'Una verificación de identidad',
  notificaciones: 'Una notificación',
  adjuntos: 'Un archivo adjunto',
  chats: 'Un chat',
  mensajes: 'Un mensaje',
  roles: 'Un rol',
  rol_modulo: 'Permisos de un rol',
  tokens_usuario: 'Un código de seguridad'
};

@Component({
  selector: 'app-auditoria-page',
  imports: [PageHeader, StatCard, Tarjeta, TablaDatos, Avatar, StatusPill, Cargando],
  templateUrl: './auditoria-page.html',
  styleUrl: './auditoria-page.css'
})
export class AuditoriaPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ eventos: [], usuarios: [], trabajos: [], ofertas: [], contrataciones: [] });
  protected readonly seleccionado = signal<any>(null);

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      eventos: this.api.get('/auditoria/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : [],
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
      ofertas: this.sesion.permiso('ofertas') ? this.api.get('/ofertas/') : [],
      contrataciones: this.sesion.permiso('contrataciones') ? this.api.get('/contrataciones/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
    this.seleccionado.set([...datos.eventos].sort((a: any, b: any) => f.ordenFecha(b.created) - f.ordenFecha(a.created))[0] ?? null);
  }

  protected readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  private readonly ofertasPorId = computed(() => f.mapaPor(this.d().ofertas, 'id_oferta'));
  private readonly contratosPorId = computed(() => f.mapaPor(this.d().contrataciones, 'id_contratacion'));
  protected nombre(id: number | null): string {
    return id ? f.nombreCompleto(this.usuariosPorId().get(id)) : 'Sistema';
  }

  // Describe el registro afectado con nombres en vez de ids
  protected registro(e: any): string {
    switch (e.tabla) {
      case 'usuarios':
        return `Cuenta de ${this.nombre(e.id_registro)}`;
      case 'trabajos':
        return `Trabajo «${this.trabajosPorId().get(e.id_registro)?.titulo ?? 'retirado'}»`;
      case 'ofertas': {
        const o = this.ofertasPorId().get(e.id_registro);
        return o ? `Oferta de ${this.nombre(o.id_trabajador)} en «${this.trabajosPorId().get(o.id_trabajo)?.titulo ?? 'un trabajo'}»` : 'Oferta';
      }
      case 'contrataciones': {
        const c = this.contratosPorId().get(e.id_registro);
        return c ? `Contrato de «${this.trabajosPorId().get(c.id_trabajo)?.titulo ?? 'un trabajo'}»` : 'Contratación';
      }
      default:
        return TABLAS[e.tabla] ?? `Registro de ${String(e.tabla).replaceAll('_', ' ')}`;
    }
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const eventos = this.d().eventos;
    const cuantos = (a: string) => eventos.filter((e: any) => e.accion === a).length;
    return [
      { titulo: 'Creaciones', valor: cuantos('INSERT'), icono: 'add_circle', color: 'azul', detalle: 'registros nuevos' },
      { titulo: 'Ediciones', valor: cuantos('UPDATE'), icono: 'edit', color: 'morado', detalle: 'cambios de datos' },
      { titulo: 'Eliminaciones', valor: cuantos('DELETE'), icono: 'delete', color: 'rojo', detalle: 'registros desactivados' }
    ];
  });

  protected readonly columnas: Columna[] = [
    { titulo: 'Fecha', valor: (e) => f.ordenFecha(e.created), html: (e) => h.suave(f.fechaHora(e.created), 'texto-2 fecha') },
    { titulo: 'Usuario', valor: (e) => this.nombre(e.id_usuario), html: (e) => h.persona(this.nombre(e.id_usuario)) },
    { titulo: 'Tabla', valor: (e) => e.tabla, html: (e) => h.codigo(e.tabla) },
    { titulo: 'Acción', valor: (e) => f.textoEstado(e.accion), html: (e) => h.pill(e.accion) },
    { titulo: 'Registro', valor: (e) => this.registro(e), html: (e) => h.recortado(this.registro(e)) },
    { titulo: 'IP', valor: (e) => e.ip ?? '', html: (e) => h.suave(e.ip ?? 'No registrada', 'texto-3 numero') }
  ];

  protected readonly elegir = (e: any) => this.seleccionado.set(e);

  private leerJSON(valor: any): any {
    if (!valor) return null;
    if (typeof valor === 'object') return valor;
    try {
      return JSON.parse(valor);
    } catch {
      return null;
    }
  }

  protected readonly cambios = computed(() => {
    const sel = this.seleccionado();
    if (!sel) return [];
    const antes = this.leerJSON(sel.datos_anteriores) ?? {};
    const despues = this.leerJSON(sel.datos_nuevos) ?? {};
    const campos = [...new Set([...Object.keys(antes), ...Object.keys(despues)])].filter((c) => !c.startsWith('id_') && c !== 'password');
    return campos.map((campo) => ({ campo, antes: String(antes[campo] ?? '—'), despues: String(despues[campo] ?? '—') }));
  });

  protected exportar(): void {
    f.descargarCSV(
      'auditoria-inwork.csv',
      [
        { titulo: 'Fecha', valor: (e) => f.fechaHora(e.created) },
        { titulo: 'Usuario', valor: (e) => this.nombre(e.id_usuario) },
        { titulo: 'Tabla', valor: (e) => e.tabla },
        { titulo: 'Acción', valor: (e) => f.textoEstado(e.accion) },
        { titulo: 'Registro', valor: (e) => this.registro(e) },
        { titulo: 'IP', valor: (e) => e.ip ?? '' }
      ],
      this.d().eventos
    );
  }
}
