import { Component, input } from '@angular/core';
import { iniciales, tonoAvatar } from '../../utils/formato';

// tamano: 'chico', 'normal' o 'grande'
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.css'
})
export class Avatar {
  readonly nombre = input('');
  readonly tamano = input('normal');

  tono(): string {
    return tonoAvatar(this.nombre());
  }

  letras(): string {
    return iniciales(this.nombre());
  }
}
