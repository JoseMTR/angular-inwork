import { Component, inject } from '@angular/core';
import { AvisosService } from '../../../core/services/avisos';

// Mensajes cortos abajo a la derecha (guardado, error...)
@Component({
  selector: 'app-avisos',
  templateUrl: './avisos.html',
  styleUrl: './avisos.css'
})
export class Avisos {
  protected readonly avisos = inject(AvisosService);
  protected readonly iconos: Record<string, string> = { exito: 'check_circle', error: 'error', info: 'info' };
}
