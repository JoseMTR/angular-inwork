import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  rangos: string[] = ['Hoy', '7 días', '30 días', '1 año'];
  rangoActivo = '30 días';
}
