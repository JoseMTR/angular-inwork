export interface HabilidadUsuario {
  nombre: string;
  anios_experiencia: number;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  ciudad: string;
  rol: string;
  direccion: string;
  fecha_nacimiento: string;
  created: string;
  total_trabajos: number;
  total_contratos: number;
  total_ofertas: number;
  promedio_calificacion: number;
  correo_verificado: boolean;
  estado: string;
}
