export type GrausDeLiberdade = '6DoF' | '3DoF' | 'indeterminado';

export type ClasseDeAparelho = 'visor' | 'celular' | 'desktop' | 'desconhecido';

export interface ParamsGraus {
  readonly concedidos: readonly string[];
  readonly modo: 'immersive-vr' | 'immersive-ar';
  readonly comPoseDePunho: boolean;
}

export function grausDeLiberdade(params: ParamsGraus): GrausDeLiberdade {
  const { concedidos, comPoseDePunho } = params;

  const espacos6DoF: readonly string[] = ['local-floor', 'bounded-floor', 'unbounded', 'local'];
  if (espacos6DoF.some((e) => concedidos.includes(e))) {
    return '6DoF';
  }

  if (comPoseDePunho) {
    return '6DoF';
  }

  if (concedidos.includes('viewer') && concedidos.length === 1) {
    return '3DoF';
  }

  return 'indeterminado';
}

export function classificarAparelho(
  modosSuportados: readonly string[],
  graus: GrausDeLiberdade | 'indeterminado',
  temApiXr: boolean,
): ClasseDeAparelho {
  if (!temApiXr) {
    return 'desktop';
  }

  const temVR = modosSuportados.includes('immersive-vr');
  const temAR = modosSuportados.includes('immersive-ar');

  if (temVR && graus === '6DoF') {
    return 'visor';
  }

  if (temAR && !temVR) {
    return 'celular';
  }

  if (temVR || temAR) {
    return 'visor';
  }

  if (temApiXr && !temVR && !temAR) {
    return 'desktop';
  }

  return 'desconhecido';
}
