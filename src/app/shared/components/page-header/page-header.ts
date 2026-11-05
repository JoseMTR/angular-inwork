import { Component, input } from '@angular/core';

// Título de cada página con las migas de pan. Los botones se ponen como contenido.
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.css'
})
export class PageHeader {
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
  readonly grupo = input('');
}
