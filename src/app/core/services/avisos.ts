// Mensajes cortos que aparecen abajo a la derecha (guardado, error, etc.)
import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  texto: string;
  tipo: 'exito' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class AvisosService {
  private contador = 0;
  readonly lista = signal<Aviso[]>([]);

  avisar(texto: string, tipo: Aviso['tipo'] = 'exito'): void {
    const id = ++this.contador;
    this.lista.update((lista) => [...lista, { id, texto, tipo }]);
    setTimeout(() => this.quitar(id), tipo === 'error' ? 6500 : 4000);
  }

  quitar(id: number): void {
    this.lista.update((lista) => lista.filter((a) => a.id !== id));
  }
}
