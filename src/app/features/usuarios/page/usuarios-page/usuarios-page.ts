// USUARIOS: todas las personas de InWork. El administrador crea, edita, cambia el rol,
// restablece la contraseña y desactiva cuentas. Moderador y analista solo pueden ver.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { SesionService } from '../../../../core/services/sesion';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { Confirmar } from '../../../../shared/components/confirmar/confirmar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { GraficoBarras } from '../../../../shared/components/grafico-barras/grafico-barras';
import { Modal } from '../../../../shared/components/modal/modal';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Estadistica } from '../../../../shared/interfaces/estadistica';
import { AccionTabla, Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

type TipoModal = '' | 'nuevo' | 'editar' | 'rol' | 'clave';

@Component({
  selector: 'app-usuarios-page',
  imports: [FormsModule, RouterLink, PageHeader, StatCard, Tarjeta, TablaDatos, Avatar, StatusPill, GraficoBarras, Modal, Confirmar, Cargando, EmptyState],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.css'
})
export class UsuariosPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly roles = [
    { id_rol: 1, nombre: 'Administrador' },
    { id_rol: 2, nombre: 'Moderador' },
    { id_rol: 3, nombre: 'Analista' },
    { id_rol: 4, nombre: 'Empleador' },
    { id_rol: 5, nombre: 'Empleado' }
  ];
  protected readonly tiposDocumento = ['cedula', 'pasaporte', 'permiso de residencia', 'cedula de extranjeria'];
  protected readonly pestanas = ['Resumen', 'Trabajos', 'Contrataciones', 'Ofertas', 'Calificaciones'];
  protected readonly titulosModal: Partial<Record<string, string>> = { nuevo: 'Nuevo usuario', editar: 'Editar usuario', rol: 'Cambiar rol', clave: 'Restablecer contraseña' };

  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly d = signal<any>({ usuarios: [] });
  protected readonly seleccionado = signal<any>(null);
  protected readonly pestana = signal('Resumen');

  protected readonly esAdmin = computed(() => this.sesion.sesion()?.id_rol === 1);
  protected readonly puedeCrear = computed(() => this.sesion.permiso('usuarios', 'crear') && this.esAdmin());

  ngOnInit(): void {
    this.cargar();
  }

  protected async cargar(silencioso = false): Promise<void> {
    if (!silencioso) this.cargando.set(true);
    this.error.set('');
    try {
      const { datos } = await cargarVarios({
        usuarios: this.api.get('/usuarios/'),
        ciudades: this.sesion.permiso('ubicacion') ? this.api.get('/ciudades/') : [],
        habilidades: this.sesion.permiso('categorias') ? this.api.get('/habilidades/') : [],
        usuariosHabilidades: this.api.get('/usuarios-habilidades/'),
        trabajos: this.sesion.permiso('trabajos') ? this.api.get('/trabajos/') : [],
        ofertas: this.sesion.permiso('ofertas') ? this.api.get('/ofertas/') : [],
        contrataciones: this.sesion.permiso('contrataciones') ? this.api.get('/contrataciones/') : [],
        calificaciones: this.sesion.permiso('calificaciones') ? this.api.get('/calificaciones/') : []
      });
      if (!datos.usuarios.length) throw new Error('No se pudo leer la lista de usuarios.');
      this.d.set(datos);
      const actual = this.seleccionado();
      this.seleccionado.set(actual ? (datos.usuarios.find((u: any) => u.id_usuario === actual.id_usuario) ?? datos.usuarios[0]) : datos.usuarios[0]);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.cargando.set(false);
    }
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private readonly trabajosPorId = computed(() => f.mapaPor(this.d().trabajos, 'id_trabajo'));
  private readonly habilidadesPorId = computed(() => f.mapaPor(this.d().habilidades, 'id_habilidad'));
  private nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }

  private trabajosDe(id: number): any[] {
    return (this.d().trabajos ?? []).filter((t: any) => t.id_cliente === id);
  }
  private contratosDe(id: number): any[] {
    return (this.d().contrataciones ?? []).filter((c: any) => c.id_cliente === id || c.id_trabajador === id);
  }
  private ofertasDe(id: number): any[] {
    return (this.d().ofertas ?? []).filter((o: any) => o.id_trabajador === id);
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const u = this.d().usuarios;
    return [
      { titulo: 'Total de usuarios', valor: f.numero(u.length), icono: 'group', color: 'azul', detalle: 'cuentas activas' },
      { titulo: 'Empleadores', valor: f.numero(u.filter((x: any) => x.id_rol === 4).length), icono: 'storefront', color: 'naranja', detalle: 'publican trabajos' },
      { titulo: 'Empleados', valor: f.numero(u.filter((x: any) => x.id_rol === 5).length), icono: 'construction', color: 'verde', detalle: 'hacen trabajos' },
      { titulo: 'Equipo InWork', valor: f.numero(u.filter((x: any) => x.id_rol <= 3).length), icono: 'admin_panel_settings', color: 'morado', detalle: 'admin, moderación y análisis' }
    ];
  });

  protected readonly columnas: Columna[] = [
    { titulo: 'Usuario', valor: (u) => `${f.nombreCompleto(u)} ${u.correo}`, html: (u) => h.persona(f.nombreCompleto(u), u.correo, 'normal') },
    {
      titulo: 'Documento',
      valor: (u) => u.numero_identificacion,
      html: (u) => `<span class="numero">${f.escapar(u.numero_identificacion)}</span><small class="bajo">${f.escapar(f.capitalizar(u.tipo_identificacion))}</small>`
    },
    { titulo: 'Ciudad', valor: (u) => u.ciudad ?? 'Sin ciudad' },
    { titulo: 'Rol', valor: (u) => u.rol, html: (u) => h.chip(u.rol) },
    { titulo: 'Trabajos', valor: (u) => this.trabajosDe(u.id_usuario).length, clase: 'numero' },
    { titulo: 'Contratos', valor: (u) => this.contratosDe(u.id_usuario).length, clase: 'numero' },
    { titulo: 'Calificación', valor: (u) => Number(u.promedio_calificacion), html: (u) => h.notaEstrella(u.promedio_calificacion) },
    {
      titulo: 'Correo',
      valor: (u) => (u.correo_verificado ? 'Verificado' : 'Sin verificar'),
      html: (u) =>
        `<span class="verificado ${u.correo_verificado ? 'si' : 'no'}"><span class="material-symbols-rounded">${u.correo_verificado ? 'verified' : 'error'}</span>${u.correo_verificado ? 'Verificado' : 'Sin verificar'}</span>`
    }
  ];

  private esYo(u: any): boolean {
    return u.id_usuario === this.sesion.sesion()?.id_usuario;
  }

  protected readonly acciones = computed<AccionTabla[]>(() =>
    this.esAdmin()
      ? [
          { texto: 'Editar', icono: 'edit', soloIcono: true, alHacer: (u) => this.abrirEditar(u) },
          { texto: 'Cambiar rol', icono: 'manage_accounts', soloIcono: true, mostrar: (u) => !this.esYo(u), alHacer: (u) => this.abrirRol(u) },
          { texto: 'Restablecer contraseña', icono: 'key', soloIcono: true, alHacer: (u) => this.abrirClave(u) },
          { texto: 'Desactivar', icono: 'block', tono: 'peligro', soloIcono: true, mostrar: (u) => !this.esYo(u), alHacer: (u) => this.abrirDesactivar(u) }
        ]
      : []
  );

  protected readonly porRol = computed(() => f.contarPor(this.d().usuarios, (u) => u.rol));
  protected readonly porCiudad = computed(() => f.contarPor(this.d().usuarios, (u) => u.ciudad).slice(0, 6));

  // Detalle del usuario elegido
  protected readonly habilidadesSel = computed(() => {
    const sel = this.seleccionado();
    return sel
      ? (this.d().usuariosHabilidades ?? [])
          .filter((x: any) => x.id_usuario === sel.id_usuario)
          .map((x: any) => ({ nombre: this.habilidadesPorId().get(x.id_habilidad)?.nombre ?? 'Habilidad', anios: x.anios_experiencia }))
      : [];
  });
  protected readonly trabajosSel = computed(() => (this.seleccionado() ? this.trabajosDe(this.seleccionado().id_usuario) : []));
  protected readonly contratosSel = computed(() => (this.seleccionado() ? this.contratosDe(this.seleccionado().id_usuario) : []));
  protected readonly ofertasSel = computed(() => (this.seleccionado() ? this.ofertasDe(this.seleccionado().id_usuario) : []));
  protected readonly calificacionesSel = computed(() => {
    const sel = this.seleccionado();
    return sel ? (this.d().calificaciones ?? []).filter((c: any) => c.id_calificado === sel.id_usuario) : [];
  });

  protected readonly actividadSel = computed(() => {
    const sel = this.seleccionado();
    if (!sel) return [];
    const id = sel.id_usuario;
    const eventos = [
      ...this.trabajosSel().map((t: any) => ({ titulo: `Publicó «${t.titulo}»`, fecha: t.created })),
      ...this.ofertasSel().map((o: any) => ({ titulo: `Ofertó en «${this.trabajosPorId().get(o.id_trabajo)?.titulo ?? 'un trabajo'}»`, fecha: o.fecha_oferta })),
      ...this.contratosSel().map((c: any) => ({
        titulo: c.id_cliente === id ? `Contrató a ${this.nombre(c.id_trabajador)}` : `Lo contrató ${this.nombre(c.id_cliente)}`,
        fecha: c.fecha_contratacion
      })),
      ...this.calificacionesSel().map((c: any) => ({ titulo: `Recibió ${c.puntuacion} estrellas de ${this.nombre(c.id_calificador)}`, fecha: c.created }))
    ];
    return eventos.sort((a, b) => f.ordenFecha(b.fecha) - f.ordenFecha(a.fecha)).slice(0, 5);
  });

  // Lista de la pestaña elegida (trabajos, contrataciones, ofertas o calificaciones)
  protected readonly listaPestana = computed(() => {
    const sel = this.seleccionado();
    if (!sel) return [];
    switch (this.pestana()) {
      case 'Trabajos':
        return this.trabajosSel().map((t: any) => ({ titulo: t.titulo, detalle: `${f.fecha(t.fecha_trabajo)} · ${f.moneda(t.presupuesto)}`, estado: t.estado_trabajo }));
      case 'Contrataciones':
        return this.contratosSel().map((c: any) => ({
          titulo: this.trabajosPorId().get(c.id_trabajo)?.titulo ?? 'Trabajo',
          detalle: c.id_cliente === sel.id_usuario ? `Contrató a ${this.nombre(c.id_trabajador)}` : `Contratado por ${this.nombre(c.id_cliente)}`,
          estado: c.estado_contratacion
        }));
      case 'Ofertas':
        return this.ofertasSel().map((o: any) => ({ titulo: this.trabajosPorId().get(o.id_trabajo)?.titulo ?? 'Trabajo', detalle: f.moneda(o.valor_oferta), estado: o.estado_oferta }));
      default:
        return this.calificacionesSel().map((c: any) => ({ titulo: `${c.puntuacion} estrellas de ${this.nombre(c.id_calificador)}`, detalle: c.comentario ?? '', estado: '' }));
    }
  });

  protected readonly elegir = (fila: any) => {
    this.seleccionado.set(this.d().usuarios.find((u: any) => u.id_usuario === fila.id_usuario) ?? fila);
    this.pestana.set('Resumen');
  };

  // ----- Formularios -----
  protected readonly modal = signal<TipoModal>('');
  protected readonly abiertoModal = signal(false);
  protected readonly confirmarAbierto = signal(false);
  protected readonly objetivo = signal<any>(null);
  protected readonly guardando = signal(false);
  protected readonly errorForm = signal('');
  protected form: any = {};

  private abrir(tipo: TipoModal, usuario: any, valores: any): void {
    this.modal.set(tipo);
    this.objetivo.set(usuario);
    this.form = valores;
    this.errorForm.set('');
    this.abiertoModal.set(true);
  }

  protected abrirNuevo(): void {
    this.abrir('nuevo', null, {
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      telefono: '',
      tipo_identificacion: 'cedula',
      numero_identificacion: '',
      fecha_nacimiento: '',
      id_ciudad: this.d().ciudades?.[0]?.id_ciudad ?? null,
      id_rol: 2,
      direccion: '',
      descripcion: ''
    });
  }

  protected abrirEditar(u: any): void {
    this.abrir('editar', u, {
      nombre: u.nombre,
      apellido: u.apellido,
      telefono: u.telefono,
      id_ciudad: u.id_ciudad,
      direccion: u.direccion ?? '',
      descripcion: u.descripcion ?? '',
      foto_perfil: u.foto_perfil
    });
  }

  protected abrirRol(u: any): void {
    this.abrir('rol', u, { id_rol: u.id_rol });
  }

  private abrirClave(u: any): void {
    this.abrir('clave', u, { password_nueva: '', confirmar: '' });
  }

  protected abrirDesactivar(u: any): void {
    this.objetivo.set(u);
    this.confirmarAbierto.set(true);
  }

  private edad(fechaTexto: string): number {
    const nacimiento = f.aFecha(fechaTexto);
    if (!nacimiento) return 0;
    const hoy = new Date();
    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())) anios--;
    return anios;
  }

  private validar(): string {
    const modal = this.modal();
    const form = this.form;
    if (modal === 'nuevo' || modal === 'editar') {
      if (!form.nombre?.trim() || !form.apellido?.trim()) return 'Escribe el nombre y el apellido.';
      if (!/^3\d{9}$/.test(String(form.telefono).replace(/\s/g, ''))) return 'El teléfono debe ser un celular colombiano de 10 dígitos (empieza por 3).';
    }
    if (modal === 'nuevo') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.correo)) return 'Escribe un correo válido.';
      if (form.password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
      if (!form.numero_identificacion.trim()) return 'Escribe el número de documento.';
      if (this.edad(form.fecha_nacimiento) < 18) return 'La persona debe ser mayor de 18 años.';
    }
    if (modal === 'clave') {
      if (form.password_nueva.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
      if (form.password_nueva !== form.confirmar) return 'Las contraseñas no coinciden.';
    }
    return '';
  }

  protected async guardar(): Promise<void> {
    const problema = this.validar();
    this.errorForm.set(problema);
    if (problema) return;
    this.guardando.set(true);
    const modal = this.modal();
    const objetivo = this.objetivo();
    const form = this.form;
    try {
      if (modal === 'nuevo') {
        await this.api.post('/usuarios/', {
          ...form,
          correo: form.correo.trim().toLowerCase(),
          telefono: form.telefono.replace(/\s/g, ''),
          id_rol: Number(form.id_rol),
          id_ciudad: form.id_ciudad ? Number(form.id_ciudad) : null
        });
        this.avisos.avisar(`Se creó la cuenta de ${form.nombre} ${form.apellido}`);
      } else if (modal === 'editar') {
        await this.api.put(`/usuarios/${objetivo.id_usuario}`, {
          ...form,
          telefono: form.telefono.replace(/\s/g, ''),
          id_ciudad: form.id_ciudad ? Number(form.id_ciudad) : null
        });
        this.avisos.avisar('Datos actualizados');
      } else if (modal === 'rol') {
        await this.api.put(`/usuarios/${objetivo.id_usuario}/rol`, { id_rol: Number(form.id_rol) });
        this.avisos.avisar(`${f.nombreCompleto(objetivo)} ahora es ${this.roles.find((r) => r.id_rol === Number(form.id_rol))?.nombre}`);
      } else if (modal === 'clave') {
        await this.api.put(`/usuarios/${objetivo.id_usuario}/password`, { password_nueva: form.password_nueva });
        this.avisos.avisar(`Contraseña restablecida para ${f.nombreCompleto(objetivo)}`);
      }
      this.abiertoModal.set(false);
      await this.cargar(true);
    } catch (e: any) {
      this.errorForm.set(e.message);
    } finally {
      this.guardando.set(false);
    }
  }

  protected textoDesactivar(): string {
    const o = this.objetivo();
    return `${o ? f.nombreCompleto(o) : ''} ya no podrá iniciar sesión. Sus trabajos y contratos se conservan.`;
  }

  protected readonly desactivar = async () => {
    const objetivo = this.objetivo();
    await this.api.del(`/usuarios/${objetivo.id_usuario}`);
    this.avisos.avisar(`La cuenta de ${f.nombreCompleto(objetivo)} quedó desactivada`);
    if (this.seleccionado()?.id_usuario === objetivo.id_usuario) this.seleccionado.set(null);
    await this.cargar(true);
  };

  protected exportar(): void {
    f.descargarCSV(
      'usuarios-inwork.csv',
      [
        { titulo: 'Nombre', valor: (u) => f.nombreCompleto(u) },
        { titulo: 'Correo', valor: (u) => u.correo },
        { titulo: 'Teléfono', valor: (u) => u.telefono },
        { titulo: 'Documento', valor: (u) => `${u.tipo_identificacion} ${u.numero_identificacion}` },
        { titulo: 'Ciudad', valor: (u) => u.ciudad },
        { titulo: 'Rol', valor: (u) => u.rol },
        { titulo: 'Calificación', valor: (u) => u.promedio_calificacion }
      ],
      this.d().usuarios
    );
  }
}
