// Marco del panel: menú lateral + barra superior + contenido + pie.
// La sesión y los permisos los revisan los guards (core/guards/auth-guard.ts) antes de entrar.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ApiService } from '../../core/services/api';
import { SesionService } from '../../core/services/sesion';
import { construirMenu } from '../../shared/utils/menu';
import { Footer } from '../footer/footer';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar, Topbar, Footer],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SesionService);

  protected readonly menuAbierto = signal(false);
  protected readonly insignias = signal<Record<string, number>>({});
  protected readonly noLeidas = signal(0);

  // El menú sale SOLO de los módulos del rol en la tabla rol_modulo
  protected readonly grupos = computed(() => construirMenu(this.sesion.modulos()));

  ngOnInit(): void {
    this.cargarContadores();
  }

  private async cargarContadores(): Promise<void> {
    const nuevas: Record<string, number> = {};
    try {
      if (this.sesion.permiso('verificaciones')) {
        const lista = await this.api.get('/verificaciones-identidad/');
        nuevas['verificaciones'] = lista.filter((v: any) => v.estado_verificacion === 'pendiente').length;
      }
      if (this.sesion.permiso('reportes')) {
        const lista = await this.api.get('/reportes/');
        nuevas['reportes'] = lista.filter((r: any) => r.estado_reporte === 'pendiente').length;
      }
      if (this.sesion.permiso('notificaciones')) {
        const lista = await this.api.get('/notificaciones/');
        this.noLeidas.set(lista.filter((n: any) => n.id_usuario === this.sesion.sesion()?.id_usuario && !n.leida).length);
      }
    } catch {
      // Los contadores son solo de ayuda; si fallan no pasa nada
    }
    this.insignias.set(nuevas);
  }

  protected salir(): void {
    this.sesion.cerrar();
    this.router.navigateByUrl('/');
  }
}
