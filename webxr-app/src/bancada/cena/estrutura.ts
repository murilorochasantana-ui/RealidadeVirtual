import * as THREE from 'three';

export function arvoreComoTexto(raiz: THREE.Object3D, profundidade = 0): string[] {
  const rotulo = raiz.name.length > 0 ? raiz.name : `(${raiz.type})`;
  const prefixo = profundidade === 0 ? '' : `${'  '.repeat(profundidade - 1)}└─ `;
  const linhas: string[] = [`${prefixo}${rotulo}`];
  for (const filho of raiz.children) {
    linhas.push(...arvoreComoTexto(filho, profundidade + 1));
  }
  return linhas;
}
