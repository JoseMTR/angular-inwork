export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
  usuarios: number;
  icono: string;
}

export interface Permiso {
  modulo: string;
  puede_crear: boolean;
  puede_leer: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
}
