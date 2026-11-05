import { Component, input } from '@angular/core';
import { textoEstado, tonoEstado } from '../../utils/formato';

// estado: el valor que viene de la base de datos (pendiente, activa, resuelto...)
@Component({
  selector: 'app-status-pill',
  templateUrl: './status-pill.html',
  styleUrl: './status-pill.css'
})
export class StatusPill {
  readonly estado = input('');
  readonly texto = input('');

  tono(): string {
    return tonoEstado(this.estado());
  }

  nombre(): string {
    return textoEstado(this.estado());
  }
}
