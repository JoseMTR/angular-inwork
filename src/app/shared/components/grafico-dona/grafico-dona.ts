import { Component, computed, input } from '@angular/core';
import { Segmento } from '../../interfaces/grafico';

// segmentos = [{ nombre, valor, color }]
@Component({
  selector: 'app-grafico-dona',
  templateUrl: './grafico-dona.html',
  styleUrl: './grafico-dona.css'
})
export class GraficoDona {
  readonly segmentos = input<Segmento[]>([]);
  readonly textoCentral = input('');

  readonly total = computed(() => this.segmentos().reduce((suma, s) => suma + (Number(s.valor) || 0), 0));

  readonly fondo = computed(() => {
    const total = this.total();
    if (!total) return 'rgba(24, 32, 47, 0.08)';
    let inicio = 0;
    const partes = this.segmentos().map((s) => {
      const fin = inicio + ((Number(s.valor) || 0) / total) * 100;
      const parte = `${s.color} ${inicio}% ${fin}%`;
      inicio = fin;
      return parte;
    });
    return `conic-gradient(${partes.join(', ')})`;
  });

  porcentaje(segmento: Segmento | undefined): number {
    const total = this.total();
    return segmento && total ? Math.round(((Number(segmento.valor) || 0) / total) * 100) : 0;
  }
}
