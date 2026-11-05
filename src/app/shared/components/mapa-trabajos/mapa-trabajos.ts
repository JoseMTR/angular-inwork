// Mapa real (Leaflet + OpenStreetMap) con la latitud y longitud de cada trabajo.
// Leaflet se carga en index.html.
import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, untracked, viewChild } from '@angular/core';
import { escapar, moneda, textoEstado } from '../../utils/formato';

declare const L: any;

@Component({
  selector: 'app-mapa-trabajos',
  templateUrl: './mapa-trabajos.html',
  styleUrl: './mapa-trabajos.css'
})
export class MapaTrabajos implements AfterViewInit, OnDestroy {
  readonly trabajos = input<any[]>([]);
  readonly seleccionado = input<any>(null);
  readonly alSeleccionar = input<(trabajo: any) => void>(() => {});
  readonly nombreCategoria = input<(id: number) => string>(() => '');

  readonly colores: Record<string, string> = { publicado: '#f2541b', asignado: '#7a5af0', finalizado: '#12a067', cancelado: '#8b92a1' };

  private readonly contenedor = viewChild.required<ElementRef<HTMLDivElement>>('lienzo');
  private mapa: any = null;
  private capa: any = null;
  private marcadores = new Map<number, { marcador: any; trabajo: any }>();

  constructor() {
    // Dibuja los puntos cada vez que cambian los trabajos
    effect(() => {
      const lista = this.trabajos();
      untracked(() => this.dibujar(lista));
    });
    // Resalta y centra el trabajo elegido en la tabla
    effect(() => {
      const elegido = this.seleccionado();
      untracked(() => this.resaltar(elegido));
    });
  }

  ngAfterViewInit(): void {
    if (typeof L === 'undefined') return;
    this.mapa = L.map(this.contenedor().nativeElement, { scrollWheelZoom: false }).setView([10.98, -74.8], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.mapa);
    this.capa = L.layerGroup().addTo(this.mapa);
    this.dibujar(this.trabajos());
    this.resaltar(this.seleccionado());
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
    this.mapa = null;
  }

  private icono(trabajo: any, elegido: boolean): any {
    const color = this.colores[trabajo.estado_trabajo] ?? '#f2541b';
    const tam = elegido ? 44 : 32;
    return L.divIcon({
      className: 'pin-mapa',
      html: `<span class="material-symbols-rounded" style="font-size:${tam}px;color:${color};font-variation-settings:'FILL' 1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25))">location_on</span>`,
      iconSize: [tam, tam],
      iconAnchor: [tam / 2, tam]
    });
  }

  private dibujar(trabajos: any[]): void {
    if (!this.mapa || !this.capa) return;
    const lista = trabajos.filter((t) => t.latitud && t.longitud);
    this.capa.clearLayers();
    this.marcadores = new Map();
    for (const t of lista) {
      const marcador = L.marker([Number(t.latitud), Number(t.longitud)], { icon: this.icono(t, false) })
        .bindPopup(
          `<strong>${escapar(t.titulo)}</strong><br><span style="color:#8b92a1">${escapar(this.nombreCategoria()(t.id_categoria))}, ${moneda(t.presupuesto)}</span><br>${escapar(textoEstado(t.estado_trabajo))}`
        )
        .on('click', () => this.alSeleccionar()(t));
      marcador.addTo(this.capa);
      this.marcadores.set(t.id_trabajo, { marcador, trabajo: t });
    }
    if (lista.length > 0) {
      this.mapa.fitBounds(L.latLngBounds(lista.map((t) => [Number(t.latitud), Number(t.longitud)])), { padding: [30, 30], maxZoom: 13 });
    }
  }

  private resaltar(elegido: any): void {
    if (!this.mapa) return;
    for (const [id, { marcador, trabajo }] of this.marcadores) {
      marcador.setIcon(this.icono(trabajo, elegido?.id_trabajo === id));
    }
    const actual = elegido && this.marcadores.get(elegido.id_trabajo);
    if (actual) {
      this.mapa.setView(actual.marcador.getLatLng(), Math.max(this.mapa.getZoom(), 13), { animate: true });
      actual.marcador.openPopup();
    }
  }
}
