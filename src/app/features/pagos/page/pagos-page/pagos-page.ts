// PAGOS: todo viene de la API de pagos (Express + MySQL) usando el mismo token.
// El administrador resuelve las disputas: le paga al trabajador o le devuelve el dinero al cliente.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { EnfoqueService } from '../../../../core/services/enfoque';
import { SesionService } from '../../../../core/services/sesion';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';
import { GraficoDona } from '../../../../shared/components/grafico-dona/grafico-dona';
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

const TIPOS: Record<string, string> = { deposito: 'Depósito', liberacion: 'Pago al trabajador', comision: 'Comisión', reembolso: 'Reembolso' };
const ICONOS_METODO: Record<string, string> = { nequi: 'smartphone', daviplata: 'smartphone', pse: 'account_balance', tarjeta: 'credit_card', efectivo: 'payments' };
const COLORES_METODO = ['#7a5af0', '#f2541b', '#12a067', '#2f7cf6', '#d99100'];

@Component({
  selector: 'app-pagos-page',
  imports: [PageHeader, StatCard, Tarjeta, TablaDatos, GraficoBarras, GraficoDona, Modal, StatusPill, Cargando, EmptyState],
  templateUrl: './pagos-page.html',
  styleUrl: './pagos-page.css'
})
export class PagosPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  private readonly enfoque = inject(EnfoqueService);
  private readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly d = signal<any>({ custodias: [], pagos: [], contrataciones: [], trabajos: [], usuarios: [] });
  protected readonly seleccionada = signal<any>(null);

  protected readonly modal = signal(false);
  protected readonly objetivo = signal<any>(null);
  protected readonly decision = signal<'liberar' | 'reembolsar'>('liberar');
  protected readonly guardando = signal(false);
  protected readonly errorForm = signal('');

  // Resolver disputas: el permiso de editar pagos y ser del equipo que modifica (admin o moderador)
  protected readonly puedeResolver = computed(() => this.sesion.permiso('pagos', 'editar') && [1, 2].includes(this.sesion.sesion()?.id_rol ?? 0));

  ngOnInit(): void {
    this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.error.set('');
    const { datos, errores } = await cargarVarios({
      custodias: this.api.pagos.get('/custodias'),
      pagos: this.api.pagos.get('/pagos'),
      contrataciones: this.sesion.permiso('contrataciones') ? this.api.get('/contrataciones/') : [],
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : []
    });
    if (!datos.custodias.length && errores.length) this.error.set(errores[0].message);
    this.d.set(datos);
    this.cargando.set(false);
    const pedido = this.enfoque.tomar('pagos');
    if (pedido) this.seleccionada.set(datos.custodias.find((c: any) => c.id_contratacion === pedido.id_contratacion) ?? null);
  }

  private readonly contratosPorId = computed(() => f.mapaPor(this.d().contrataciones, 'id_contratacion'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  private readonly usuariosPorCorreo = computed(() => f.mapaPor(this.d().usuarios, 'correo'));
  protected trabajo(idContratacion: number): string {
    return this.trabajosPorId().get(this.contratosPorId().get(idContratacion)?.id_trabajo)?.titulo ?? 'Contrato de InWork';
  }
  protected persona(correo: string): string {
    const usuario = this.usuariosPorCorreo().get(correo);
    return usuario ? f.nombreCompleto(usuario) : correo;
  }
  private sumaTipo(tipo: string): number {
    return f.sumar(this.d().pagos.filter((p: any) => p.tipo_pago === tipo), (p) => p.monto);
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const enCustodia = f.sumar(this.d().custodias.filter((c: any) => ['asegurado', 'en_disputa'].includes(c.estado_custodia)), (c) => c.monto);
    return [
      { titulo: 'Dinero en custodia', valor: f.millones(enCustodia), icono: 'lock', color: 'azul', detalle: 'esperando confirmación' },
      { titulo: 'Pagado a trabajadores', valor: f.millones(this.sumaTipo('liberacion')), icono: 'payments', color: 'verde', detalle: 'ya liberado' },
      { titulo: 'Comisión de InWork', valor: f.millones(this.sumaTipo('comision')), icono: 'account_balance', color: 'morado', detalle: 'ganancia de la plataforma' },
      { titulo: 'Reembolsos', valor: f.millones(this.sumaTipo('reembolso')), icono: 'undo', color: 'rojo', detalle: 'devuelto a clientes' }
    ];
  });

  protected readonly porTipo = computed(() => [
    { etiqueta: 'Depósitos', valor: Math.round(this.sumaTipo('deposito') / 1000) },
    { etiqueta: 'A trabajadores', valor: Math.round(this.sumaTipo('liberacion') / 1000) },
    { etiqueta: 'Comisiones', valor: Math.round(this.sumaTipo('comision') / 1000) },
    { etiqueta: 'Reembolsos', valor: Math.round(this.sumaTipo('reembolso') / 1000) }
  ]);
  protected readonly formatoMiles = (v: number) => `$ ${f.numero(v)} mil`;

  protected readonly depositos = computed(() => this.d().pagos.filter((p: any) => p.tipo_pago === 'deposito').length);
  protected readonly metodos = computed(() =>
    f
      .contarPor(this.d().pagos.filter((p: any) => p.tipo_pago === 'deposito'), (p) => f.capitalizar(p.metodo_pago ?? 'otro'))
      .map((m, i) => ({ nombre: m.etiqueta, valor: m.valor, color: COLORES_METODO[i % COLORES_METODO.length] }))
  );

  protected readonly columnasCustodias: Columna[] = [
    { titulo: 'Código', valor: (c) => c.codigo, html: (c) => h.codigo(c.codigo) },
    { titulo: 'Trabajo', valor: (c) => this.trabajo(c.id_contratacion), html: (c) => `<strong class="bloque-texto">${f.escapar(this.trabajo(c.id_contratacion))}</strong>` },
    { titulo: 'Cliente', valor: (c) => this.persona(c.correo_cliente) },
    { titulo: 'Trabajador', valor: (c) => c.nombre_trabajador ?? this.persona(c.correo_trabajador) },
    { titulo: 'Monto', valor: (c) => Number(c.monto), html: (c) => h.dinero(c.monto) },
    {
      titulo: 'Confirmaciones',
      valor: (c) => Number(c.confirmado_cliente) + Number(c.confirmado_trabajador),
      html: (c) =>
        `<span class="confirma">${c.confirmado_cliente ? '✔' : '○'} Cliente</span><span class="confirma">${c.confirmado_trabajador ? '✔' : '○'} Trabajador</span>`
    },
    { titulo: 'Estado', valor: (c) => f.textoEstado(c.estado_custodia), html: (c) => h.pill(c.estado_custodia) }
  ];

  protected readonly accionesCustodias = computed<AccionTabla[]>(() =>
    this.puedeResolver()
      ? [
          {
            texto: 'Resolver disputa',
            icono: 'gavel',
            tono: 'suave',
            mostrar: (c) => c.estado_custodia === 'en_disputa',
            alHacer: (c) => {
              this.objetivo.set(c);
              this.decision.set('liberar');
              this.errorForm.set('');
              this.modal.set(true);
            }
          }
        ]
      : []
  );

  protected readonly elegir = (c: any) => this.seleccionada.set(c);

  protected readonly movimientos = computed(() => {
    const sel = this.seleccionada();
    return sel ? this.d().pagos.filter((p: any) => p.id_custodia === sel.id_custodia) : this.d().pagos;
  });

  protected readonly columnasPagos: Columna[] = [
    { titulo: 'Referencia', valor: (p) => p.referencia, html: (p) => h.codigo(p.referencia) },
    { titulo: 'Trabajo', valor: (p) => this.trabajo(p.id_contratacion) },
    { titulo: 'Tipo', valor: (p) => TIPOS[p.tipo_pago], html: (p) => h.pill(p.tipo_pago, TIPOS[p.tipo_pago]) },
    { titulo: 'Monto', valor: (p) => Number(p.monto), html: (p) => h.dinero(p.monto) },
    {
      titulo: 'Método',
      valor: (p) => p.metodo_pago ?? '',
      html: (p) => (p.metodo_pago ? h.chip(f.capitalizar(p.metodo_pago), ICONOS_METODO[p.metodo_pago] ?? 'payments') : '<span class="texto-3">Interno</span>')
    },
    { titulo: 'Fecha', valor: (p) => f.ordenFecha(p.created), html: (p) => h.suave(f.fechaHora(p.created), 'texto-3 fecha') }
  ];

  protected async resolver(): Promise<void> {
    this.guardando.set(true);
    this.errorForm.set('');
    try {
      const respuesta = await this.api.pagos.post(`/custodias/${this.objetivo().id_custodia}/resolver`, { decision: this.decision() });
      this.avisos.avisar(respuesta?.mensaje ?? 'Disputa resuelta');
      this.modal.set(false);
      await this.cargar();
    } catch (e: any) {
      this.errorForm.set(e.message);
    } finally {
      this.guardando.set(false);
    }
  }

  protected exportar(): void {
    f.descargarCSV(
      'pagos-inwork.csv',
      [
        { titulo: 'Referencia', valor: (p) => p.referencia },
        { titulo: 'Código custodia', valor: (p) => p.codigo_custodia },
        { titulo: 'Trabajo', valor: (p) => this.trabajo(p.id_contratacion) },
        { titulo: 'Tipo', valor: (p) => TIPOS[p.tipo_pago] },
        { titulo: 'Monto', valor: (p) => p.monto },
        { titulo: 'Método', valor: (p) => p.metodo_pago ?? '' },
        { titulo: 'Fecha', valor: (p) => f.fechaHora(p.created) }
      ],
      this.d().pagos
    );
  }
}
