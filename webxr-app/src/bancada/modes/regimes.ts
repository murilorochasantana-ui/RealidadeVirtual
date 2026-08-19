export type RegimeId = 'immersive-vr' | 'immersive-ar' | 'inline';

export interface Regime {
  readonly id: RegimeId;
  readonly nome: string;
  readonly composicaoEsperada: XREnvironmentBlendMode;
  readonly descricao: string;
}

export const REGIMES: readonly Regime[] = [
  {
    id: 'immersive-ar',
    nome: 'AR imersiva',
    composicaoEsperada: 'additive',
    descricao: 'Sessão que mistura virtual e real, câmera passante ou display transparente.',
  },
  {
    id: 'immersive-vr',
    nome: 'VR imersiva',
    composicaoEsperada: 'opaque',
    descricao: 'Sessão que substitui o real, fundo opaco, sem câmera passante.',
  },
  {
    id: 'inline',
    nome: 'Inline (página)',
    composicaoEsperada: 'opaque',
    descricao: 'Sessão dentro da página, sem tomar o visor inteiro. Não exige gesto.',
  },
];
