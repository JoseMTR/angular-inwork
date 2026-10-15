import { Component, Input } from '@angular/core';

interface Punto {
  x: number;
  y: number;
}

@Component({
  selector: 'app-grafico-area',
  imports: [],
  templateUrl: './grafico-area.html',
  styleUrl: './grafico-area.css'
})
export class GraficoArea {
  @Input() valores: number[] = [];
  @Input() etiquetas: string[] = [];

  ancho = 600;
  alto = 220;

  get puntos(): Punto[] {
    const maximo = Math.max(...this.valores);
    const minimo = Math.min(...this.valores) * 0.85;
    const paso = this.ancho / (this.valores.length - 1);
    return this.valores.map((valor, indice) => ({
      x: indice * paso,
      y: this.alto - 16 - ((valor - minimo) / (maximo - minimo)) * (this.alto - 40)
    }));
  }

  get linea(): string {
    const puntos = this.puntos;
    let ruta = `M ${puntos[0].x} ${puntos[0].y}`;
    for (let i = 1; i < puntos.length; i++) {
      const anterior = puntos[i - 1];
      const actual = puntos[i];
      const medio = (anterior.x + actual.x) / 2;
      ruta += ` C ${medio} ${anterior.y}, ${medio} ${actual.y}, ${actual.x} ${actual.y}`;
    }
    return ruta;
  }

  get area(): string {
    return `${this.linea} L ${this.ancho} ${this.alto} L 0 ${this.alto} Z`;
  }
}
