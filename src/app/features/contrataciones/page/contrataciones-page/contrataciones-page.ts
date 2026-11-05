// CONTRATACIONES: los acuerdos que nacen cuando un cliente acepta una oferta.
// Los pagos de cada contrato vienen de la API de pagos (Express + MySQL).
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { EnfoqueService } from '../../../../core/services/enfoque';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { Modal } from '../../../../shared/components/modal/modal';
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
  selector: 'app-contrataciones-page',
  imports: [FormsModule, PageHeader, StatCard, Tarjeta, TablaDatos, Avatar, StatusPill, Modal, Cargando],
  templateUrl: './contrataciones-page.html',
  styleUrl: './contrataciones-page.css'
})
export class ContratacionesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  private readonly enfoque = inject(EnfoqueService);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly tiposPago: Partial<Record<string, string>> = {
    deposito: 'Depósito del cliente',
    liberacion: 'Pago al trabajador',
    comision: 'Comisión de InWork',
    reembolso: 'Reembolso al cliente'
  };

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ contrataciones: [], trabajos: [], usuarios: [], ofertas: [] });
  protected readonly seleccionada = signal<any>(null);
  protected readonly custodia = signal<any>(null);
  protected readonly pagos = signal<any[]>([]);
  protected readonly estadoPago = signal('');
  protected readonly cargandoPago = signal(false);

  protected readonly modalEstado = signal(false);
  protected nuevoEstado = 'activa';
  protected readonly objetivo = signal<any>(null);
  protected readonly guardando = signal(false);
  protected readonly errorForm = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      contrataciones: this.api.get('/contrataciones/'),
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : [],
      ofertas: this.sesion.permiso('ofertas') ? this.api.get('/ofertas/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
    const pedido = this.enfoque.tomar('contrataciones');
    const anterior = this.seleccionada();
    const elegida = pedido
      ? datos.contrataciones.find((c: any) => c.id_trabajo === pedido.id_trabajo)
      : datos.contrataciones.find((c: any) => c.id_contratacion === anterior?.id_contratacion);
    this.elegir(elegida ?? datos.contrataciones[0] ?? null);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  private readonly ofertasPorId = computed(() => f.mapaPor(this.d().ofertas, 'id_oferta'));
  protected nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }
  protected trabajo(id: number): string {
    return this.trabajosPorId().get(id)?.titulo ?? 'Trabajo';
  }
  protected valor(c: any): number {
    return Number(this.ofertasPorId().get(c.id_oferta)?.valor_oferta) || 0;
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const lista = this.d().contrataciones;
    const cuantos = (e: string) => lista.filter((c: any) => c.estado_contratacion === e).length;
    return [
      { titulo: 'Activas', valor: cuantos('activa'), icono: 'engineering', color: 'azul', detalle: 'trabajos en curso' },
      { titulo: 'Finalizadas', valor: cuantos('finalizada'), icono: 'task_alt', color: 'verde', detalle: 'pagadas al trabajador' },
      { titulo: 'Canceladas', valor: cuantos('cancelada'), icono: 'cancel', color: 'rojo', detalle: 'el trabajo volvió a publicarse' }
    ];
  });

  protected readonly columnas: Columna[] = [
    { titulo: 'Trabajo', valor: (c) => this.trabajo(c.id_trabajo), html: (c) => `<strong class="bloque-texto">${f.escapar(this.trabajo(c.id_trabajo))}</strong>` },
    { titulo: 'Cliente', valor: (c) => this.nombre(c.id_cliente) },
    { titulo: 'Trabajador', valor: (c) => this.nombre(c.id_trabajador) },
    { titulo: 'Valor', valor: (c) => this.valor(c), html: (c) => h.dinero(this.valor(c)) },
    { titulo: 'Fecha', valor: (c) => f.ordenFecha(c.fecha_contratacion), html: (c) => h.suave(f.fecha(c.fecha_contratacion), 'texto-2 fecha') },
    { titulo: 'Estado', valor: (c) => f.textoEstado(c.estado_contratacion), html: (c) => h.pill(c.estado_contratacion) }
  ];

  protected readonly accionesTabla = computed<AccionTabla[]>(() =>
    this.sesion.permiso('contrataciones', 'editar')
      ? [
          {
            texto: 'Cambiar estado',
            icono: 'sync_alt',
            soloIcono: true,
            alHacer: (c) => {
              this.objetivo.set(c);
              this.nuevoEstado = c.estado_contratacion;
              this.errorForm.set('');
              this.modalEstado.set(true);
            }
          }
        ]
      : []
  );

  protected readonly elegir = async (contrato: any) => {
    this.seleccionada.set(contrato);
    this.custodia.set(null);
    this.pagos.set([]);
    this.estadoPago.set('');
    if (!contrato) return;
    this.cargandoPago.set(true);
    try {
      // La API principal le pregunta a la API de pagos por la custodia de este contrato
      const custodia = await this.api.get(`/contrataciones/${contrato.id_contratacion}/pago`);
      this.custodia.set(custodia);
      if (this.sesion.permiso('pagos')) this.pagos.set(await this.api.pagos.get(`/pagos?id_custodia=${custodia.id_custodia}`));
    } catch (e: any) {
      this.estadoPago.set(e.message);
    } finally {
      this.cargandoPago.set(false);
    }
  };

  protected readonly pasos = computed(() => {
    const sel = this.seleccionada();
    if (!sel) return [];
    const c = this.custodia();
    const estado = c?.estado_custodia;
    const pagado = ['asegurado', 'en_disputa', 'liberado'].includes(estado);
    const lista = [
      { titulo: 'Oferta aceptada', detalle: f.fechaHora(sel.fecha_contratacion), estado: 'hecho' },
      {
        titulo: 'Pago en custodia',
        detalle: pagado ? 'El cliente ya depositó' : estado === 'pendiente_pago' ? 'Esperando el depósito del cliente' : 'Sin depósito',
        estado: pagado ? 'hecho' : 'actual'
      },
      {
        titulo: 'Confirmación del trabajo',
        detalle: c ? `Cliente ${c.confirmado_cliente ? 'confirmó' : 'no ha confirmado'}, trabajador ${c.confirmado_trabajador ? 'confirmó' : 'no ha confirmado'}` : '—',
        estado: c?.confirmado_cliente && c?.confirmado_trabajador ? 'hecho' : pagado ? 'actual' : ''
      }
    ];
    if (estado === 'en_disputa') lista.push({ titulo: 'En disputa', detalle: c.motivo_disputa ?? 'InWork debe decidir', estado: 'actual' });
    lista.push({
      titulo: sel.estado_contratacion === 'cancelada' ? 'Contratación cancelada' : 'Pago liberado y contrato finalizado',
      detalle: f.textoEstado(sel.estado_contratacion),
      estado: sel.estado_contratacion === 'activa' ? '' : 'hecho'
    });
    return lista;
  });

  protected async guardarEstado(): Promise<void> {
    this.guardando.set(true);
    this.errorForm.set('');
    try {
      await this.api.put(`/contrataciones/${this.objetivo().id_contratacion}`, { estado_contratacion: this.nuevoEstado });
      this.avisos.avisar('Estado de la contratación actualizado');
      this.modalEstado.set(false);
      await this.cargar();
    } catch (e: any) {
      this.errorForm.set(e.message);
    } finally {
      this.guardando.set(false);
    }
  }

  protected irA(modulo: string, ruta: string): void {
    const sel = this.seleccionada();
    this.enfoque.pedir({ modulo, id_trabajo: sel.id_trabajo, id_contratacion: sel.id_contratacion });
    this.router.navigateByUrl(ruta);
  }
}
