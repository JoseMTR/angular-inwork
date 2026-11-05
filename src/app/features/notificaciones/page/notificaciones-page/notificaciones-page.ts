// NOTIFICACIONES: avisos que reciben los usuarios. El equipo puede enviar avisos nuevos.
// La API también las crea sola (oferta aceptada, contrato finalizado, etc.).
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, cargarVarios } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { SesionService } from '../../../../core/services/sesion';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { Confirmar } from '../../../../shared/components/confirmar/confirmar';
import { Modal } from '../../../../shared/components/modal/modal';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { TablaDatos } from '../../../../shared/components/tabla-datos/tabla-datos';
import { Tarjeta } from '../../../../shared/components/tarjeta/tarjeta';
import { Estadistica } from '../../../../shared/interfaces/estadistica';
import { AccionTabla, Columna } from '../../../../shared/interfaces/tabla';
import * as f from '../../../../shared/utils/formato';
import * as h from '../../../../shared/utils/html';

const TIPOS: Record<string, string> = {
  sistema: 'Aviso del sistema',
  verificacion: 'Verificación',
  reporte: 'Reporte',
  oferta_aceptada: 'Oferta aceptada',
  contratacion_finalizada: 'Contrato finalizado',
  contratacion_cancelada: 'Contrato cancelado'
};

@Component({
  selector: 'app-notificaciones-page',
  imports: [FormsModule, PageHeader, StatCard, Tarjeta, TablaDatos, Modal, Confirmar, Cargando],
  templateUrl: './notificaciones-page.html',
  styleUrl: './notificaciones-page.css'
})
export class NotificacionesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly tipos = Object.entries(TIPOS).map(([valor, texto]) => ({ valor, texto }));
  protected readonly destinos = [
    { valor: 'uno', texto: 'Una persona' },
    { valor: 'empleados', texto: 'Todos los empleados' },
    { valor: 'empleadores', texto: 'Todos los empleadores' }
  ];

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ notificaciones: [], usuarios: [] });
  protected readonly modal = signal(false);
  protected readonly editando = signal<any>(null);
  protected readonly guardando = signal(false);
  protected readonly errorForm = signal('');
  protected readonly confirmar = signal(false);
  protected readonly objetivo = signal<any>(null);
  protected form: any = {};

  protected readonly esEquipo = computed(() => [1, 2].includes(this.sesion.sesion()?.id_rol ?? 0));
  protected readonly puedeCrear = computed(() => this.sesion.permiso('notificaciones', 'crear') && this.esEquipo());

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      notificaciones: this.api.get('/notificaciones/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  private nombre(id: number): string {
    const yo = this.sesion.sesion();
    return id === yo?.id_usuario ? `${yo.nombre} (tú)` : f.nombreCompleto(this.usuariosPorId().get(id));
  }
  private esMia(n: any): boolean {
    return n.id_usuario === this.sesion.sesion()?.id_usuario;
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const lista = this.d().notificaciones;
    return [
      { titulo: 'Notificaciones', valor: lista.length, icono: 'notifications', color: 'naranja', detalle: this.esEquipo() ? 'de todos los usuarios' : 'tuyas' },
      { titulo: 'Sin leer', valor: lista.filter((n: any) => !n.leida).length, icono: 'mark_email_unread', color: 'ambar', detalle: 'todavía no se abren' },
      { titulo: 'Para ti', valor: lista.filter((n: any) => this.esMia(n)).length, icono: 'person', color: 'azul', detalle: 'que te llegaron a ti' }
    ];
  });

  protected readonly columnas: Columna[] = [
    { titulo: 'Para', valor: (n) => this.nombre(n.id_usuario), html: (n) => h.persona(this.nombre(n.id_usuario)) },
    { titulo: 'Tipo', valor: (n) => TIPOS[n.tipo] ?? n.tipo, html: (n) => h.chip(TIPOS[n.tipo] ?? f.capitalizar(n.tipo)) },
    { titulo: 'Título', valor: (n) => n.titulo, html: (n) => h.titulo(n.titulo) },
    { titulo: 'Contenido', valor: (n) => n.contenido ?? '', html: (n) => h.recortado(n.contenido ?? '—') },
    { titulo: 'Estado', valor: (n) => (n.leida ? 'Leída' : 'Sin leer'), html: (n) => h.pill(n.leida ? 'leida' : 'sin_leer') },
    { titulo: 'Fecha', valor: (n) => f.ordenFecha(n.created), html: (n) => h.suave(f.fechaHora(n.created), 'texto-3 fecha') }
  ];

  protected readonly acciones = computed<AccionTabla[]>(() => [
    ...(this.sesion.permiso('notificaciones', 'editar')
      ? [{ texto: 'Marcar como leída', icono: 'done_all', soloIcono: true, mostrar: (n: any) => !n.leida && this.esMia(n), alHacer: (n: any) => this.marcarLeida(n) }]
      : []),
    ...(this.esEquipo() && this.sesion.permiso('notificaciones', 'editar') ? [{ texto: 'Editar', icono: 'edit', soloIcono: true, alHacer: (n: any) => this.abrirEditar(n) }] : []),
    ...(this.sesion.permiso('notificaciones', 'eliminar')
      ? [
          {
            texto: 'Eliminar',
            icono: 'delete',
            tono: 'peligro' as const,
            soloIcono: true,
            mostrar: (n: any) => this.esEquipo() || this.esMia(n),
            alHacer: (n: any) => {
              this.objetivo.set(n);
              this.confirmar.set(true);
            }
          }
        ]
      : [])
  ]);

  protected readonly personas = computed(() =>
    this.d()
      .usuarios.filter((u: any) => u.id_rol >= 4)
      .sort((a: any, b: any) => f.nombreCompleto(a).localeCompare(f.nombreCompleto(b)))
  );

  protected abrirNuevo(): void {
    this.editando.set(null);
    this.form = { destino: 'uno', id_usuario: this.personas()[0]?.id_usuario ?? null, tipo: 'sistema', titulo: '', contenido: '' };
    this.errorForm.set('');
    this.modal.set(true);
  }

  private abrirEditar(n: any): void {
    this.editando.set(n);
    this.form = { destino: 'uno', id_usuario: n.id_usuario, tipo: n.tipo, titulo: n.titulo, contenido: n.contenido ?? '' };
    this.errorForm.set('');
    this.modal.set(true);
  }

  protected async guardar(): Promise<void> {
    if (!this.form.titulo.trim()) {
      this.errorForm.set('Escribe un título.');
      return;
    }
    this.guardando.set(true);
    this.errorForm.set('');
    try {
      const editando = this.editando();
      const cuerpo = (id_usuario: number) => ({
        id_usuario,
        tipo: this.form.tipo,
        titulo: this.form.titulo.trim(),
        contenido: this.form.contenido.trim() || null,
        id_referencia: editando?.id_referencia ?? null
      });
      if (editando) {
        await this.api.put(`/notificaciones/${editando.id_notificacion}`, cuerpo(Number(this.form.id_usuario)));
        this.avisos.avisar('Notificación actualizada');
      } else {
        const destinatarios: number[] =
          this.form.destino === 'uno'
            ? [Number(this.form.id_usuario)]
            : this.d()
                .usuarios.filter((u: any) => u.id_rol === (this.form.destino === 'empleados' ? 5 : 4))
                .map((u: any) => u.id_usuario);
        for (const id of destinatarios) await this.api.post('/notificaciones/', cuerpo(id));
        this.avisos.avisar(destinatarios.length === 1 ? 'Notificación enviada' : `Notificación enviada a ${destinatarios.length} personas`);
      }
      this.modal.set(false);
      await this.cargar();
    } catch (e: any) {
      this.errorForm.set(e.message);
    } finally {
      this.guardando.set(false);
    }
  }

  private async marcarLeida(n: any): Promise<void> {
    try {
      await this.api.put(`/notificaciones/${n.id_notificacion}/leer`);
      this.avisos.avisar('Marcada como leída');
      await this.cargar();
    } catch (e: any) {
      this.avisos.avisar(e.message, 'error');
    }
  }

  protected textoConfirmar(): string {
    return `«${this.objetivo()?.titulo ?? ''}» dejará de aparecer en la app.`;
  }

  protected readonly eliminar = async () => {
    await this.api.del(`/notificaciones/${this.objetivo().id_notificacion}`);
    this.avisos.avisar('Notificación eliminada');
    await this.cargar();
  };
}
