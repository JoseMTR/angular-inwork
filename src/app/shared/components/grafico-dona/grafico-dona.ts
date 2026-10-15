import { Component, Input } from '@angular/core';
import { Segmento } from '../../interfaces/grafico';

@Component({
  selector: 'app-grafico-dona',
  imports: [],
  templateUrl: './grafico-dona.html',
  styleUrl: './grafico-dona.css'
})
export class GraficoDona {
  @Input() segmentos: Segmento[] = [];
  @Input() textoCentral = '';

  get total(): number {
    return this.segmentos.reduce((suma, segmento) => suma + segmento.valor, 0);
  }

  porcentaje(segmento: Segmento): number {
    return Math.round((segmento.valor / this.total) * 100);
  }

  get fondo(): string {
    let inicio = 0;
    const partes = this.segmentos.map((segmento) => {
      const fin = inicio + (segmento.valor / this.total) * 100;
      const parte = `${segmento.color} ${inicio}% ${fin}%`;
      inicio = fin;
      return parte;
    });
    return `conic-gradient(${partes.join(', ')})`;
  }
}
