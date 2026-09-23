// src/bancada/cena/estrutura.ts
// ---------------------------------------------------------------------------
// Impressão da árvore de cena como texto.
//
// Existe porque a estrutura de parentesco (Passo 7) não aparece na imagem:
// uma cena com coordenadas absolutas e uma cena em árvore produzem a mesma
// tela. Isto é o que se lê para confirmar que o pai errado não foi escolhido
// e que o parentesco de projeto (Tom preso à Estante, por exemplo) existe de
// fato na hierarquia, e não só na posição visual.
// ---------------------------------------------------------------------------
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
