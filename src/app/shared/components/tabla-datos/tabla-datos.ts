// Tabla con la librería DataTables (buscar, ordenar y paginar). La librería se carga en index.html.
//
// columnas: [{ titulo, valor: (fila) => texto para ordenar/buscar, html: (fila) => HTML de la celda, clase, ordenable }]
// acciones: [{ texto, icono, tono, soloIcono, mostrar: (fila) => bool, alHacer: (fila) => {} }]
// alSeleccionar(fila): clic en una fila
// alClicElemento(fila, valor): clic en un elemento con data-clic="valor" dentro de una celda (ej: interruptores)
// clave: campo interno para saber qué fila está elegida (nunca se muestra en pantalla)
import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { escapar } from '../../utils/formato';
import { AccionTabla, Columna } from '../../interfaces/tabla';

declare const DataTable: any;

@Component({
  selector: 'app-tabla-datos',
  template: `
    <div class="tabla-datos">
      <table #tabla class="tabla display" style="width: 100%"></table>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }
  `
})
export class TablaDatos implements AfterViewInit, OnDestroy {
  readonly datos = input<any[]>([]);
  readonly columnas = input<Columna[]>([]);
  readonly acciones = input<AccionTabla[]>([]);
  readonly alSeleccionar = input<((fila: any) => void) | null>(null);
  readonly alClicElemento = input<((fila: any, valor: string) => void) | null>(null);
  readonly seleccionado = input<any>(null);
  readonly clave = input<string | null>(null);
  readonly porPagina = input(8);
  readonly orden = input<any[]>([]);
  readonly vacio = input('No hay registros para mostrar');

  private readonly elemento = viewChild.required<ElementRef<HTMLTableElement>>('tabla');
  private tabla: any = null;
  private readonly clic = (evento: Event) => this.alHacerClic(evento);

  constructor() {
    // Si llegan datos nuevos se recargan las filas (sin perder la página ni la búsqueda)
    effect(() => {
      const lista = this.datos() ?? [];
      if (!this.tabla) return;
      this.tabla.clear();
      this.tabla.rows.add(lista);
      this.tabla.draw(false);
    });

    // Si cambia la fila elegida se vuelve a marcar
    effect(() => {
      this.seleccionado();
      if (!this.tabla) return;
      const tabla = this.tabla;
      tabla.rows({ page: 'current' }).every((indice: number) => {
        const fila = tabla.row(indice);
        fila.node()?.classList.toggle('seleccionada', this.esElegida(fila.data()));
      });
    });
  }

  ngAfterViewInit(): void {
    if (typeof DataTable === 'undefined') {
      console.error('No se cargó la librería DataTables (revisa index.html)');
      return;
    }
    const columns: any[] = this.columnas().map((c) => ({
      title: c.titulo,
      data: null,
      className: c.clase ?? '',
      orderable: c.ordenable !== false,
      searchable: c.buscable !== false,
      render: (_: unknown, tipo: string, fila: any) => {
        if (tipo === 'display') return c.html ? c.html(fila) : escapar(c.valor?.(fila) ?? '');
        return c.valor?.(fila) ?? '';
      }
    }));
    if (this.acciones().length > 0) {
      columns.push({
        title: 'Acciones',
        data: null,
        orderable: false,
        searchable: false,
        className: 'col-acciones',
        render: (_: unknown, tipo: string, fila: any) => (tipo === 'display' ? this.htmlAcciones(fila) : '')
      });
    }

    const elemento = this.elemento().nativeElement;
    this.tabla = new DataTable(elemento, {
      data: this.datos() ?? [],
      columns,
      pageLength: this.porPagina(),
      lengthMenu: [5, 8, 10, 25, 50],
      order: this.orden(),
      orderClasses: false,
      autoWidth: false,
      language: this.idioma(),
      createdRow: (tr: HTMLElement) => {
        if (this.alSeleccionar()) tr.classList.add('clicable');
      },
      rowCallback: (tr: HTMLElement, fila: any) => {
        tr.classList.toggle('seleccionada', this.esElegida(fila));
      }
    });
    elemento.addEventListener('click', this.clic);
  }

  ngOnDestroy(): void {
    this.elemento().nativeElement.removeEventListener('click', this.clic);
    this.tabla?.destroy();
    this.tabla = null;
  }

  private idioma() {
    return {
      processing: 'Procesando...',
      search: '',
      searchPlaceholder: 'Buscar en la tabla',
      lengthMenu: 'Mostrar _MENU_',
      info: 'Mostrando _START_ a _END_ de _TOTAL_',
      infoEmpty: 'Sin registros',
      infoFiltered: '(filtrado de _MAX_)',
      zeroRecords: 'No se encontraron resultados',
      emptyTable: this.vacio(),
      loadingRecords: 'Cargando...',
      paginate: { first: '«', previous: '‹', next: '›', last: '»' },
      aria: { orderable: 'Ordenar por esta columna', orderableReverse: 'Ordenar al revés' }
    };
  }

  private esElegida(fila: any): boolean {
    const elegido = this.seleccionado();
    const clave = this.clave();
    return !!(elegido && clave && fila && fila[clave] === elegido[clave]);
  }

  private htmlAcciones(fila: any): string {
    return this.acciones()
      .map((accion, i) => ({ accion, i }))
      .filter(({ accion }) => !accion.mostrar || accion.mostrar(fila))
      .map(
        ({ accion, i }) =>
          `<button type="button" class="boton boton-${accion.tono ?? 'claro'} boton-pequeno${accion.soloIcono ? ' boton-cuadrado' : ''}" data-accion="${i}" title="${escapar(accion.texto)}" aria-label="${escapar(accion.texto)}">` +
          `<span class="material-symbols-rounded">${accion.icono}</span>${accion.soloIcono ? '' : escapar(accion.texto)}</button>`
      )
      .join('');
  }

  private alHacerClic(evento: Event): void {
    if (!this.tabla) return;
    const objetivo = evento.target as HTMLElement;
    const tr = objetivo.closest('tbody tr');
    if (!tr) return;
    const fila = this.tabla.row(tr).data();
    if (!fila) return;
    const boton = objetivo.closest('button[data-accion]') as HTMLElement | null;
    if (boton) {
      this.acciones()[Number(boton.dataset['accion'])]?.alHacer(fila);
      return;
    }
    const marcado = objetivo.closest('[data-clic]') as HTMLElement | null;
    const alClic = this.alClicElemento();
    if (marcado && alClic) {
      alClic(fila, marcado.dataset['clic'] ?? '');
      return;
    }
    if (objetivo.closest('a')) return;
    this.alSeleccionar()?.(fila);
  }
}
