// CATEGORÍAS Y HABILIDADES: tipos de trabajo y oficios de los trabajadores.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { SesionService } from '../../../../core/services/sesion';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { CampoCatalogo, CrudCatalogo } from '../../../../shared/components/crud-catalogo/crud-catalogo';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

@Component({
  selector: 'app-categorias-page',
  imports: [PageHeader, StatCard, CrudCatalogo, Tarjeta, GraficoBarras, Cargando],
  templateUrl: './categorias-page.html',
  styleUrl: './categorias-page.css'
})
export class CategoriasPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ categorias: [], habilidades: [], trabajos: [], usuariosHabilidades: [] });

  ngOnInit(): void {
    this.cargar();
  }

  protected readonly cargar = async () => {
    const { datos } = await cargarVarios({
      categorias: this.api.get('/categorias/'),
      habilidades: this.api.get('/habilidades/'),
      trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
      usuariosHabilidades: this.sesion.permiso('usuarios') ? this.api.get('/usuarios-habilidades/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
  };

  protected readonly columnasCategorias: Columna[] = [
    { titulo: 'Categoría', valor: (c) => c.nombre, html: (c) => h.titulo(c.nombre, c.descripcion ?? '') },
    { titulo: 'Trabajos', valor: (c) => this.d().trabajos.filter((t: any) => t.id_categoria === c.id_categoria).length, clase: 'numero' },
    {
      titulo: 'Publicados',
      valor: (c) => this.d().trabajos.filter((t: any) => t.id_categoria === c.id_categoria && t.estado_trabajo === 'publicado').length,
      clase: 'numero'
    }
  ];

  protected readonly columnasHabilidades: Columna[] = [
    { titulo: 'Habilidad', valor: (x) => x.nombre, html: (x) => h.titulo(x.nombre, x.descripcion ?? '') },
    { titulo: 'Trabajadores', valor: (x) => this.d().usuariosHabilidades.filter((u: any) => u.id_habilidad === x.id_habilidad).length, clase: 'numero' }
  ];

  protected readonly campos: CampoCatalogo[] = [
    { nombre: 'nombre', etiqueta: 'Nombre' },
    { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', requerido: false }
  ];

  protected readonly porCategoria = computed(() =>
    f.contarPor(this.d().trabajos, (t) => this.d().categorias.find((c: any) => c.id_categoria === t.id_categoria)?.nombre).slice(0, 8)
  );
  protected readonly porHabilidad = computed(() =>
    f.contarPor(this.d().usuariosHabilidades, (u) => this.d().habilidades.find((x: any) => x.id_habilidad === u.id_habilidad)?.nombre).slice(0, 8)
  );
}
