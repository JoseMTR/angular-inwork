export interface MenuItem {
  texto: string;
  icono: string;
  ruta: string;
  insignia?: string;
}

export interface MenuGrupo {
  titulo: string;
  color: string;
  items: MenuItem[];
}
