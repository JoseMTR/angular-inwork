import { Component, input } from '@angular/core';

// Caja de vidrio con título. Los botones de arriba a la derecha se ponen con el atributo "acciones".
@Component({
  selector: 'app-tarjeta',
  templateUrl: './tarjeta.html',
  styleUrl: './tarjeta.css'
})
export class Tarjeta {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
  readonly clase = input('');
}
