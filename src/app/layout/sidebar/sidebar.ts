import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SesionService } from '../../core/services/sesion';
import { MenuGrupo } from '../../shared/interfaces/menu-item';
import { Avatar } from '../../shared/components/avatar/avatar';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Avatar],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  sesionService = inject(SesionService);

  grupos: MenuGrupo[] = [
    {
      titulo: 'General',
      color: 'var(--naranja)',
      items: [
        { texto: 'Dashboard', icono: 'space_dashboard', ruta: '/admin/dashboard' },
        { texto: 'IA', icono: 'auto_awesome', ruta: '/admin/ia', insignia: 'Nuevo' },
        { texto: 'Informes automáticos', icono: 'summarize', ruta: '/admin/informes' }
      ]
    },
    {
      titulo: 'Personas',
      color: 'var(--azul)',
      items: [
        { texto: 'Usuarios', icono: 'group', ruta: '/admin/usuarios' },
        { texto: 'Verificación de identidad', icono: 'badge', ruta: '/admin/verificacion', insignia: '8' },
        { texto: 'Calificaciones', icono: 'star_rate', ruta: '/admin/calificaciones' }
      ]
    },
    {
      titulo: 'Marketplace',
      color: 'var(--verde)',
      items: [
        { texto: 'Trabajos', icono: 'work', ruta: '/admin/trabajos' },
        { texto: 'Ofertas', icono: 'local_offer', ruta: '/admin/ofertas' },
        { texto: 'Contrataciones', icono: 'handshake', ruta: '/admin/contrataciones' },
        { texto: 'Mapa de trabajos', icono: 'map', ruta: '/admin/mapa' }
      ]
    },
    {
      titulo: 'Finanzas',
      color: 'var(--morado)',
      items: [
        { texto: 'Pagos', icono: 'payments', ruta: '/admin/pagos' }
      ]
    },
    {
      titulo: 'Moderación',
      color: '#b8560f',
      items: [
        { texto: 'Reportes', icono: 'flag', ruta: '/admin/reportes', insignia: '12' },
        { texto: 'Chats y mensajes', icono: 'forum', ruta: '/admin/chats' }
      ]
    },
    {
      titulo: 'Sistema',
      color: '#475569',
      items: [
        { texto: 'Roles y permisos', icono: 'admin_panel_settings', ruta: '/admin/roles' },
        { texto: 'Auditoría', icono: 'history', ruta: '/admin/auditoria' },
        { texto: 'Perfil', icono: 'account_circle', ruta: '/admin/perfil' }
      ]
    }
  ];
}
