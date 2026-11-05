// INFORMES: se arman solos con los datos reales de las dos APIs según el periodo elegido.
// El asistente responde preguntas con reglas sobre esos mismos datos (no usa un servicio de IA externo).
import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { SesionService } from '../../../../core/services/sesion';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { ChatBubble } from '../../../../shared/components/chat-bubble/chat-bubble';
import { GraficoArea } from '../../../../shared/components/grafico-area/grafico-area';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';
import { GraficoDona } from '../../../../shared/components/grafico-dona/grafico-dona';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Barra } from '../../../../shared/interfaces/grafico';
import { Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

interface Periodo {
  clave: string;
  texto: string;
  frase: string; // para títulos ("Informe de ...")
  en: string; // para oraciones ("... en los últimos 7 días")
  dias: number | null;
}

interface Cifra {
  etiqueta: string;
  valor: string;
  variacion?: string;
  sube?: boolean;
}

interface Respuesta {
  texto: string;
  cifras?: Cifra[];
  barras?: Barra[];
  color?: string;
  formato?: (valor: number) => string | number;
}

interface Mensaje extends Respuesta {
  propio: boolean;
  hora: string;
}

const PERIODOS: Periodo[] = [
  { clave: 'hoy', texto: 'Hoy', frase: 'hoy', en: 'hoy', dias: 1 },
  { clave: '7', texto: '7 días', frase: 'los últimos 7 días', en: 'en los últimos 7 días', dias: 7 },
  { clave: '30', texto: '30 días', frase: 'los últimos 30 días', en: 'en los últimos 30 días', dias: 30 },
  { clave: 'todo', texto: 'Todo', frase: 'toda la historia', en: 'en toda la historia de InWork', dias: null }
];

const VACIO = { usuarios: [], trabajos: [], ofertas: [], contrataciones: [], categorias: [], ciudades: [], calificaciones: [], reportes: [], verificaciones: [], pagos: [], custodias: [] };

@Component({
  selector: 'app-informes-page',
  imports: [FormsModule, PageHeader, Tarjeta, TablaDatos, GraficoArea, GraficoBarras, GraficoDona, ChatBubble, StatusPill, Cargando],
  templateUrl: './informes-page.html',
  styleUrl: './informes-page.css'
})
export class InformesPage implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;
  protected readonly periodos = PERIODOS;

  protected readonly cargando = signal(true);
  protected readonly generado = signal<Date | null>(null);
  protected readonly periodo = signal('30');
  protected readonly d = signal<any>(VACIO);

  ngOnInit(): void {
    this.cargar();
  }

  protected async cargar(forzar = false): Promise<void> {
    if (forzar) this.api.limpiarMemoria();
    this.cargando.set(true);
    const puede = (m: string) => this.sesion.permiso(m);
    const { datos } = await cargarVarios({
      usuarios: puede('usuarios') ? this.api.get('/usuarios/') : [],
      trabajos: puede('trabajos') ? this.api.get('/trabajos/') : [],
      ofertas: puede('ofertas') ? this.api.get('/ofertas/') : [],
      contrataciones: puede('contrataciones') ? this.api.get('/contrataciones/') : [],
      categorias: puede('categorias') ? this.api.get('/categorias/') : [],
      ciudades: puede('ubicacion') ? this.api.get('/ciudades/') : [],
      calificaciones: puede('calificaciones') ? this.api.get('/calificaciones/') : [],
      reportes: puede('reportes') ? this.api.get('/reportes/') : [],
      verificaciones: puede('verificaciones') ? this.api.get('/verificaciones-identidad/') : [],
      pagos: puede('pagos') ? this.api.pagos.get('/pagos') : [],
      custodias: puede('pagos') ? this.api.pagos.get('/custodias') : []
    });
    this.d.set(datos);
    this.generado.set(new Date());
    this.cargando.set(false);
  }

  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  private readonly ofertasPorId = computed(() => f.mapaPor(this.d().ofertas, 'id_oferta'));
  private readonly categoriasPorId = computed(() => f.mapaPor(this.d().categorias, 'id_categoria'));
  private readonly ciudadesPorId = computed(() => f.mapaPor(this.d().ciudades, 'id_ciudad'));
  private categoriaDe(idTrabajo: number): string {
    return this.categoriasPorId().get(this.trabajosPorId().get(idTrabajo)?.id_categoria)?.nombre ?? 'Sin categoría';
  }

  // ---------- Periodo ----------
  protected readonly elegido = computed(() => PERIODOS.find((p) => p.clave === this.periodo()) ?? PERIODOS[2]);

  private readonly rango = computed(() => {
    const ahora = this.generado() ?? new Date();
    const elegido = this.elegido();
    if (!elegido.dias) return { desde: null as Date | null, hasta: ahora, antes: null as Date | null };
    const desde = new Date(ahora);
    if (elegido.clave === 'hoy') desde.setHours(0, 0, 0, 0);
    else desde.setTime(ahora.getTime() - elegido.dias * 86400000);
    // Hoy se compara con todo el día de ayer; los demás con un periodo igual de largo justo antes
    const largo = elegido.clave === 'hoy' ? 86400000 : ahora.getTime() - desde.getTime();
    return { desde: desde as Date | null, hasta: ahora, antes: new Date(desde.getTime() - largo) as Date | null };
  });

  private dentro(valor: any, desde: Date | null, hasta: Date): boolean {
    const t = f.ordenFecha(valor);
    return t > 0 && (!desde || t >= desde.getTime()) && t <= hasta.getTime();
  }

  private filtrar(desde: Date | null, hasta: Date): any {
    const d = this.d();
    return {
      usuarios: d.usuarios.filter((u: any) => this.dentro(u.created, desde, hasta)),
      trabajos: d.trabajos.filter((t: any) => this.dentro(t.created, desde, hasta)),
      ofertas: d.ofertas.filter((o: any) => this.dentro(o.fecha_oferta ?? o.created, desde, hasta)),
      contrataciones: d.contrataciones.filter((c: any) => this.dentro(c.fecha_contratacion ?? c.created, desde, hasta)),
      calificaciones: d.calificaciones.filter((c: any) => this.dentro(c.created, desde, hasta)),
      reportes: d.reportes.filter((r: any) => this.dentro(r.created, desde, hasta)),
      pagos: d.pagos.filter((p: any) => this.dentro(p.created, desde, hasta))
    };
  }

  private readonly actual = computed(() => this.filtrar(this.rango().desde, this.rango().hasta));
  private readonly anterior = computed(() => {
    const r = this.rango();
    return r.antes ? this.filtrar(r.antes, r.desde ?? r.hasta) : null;
  });

  private comision(datos: any): number {
    return f.sumar(datos.pagos.filter((p: any) => p.tipo_pago === 'comision'), (p) => p.monto);
  }
  private promedioNotas(datos: any): number {
    return f.promedio(datos.calificaciones, (c) => c.puntuacion);
  }

  private variacion(ahora: number, antes: number | null | undefined): { variacion: string; sube: boolean } {
    if (antes === null || antes === undefined) return { variacion: '', sube: true };
    if (!antes) return { variacion: ahora ? 'Nuevo frente al periodo anterior' : 'Igual que el periodo anterior', sube: true };
    const cambio = ((ahora - antes) / antes) * 100;
    return { variacion: `${cambio >= 0 ? '+' : ''}${f.decimal(cambio)}% vs. periodo anterior`, sube: cambio >= 0 };
  }

  // ---------- Cifras clave ----------
  protected readonly cifras = computed<Cifra[]>(() => {
    const actual = this.actual();
    const anterior = this.anterior();
    const lista: Cifra[] = [];
    const agregar = (modulo: string, etiqueta: string, ahora: number, antes: number | null | undefined, formato: (v: number) => string = f.numero) => {
      if (!this.sesion.permiso(modulo)) return;
      lista.push({ etiqueta, valor: formato(ahora), ...this.variacion(ahora, antes) });
    };
    agregar('usuarios', 'Usuarios nuevos', actual.usuarios.length, anterior?.usuarios.length);
    agregar('trabajos', 'Trabajos publicados', actual.trabajos.length, anterior?.trabajos.length);
    agregar('ofertas', 'Ofertas enviadas', actual.ofertas.length, anterior?.ofertas.length);
    agregar('contrataciones', 'Contrataciones', actual.contrataciones.length, anterior?.contrataciones.length);
    agregar('pagos', 'Comisión de InWork', this.comision(actual), anterior ? this.comision(anterior) : null, f.millones);
    agregar('calificaciones', 'Calificación promedio', this.promedioNotas(actual), anterior ? this.promedioNotas(anterior) : null, (v) =>
      v ? `${f.decimal(v)} ★` : 'Sin notas'
    );
    return lista;
  });

  protected readonly categoriasPeriodo = computed(() =>
    f.contarPor(this.actual().trabajos, (t) => this.categoriasPorId().get(t.id_categoria)?.nombre).slice(0, 6)
  );

  // ---------- Narrativa ----------
  protected readonly narrativa = computed(() => {
    const actual = this.actual();
    const elegido = this.elegido();
    const partes: string[] = [];
    const inicio = elegido.en.charAt(0).toUpperCase() + elegido.en.slice(1);
    const movimiento = actual.usuarios.length + actual.trabajos.length + actual.ofertas.length + actual.contrataciones.length;
    if (this.sesion.permiso('usuarios'))
      partes.push(`se registr${actual.usuarios.length === 1 ? 'ó 1 persona nueva' : `aron ${actual.usuarios.length} personas nuevas`}`);
    if (this.sesion.permiso('trabajos')) partes.push(`se publicaron ${f.cantidad(actual.trabajos.length, 'trabajo')}`);
    if (this.sesion.permiso('ofertas')) partes.push(`los trabajadores enviaron ${f.cantidad(actual.ofertas.length, 'oferta')}`);
    if (this.sesion.permiso('contrataciones')) partes.push(`se cerraron ${f.cantidad(actual.contrataciones.length, 'contratación', 'contrataciones')}`);
    let texto = '';
    if (partes.length && !movimiento) texto = `${inicio} no hubo registros nuevos de usuarios, trabajos, ofertas ni contrataciones.`;
    else if (partes.length) texto = `${inicio} ${partes.slice(0, -1).join(', ')}${partes.length > 1 ? ' y ' : ''}${partes[partes.length - 1]}.`;
    const top = this.categoriasPeriodo()[0];
    if (top) texto += ` La categoría con más movimiento fue ${top.etiqueta} con ${top.valor} trabajo${top.valor === 1 ? '' : 's'}.`;
    if (this.sesion.permiso('pagos') && this.comision(actual)) texto += ` InWork ganó ${f.moneda(this.comision(actual))} en comisiones.`;
    const abiertos = this.d().reportes.filter((r: any) => ['pendiente', 'en_revision'].includes(r.estado_reporte)).length;
    if (this.sesion.permiso('reportes')) texto += abiertos ? ` Quedan ${abiertos} reportes por resolver.` : ' No hay reportes abiertos.';
    return texto.trim() || 'Tu rol no tiene módulos con datos para armar el informe.';
  });

  // ---------- Gráficos ----------
  private cubetas(): { ini: Date; fin: Date; etiqueta: string }[] {
    const rango = this.rango();
    const ahora = rango.hasta;
    const periodo = this.periodo();
    const lista: { ini: Date; fin: Date; etiqueta: string }[] = [];
    if (periodo === 'hoy') {
      for (let hora = 0; hora <= ahora.getHours(); hora++) {
        const ini = new Date(ahora);
        ini.setHours(hora, 0, 0, 0);
        lista.push({ ini, fin: new Date(ini.getTime() + 3600000), etiqueta: `${hora} h` });
      }
      return lista;
    }
    if (periodo === '7') {
      for (let i = 6; i >= 0; i--) {
        const ini = new Date(ahora);
        ini.setHours(0, 0, 0, 0);
        ini.setDate(ini.getDate() - i);
        const fin = new Date(ini);
        fin.setDate(fin.getDate() + 1);
        lista.push({ ini, fin, etiqueta: ini.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }) });
      }
      return lista;
    }
    const actual = this.actual();
    const fechas = [...actual.trabajos.map((t: any) => t.created), ...actual.ofertas.map((o: any) => o.fecha_oferta), ...actual.contrataciones.map((c: any) => c.fecha_contratacion)]
      .map((x) => f.ordenFecha(x))
      .filter((t) => t > 0);
    const primera = rango.desde ?? new Date(fechas.length ? Math.min(...fechas) : ahora.getTime());
    let lunes = f.inicioSemana(primera);
    while (lunes && lunes <= ahora) {
      const fin = new Date(lunes);
      fin.setDate(fin.getDate() + 7);
      lista.push({ ini: lunes, fin, etiqueta: f.etiquetaSemana(lunes) });
      lunes = fin;
    }
    return lista.slice(-12);
  }

  protected readonly actividad = computed(() => {
    const actual = this.actual();
    const tiempos: number[] = [
      ...actual.trabajos.map((t: any) => t.created),
      ...actual.ofertas.map((o: any) => o.fecha_oferta),
      ...actual.contrataciones.map((c: any) => c.fecha_contratacion)
    ].map((x) => f.ordenFecha(x));
    const lista = this.cubetas();
    return {
      valores: lista.map((c) => tiempos.filter((t) => t >= c.ini.getTime() && t < c.fin.getTime()).length),
      etiquetas: lista.map((c) => c.etiqueta)
    };
  });

  protected readonly contratosPorEstado = computed(() => {
    const lista = this.actual().contrataciones;
    const cuantos = (e: string) => lista.filter((c: any) => c.estado_contratacion === e).length;
    return [
      { nombre: 'Activas', valor: cuantos('activa'), color: '#2f7cf6' },
      { nombre: 'Finalizadas', valor: cuantos('finalizada'), color: '#12a067' },
      { nombre: 'Canceladas', valor: cuantos('cancelada'), color: '#b6bcc8' }
    ];
  });

  // ---------- Resumen por categoría (DataTable) ----------
  protected readonly porCategoria = computed(() => {
    const actual = this.actual();
    const filas = new Map<string, any>();
    const fila = (nombre: string) => {
      if (!filas.has(nombre)) filas.set(nombre, { categoria: nombre, trabajos: 0, ofertas: 0, contrataciones: 0, valor: 0, presupuestos: [] as number[] });
      return filas.get(nombre);
    };
    for (const t of actual.trabajos) {
      const r = fila(this.categoriasPorId().get(t.id_categoria)?.nombre ?? 'Sin categoría');
      r.trabajos++;
      r.presupuestos.push(Number(t.presupuesto) || 0);
    }
    for (const o of actual.ofertas) fila(this.categoriaDe(o.id_trabajo)).ofertas++;
    for (const c of actual.contrataciones) {
      const r = fila(this.categoriaDe(c.id_trabajo));
      r.contrataciones++;
      r.valor += Number(this.ofertasPorId().get(c.id_oferta)?.valor_oferta) || 0;
    }
    return [...filas.values()].map((r) => ({ ...r, presupuesto: r.presupuestos.length ? f.sumar(r.presupuestos, (v) => v) / r.presupuestos.length : 0 }));
  });

  protected readonly columnasCategoria: Columna[] = [
    { titulo: 'Categoría', valor: (r) => r.categoria, html: (r) => `<strong>${f.escapar(r.categoria)}</strong>` },
    { titulo: 'Trabajos', valor: (r) => r.trabajos, clase: 'numero' },
    { titulo: 'Ofertas', valor: (r) => r.ofertas, clase: 'numero' },
    { titulo: 'Contrataciones', valor: (r) => r.contrataciones, clase: 'numero' },
    { titulo: 'Valor contratado', valor: (r) => r.valor, html: (r) => h.dinero(r.valor), clase: 'numero' },
    { titulo: 'Presupuesto promedio', valor: (r) => r.presupuesto, html: (r) => (r.presupuesto ? h.dinero(r.presupuesto) : h.suave('—', 'texto-3')), clase: 'numero' }
  ];

  // ---------- Hallazgos y recomendaciones ----------
  protected readonly hallazgos = computed(() => {
    const d = this.d();
    const actual = this.actual();
    const elegido = this.elegido();
    const lista: { tono: string; icono: string; texto: string }[] = [];
    if (this.sesion.permiso('trabajos') && this.sesion.permiso('ofertas')) {
      const sinOfertas = d.trabajos.filter((t: any) => t.estado_trabajo === 'publicado' && !d.ofertas.some((o: any) => o.id_trabajo === t.id_trabajo)).length;
      if (sinOfertas)
        lista.push({
          tono: 'ambar',
          icono: 'campaign',
          texto: `${sinOfertas} trabajo${sinOfertas === 1 ? '' : 's'} publicado${sinOfertas === 1 ? '' : 's'} todavía no recibe${sinOfertas === 1 ? '' : 'n'} ofertas. Conviene avisar a los trabajadores de esa categoría.`
        });
    }
    const top = this.categoriasPeriodo()[0];
    if (top && actual.trabajos.length)
      lista.push({ tono: 'verde', icono: 'trending_up', texto: `${top.etiqueta} concentra el ${f.porcentaje(top.valor, actual.trabajos.length)} de los trabajos publicados ${elegido.en}.` });
    if (this.sesion.permiso('ofertas') && actual.ofertas.length) {
      const aceptadas = actual.ofertas.filter((o: any) => o.estado_oferta === 'aceptada').length;
      lista.push({ tono: 'naranja', icono: 'local_offer', texto: `Se aceptó el ${f.porcentaje(aceptadas, actual.ofertas.length)} de las ofertas (${aceptadas} de ${actual.ofertas.length}).` });
      const relaciones = actual.ofertas
        .map((o: any) => Number(o.valor_oferta) / Number(this.trabajosPorId().get(o.id_trabajo)?.presupuesto))
        .filter((x: number) => Number.isFinite(x) && x > 0);
      if (relaciones.length) {
        const media = (f.sumar(relaciones, (x) => x) / relaciones.length - 1) * 100;
        lista.push({ tono: 'naranja', icono: 'balance', texto: `Las ofertas llegan en promedio un ${f.decimal(Math.abs(media))}% ${media <= 0 ? 'por debajo' : 'por encima'} del presupuesto del cliente.` });
      }
    }
    if (this.sesion.permiso('contrataciones') && actual.contrataciones.length) {
      const canceladas = actual.contrataciones.filter((c: any) => c.estado_contratacion === 'cancelada').length;
      if (canceladas / actual.contrataciones.length >= 0.2)
        lista.push({ tono: 'ambar', icono: 'cancel', texto: `${canceladas} de ${actual.contrataciones.length} contrataciones se cancelaron. Vale la pena revisar por qué.` });
    }
    if (this.sesion.permiso('reportes')) {
      const abiertos = d.reportes.filter((r: any) => ['pendiente', 'en_revision'].includes(r.estado_reporte)).length;
      if (abiertos) lista.push({ tono: 'ambar', icono: 'flag', texto: `Hay ${abiertos} reporte${abiertos === 1 ? '' : 's'} sin resolver entre usuarios.` });
    }
    if (this.sesion.permiso('verificaciones')) {
      const pendientes = d.verificaciones.filter((v: any) => v.estado_verificacion === 'pendiente').length;
      if (pendientes) lista.push({ tono: 'ambar', icono: 'badge', texto: `${pendientes} verificaci${pendientes === 1 ? 'ón' : 'ones'} de identidad esperan revisión.` });
    }
    if (this.sesion.permiso('pagos')) {
      const disputas = d.custodias.filter((c: any) => c.estado_custodia === 'en_disputa').length;
      if (disputas)
        lista.push({ tono: 'naranja', icono: 'gavel', texto: `${disputas} pago${disputas === 1 ? '' : 's'} en custodia está${disputas === 1 ? '' : 'n'} en disputa y esperan decisión.` });
    }
    if (this.sesion.permiso('usuarios')) {
      const bajos = d.usuarios.filter((u: any) => u.id_rol === 5 && Number(u.total_calificaciones) >= 2 && Number(u.promedio_calificacion) < 3.5).length;
      if (bajos) lista.push({ tono: 'ambar', icono: 'star_half', texto: `${bajos} trabajador${bajos === 1 ? ' tiene' : 'es tienen'} un promedio menor a 3,5 estrellas.` });
    }
    if (!lista.length) lista.push({ tono: 'verde', icono: 'verified', texto: 'No se encontraron alertas en este periodo.' });
    return lista;
  });

  // ---------- Asistente ----------
  protected readonly sugerencias = [
    'Resumen del periodo',
    '¿Cuánto ganó InWork en comisión?',
    '¿Qué categorías tienen más trabajos?',
    '¿Quiénes son los mejores trabajadores?',
    '¿Cuántos reportes hay abiertos?',
    '¿En qué ciudades hay más trabajos?',
    '¿Cómo van las ofertas?',
    '¿Cuántos usuarios hay por rol?'
  ];

  protected readonly mensajes = signal<Mensaje[]>([]);
  protected pregunta = '';
  private readonly zonaMensajes = viewChild<ElementRef<HTMLDivElement>>('zonaMensajes');
  protected readonly formatoNormal = (v: number) => v;

  private horaActual(): string {
    return new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  }

  protected primerNombre(): string {
    return this.sesion.sesion()?.nombre?.split(' ')[0] ?? '';
  }

  private sinPermiso(modulo: string): Respuesta {
    return { texto: `Tu rol no tiene acceso al módulo de ${modulo}, así que no puedo responder eso.` };
  }

  private responder(texto: string): Respuesta {
    const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const tiene = (...palabras: string[]) => palabras.some((p) => t.includes(p));
    const d = this.d();
    const actual = this.actual();
    const frase = this.elegido().en;
    const Frase = frase.charAt(0).toUpperCase() + frase.slice(1);

    if (tiene('comision', 'gan', 'ingreso', 'dinero', 'plata', 'pago', 'custodia', 'disputa')) {
      if (!this.sesion.permiso('pagos')) return this.sinPermiso('pagos');
      const depositos = f.sumar(actual.pagos.filter((p: any) => p.tipo_pago === 'deposito'), (p) => p.monto);
      const disputas = d.custodias.filter((c: any) => c.estado_custodia === 'en_disputa').length;
      return {
        texto: `${Frase} InWork ganó ${f.moneda(this.comision(actual))} en comisiones sobre ${f.moneda(depositos)} depositados por los clientes. ${
          disputas ? `Hay ${disputas} pago${disputas === 1 ? '' : 's'} en disputa.` : 'No hay pagos en disputa.'
        }`,
        cifras: [
          { etiqueta: 'Comisión', valor: f.millones(this.comision(actual)) },
          { etiqueta: 'Depósitos', valor: f.millones(depositos) },
          { etiqueta: 'En disputa', valor: f.numero(disputas) }
        ]
      };
    }
    if (tiene('categor')) {
      if (!this.sesion.permiso('trabajos')) return this.sinPermiso('trabajos');
      if (!this.categoriasPeriodo().length) return { texto: `No se publicaron trabajos ${frase}.` };
      return { texto: `Estas son las categorías con más trabajos publicados ${frase}:`, barras: this.categoriasPeriodo(), color: 'naranja' };
    }
    if (tiene('mejor', 'trabajador', 'calific', 'estrella', 'nota')) {
      if (!this.sesion.permiso('usuarios')) return this.sinPermiso('usuarios');
      const mejores = [...d.usuarios]
        .filter((u: any) => u.id_rol === 5 && Number(u.total_calificaciones) > 0)
        .sort((a: any, b: any) => Number(b.promedio_calificacion) - Number(a.promedio_calificacion) || b.total_calificaciones - a.total_calificaciones)
        .slice(0, 5);
      if (!mejores.length) return { texto: 'Todavía no hay trabajadores con calificaciones.' };
      return {
        texto: `Los trabajadores mejor calificados son ${mejores
          .slice(0, 3)
          .map((u: any) => f.nombreCompleto(u))
          .join(', ')}.`,
        barras: mejores.map((u: any) => ({ etiqueta: f.nombreCompleto(u), valor: Number(u.promedio_calificacion) })),
        color: 'verde',
        formato: (v) => `${f.decimal(v)} ★`
      };
    }
    if (tiene('report', 'denuncia', 'moderac', 'queja')) {
      if (!this.sesion.permiso('reportes')) return this.sinPermiso('reportes');
      const abiertos = d.reportes.filter((r: any) => ['pendiente', 'en_revision'].includes(r.estado_reporte));
      return {
        texto: abiertos.length
          ? `Hay ${abiertos.length} reporte${abiertos.length === 1 ? '' : 's'} abierto${abiertos.length === 1 ? '' : 's'}. Por motivo:`
          : 'No hay reportes abiertos. Todos los reportes están resueltos o rechazados.',
        barras: f.contarPor(abiertos, (r) => f.textoEstado(r.motivo)),
        color: 'rojo'
      };
    }
    if (tiene('ciudad', 'donde', 'lugar', 'zona')) {
      if (!this.sesion.permiso('trabajos')) return this.sinPermiso('trabajos');
      const barras = f.contarPor(actual.trabajos, (t) => this.ciudadesPorId().get(t.id_ciudad)?.nombre ?? 'Sin ciudad').slice(0, 6);
      if (!barras.length) return { texto: `No se publicaron trabajos ${frase}.` };
      return { texto: `Ciudades con más trabajos publicados ${frase}:`, barras, color: 'azul' };
    }
    if (tiene('oferta', 'acept', 'presupuesto')) {
      if (!this.sesion.permiso('ofertas')) return this.sinPermiso('ofertas');
      const total = actual.ofertas.length;
      const aceptadas = actual.ofertas.filter((o: any) => o.estado_oferta === 'aceptada').length;
      const pendientes = actual.ofertas.filter((o: any) => o.estado_oferta === 'pendiente').length;
      return {
        texto: total
          ? `${Frase} llegaron ${total} ofertas: se aceptó el ${f.porcentaje(aceptadas, total)} y ${pendientes} siguen esperando respuesta del cliente.`
          : `No llegaron ofertas ${frase}.`,
        cifras: [
          { etiqueta: 'Ofertas', valor: f.numero(total) },
          { etiqueta: 'Aceptadas', valor: f.numero(aceptadas) },
          { etiqueta: 'Pendientes', valor: f.numero(pendientes) }
        ]
      };
    }
    if (tiene('usuario', 'registr', 'empleador', 'empleado', 'rol', 'persona')) {
      if (!this.sesion.permiso('usuarios')) return this.sinPermiso('usuarios');
      return {
        texto: `InWork tiene ${d.usuarios.length} usuarios activos. ${Frase} se registraron ${actual.usuarios.length}.`,
        barras: f.contarPor(d.usuarios, (u) => u.rol),
        color: 'morado'
      };
    }
    if (tiene('resumen', 'informe', 'periodo', 'como va', 'general', 'hola')) {
      return { texto: this.narrativa(), cifras: this.cifras().slice(0, 3).map((c) => ({ etiqueta: c.etiqueta, valor: c.valor })) };
    }
    return { texto: 'No encontré eso en los datos. Puedo responder sobre comisiones y pagos, categorías, mejores trabajadores, reportes, ciudades, ofertas y usuarios.' };
  }

  protected preguntar(texto: string): void {
    const limpio = texto.trim();
    if (!limpio || this.cargando()) return;
    this.mensajes.update((lista) => [...lista, { propio: true, texto: limpio, hora: this.horaActual() }, { propio: false, hora: this.horaActual(), ...this.responder(limpio) }]);
    this.pregunta = '';
    setTimeout(() => {
      const zona = this.zonaMensajes()?.nativeElement;
      zona?.scrollTo({ top: zona.scrollHeight, behavior: 'smooth' });
    });
  }

  protected imprimir(): void {
    window.print();
  }

  // ---------- Descargas ----------
  protected exportar(): void {
    const filas = [
      ...this.cifras().map((c) => ({ seccion: 'Cifras clave', concepto: c.etiqueta, valor: c.valor, detalle: c.variacion })),
      ...this.porCategoria().map((r: any) => ({
        seccion: 'Categorías',
        concepto: r.categoria,
        valor: `${r.trabajos} trabajos · ${r.ofertas} ofertas · ${r.contrataciones} contrataciones`,
        detalle: f.moneda(r.valor)
      })),
      ...this.hallazgos().map((x) => ({ seccion: 'Hallazgos', concepto: x.texto, valor: '', detalle: '' }))
    ];
    f.descargarCSV(
      `informe-inwork-${this.elegido().clave}.csv`,
      [
        { titulo: 'Sección', valor: (x) => x.seccion },
        { titulo: 'Concepto', valor: (x) => x.concepto },
        { titulo: 'Valor', valor: (x) => x.valor },
        { titulo: 'Detalle', valor: (x) => x.detalle }
      ],
      filas
    );
  }
}
