import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css'
})
export class Cargando {
  readonly texto = input('Cargando información');
  readonly ayuda = input(true);
}
