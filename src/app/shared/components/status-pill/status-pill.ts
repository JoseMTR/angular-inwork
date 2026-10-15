import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-pill',
  imports: [],
  templateUrl: './status-pill.html',
  styleUrl: './status-pill.css'
})
export class StatusPill {
  @Input({ required: true }) estado = '';

  tono(): string {
    switch (this.estado) {
      case 'activo':
      case 'activa':
      case 'aceptada':
      case 'aprobada':
      case 'finalizado':
      case 'finalizada':
      case 'liberado':
      case 'resuelto':
      case 'generado':
      case 'verificado':
        return 'verde';
      case 'publicado':
      case 'en_revision':
      case 'programado':
      case 'INSERT':
        return 'azul';
      case 'asignado':
      case 'retenido':
      case 'generando':
      case 'UPDATE':
        return 'morado';
      case 'pendiente':
        return 'ambar';
      case 'cancelado':
      case 'cancelada':
      case 'rechazada':
      case 'rechazado':
      case 'fallido':
      case 'suspendido':
      case 'DELETE':
        return 'rojo';
      default:
        return 'gris';
    }
  }

  texto(): string {
    if (this.estado === this.estado.toUpperCase()) {
      return this.estado;
    }
    if (this.estado === 'en_revision') {
      return 'En revisión';
    }
    const limpio = this.estado.replace('_', ' ');
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  }
}
