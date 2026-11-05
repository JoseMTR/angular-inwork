// CALIFICACIONES: lo que opinan clientes y trabajadores entre sí después de cada trabajo.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { Confirmar } from '../../../../shared/components/confirmar/confirmar';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Estadistica } from '../../../../shared/interfaces/estadistica';
import { AccionTabla, Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

@Component({
  selector: 'app-calificaciones-page',
  imports: [PageHeader, StatCard, Tarjeta, TablaDatos, GraficoBarras, Avatar, Confirmar, Cargando],
  templateUrl: './calificaciones-page.html',
  styleUrl: './calificaciones-page.css'
})
export class CalificacionesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ calificaciones: [], usuarios: [], trabajos: [], reportes: [] });
  protected readonly confirmar = signal(false);
  protected readonly objetivo = signal<any>(null);

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      calificaciones: this.api.get('/calificaciones/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : [],
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
      reportes: this.sesion.permiso('reportes') ? this.api.get('/reportes/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  protected nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }
  private trabajo(id: number): string {
    return this.trabajosPorId().get(id)?.titulo ?? 'Trabajo';
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const lista = this.d().calificaciones;
    const promedio = f.promedio(lista, (c) => c.puntuacion);
    const cinco = lista.filter((c: any) => c.puntuacion === 5).length;
    return [
      { titulo: 'Promedio general', valor: f.decimal(promedio), icono: 'star', color: 'ambar', detalle: 'de 5 estrellas' },
      { titulo: 'Reseñas', valor: f.numero(lista.length), icono: 'reviews', color: 'azul', detalle: 'entre clientes y trabajadores' },
      { titulo: 'Con 5 estrellas', valor: f.porcentaje(cinco, lista.length), icono: 'thumb_up', color: 'verde', detalle: f.cantidad(cinco, 'reseña perfecta', 'reseñas perfectas') }
    ];
  });

  protected readonly distribucion = computed(() =>
    [5, 4, 3, 2, 1].map((n) => ({ etiqueta: `${n} estrella${n === 1 ? '' : 's'}`, valor: this.d().calificaciones.filter((c: any) => c.puntuacion === n).length }))
  );

  // Usuarios con peor promedio (para vigilarlos)
  protected readonly vigilados = computed(() =>
    [...this.d().usuarios]
      .filter((u: any) => Number(u.total_calificaciones) > 0)
      .sort((a: any, b: any) => Number(a.promedio_calificacion) - Number(b.promedio_calificacion))
      .slice(0, 5)
      .map((u: any) => ({
        nombre: f.nombreCompleto(u),
        promedio: Number(u.promedio_calificacion).toFixed(1),
        bajo: Number(u.promedio_calificacion) < 4,
        resenas: u.total_calificaciones,
        reportes: this.d().reportes.filter((r: any) => r.id_reportado === u.id_usuario).length
      }))
  );

  protected readonly columnas: Columna[] = [
    { titulo: 'Calificador', valor: (c) => this.nombre(c.id_calificador), html: (c) => h.persona(this.nombre(c.id_calificador), this.trabajo(c.id_trabajo)) },
    { titulo: 'Calificado', valor: (c) => this.nombre(c.id_calificado), html: (c) => `<strong>${f.escapar(this.nombre(c.id_calificado))}</strong>` },
    { titulo: 'Puntuación', valor: (c) => c.puntuacion, html: (c) => h.estrellas(c.puntuacion) },
    { titulo: 'Comentario', valor: (c) => c.comentario ?? '', html: (c) => h.recortado(c.comentario ?? 'Sin comentario') },
    { titulo: 'Fecha', valor: (c) => f.ordenFecha(c.created), html: (c) => h.suave(f.fecha(c.created), 'texto-3 fecha') }
  ];

  protected readonly acciones = computed<AccionTabla[]>(() =>
    this.sesion.permiso('calificaciones', 'eliminar')
      ? [
          {
            texto: 'Eliminar reseña',
            icono: 'delete',
            tono: 'peligro',
            soloIcono: true,
            alHacer: (c) => {
              this.objetivo.set(c);
              this.confirmar.set(true);
            }
          }
        ]
      : []
  );

  protected textoConfirmar(): string {
    const o = this.objetivo();
    return `Se eliminará la reseña de ${o ? this.nombre(o.id_calificador) : ''} y se recalculará el promedio de ${o ? this.nombre(o.id_calificado) : ''}.`;
  }

  protected readonly eliminar = async () => {
    await this.api.del(`/calificaciones/${this.objetivo().id_calificacion}`);
    this.avisos.avisar('Reseña eliminada. El promedio del usuario se recalculó.');
    await this.cargar();
  };
}
