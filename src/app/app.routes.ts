// Rutas del panel. Cada ruta coincide con la columna "ruta" de la tabla modulos de la base de datos
// (por eso el menú, que sale de rol_modulo, lleva directo a cada página).
import { Routes } from '@angular/router';
import { authGuard, permisoGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Iniciar sesión | InWork',
    loadComponent: () => import('./features/login/page/login-page/login-page').then((m) => m.LoginPage)
  },
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: 'inicio',
        title: 'Inicio | InWork',
        loadComponent: () => import('./features/dashboard/page/dashboard-page/dashboard-page').then((m) => m.DashboardPage)
      },
      {
        // Chat en tiempo real (WebSocket) entre Administrador, Moderador y Analista.
        // No va en la tabla modulos: es de todo el equipo del panel, como Inicio y Mi perfil.
        path: 'chat-equipo',
        title: 'Chat del equipo | InWork',
        loadComponent: () => import('./features/chat-equipo/page/chat-equipo-page/chat-equipo-page').then((m) => m.ChatEquipoPage)
      },
      {
        path: 'usuarios',
        title: 'Usuarios | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/usuarios/page/usuarios-page/usuarios-page').then((m) => m.UsuariosPage)
      },
      {
        path: 'verificaciones',
        title: 'Verificación de identidad | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/verificacion/page/verificacion-page/verificacion-page').then((m) => m.VerificacionPage)
      },
      {
        path: 'calificaciones',
        title: 'Calificaciones | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/calificaciones/page/calificaciones-page/calificaciones-page').then((m) => m.CalificacionesPage)
      },
      {
        path: 'trabajos',
        title: 'Trabajos | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/trabajos/page/trabajos-page/trabajos-page').then((m) => m.TrabajosPage)
      },
      {
        path: 'ofertas',
        title: 'Ofertas | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/ofertas/page/ofertas-page/ofertas-page').then((m) => m.OfertasPage)
      },
      {
        path: 'contrataciones',
        title: 'Contrataciones | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/contrataciones/page/contrataciones-page/contrataciones-page').then((m) => m.ContratacionesPage)
      },
      {
        path: 'pagos',
        title: 'Pagos | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/pagos/page/pagos-page/pagos-page').then((m) => m.PagosPage)
      },
      {
        path: 'reportes',
        title: 'Reportes | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/reportes/page/reportes-page/reportes-page').then((m) => m.ReportesPage)
      },
      {
        path: 'chat',
        title: 'Chats y mensajes | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/chats/page/chats-page/chats-page').then((m) => m.ChatsPage)
      },
      {
        path: 'notificaciones',
        title: 'Notificaciones | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/notificaciones/page/notificaciones-page/notificaciones-page').then((m) => m.NotificacionesPage)
      },
      {
        path: 'adjuntos',
        title: 'Archivos adjuntos | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/adjuntos/page/adjuntos-page/adjuntos-page').then((m) => m.AdjuntosPage)
      },
      {
        path: 'ubicacion',
        title: 'Países y ciudades | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/ubicacion/page/ubicacion-page/ubicacion-page').then((m) => m.UbicacionPage)
      },
      {
        path: 'categorias',
        title: 'Categorías y habilidades | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/categorias/page/categorias-page/categorias-page').then((m) => m.CategoriasPage)
      },
      {
        path: 'roles',
        title: 'Roles y permisos | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/roles/page/roles-page/roles-page').then((m) => m.RolesPage)
      },
      {
        path: 'seguridad',
        title: 'Seguridad | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/seguridad/page/seguridad-page/seguridad-page').then((m) => m.SeguridadPage)
      },
      {
        path: 'auditoria',
        title: 'Auditoría | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/auditoria/page/auditoria-page/auditoria-page').then((m) => m.AuditoriaPage)
      },
      {
        path: 'informes',
        title: 'Informes | InWork',
        canActivate: [permisoGuard],
        loadComponent: () => import('./features/informes/page/informes-page/informes-page').then((m) => m.InformesPage)
      },
      {
        path: 'perfil',
        title: 'Mi perfil | InWork',
        loadComponent: () => import('./features/perfil/page/perfil-page/perfil-page').then((m) => m.PerfilPage)
      },
      {
        path: 'sin-permiso',
        title: 'Sin permiso | InWork',
        loadComponent: () => import('./features/errores/page/sin-permiso-page/sin-permiso-page').then((m) => m.SinPermisoPage)
      }
    ]
  },
  {
    path: '**',
    title: 'Página no encontrada | InWork',
    loadComponent: () => import('./features/errores/page/no-encontrado-page/no-encontrado-page').then((m) => m.NoEncontradoPage)
  }
];
