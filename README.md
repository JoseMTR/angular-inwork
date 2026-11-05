# InWork · Panel de administración (Angular)

Panel web de InWork para los roles **Administrador**, **Moderador** y **Analista**.
Hecho con Angular 21 (componentes standalone y signals) y conectado a las dos APIs en la nube:

| API | URL |
|---|---|
| Principal (FastAPI + PostgreSQL) | https://backend-inwork.onrender.com |
| Pagos y custodia (Express + MySQL) | https://backend-pagos-wauv.onrender.com |

Es la misma aplicación que la versión en Svelte (`inwork-admin-svelte`): mismas páginas, mismos permisos y mismo diseño.

## Cómo ejecutarlo

```bash
npm install
npm start
```

Abre http://localhost:4200. La primera petición puede tardar unos 40 segundos si Render tiene las APIs dormidas.

### Cuentas de prueba (contraseña `Inwork2026*`)

| Rol | Correo |
|---|---|
| Administrador | sebastian.rojas@inwork.com.co |
| Moderador | mariana.castro@inwork.com.co |
| Analista | jorge.pertuz@inwork.com.co |

Los empleadores y empleados (roles 4 y 5) no pueden entrar al panel.

## Cómo funciona

- **Login con JWT**: `POST /auth/login` devuelve el token. Se guarda en `localStorage` (con "Recordarme") o en `sessionStorage`.
- **Interceptor** (`core/interceptors/auth-interceptor.ts`): pone `Authorization: Bearer <token>` en cada petición a las dos APIs. Si la API responde 401 (token vencido o rol cambiado) cierra la sesión.
- **Guards** (`core/guards/auth-guard.ts`): `authGuard` revisa que haya sesión y que el rol sea 1, 2 o 3; `permisoGuard` revisa que el rol tenga permiso de leer el módulo de esa ruta según la tabla `rol_modulo`.
- **Menú desde la base de datos**: sale de `GET /auth/mis-modulos` (tabla `rol_modulo`). Los botones de crear, editar y eliminar también dependen de esa tabla.
- **Sin IDs en pantalla**: las tablas muestran nombres, títulos y fechas; los formularios usan listas desplegables.
- **Tablas**: todas usan la librería DataTables (componente `shared/components/tabla-datos`).

## Estructura

```
src/
  index.html            CDN de Bootstrap, jQuery, DataTables, Leaflet y fuentes
  styles.css            Estilos globales (colores de la propuesta)
  app/
    app.routes.ts       Rutas (coinciden con la columna "ruta" de la tabla modulos)
    core/               config, servicios (api, sesion, avisos, enfoque), guards e interceptor
    layout/             Marco del panel: menú lateral, barra superior y pie
    shared/             Componentes reutilizables, interfaces y utilidades
    features/           Una carpeta por página
```

### Componentes reutilizables

Avatar, Avisos, Cargando, ChatBubble, Confirmar, CrudCatalogo, EmptyState, GraficoArea, GraficoBarras, GraficoDona, MapaTrabajos, Modal, PageHeader, RoleSelector, StatCard, StatusPill, TablaDatos y Tarjeta, más Sidebar, Topbar y Footer en `layout/`.

## Publicarlo en la nube (Render)

`npm run build` genera la carpeta `dist/inwork-admin/browser` con un sitio estático. Render lo publica gratis como **Static Site**.

1. Sube el proyecto a un repositorio de GitHub.
2. En render.com elige **New → Static Site** y conecta el repositorio.
3. Configura:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist/inwork-admin/browser`
4. En **Redirects/Rewrites** agrega una regla:

   | Source | Destination | Action |
   |---|---|---|
   | `/*` | `/index.html` | Rewrite |

   Sin esta regla, al recargar una página como `/usuarios` Render responde 404.

El archivo `.node-version` le dice a Render que use Node 22. Las URLs de las APIs están en `src/app/core/config.ts`.
