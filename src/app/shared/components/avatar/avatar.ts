import { Component, Input } from '@angular/core';
import { InicialesPipe } from '../../pipes/iniciales-pipe';

@Component({
  selector: 'app-avatar',
  imports: [InicialesPipe],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css'
})
export class Avatar {
  @Input({ required: true }) nombre = '';
  @Input() tamano = 'normal';

  tono(): string {
    const tonos = ['naranja', 'azul', 'verde', 'morado', 'ambar'];
    let suma = 0;
    for (const letra of this.nombre) {
      suma += letra.charCodeAt(0);
    }
    return tonos[suma % tonos.length];
  }
}
