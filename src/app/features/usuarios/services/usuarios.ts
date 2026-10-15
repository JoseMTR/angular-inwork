import { Injectable, signal } from '@angular/core';
import { HabilidadUsuario, Usuario } from '../../../core/models/usuario';
import { Estadistica } from '../../../shared/interfaces/estadistica';
import { Barra } from '../../../shared/interfaces/grafico';

export interface EventoActividad {
  titulo: string;
  fecha: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private _resumen = signal<Estadistica[]>([
    { titulo: 'Total de usuarios', valor: '48.312', variacion: '+6,1%', sube: true, icono: 'group', color: 'azul', detalle: 'este mes' },
    { titulo: 'Contratos', valor: '9.874', variacion: '+4,2%', sube: true, icono: 'handshake', color: 'verde', detalle: 'este mes' },
    { titulo: 'Trabajos', valor: '21.506', variacion: '+7,9%', sube: true, icono: 'work', color: 'naranja', detalle: 'este mes' },
    { titulo: 'Ofertas', valor: '63.220', variacion: '+11,0%', sube: true, icono: 'local_offer', color: 'morado', detalle: 'este mes' }
  ]);

  private _usuarios = signal<Usuario[]>([
    { id_usuario: 1, nombre: 'Carlos', apellido: 'Pérez', correo: 'carlos.perez@gmail.com', telefono: '300 145 2210', tipo_identificacion: 'Cédula', numero_identificacion: '1.045.223.871', ciudad: 'Barranquilla', rol: 'Usuario', direccion: 'Cra 54 # 72-80', fecha_nacimiento: '14 mar 1991', created: '02 feb 2025', total_trabajos: 12, total_contratos: 126, total_ofertas: 188, promedio_calificacion: 4.98, correo_verificado: true, estado: 'activo' },
    { id_usuario: 2, nombre: 'Luisa', apellido: 'Gómez', correo: 'luisa.gomez@gmail.com', telefono: '310 987 6543', tipo_identificacion: 'Cédula', numero_identificacion: '1.140.876.002', ciudad: 'Soledad', rol: 'Usuario', direccion: 'Cl 30 # 21-15', fecha_nacimiento: '02 jul 1994', created: '19 ene 2025', total_trabajos: 4, total_contratos: 214, total_ofertas: 260, promedio_calificacion: 4.95, correo_verificado: true, estado: 'activo' },
    { id_usuario: 3, nombre: 'María', apellido: 'López', correo: 'maria.lopez@gmail.com', telefono: '315 222 1100', tipo_identificacion: 'Cédula', numero_identificacion: '32.887.410', ciudad: 'Bogotá', rol: 'Usuario', direccion: 'Cl 85 # 15-20', fecha_nacimiento: '28 nov 1988', created: '05 mar 2025', total_trabajos: 31, total_contratos: 27, total_ofertas: 0, promedio_calificacion: 4.7, correo_verificado: true, estado: 'activo' },
    { id_usuario: 4, nombre: 'Jorge', apellido: 'Díaz', correo: 'jorge.diaz@gmail.com', telefono: '301 456 7788', tipo_identificacion: 'Cédula', numero_identificacion: '72.334.981', ciudad: 'Medellín', rol: 'Usuario', direccion: 'Cra 43A # 1-50', fecha_nacimiento: '09 ene 1985', created: '22 abr 2025', total_trabajos: 6, total_contratos: 143, total_ofertas: 201, promedio_calificacion: 4.88, correo_verificado: false, estado: 'activo' },
    { id_usuario: 5, nombre: 'Sofía', apellido: 'Méndez', correo: 'sofia.mendez@gmail.com', telefono: '320 111 4455', tipo_identificacion: 'Pasaporte', numero_identificacion: 'AX 482 117', ciudad: 'Cartagena', rol: 'Usuario', direccion: 'Bocagrande, Cra 3 # 6-40', fecha_nacimiento: '17 may 1996', created: '30 may 2025', total_trabajos: 18, total_contratos: 15, total_ofertas: 2, promedio_calificacion: 4.6, correo_verificado: true, estado: 'activo' },
    { id_usuario: 6, nombre: 'Andrés', apellido: 'Ruiz', correo: 'andres.ruiz@gmail.com', telefono: '304 765 1290', tipo_identificacion: 'Cédula', numero_identificacion: '1.020.441.765', ciudad: 'Cali', rol: 'Moderador', direccion: 'Av 6N # 23-45', fecha_nacimiento: '21 ago 1990', created: '11 dic 2024', total_trabajos: 0, total_contratos: 98, total_ofertas: 130, promedio_calificacion: 4.93, correo_verificado: true, estado: 'activo' },
    { id_usuario: 7, nombre: 'Kevin', apellido: 'Montes', correo: 'kevin.montes@gmail.com', telefono: '313 908 1122', tipo_identificacion: 'Cédula', numero_identificacion: '1.143.556.019', ciudad: 'Barranquilla', rol: 'Usuario', direccion: 'Cl 98 # 52-115', fecha_nacimiento: '03 feb 1999', created: '14 jul 2025', total_trabajos: 2, total_contratos: 9, total_ofertas: 41, promedio_calificacion: 2.4, correo_verificado: false, estado: 'suspendido' },
    { id_usuario: 8, nombre: 'Daniela', apellido: 'Castro', correo: 'daniela.castro@gmail.com', telefono: '317 334 5566', tipo_identificacion: 'Cédula de extranjería', numero_identificacion: 'E 901 233', ciudad: 'Santa Marta', rol: 'Analista', direccion: 'Cra 4 # 10-22', fecha_nacimiento: '12 oct 1993', created: '03 ago 2025', total_trabajos: 0, total_contratos: 0, total_ofertas: 0, promedio_calificacion: 0, correo_verificado: true, estado: 'activo' }
  ]);

  private _habilidades = signal<HabilidadUsuario[]>([
    { nombre: 'Plomería', anios_experiencia: 8 },
    { nombre: 'Electricidad', anios_experiencia: 3 },
    { nombre: 'Pintura', anios_experiencia: 2 }
  ]);

  private _actividad = signal<EventoActividad[]>([
    { titulo: 'Recibió 5 estrellas de María López', fecha: 'Hoy, 9:12 a. m.', estado: 'actual' },
    { titulo: 'Finalizó "Arreglar tubería de la cocina"', fecha: 'Ayer, 5:40 p. m.', estado: 'hecho' },
    { titulo: 'Le pagaron $ 126.000 desde la custodia', fecha: 'Ayer, 5:41 p. m.', estado: 'hecho' },
    { titulo: 'Envió una oferta a "Instalar calentador"', fecha: '11 oct, 3:15 p. m.', estado: 'hecho' }
  ]);

  private _registrosPorMes = signal<Barra[]>([
    { etiqueta: 'May', valor: 2810 },
    { etiqueta: 'Jun', valor: 3120 },
    { etiqueta: 'Jul', valor: 3480 },
    { etiqueta: 'Ago', valor: 3260 },
    { etiqueta: 'Sep', valor: 3905 },
    { etiqueta: 'Oct', valor: 4410 }
  ]);

  private _usuariosPorCiudad = signal<Barra[]>([
    { etiqueta: 'Barranquilla', valor: 14210 },
    { etiqueta: 'Bogotá', valor: 11980 },
    { etiqueta: 'Medellín', valor: 8640 },
    { etiqueta: 'Cali', valor: 6120 },
    { etiqueta: 'Cartagena', valor: 4302 }
  ]);

  readonly resumen = this._resumen.asReadonly();
  readonly usuarios = this._usuarios.asReadonly();
  readonly habilidades = this._habilidades.asReadonly();
  readonly actividad = this._actividad.asReadonly();
  readonly registrosPorMes = this._registrosPorMes.asReadonly();
  readonly usuariosPorCiudad = this._usuariosPorCiudad.asReadonly();
}
