import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Avisos } from './shared/components/avisos/avisos';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Avisos],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
