import { Injectable, signal } from '@angular/core';
import { Auditoria } from '../../../core/models/auditoria';

export interface CambioCampo {
  campo: string;
  antes: string;
  despues: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private _eventos = signal<Auditoria[]>([
    { id_auditoria: 88213, created: 'Hoy, 9:14:22 a. m.', usuario: 'Jose Torregrosa', tabla: 'usuarios', accion: 'UPDATE', id_registro: 7, ip: '181.49.12.30' },
    { id_auditoria: 88212, created: 'Hoy, 9:02:10 a. m.', usuario: 'María López', tabla: 'trabajos', accion: 'INSERT', id_registro: 1215, ip: '190.85.44.201' },
    { id_auditoria: 88211, created: 'Hoy, 8:47:55 a. m.', usuario: 'Andrés Ruiz', tabla: 'reportes', accion: 'UPDATE', id_registro: 77, ip: '186.31.90.12' },
    { id_auditoria: 88210, created: 'Hoy, 7:30:04 a. m.', usuario: 'María López', tabla: 'contrataciones', accion: 'INSERT', id_registro: 1042, ip: '190.85.44.201' },
    { id_auditoria: 88209, created: 'Ayer, 6:12:40 p. m.', usuario: 'Carlos Pérez', tabla: 'ofertas', accion: 'UPDATE', id_registro: 5499, ip: '179.12.3.88' },
    { id_auditoria: 88208, created: 'Ayer, 5:58:19 p. m.', usuario: 'Jose Torregrosa', tabla: 'trabajos', accion: 'DELETE', id_registro: 1190, ip: '181.49.12.30' }
  ]);

  private _cambios = signal<CambioCampo[]>([
    { campo: 'estado', antes: 'true', despues: 'false' },
    { campo: 'id_rol', antes: '3', despues: '3' },
    { campo: 'correo', antes: 'kevin.montes@gmail.com', despues: 'kevin.montes@gmail.com' },
    { campo: 'updated', antes: '2026-10-02 18:20:11', despues: '2026-10-15 09:14:22' }
  ]);

  readonly eventos = this._eventos.asReadonly();
  readonly cambios = this._cambios.asReadonly();
}
