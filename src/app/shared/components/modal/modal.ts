import { Component, HostListener, input, model } from '@angular/core';

// Ventana para formularios. Se abre con [(abierto)].
// Los botones de abajo se ponen con <ng-container ngProjectAs="[pie]">.
@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  readonly abierto = model(false);
  readonly titulo = input('');
  readonly subtitulo = input('');
  readonly ancho = input('560px');

  cerrar(): void {
    this.abierto.set(false);
  }

  clicFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) this.cerrar();
  }

  @HostListener('window:keydown.escape')
  tecla(): void {
    if (this.abierto()) this.cerrar();
  }
}
