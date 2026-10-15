import { Injectable, signal } from '@angular/core';
import { Pago } from '../../../core/models/pago';
import { Estadistica } from '../../../shared/interfaces/estadistica';
import { Barra, Segmento } from '../../../shared/interfaces/grafico';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private _resumen = signal<Estadistica[]>([
    { titulo: 'Total procesado', valor: '$ 512,4 M', variacion: '+10,2%', sube: true, icono: 'account_balance_wallet', color: 'morado', detalle: 'este mes' },
    { titulo: 'Comisión de la plataforma', valor: '$ 48,9 M', variacion: '+9,4%', sube: true, icono: 'percent', color: 'naranja', detalle: 'este mes' },
    { titulo: 'Dinero retenido', valor: '$ 18,7 M', variacion: '+3,1%', sube: true, icono: 'lock_clock', color: 'azul', detalle: 'en custodia hoy' },
    { titulo: 'Reembolsado', valor: '$ 3,2 M', variacion: '-12,0%', sube: true, icono: 'undo', color: 'verde', detalle: 'este mes' }
  ]);

  private _ingresosPorMes = signal<Barra[]>([
    { etiqueta: 'May', valor: 29 },
    { etiqueta: 'Jun', valor: 33 },
    { etiqueta: 'Jul', valor: 31 },
    { etiqueta: 'Ago', valor: 38 },
    { etiqueta: 'Sep', valor: 36 },
    { etiqueta: 'Oct', valor: 49 }
  ]);

  private _metodos = signal<Segmento[]>([
    { nombre: 'Nequi', valor: 4120, color: '#7a5af0' },
    { nombre: 'PSE', valor: 2310, color: '#2f7cf6' },
    { nombre: 'Tarjeta', valor: 1480, color: '#f2541b' },
    { nombre: 'Daviplata', valor: 890, color: '#e2464b' },
    { nombre: 'Efectivo', valor: 300, color: '#b6bcc8' }
  ]);

  private _pagos = signal<Pago[]>([
    { id_pago: 9001, referencia: 'PAG-1760449920-312', id_contratacion: 1042, monto: 140000, comision_plataforma: 14000, metodo_pago: 'nequi', estado_pago: 'retenido', fecha_pago: 'Hoy, 7:52 a. m.' },
    { id_pago: 9000, referencia: 'PAG-1760367501-118', id_contratacion: 1041, monto: 115000, comision_plataforma: 11500, metodo_pago: 'pse', estado_pago: 'liberado', fecha_pago: '11 oct, 6:10 p. m.' },
    { id_pago: 8999, referencia: 'PAG-1760281044-907', id_contratacion: 1040, monto: 180000, comision_plataforma: 18000, metodo_pago: 'tarjeta', estado_pago: 'liberado', fecha_pago: '10 oct, 7:22 p. m.' },
    { id_pago: 8998, referencia: 'PAG-1760190036-455', id_contratacion: 1039, monto: 200000, comision_plataforma: 0, metodo_pago: 'daviplata', estado_pago: 'reembolsado', fecha_pago: '9 oct, 2:30 p. m.' },
    { id_pago: 8997, referencia: 'PAG-1760104487-020', id_contratacion: 1038, monto: 360000, comision_plataforma: 36000, metodo_pago: 'pse', estado_pago: 'fallido', fecha_pago: '8 oct, 8:15 a. m.' },
    { id_pago: 8996, referencia: 'PAG-1760018802-771', id_contratacion: 1037, monto: 95000, comision_plataforma: 9500, metodo_pago: 'efectivo', estado_pago: 'pendiente', fecha_pago: '7 oct, 5:00 p. m.' }
  ]);

  readonly resumen = this._resumen.asReadonly();
  readonly ingresosPorMes = this._ingresosPorMes.asReadonly();
  readonly metodos = this._metodos.asReadonly();
  readonly pagos = this._pagos.asReadonly();
}
