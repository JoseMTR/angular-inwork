// INICIO (dashboard): resumen de toda la plataforma con datos reales de las dos APIs.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { GraficoArea } from '../../../../shared/components/grafico-area/grafico-area';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';
import { GraficoDona } from '../../../../shared/components/grafico-dona/grafico-dona';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Estadistica } from '../../../../shared/interfaces/estadistica';
import { Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

const contar = (lista: any[] = [], campo: string, valor: any) => lista.filter((x) => x[campo] === valor).length;

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, PageHeader, StatCard, Tarjeta, GraficoArea, GraficoDona, GraficoBarras, Avatar, TablaDatos, Cargando, EmptyState],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPage implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly sesion = inject(SesionService);

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({});
  protected readonly serie = signal('Trabajos');
  protected readonly series = ['Trabajos', 'Ofertas', 'Contrataciones'];

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    const puede = (m: string) => this.sesion.permiso(m);
    const { datos } = await cargarVarios({
      usuarios: puede('usuarios') ? this.api.get('/usuarios/') : [],
      trabajos: puede('trabajos') ? this.api.get('/trabajos/') : [],
      ofertas: puede('ofertas') ? this.api.get('/ofertas/') : [],
      contrataciones: puede('contrataciones') ? this.api.get('/contrataciones/') : [],
      categorias: puede('categorias') ? this.api.get('/categorias/') : [],
      habilidades: puede('categorias') ? this.api.get('/habilidades/') : [],
      usuariosHabilidades: puede('usuarios') ? this.api.get('/usuarios-habilidades/') : [],
      calificaciones: puede('calificaciones') ? this.api.get('/calificaciones/') : [],
      verificaciones: puede('verificaciones') ? this.api.get('/verificaciones-identidad/') : [],
      reportes: puede('reportes') ? this.api.get('/reportes/') : [],
      pagos: puede('pagos') ? this.api.pagos.get('/pagos') : [],
      custodias: puede('pagos') ? this.api.pagos.get('/custodias') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  private readonly categoriasPorId = computed(() => f.mapaPor(this.d().categorias, 'id_categoria'));
  private nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }
  private tituloTrabajo(id: number): string {
    return this.trabajosPorId().get(id)?.titulo ?? 'Trabajo';
  }

  protected readonly metricas = computed<Estadistica[]>(() => {
    const d = this.d();
    const u = d.usuarios ?? [];
    const t = d.trabajos ?? [];
    const c = d.contrataciones ?? [];
    const finalizadas = contar(c, 'estado_contratacion', 'finalizada');
    const lista: Estadistica[] = [];
    if (this.sesion.permiso('usuarios'))
      lista.push({
        titulo: 'Usuarios registrados',
        valor: f.numero(u.length),
        icono: 'group',
        color: 'azul',
        detalle: `${contar(u, 'id_rol', 4)} empleadores · ${contar(u, 'id_rol', 5)} empleados`
      });
    if (this.sesion.permiso('trabajos'))
      lista.push({
        titulo: 'Trabajos publicados',
        valor: f.numero(contar(t, 'estado_trabajo', 'publicado')),
        icono: 'work',
        color: 'naranja',
        detalle: `de ${t.length} trabajos en total`
      });
    if (this.sesion.permiso('contrataciones'))
      lista.push({
        titulo: 'Contrataciones activas',
        valor: f.numero(contar(c, 'estado_contratacion', 'activa')),
        icono: 'handshake',
        color: 'verde',
        detalle: `${finalizadas} finalizadas`
      });
    if (this.sesion.permiso('pagos'))
      lista.push({
        titulo: 'Comisión de InWork',
        valor: f.millones(f.sumar((d.pagos ?? []).filter((p: any) => p.tipo_pago === 'comision'), (p) => p.monto)),
        icono: 'payments',
        color: 'morado',
        detalle: `${contar(d.custodias, 'estado_custodia', 'asegurado')} pagos en custodia`
      });
    if (this.sesion.permiso('contrataciones'))
      lista.push({
        titulo: 'Tasa de finalización',
        valor: f.porcentaje(finalizadas, c.length, 1),
        icono: 'task_alt',
        color: 'ambar',
        detalle: 'de todas las contrataciones'
      });
    return lista;
  });

  // Gráfico por semana según la serie elegida
  protected readonly evolucion = computed(() => {
    const d = this.d();
    const origen: any[] = {
      Trabajos: (d.trabajos ?? []).map((t: any) => t.fecha_trabajo),
      Ofertas: (d.ofertas ?? []).map((o: any) => o.fecha_oferta),
      Contrataciones: (d.contrataciones ?? []).map((c: any) => c.fecha_contratacion)
    }[this.serie()] ?? [];
    const semanas = new Map<number, number>();
    for (const valor of origen) {
      const lunes = f.inicioSemana(valor);
      if (!lunes) continue;
      const clave = lunes.getTime();
      semanas.set(clave, (semanas.get(clave) || 0) + 1);
    }
    const ordenadas = [...semanas.entries()].sort((a, b) => a[0] - b[0]).slice(-10);
    return {
      valores: ordenadas.map(([, n]) => n),
      etiquetas: ordenadas.map(([clave]) => f.etiquetaSemana(new Date(clave)))
    };
  });

  protected readonly trabajosPorEstado = computed(() => {
    const t = this.d().trabajos;
    return [
      { nombre: 'Publicados', valor: contar(t, 'estado_trabajo', 'publicado'), color: '#f2541b' },
      { nombre: 'Asignados', valor: contar(t, 'estado_trabajo', 'asignado'), color: '#2f7cf6' },
      { nombre: 'Finalizados', valor: contar(t, 'estado_trabajo', 'finalizado'), color: '#12a067' },
      { nombre: 'Cancelados', valor: contar(t, 'estado_trabajo', 'cancelado'), color: '#b6bcc8' }
    ];
  });

  protected readonly categorias = computed(() => f.contarPor(this.d().trabajos, (t) => this.categoriasPorId().get(t.id_categoria)?.nombre).slice(0, 6));

  protected readonly mejores = computed(() => {
    const d = this.d();
    const habilidadesPorId = f.mapaPor(d.habilidades, 'id_habilidad');
    return [...(d.usuarios ?? [])]
      .filter((u: any) => u.id_rol === 5 && Number(u.total_calificaciones) > 0)
      .sort((a: any, b: any) => Number(b.promedio_calificacion) - Number(a.promedio_calificacion) || b.total_calificaciones - a.total_calificaciones)
      .slice(0, 5)
      .map((u: any) => {
        const habilidad = (d.usuariosHabilidades ?? []).find((x: any) => x.id_usuario === u.id_usuario);
        return {
          nombre: f.nombreCompleto(u),
          oficio: habilidadesPorId.get(habilidad?.id_habilidad)?.nombre ?? 'Sin oficio registrado',
          trabajos: (d.contrataciones ?? []).filter((c: any) => c.id_trabajador === u.id_usuario && c.estado_contratacion === 'finalizada').length,
          calificacion: Number(u.promedio_calificacion).toFixed(1)
        };
      });
  });

  protected readonly alertas = computed(() => {
    const d = this.d();
    const lista = [];
    const pendientesVerif = contar(d.verificaciones, 'estado_verificacion', 'pendiente');
    const pendientesRep = contar(d.reportes, 'estado_reporte', 'pendiente');
    const disputas = contar(d.custodias, 'estado_custodia', 'en_disputa');
    const sinPagar = contar(d.custodias, 'estado_custodia', 'pendiente_pago');
    if (this.sesion.permiso('verificaciones') && pendientesVerif)
      lista.push({ icono: 'badge', titulo: `${pendientesVerif} verificaciones pendientes`, detalle: 'Documentos esperando revisión', ruta: '/verificaciones', tono: 'ambar' });
    if (this.sesion.permiso('reportes') && pendientesRep)
      lista.push({ icono: 'flag', titulo: `${pendientesRep} reportes sin atender`, detalle: 'Denuncias entre usuarios', ruta: '/reportes', tono: 'rojo' });
    if (this.sesion.permiso('pagos') && disputas)
      lista.push({ icono: 'gavel', titulo: `${disputas} pagos en disputa`, detalle: 'InWork debe decidir a quién pagar', ruta: '/pagos', tono: 'morado' });
    if (this.sesion.permiso('pagos') && sinPagar)
      lista.push({ icono: 'hourglass_top', titulo: `${f.cantidad(sinPagar, 'contrato')} sin pagar`, detalle: 'El cliente aún no deposita', ruta: '/pagos', tono: 'ambar' });
    return lista;
  });

  // Actividad reciente armada con los movimientos de cada tabla
  protected readonly actividad = computed(() => {
    const d = this.d();
    const eventos: any[] = [];
    for (const t of d.trabajos ?? [])
      eventos.push({ usuario: this.nombre(t.id_cliente), accion: `Publicó «${t.titulo}»`, modulo: 'Trabajos', estado: t.estado_trabajo, fecha: t.created });
    for (const o of d.ofertas ?? [])
      eventos.push({
        usuario: this.nombre(o.id_trabajador),
        accion: `Ofertó ${f.moneda(o.valor_oferta)} en «${this.tituloTrabajo(o.id_trabajo)}»`,
        modulo: 'Ofertas',
        estado: o.estado_oferta,
        fecha: o.fecha_oferta
      });
    for (const c of d.contrataciones ?? [])
      eventos.push({ usuario: this.nombre(c.id_cliente), accion: `Contrató a ${this.nombre(c.id_trabajador)}`, modulo: 'Contrataciones', estado: c.estado_contratacion, fecha: c.fecha_contratacion });
    for (const r of d.reportes ?? [])
      eventos.push({ usuario: this.nombre(r.id_reportante), accion: `Reportó a ${this.nombre(r.id_reportado)}`, modulo: 'Reportes', estado: r.estado_reporte, fecha: r.created });
    return eventos.sort((a, b) => f.ordenFecha(b.fecha) - f.ordenFecha(a.fecha)).slice(0, 40);
  });

  protected readonly columnasActividad: Columna[] = [
    { titulo: 'Usuario', valor: (e) => e.usuario, html: (e) => h.persona(e.usuario) },
    { titulo: 'Acción', valor: (e) => e.accion },
    { titulo: 'Módulo', valor: (e) => e.modulo, html: (e) => h.suave(e.modulo) },
    { titulo: 'Estado', valor: (e) => f.textoEstado(e.estado), html: (e) => h.pill(e.estado) },
    { titulo: 'Fecha', valor: (e) => f.ordenFecha(e.fecha), html: (e) => h.suave(f.fechaHora(e.fecha), 'texto-3 fecha') }
  ];

  protected exportar(): void {
    f.descargarCSV(
      'actividad-inwork.csv',
      [
        { titulo: 'Usuario', valor: (e) => e.usuario },
        { titulo: 'Acción', valor: (e) => e.accion },
        { titulo: 'Módulo', valor: (e) => e.modulo },
        { titulo: 'Estado', valor: (e) => f.textoEstado(e.estado) },
        { titulo: 'Fecha', valor: (e) => f.fechaHora(e.fecha) }
      ],
      this.actividad()
    );
  }
}
