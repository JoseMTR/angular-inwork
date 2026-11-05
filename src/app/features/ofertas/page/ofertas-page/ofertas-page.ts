// OFERTAS: las propuestas que los empleados envían a cada trabajo publicado.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { EnfoqueService } from '../../../../core/services/enfoque';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { Confirmar } from '../../../../shared/components/confirmar/confirmar';
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
  selector: 'app-ofertas-page',
  imports: [PageHeader, StatCard, Tarjeta, TablaDatos, Avatar, StatusPill, Confirmar, Cargando],
  templateUrl: './ofertas-page.html',
  styleUrl: './ofertas-page.css'
})
export class OfertasPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  private readonly enfoque = inject(EnfoqueService);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ ofertas: [], trabajos: [], usuarios: [], contrataciones: [] });
  protected readonly seleccionada = signal<any>(null);
  protected readonly confirmar = signal(false);
  protected readonly objetivo = signal<any>(null);

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      ofertas: this.api.get('/ofertas/'),
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : [],
      contrataciones: this.sesion.permiso('contrataciones') ? this.api.get('/contrataciones/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
    const pedido = this.enfoque.tomar('ofertas');
    const anterior = this.seleccionada();
    const elegida = pedido
      ? datos.ofertas.find((o: any) => o.id_trabajo === pedido.id_trabajo)
      : datos.ofertas.find((o: any) => o.id_oferta === anterior?.id_oferta);
    this.seleccionada.set(elegida ?? datos.ofertas[0] ?? null);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  protected nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }
  protected trabajo(id: number): any {
    return this.trabajosPorId().get(id);
  }
  protected presupuesto(o: any): number {
    return Number(this.trabajo(o.id_trabajo)?.presupuesto) || 0;
  }
  private diferencia(o: any): number {
    const p = this.presupuesto(o);
    return p ? Math.round(((Number(o.valor_oferta) - p) / p) * 100) : 0;
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const ofertas = this.d().ofertas;
    return [
      { titulo: 'Ofertas', valor: ofertas.length, icono: 'local_offer', color: 'naranja', detalle: 'enviadas en total' },
      { titulo: 'Pendientes', valor: ofertas.filter((o: any) => o.estado_oferta === 'pendiente').length, icono: 'hourglass_top', color: 'ambar', detalle: 'esperando respuesta' },
      { titulo: 'Aceptadas', valor: ofertas.filter((o: any) => o.estado_oferta === 'aceptada').length, icono: 'handshake', color: 'verde', detalle: 'se volvieron contrato' },
      {
        titulo: 'Frente al presupuesto',
        valor: `${Math.round(f.promedio(ofertas, (o) => this.diferencia(o)))}%`,
        icono: 'balance',
        color: 'azul',
        detalle: 'diferencia promedio de las ofertas'
      }
    ];
  });

  protected readonly columnas: Columna[] = [
    { titulo: 'Trabajo', valor: (o) => this.trabajo(o.id_trabajo)?.titulo ?? '', html: (o) => `<strong>${f.escapar(this.trabajo(o.id_trabajo)?.titulo ?? 'Trabajo')}</strong>` },
    { titulo: 'Trabajador', valor: (o) => this.nombre(o.id_trabajador), html: (o) => h.persona(this.nombre(o.id_trabajador)) },
    {
      titulo: 'Valor ofertado',
      valor: (o) => Number(o.valor_oferta),
      html: (o) => {
        const dif = this.diferencia(o);
        return `${h.dinero(o.valor_oferta)}<small class="comparacion ${dif > 0 ? 'arriba' : 'abajo'}">${dif > 0 ? '+' : ''}${dif}% vs. ${f.moneda(this.presupuesto(o))}</small>`;
      }
    },
    { titulo: 'Mensaje', valor: (o) => o.mensaje ?? '', html: (o) => h.recortado(o.mensaje ?? 'Sin mensaje') },
    { titulo: 'Fecha', valor: (o) => f.ordenFecha(o.fecha_oferta), html: (o) => h.suave(f.fecha(o.fecha_oferta), 'texto-3 fecha') },
    { titulo: 'Estado', valor: (o) => f.textoEstado(o.estado_oferta), html: (o) => h.pill(o.estado_oferta) }
  ];

  protected readonly accionesTabla = computed<AccionTabla[]>(() =>
    this.sesion.permiso('ofertas', 'eliminar')
      ? [
          {
            texto: 'Eliminar oferta',
            icono: 'delete',
            tono: 'peligro',
            soloIcono: true,
            mostrar: (o) => o.estado_oferta !== 'aceptada',
            alHacer: (o) => {
              this.objetivo.set(o);
              this.confirmar.set(true);
            }
          }
        ]
      : []
  );

  protected readonly elegir = (o: any) => this.seleccionada.set(o);

  protected readonly detalleTrabajador = computed(() => {
    const sel = this.seleccionada();
    if (!sel) return '';
    const trabajador = this.usuariosPorId().get(sel.id_trabajador);
    const contratos = this.d().contrataciones.filter((c: any) => c.id_trabajador === sel.id_trabajador).length;
    const nota = trabajador && Number(trabajador.promedio_calificacion) ? `${f.decimal(trabajador.promedio_calificacion)} de calificación` : 'Sin reseñas';
    return `${nota}, ${f.cantidad(contratos, 'contrato')}`;
  });

  protected textoConfirmar(): string {
    const o = this.objetivo();
    return `Se eliminará la oferta de ${o ? this.nombre(o.id_trabajador) : ''} por ${o ? f.moneda(o.valor_oferta) : ''}.`;
  }

  protected readonly eliminar = async () => {
    await this.api.del(`/ofertas/${this.objetivo().id_oferta}`);
    this.avisos.avisar('Oferta eliminada');
    await this.cargar();
  };

  protected verTrabajo(): void {
    this.enfoque.pedir({ modulo: 'trabajos', id_trabajo: this.seleccionada().id_trabajo });
    this.router.navigateByUrl('/trabajos');
  }
}
