// TRABAJOS: lo que publican los empleadores, con su detalle y un mapa real de ubicaciones.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { EnfoqueService } from '../../../../core/services/enfoque';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { Confirmar } from '../../../../shared/components/confirmar/confirmar';
import { MapaTrabajos } from '../../../../shared/components/mapa-trabajos/mapa-trabajos';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Estadistica } from '../../../../shared/interfaces/estadistica';
import { AccionTabla, Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

@Component({
  selector: 'app-trabajos-page',
  imports: [PageHeader, StatCard, Tarjeta, TablaDatos, Avatar, StatusPill, MapaTrabajos, Confirmar, Cargando],
  templateUrl: './trabajos-page.html',
  styleUrl: './trabajos-page.css'
})
export class TrabajosPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  private readonly enfoque = inject(EnfoqueService);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ trabajos: [], usuarios: [], categorias: [], ciudades: [], ofertas: [], adjuntos: [] });
  protected readonly seleccionado = signal<any>(null);
  protected readonly habilidades = signal<string[]>([]);
  protected readonly confirmar = signal(false);
  protected readonly objetivo = signal<any>(null);

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      trabajos: this.api.get('/trabajos/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : [],
      categorias: this.sesion.permiso('categorias') ? this.api.get('/categorias/') : [],
      ciudades: this.sesion.permiso('ubicacion') ? this.api.get('/ciudades/') : [],
      ofertas: this.sesion.permiso('ofertas') ? this.api.get('/ofertas/') : [],
      adjuntos: this.sesion.permiso('adjuntos') ? this.api.get('/adjuntos/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
    const pedido = this.enfoque.tomar('trabajos');
    const id = pedido?.id_trabajo ?? this.seleccionado()?.id_trabajo;
    this.elegir(datos.trabajos.find((t: any) => t.id_trabajo === id) ?? datos.trabajos[0] ?? null);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly categoriasPorId = computed(() => f.mapaPor(this.d().categorias, 'id_categoria'));
  private readonly ciudadesPorId = computed(() => f.mapaPor(this.d().ciudades, 'id_ciudad'));
  protected nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }
  protected readonly categoria = (id: number): string => this.categoriasPorId().get(id)?.nombre ?? 'Sin categoría';
  protected ciudad(id: number): string {
    return this.ciudadesPorId().get(id)?.nombre ?? '—';
  }
  private ofertasDe(id: number): any[] {
    return this.d().ofertas.filter((o: any) => o.id_trabajo === id);
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const lista = this.d().trabajos;
    const cuantos = (e: string) => lista.filter((t: any) => t.estado_trabajo === e).length;
    return [
      { titulo: 'Trabajos', valor: lista.length, icono: 'work', color: 'naranja', detalle: 'publicados en total' },
      { titulo: 'Publicados', valor: cuantos('publicado'), icono: 'campaign', color: 'azul', detalle: 'esperando ofertas' },
      { titulo: 'Asignados', valor: cuantos('asignado'), icono: 'engineering', color: 'morado', detalle: 'con contrato activo' },
      { titulo: 'Finalizados', valor: cuantos('finalizado'), icono: 'task_alt', color: 'verde', detalle: 'terminados y pagados' }
    ];
  });

  protected readonly columnas: Columna[] = [
    { titulo: 'Trabajo', valor: (t) => t.titulo, html: (t) => h.titulo(t.titulo, f.cantidad(this.ofertasDe(t.id_trabajo).length, 'oferta')) },
    { titulo: 'Cliente', valor: (t) => this.nombre(t.id_cliente) },
    { titulo: 'Categoría', valor: (t) => this.categoria(t.id_categoria), html: (t) => h.chip(this.categoria(t.id_categoria)) },
    { titulo: 'Ciudad', valor: (t) => this.ciudad(t.id_ciudad) },
    { titulo: 'Fecha', valor: (t) => f.ordenFecha(t.fecha_trabajo), html: (t) => h.suave(f.fecha(t.fecha_trabajo), 'texto-2 fecha') },
    { titulo: 'Presupuesto', valor: (t) => Number(t.presupuesto), html: (t) => h.dinero(t.presupuesto) },
    { titulo: 'Estado', valor: (t) => f.textoEstado(t.estado_trabajo), html: (t) => h.pill(t.estado_trabajo) }
  ];

  protected readonly acciones = computed<AccionTabla[]>(() =>
    this.sesion.permiso('trabajos', 'eliminar')
      ? [
          {
            texto: 'Desactivar trabajo',
            icono: 'delete',
            tono: 'peligro',
            soloIcono: true,
            mostrar: (t) => t.estado_trabajo !== 'asignado',
            alHacer: (t) => {
              this.objetivo.set(t);
              this.confirmar.set(true);
            }
          }
        ]
      : []
  );

  protected readonly elegir = async (trabajo: any) => {
    const actual = trabajo ? (this.d().trabajos.find((t: any) => t.id_trabajo === trabajo.id_trabajo) ?? trabajo) : null;
    this.seleccionado.set(actual);
    this.habilidades.set([]);
    if (!actual) return;
    try {
      const lista = await this.api.get(`/trabajos-habilidades/trabajo/${actual.id_trabajo}`);
      this.habilidades.set(lista.map((x: any) => x.habilidad));
    } catch {
      this.habilidades.set([]);
    }
  };

  protected readonly ofertasSel = computed(() => {
    const sel = this.seleccionado();
    return sel ? this.ofertasDe(sel.id_trabajo) : [];
  });
  protected readonly fotosSel = computed(() => {
    const sel = this.seleccionado();
    return sel ? this.d().adjuntos.filter((a: any) => a.tipo_entidad === 'trabajo' && a.id_entidad === sel.id_trabajo) : [];
  });

  protected readonly porCiudad = computed(() =>
    f.contarPor(this.d().trabajos.filter((t: any) => ['publicado', 'asignado'].includes(t.estado_trabajo)), (t) => this.ciudad(t.id_ciudad))
  );

  protected textoConfirmar(): string {
    return `«${this.objetivo()?.titulo ?? ''}» dejará de aparecer en la plataforma. Sus ofertas se conservan en la base de datos.`;
  }

  protected readonly eliminar = async () => {
    const objetivo = this.objetivo();
    await this.api.del(`/trabajos/${objetivo.id_trabajo}`);
    this.avisos.avisar(`«${objetivo.titulo}» ya no aparece en la plataforma`);
    await this.cargar();
  };

  protected irA(modulo: string, ruta: string): void {
    this.enfoque.pedir({ modulo, id_trabajo: this.seleccionado().id_trabajo });
    this.router.navigateByUrl(ruta);
  }

  protected exportar(): void {
    f.descargarCSV(
      'trabajos-inwork.csv',
      [
        { titulo: 'Trabajo', valor: (t) => t.titulo },
        { titulo: 'Cliente', valor: (t) => this.nombre(t.id_cliente) },
        { titulo: 'Categoría', valor: (t) => this.categoria(t.id_categoria) },
        { titulo: 'Ciudad', valor: (t) => this.ciudad(t.id_ciudad) },
        { titulo: 'Fecha', valor: (t) => t.fecha_trabajo },
        { titulo: 'Presupuesto', valor: (t) => t.presupuesto },
        { titulo: 'Estado', valor: (t) => t.estado_trabajo }
      ],
      this.d().trabajos
    );
  }
}
