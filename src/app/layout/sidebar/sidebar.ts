import { Component, input, model, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Sesion } from '../../core/services/sesion';
import { Avatar } from '../../shared/components/avatar/avatar';
import { GrupoMenu } from '../../shared/utils/menu';

// Menú lateral. Los grupos y enlaces se arman con los módulos de la tabla rol_modulo.
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Avatar],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  readonly grupos = input<GrupoMenu[]>([]);
  readonly usuario = input<Sesion | null>(null);
  readonly insignias = input<Record<string, number>>({});
  readonly abierto = model(false);
  readonly salir = output<void>();
}
