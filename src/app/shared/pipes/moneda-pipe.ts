import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moneda'
})
export class MonedaPipe implements PipeTransform {
  transform(valor: number): string {
    return '$\u00a0' + Math.round(valor).toLocaleString('es-CO');
  }
}
