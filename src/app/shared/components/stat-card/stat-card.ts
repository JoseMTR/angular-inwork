import { Component, input } from '@angular/core';
import { Estadistica } from '../../interfaces/estadistica';

// dato = { titulo, valor, icono, color, detalle, variacion?, sube? }
@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  readonly dato = input.required<Estadistica>();
}
