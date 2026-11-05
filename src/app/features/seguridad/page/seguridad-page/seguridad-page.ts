// SEGURIDAD: códigos para verificar correos y recuperar contraseñas (tabla tokens_usuario).
// El valor del código nunca se muestra; solo para quién es, para qué sirve y si sigue vigente.
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

const TIPOS: Record<string, string> = { verificacion_correo: 'Verificar correo', recuperar_password: 'Recuperar contraseña', refresh: 'Mantener sesión' };

@Component({
  selector: 'app-seguridad-page',
  imports: [FormsModule, PageHeader, StatCard, Tarjeta, TablaDatos, Modal, Confirmar, Cargando],
  templateUrl: './seguridad-page.html',
  styleUrl: './seguridad-page.css'
})
export class SeguridadPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);
  protected readonly sesion = inject(SesionService);
  protected readonly f = f;

  protected readonly cargando = signal(true);
  protected readonly d = signal<any>({ tokens: [], usuarios: [] });
  protected readonly modal = signal(false);
  protected readonly errorForm = signal('');
  protected readonly guardando = signal(false);
  protected readonly confirmar = signal(false);
  protected readonly objetivo = signal<any>(null);
  protected form: any = {};

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const { datos } = await cargarVarios({
      tokens: this.api.get('/tokens-usuario/'),
      usuarios: this.sesion.permiso('usuarios') ? this.api.get('/usuarios/') : []
    });
    this.d.set(datos);
    this.cargando.set(false);
  }

  private readonly usuariosPorId = computed(() => f.mapaPor(this.d().usuarios, 'id_usuario'));
  protected nombre(id: number): string {
    return f.nombreCompleto(this.usuariosPorId().get(id));
  }
  private estado(t: any): string {
    return t.usado ? 'usado' : f.ordenFecha(t.expira) < Date.now() ? 'vencido' : 'vigente';
  }

  protected readonly resumen = computed<Estadistica[]>(() => {
    const tokens = this.d().tokens;
    const cuantos = (e: string) => tokens.filter((t: any) => this.estado(t) === e).length;
    return [
      { titulo: 'Vigentes', valor: cuantos('vigente'), icono: 'key', color: 'ambar', detalle: 'se pueden usar todavía' },
      { titulo: 'Usados', valor: cuantos('usado'), icono: 'task_alt', color: 'verde', detalle: 'ya cumplieron su función' },
      { titulo: 'Vencidos', valor: cuantos('vencido'), icono: 'timer_off', color: 'rojo', detalle: 'pasó su fecha límite' }
    ];
  });

  protected readonly columnas: Columna[] = [
    { titulo: 'Usuario', valor: (t) => this.nombre(t.id_usuario), html: (t) => h.persona(this.nombre(t.id_usuario), this.usuariosPorId().get(t.id_usuario)?.correo ?? '') },
    { titulo: 'Para qué sirve', valor: (t) => TIPOS[t.tipo] ?? t.tipo, html: (t) => h.chip(TIPOS[t.tipo] ?? t.tipo, 'key') },
    { titulo: 'Estado', valor: (t) => this.estado(t), html: (t) => h.pill(this.estado(t)) },
    { titulo: 'Vence', valor: (t) => f.ordenFecha(t.expira), html: (t) => h.suave(f.fechaHora(t.expira), 'texto-2 fecha') },
    { titulo: 'Creado', valor: (t) => f.ordenFecha(t.created), html: (t) => h.suave(f.fechaHora(t.created), 'texto-3 fecha') }
  ];

  protected readonly acciones = computed<AccionTabla[]>(() =>
    this.sesion.permiso('seguridad', 'eliminar')
      ? [
          {
            texto: 'Revocar',
            icono: 'block',
            tono: 'peligro',
            soloIcono: true,
            mostrar: (t) => this.estado(t) === 'vigente',
            alHacer: (t) => {
              this.objetivo.set(t);
              this.confirmar.set(true);
            }
          }
        ]
      : []
  );

  protected abrirNuevo(): void {
    this.form = { id_usuario: this.d().usuarios[0]?.id_usuario ?? null, tipo: 'recuperar_password', horas: 24 };
    this.errorForm.set('');
    this.modal.set(true);
  }

  protected async guardar(): Promise<void> {
    this.guardando.set(true);
    this.errorForm.set('');
    try {
      const expira = new Date(Date.now() + Number(this.form.horas) * 3600000);
      const local = new Date(expira.getTime() - expira.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
      await this.api.post('/tokens-usuario/', {
        id_usuario: Number(this.form.id_usuario),
        tipo: this.form.tipo,
        token: crypto.randomUUID().replaceAll('-', ''),
        expira: local,
        usado: false
      });
      this.avisos.avisar(`Código de «${TIPOS[this.form.tipo]}» generado para ${this.nombre(Number(this.form.id_usuario))}`);
      this.modal.set(false);
      await this.cargar();
    } catch (e: any) {
      this.errorForm.set(e.message);
    } finally {
      this.guardando.set(false);
    }
  }

  protected textoConfirmar(): string {
    const o = this.objetivo();
    return `El código de ${o ? this.nombre(o.id_usuario) : ''} dejará de funcionar.`;
  }

  protected readonly revocar = async () => {
    await this.api.del(`/tokens-usuario/${this.objetivo().id_token}`);
    this.avisos.avisar('Código revocado: ya no se puede usar');
    await this.cargar();
  };
}
