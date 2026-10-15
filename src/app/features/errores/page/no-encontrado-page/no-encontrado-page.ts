import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-no-encontrado-page',
  imports: [RouterLink, EmptyState],
  templateUrl: './no-encontrado-page.html',
  styleUrl: './no-encontrado-page.css'
})
export class NoEncontradoPage {}
