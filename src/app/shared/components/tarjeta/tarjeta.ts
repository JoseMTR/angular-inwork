import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  imports: [],
  templateUrl: './tarjeta.html',
  styleUrl: './tarjeta.css'
})
export class Tarjeta {
  @Input({ required: true }) titulo = '';
  @Input() subtitulo = '';
}
