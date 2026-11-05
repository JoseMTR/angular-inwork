// LOGIN: autenticación con JWT contra la API principal (POST /auth/login).
// Solo entran los roles del equipo de InWork: Administrador, Moderador y Analista.
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api';
import { AvisosService } from '../../../../core/services/avisos';
import { ROLES_PANEL, SesionService, tokenVencido } from '../../../../core/services/sesion';
import { CuentaDemo, RoleSelector } from '../../../../shared/components/role-selector/role-selector';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RoleSelector],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly sesion = inject(SesionService);
  private readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected correo = '';
  protected password = '';
  protected recordar = true;
  protected readonly verClave = signal(false);
  protected readonly rolDemo = signal('');
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly ayudaClave = signal(false);

  protected correoValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.correo.trim());
  }

  ngOnInit(): void {
    const actual = this.sesion.sesion();
    if (actual && !tokenVencido(actual.token) && ROLES_PANEL.includes(actual.id_rol)) {
      this.router.navigateByUrl('/inicio');
      return;
    }
    if (this.ruta.snapshot.queryParamMap.get('sesion') === 'expirada') {
      this.error.set('Tu sesión terminó o tu rol cambió. Inicia sesión de nuevo.');
    }
  }

  protected elegirDemo(rol: CuentaDemo): void {
    this.rolDemo.set(rol.nombre);
    this.correo = rol.correo;
    this.password = 'Inwork2026*';
    this.error.set('');
  }

  protected async entrar(): Promise<void> {
    this.error.set('');
    if (!this.correoValido()) {
      this.error.set('Escribe un correo válido.');
      return;
    }
    if (this.password.length < 8) {
      this.error.set('La contraseña tiene mínimo 8 caracteres.');
      return;
    }
    this.enviando.set(true);
    try {
      const respuesta = await this.api.iniciarSesion(this.correo.trim().toLowerCase(), this.password);
      if (!ROLES_PANEL.includes(respuesta.id_rol)) {
        this.error.set(`Tu cuenta es de ${respuesta.rol}. Este panel es solo para administradores, moderadores y analistas de InWork.`);
        return;
      }
      this.sesion.iniciar(respuesta, this.recordar);
      // Los módulos del menú salen de la tabla rol_modulo
      this.sesion.ponerModulos(await this.api.get('/auth/mis-modulos'));
      this.avisos.avisar(`Bienvenido, ${respuesta.nombre}`);
      this.router.navigateByUrl('/inicio');
    } catch (e: any) {
      this.sesion.cerrar();
      this.error.set(e.message);
    } finally {
      this.enviando.set(false);
    }
  }
}
