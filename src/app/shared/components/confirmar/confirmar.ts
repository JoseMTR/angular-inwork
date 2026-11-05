import { Component, inject, input, model, signal } from '@angular/core';
import { AvisosService } from '../../../core/services/avisos';
import { Modal } from '../modal/modal';

// Ventana para confirmar una acción peligrosa (eliminar, desactivar...)
@Component({
  selector: 'app-confirmar',
  imports: [Modal],
  templateUrl: './confirmar.html',
  styleUrl: './confirmar.css'
})
export class Confirmar {
  private readonly avisos = inject(AvisosService);

  readonly abierto = model(false);
  readonly titulo = input('¿Estás seguro?');
  readonly texto = input('');
  readonly textoBoton = input('Confirmar');
  readonly peligro = input(true);
  readonly alConfirmar = input<() => Promise<unknown> | unknown>(async () => {});

  protected readonly trabajando = signal(false);

  async confirmar(): Promise<void> {
    this.trabajando.set(true);
    try {
      await this.alConfirmar()();
      this.abierto.set(false);
    } catch (error: any) {
      this.avisos.avisar(error?.message ?? 'No se pudo completar la acción', 'error');
    } finally {
      this.trabajando.set(false);
    }
  }
}
