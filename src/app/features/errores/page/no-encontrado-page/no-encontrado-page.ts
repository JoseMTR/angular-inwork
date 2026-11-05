import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionService } from '../../../../core/services/sesion';

// Página que se muestra cuando la dirección no existe (404)
@Component({
  selector: 'app-no-encontrado-page',
  imports: [RouterLink],
  templateUrl: './no-encontrado-page.html',
  styleUrl: './no-encontrado-page.css'
})
export class NoEncontradoPage {
  protected readonly sesion = inject(SesionService);
}
