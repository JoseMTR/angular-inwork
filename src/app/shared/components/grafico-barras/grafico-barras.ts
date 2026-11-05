import { Component, computed, input } from '@angular/core';
import { Barra } from '../../interfaces/grafico';

// barras = [{ etiqueta, valor }]
@Component({
  selector: 'app-grafico-barras',
  templateUrl: './grafico-barras.html',
  styleUrl: './grafico-barras.css'
})
export class GraficoBarras {
  readonly barras = input<Barra[]>([]);
  readonly color = input('naranja');
  readonly horizontal = input(false);
  readonly alto = input(220);
  readonly formato = input<(valor: number) => string | number>((v) => v);

  readonly maximo = computed(() => Math.max(1, ...this.barras().map((b) => Number(b.valor) || 0)));

  porcentaje(barra: Barra): number {
    return ((Number(barra.valor) || 0) / this.maximo()) * 100;
  }
}
