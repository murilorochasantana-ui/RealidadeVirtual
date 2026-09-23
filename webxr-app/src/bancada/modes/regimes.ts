// src/bancada/modes/regimes.ts
// ---------------------------------------------------------------------------
// Declaração dos três regimes — Passo 3 do Módulo 01.
//
// Os campos abaixo não foram inventados: cada um traduz uma célula da
// Seção 9 da especificação (a tabela "Na Tela / No Visor / Pela Câmera") em
// dado tipado. A Seção 9 já dizia, em prosa, como cada regime trata o mundo
// de quem observa — o que faltava era prender isso a um tipo que o
// compilador confere, em vez de deixar só no documento.
//
// Este arquivo não abre sessão, não renderiza e não detecta nada: declara.
// A confirmação contra o aparelho é feita em devices/sonda.ts
// (conferirComposicao), depois que houver sessão.
// ---------------------------------------------------------------------------

export type RegimeId = 'immersive-vr' | 'immersive-ar' | 'inline';

/**
 * O que o regime faz com o ambiente de quem observa — a distinção que separa
 * os três antes de qualquer detalhe técnico (Seção 9, linha "O que a cena
 * faz de diferente" / "O que não existe neste regime").
 */
export type TratamentoDoMundo =
  | 'substitui' // o ambiente sintético toma o lugar do ambiente real
  | 'preserva' // o ambiente real permanece visível e recebe o sintético sobre si
  | 'exibe'; // o ambiente sintético é mostrado por uma janela, sem tocar o real

export interface Regime {
  readonly id: RegimeId;
  readonly nome: string;
  /** O que este regime faz com o mundo de quem observa (Seção 9). */
  readonly tratamentoDoMundo: TratamentoDoMundo;
  /** Espaço de referência pretendido, no vocabulário da API XR. */
  readonly espacoDeReferencia: 'viewer' | 'local' | 'local-floor' | 'unbounded';
  /** O que o sistema rastreia neste regime, em uma frase (Seção 9, "Como se aponta e age"). */
  readonly rastreia: string;
  /** Contra o que a cena é registrada — a origem do mundo virtual (Seção 9, "Escala da cena" / "O que a cena faz de diferente"). */
  readonly registroContra: string;
  /** Modo de composição do fundo esperado da sessão XR. Só é confirmável com
   * sessão ativa — aqui é o valor ESPERADO, não o lido. */
  readonly composicaoEsperada: XREnvironmentBlendMode;
  /** Por que este regime existe no projeto, e não como enfeite comparativo. */
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
