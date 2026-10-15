import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-sin-permiso-page',
  imports: [RouterLink, EmptyState],
  templateUrl: './sin-permiso-page.html',
  styleUrl: './sin-permiso-page.css'
})
export class SinPermisoPage {}
