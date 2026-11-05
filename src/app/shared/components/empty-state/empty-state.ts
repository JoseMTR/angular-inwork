import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyState {
  readonly icono = input('inbox');
  readonly titulo = input('');
  readonly texto = input('');
}
