// Columnas y botones de la tabla con DataTables (componente TablaDatos)
export interface Columna {
  titulo: string;
  // Texto o número que se usa para ordenar y buscar
  valor?: (fila: any) => any;
  // HTML que se muestra en la celda (opcional)
  html?: (fila: any) => string;
  clase?: string;
  ordenable?: boolean;
  buscable?: boolean;
}

export interface AccionTabla {
  texto: string;
  icono: string;
  tono?: 'claro' | 'suave' | 'peligro' | 'exito' | 'primario';
  soloIcono?: boolean;
  mostrar?: (fila: any) => boolean;
  alHacer: (fila: any) => void;
}
