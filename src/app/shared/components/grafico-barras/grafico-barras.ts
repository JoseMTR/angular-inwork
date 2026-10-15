import { Component, Input } from '@angular/core';
import { Barra } from '../../interfaces/grafico';

@Component({
  selector: 'app-grafico-barras',
  imports: [],
  templateUrl: './grafico-barras.html',
  styleUrl: './grafico-barras.css'
})
export class GraficoBarras {
  @Input() barras: Barra[] = [];
  @Input() color = 'naranja';
  @Input() horizontal = false;
  @Input() alto = 220;

  get maximo(): number {
    return Math.max(...this.barras.map((barra) => barra.valor));
  }

  porcentaje(barra: Barra): number {
    return (barra.valor / this.maximo) * 100;
  }
}
