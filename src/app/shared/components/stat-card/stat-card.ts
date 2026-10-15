import { Component, Input } from '@angular/core';
import { Estadistica } from '../../interfaces/estadistica';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  @Input({ required: true }) dato!: Estadistica;
}
