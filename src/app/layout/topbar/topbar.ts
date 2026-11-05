import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GrupoMenu } from '../../shared/utils/menu';

// Barra superior: botón de menú (celular), buscador de módulos, campana y acceso a la IA.
@Component({
  selector: 'app-topbar',
  imports: [FormsModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  private readonly router = inject(Router);

  readonly grupos = input<GrupoMenu[]>([]);
  readonly noLeidas = input(0);
  readonly verNotificaciones = input(false);
  readonly verInformes = input(false);
  readonly abrirMenu = output<void>();

  protected readonly busqueda = signal('');
  protected readonly enfocado = signal(false);

  private readonly opciones = computed(() => this.grupos().flatMap((g) => g.items));
  protected readonly coincidencias = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return texto ? this.opciones().filter((o) => o.texto.toLowerCase().includes(texto)).slice(0, 6) : [];
  });

  protected ir(ruta: string): void {
    this.busqueda.set('');
    this.router.navigateByUrl(ruta);
  }

  protected enviar(): void {
    const primera = this.coincidencias()[0];
    if (primera) this.ir(primera.ruta);
  }

  protected salirDelBuscador(): void {
    setTimeout(() => this.enfocado.set(false), 150);
  }
}
