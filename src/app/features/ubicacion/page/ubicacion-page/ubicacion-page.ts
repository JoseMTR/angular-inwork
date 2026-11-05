// UBICACIÓN: países y ciudades donde funciona InWork.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { SesionService } from '../../../../core/services/sesion';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { CampoCatalogo, CrudCatalogo } from '../../../../shared/components/crud-catalogo/crud-catalogo';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

@Component({
  selector: 'app-ubicacion-page',
  imports: [PageHeader, StatCard, CrudCatalogo, Cargando],
  templateUrl: './ubicacion-page.html',
  styleUrl: './ubicacion-page.css'
})
export class UbicacionPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly sesion = inject(SesionService);

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ paises: [], ciudades: [], usuarios: [], trabajos: [] });

  ngOnInit(): void {
    this.cargar();
  }

  protected readonly cargar = async () => {
    const { datos } = await cargarVarios({
      paises: this.api.get('/paises/'),
      ciudades: this.api.get('/ciudades/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : [],
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
  };

  private readonly paisesPorId = computed(() => f.mapaPor(this.d().paises, 'id_pais'));

  protected readonly ciudadTop = computed(
    () => f.contarPor(this.d().trabajos, (t) => this.d().ciudades.find((c: any) => c.id_ciudad === t.id_ciudad)?.nombre)[0]?.etiqueta ?? '—'
  );

  protected readonly columnasPaises: Columna[] = [
    { titulo: 'País', valor: (p) => p.nombre, html: (p) => `<strong>${f.escapar(p.nombre)}</strong>` },
    { titulo: 'Ciudades', valor: (p) => this.d().ciudades.filter((c: any) => c.id_pais === p.id_pais).length, clase: 'numero' },
    { titulo: 'Creado', valor: (p) => f.ordenFecha(p.created), html: (p) => h.suave(f.fecha(p.created), 'texto-3 fecha') }
  ];

  protected readonly columnasCiudades: Columna[] = [
    { titulo: 'Ciudad', valor: (c) => c.nombre, html: (c) => `<strong>${f.escapar(c.nombre)}</strong>` },
    { titulo: 'País', valor: (c) => this.paisesPorId().get(c.id_pais)?.nombre ?? '', html: (c) => h.chip(this.paisesPorId().get(c.id_pais)?.nombre ?? 'Sin país', 'flag') },
    { titulo: 'Usuarios', valor: (c) => this.d().usuarios.filter((u: any) => u.id_ciudad === c.id_ciudad).length, clase: 'numero' },
    { titulo: 'Trabajos', valor: (c) => this.d().trabajos.filter((t: any) => t.id_ciudad === c.id_ciudad).length, clase: 'numero' }
  ];

  protected readonly camposPais: CampoCatalogo[] = [{ nombre: 'nombre', etiqueta: 'Nombre del país', ayuda: 'Ej: Colombia' }];

  protected readonly camposCiudad = computed<CampoCatalogo[]>(() => [
    { nombre: 'nombre', etiqueta: 'Nombre de la ciudad', ayuda: 'Ej: Sincelejo' },
    { nombre: 'id_pais', etiqueta: 'País', tipo: 'select', opciones: this.d().paises.map((p: any) => ({ valor: p.id_pais, texto: p.nombre })) }
  ]);
}
