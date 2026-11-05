import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api';

// Pie de página con el estado de las dos APIs (se revisa cada minuto)
@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  protected readonly anio = new Date().getFullYear();
  protected readonly estado = signal<{ principal: boolean | null; pagos: boolean | null }>({ principal: null, pagos: null });
  private intervalo: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.revisar();
    this.intervalo = setInterval(() => this.revisar(), 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  private async revisar(): Promise<void> {
    this.estado.set(await this.api.estadoApis());
  }

  protected clase(valor: boolean | null): string {
    return valor === null ? 'revisando' : valor ? 'en-linea' : 'caida';
  }
}
