import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/page/login-page/login-page')
        .then(m => m.LoginPage)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout')
        .then(m => m.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/page/dashboard-page/dashboard-page')
            .then(m => m.DashboardPage)
      },
      {
        path: 'ia',
        loadComponent: () =>
          import('./features/ia/page/ia-page/ia-page')
            .then(m => m.IaPage)
      },
      {
        path: 'informes',
        loadComponent: () =>
          import('./features/informes/page/informes-page/informes-page')
            .then(m => m.InformesPage)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/page/usuarios-page/usuarios-page')
            .then(m => m.UsuariosPage)
      },
      {
        path: 'verificacion',
        loadComponent: () =>
          import('./features/verificacion/page/verificacion-page/verificacion-page')
            .then(m => m.VerificacionPage)
      },
      {
        path: 'calificaciones',
        loadComponent: () =>
          import('./features/calificaciones/page/calificaciones-page/calificaciones-page')
            .then(m => m.CalificacionesPage)
      },
      {
        path: 'trabajos',
        loadComponent: () =>
          import('./features/trabajos/page/trabajos-page/trabajos-page')
            .then(m => m.TrabajosPage)
      },
      {
        path: 'ofertas',
        loadComponent: () =>
          import('./features/ofertas/page/ofertas-page/ofertas-page')
            .then(m => m.OfertasPage)
      },
      {
        path: 'contrataciones',
        loadComponent: () =>
          import('./features/contrataciones/page/contrataciones-page/contrataciones-page')
            .then(m => m.ContratacionesPage)
      },
      {
        path: 'mapa',
        loadComponent: () =>
          import('./features/mapa/page/mapa-page/mapa-page')
            .then(m => m.MapaPage)
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/pagos/page/pagos-page/pagos-page')
            .then(m => m.PagosPage)
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/page/reportes-page/reportes-page')
            .then(m => m.ReportesPage)
      },
      {
        path: 'chats',
        loadComponent: () =>
          import('./features/chats/page/chats-page/chats-page')
            .then(m => m.ChatsPage)
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/page/roles-page/roles-page')
            .then(m => m.RolesPage)
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('./features/auditoria/page/auditoria-page/auditoria-page')
            .then(m => m.AuditoriaPage)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/page/perfil-page/perfil-page')
            .then(m => m.PerfilPage)
      },
      {
        path: 'sin-permiso',
        loadComponent: () =>
          import('./features/errores/page/sin-permiso-page/sin-permiso-page')
            .then(m => m.SinPermisoPage)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errores/page/no-encontrado-page/no-encontrado-page')
        .then(m => m.NoEncontradoPage)
  }
];
