// Para abrir una página con un registro ya elegido sin poner el id en la URL.
// Ejemplo: desde un reporte se abre el chat de ese trabajo.
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EnfoqueService {
  private actual: any = null;

  pedir(valor: any): void {
    this.actual = valor;
  }

  // Devuelve lo que se pidió para ese módulo y lo borra
  tomar(modulo: string): any {
    if (this.actual?.modulo === modulo) {
      const valor = this.actual;
      this.actual = null;
      return valor;
    }
    return null;
  }
}
