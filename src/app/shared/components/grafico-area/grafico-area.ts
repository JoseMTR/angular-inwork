import { Component, computed, input } from '@angular/core';

interface Punto {
  x: number;
  y: number;
  valor: number;
}

// Gráfico de línea con área. valores = [3, 5, 2], etiquetas = ['Lun', 'Mar', 'Mié']
@Component({
  selector: 'app-grafico-area',
  templateUrl: './grafico-area.html',
  styleUrl: './grafico-area.css'
})
export class GraficoArea {
  readonly valores = input<number[]>([]);
  readonly etiquetas = input<string[]>([]);
  readonly formato = input<(valor: number) => string | number>((v) => v);

  readonly ancho = 600;
  readonly alto = 220;
  readonly idGradiente = 'area-' + Math.random().toString(36).slice(2, 8);

  readonly puntos = computed<Punto[]>(() => {
    const valores = this.valores();
    if (valores.length === 0) return [];
    const maximo = Math.max(...valores);
    const minimo = Math.min(0, ...valores);
    const rango = maximo - minimo || 1;
    const paso = valores.length > 1 ? this.ancho / (valores.length - 1) : 0;
    return valores.map((valor, i) => ({
      x: valores.length > 1 ? i * paso : this.ancho / 2,
      y: this.alto - 16 - ((valor - minimo) / rango) * (this.alto - 40),
      valor
    }));
  });

  readonly linea = computed(() => {
    const puntos = this.puntos();
    if (puntos.length === 0) return '';
    let ruta = `M ${puntos[0].x} ${puntos[0].y}`;
    for (let i = 1; i < puntos.length; i++) {
      const a = puntos[i - 1];
      const b = puntos[i];
      const medio = (a.x + b.x) / 2;
      ruta += ` C ${medio} ${a.y}, ${medio} ${b.y}, ${b.x} ${b.y}`;
    }
    return ruta;
  });

  readonly area = computed(() => {
    const puntos = this.puntos();
    const linea = this.linea();
    return linea ? `${linea} L ${puntos[puntos.length - 1].x} ${this.alto} L ${puntos[0].x} ${this.alto} Z` : '';
  });

  titulo(i: number, valor: number): string {
    return `${this.etiquetas()[i] ?? ''}: ${this.formato()(valor)}`;
  }
}
