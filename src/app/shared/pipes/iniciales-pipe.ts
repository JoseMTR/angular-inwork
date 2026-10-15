import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iniciales'
})
export class InicialesPipe implements PipeTransform {
  transform(nombre: string): string {
    const partes = nombre.trim().split(' ').filter((parte) => parte.length > 0);
    const primera = partes.length > 0 ? partes[0].charAt(0) : '';
    const segunda = partes.length > 1 ? partes[1].charAt(0) : '';
    return (primera + segunda).toUpperCase();
  }
}
