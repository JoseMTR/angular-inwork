// HTML de las celdas de las DataTables.
// Usa las mismas clases que los componentes Avatar y StatusPill para que se vean iguales.
import { escapar, iniciales, tonoAvatar, tonoEstado, textoEstado, moneda } from './formato';

export function avatar(nombre: string, tamano = 'chico'): string {
  return `<span class="avatar avatar-${tamano} avatar-${tonoAvatar(nombre)}">${escapar(iniciales(nombre))}</span>`;
}

export function persona(nombre: string, detalle: any = '', tamano = 'chico'): string {
  return `<div class="celda-persona">${avatar(nombre, tamano)}<div><strong>${escapar(nombre)}</strong>${
    detalle ? `<small>${escapar(detalle)}</small>` : ''
  }</div></div>`;
}

export function pill(estado: any, texto?: string): string {
  return `<span class="pill pill-${tonoEstado(estado)}">${escapar(texto ?? textoEstado(estado))}</span>`;
}

export function chip(texto: any, icono = ''): string {
  return `<span class="chip">${icono ? `<span class="material-symbols-rounded">${icono}</span>` : ''}${escapar(texto)}</span>`;
}

export function estrellas(puntos: number): string {
  let html = `<span class="estrellas" aria-label="${puntos} de 5 estrellas">`;
  for (let i = 1; i <= 5; i++) {
    html += `<span class="material-symbols-rounded${i > puntos ? ' apagada' : ''}">star</span>`;
  }
  return html + '</span>';
}

export function notaEstrella(valor: any): string {
  if (!Number(valor)) return '<span class="texto-3">Sin reseñas</span>';
  return `<span class="nota-estrella"><span class="material-symbols-rounded">star</span>${Number(valor).toFixed(1)}</span>`;
}

export function titulo(texto: any, detalle: any = ''): string {
  return `<strong class="bloque-texto">${escapar(texto)}</strong>${detalle ? `<small class="texto-3">${escapar(detalle)}</small>` : ''}`;
}

export function dinero(valor: any): string {
  return `<span class="numero fuerte">${moneda(valor)}</span>`;
}

export function suave(texto: any, clase = 'texto-2'): string {
  return `<span class="${clase}">${escapar(texto)}</span>`;
}

export function recortado(texto: any): string {
  return `<span class="recortar texto-2" title="${escapar(texto)}">${escapar(texto)}</span>`;
}

export function codigo(texto: any): string {
  return `<code class="codigo">${escapar(texto)}</code>`;
}
