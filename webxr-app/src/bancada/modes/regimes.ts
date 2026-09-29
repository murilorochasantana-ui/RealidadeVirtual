export type RegimeId = 'immersive-vr' | 'immersive-ar' | 'inline';

export type TratamentoDoMundo =
  | 'substitui'
  | 'preserva'
  | 'exibe';

export interface Regime {
  readonly id: RegimeId;
  readonly nome: string;

  readonly tratamentoDoMundo: TratamentoDoMundo;

  readonly espacoDeReferencia: 'viewer' | 'local' | 'local-floor' | 'unbounded';

  readonly rastreia: string;

  readonly registroContra: string;

  readonly composicaoEsperada: XREnvironmentBlendMode;

  readonly papel: string;
  readonly descricao: string;
}

export const REGIMES: readonly Regime[] = [
  {
    id: 'inline',
    nome: 'Na tela (não imersivo)',
    tratamentoDoMundo: 'exibe',
    espacoDeReferencia: 'viewer',
    rastreia: 'nada do corpo; a câmera obedece ao mouse/toque (órbita)',
    registroContra:
      'a origem arbitrária da própria cena — a bateria é vista de fora, reduzida, ' +
      'como uma maquete (Seção 9, "Escala da cena")',
    composicaoEsperada: 'opaque',
    papel:
      'É o caso base, o único que não exige headset nem câmera: a bateria inteira ' +
      'precisa ser tocável aqui.',
    descricao: 'Sessão dentro da página, sem tomar o visor inteiro. Não exige gesto.',
  },
  {
    id: 'immersive-vr',
    nome: 'No visor (imersivo)',
    tratamentoDoMundo: 'substitui',
    espacoDeReferencia: 'local-floor',
    rastreia: 'a pose da cabeça e a das mãos/controles, com seis graus de liberdade',
    registroContra:
      'o chão do espaço físico onde a pessoa está — é isso que faz a bateria nascer ' +
      'em tamanho real, com a pessoa dentro da cena, em vez de flutuar (Seção 9)',
    composicaoEsperada: 'opaque',
    papel:
      'É onde a pessoa passa a estar dentro da cena, em tamanho real: o cômodo dela ' +
      'não existe mais, tudo foi substituído (Seção 9, "O que não existe neste regime").',
    descricao: 'Sessão que substitui o real, fundo opaco, sem câmera passante.',
  },
  {
    id: 'immersive-ar',
    nome: 'Pela câmera (realidade aumentada)',
    tratamentoDoMundo: 'preserva',
    espacoDeReferencia: 'local-floor',
    rastreia:
      'a pose da cabeça, a mão ou o dispositivo apontado, e a superfície real onde ' +
      'a bateria foi ancorada',
    registroContra:
      'uma superfície real (chão ou mesa) escolhida no ambiente, à qual a bateria ' +
      'permanece presa enquanto a pessoa anda pelo cômodo (Seção 9)',
    composicaoEsperada: 'alpha-blend',
    papel:
      'É o único regime em que a bateria convive com o cômodo real: erro de ' +
      'ancoragem é visível a olho nu, sem precisar de instrumento para notar.',
    descricao: 'Sessão que mistura virtual e real, câmera passante ou display transparente.',
  },
];
