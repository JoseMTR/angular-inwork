export interface Cifra {
  etiqueta: string;
  valor: string;
  variacion: string;
  sube: boolean;
}

export interface Informe {
  id_informe: number;
  tipo: string;
  titulo: string;
  generado: string;
  estado: string;
  resumen: string;
  cifras: Cifra[];
}

export interface Programacion {
  tipo: string;
  descripcion: string;
  hora: string;
  proximo: string;
  activo: boolean;
}
