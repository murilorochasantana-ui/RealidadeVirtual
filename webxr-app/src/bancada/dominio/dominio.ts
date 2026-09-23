// src/bancada/dominio/dominio.ts
// ---------------------------------------------------------------------------
// Delimitação do domínio da cena: Bateria Acústica.
//
// Este arquivo é o Passo 2 do Módulo 01 escrito como dado tipado, e não só
// como texto em docs/especificacao.md (Bloco A, Seções 2-3). O motivo é o
// mesmo do material: uma declaração guardada só em documento não se
// confronta com nada quando a cena existir de fato; aqui ela é tipada, e o
// compilador cobra consistência antes de qualquer execução (ver
// inconsistenciasDoDominio, abaixo).
//
// Cada peça listada reproduz uma linha da Seção 3 da especificação — nenhum
// objeto foi inventado aqui. `exigeAncoragem` é a tradução em dado do que a
// Seção 6 chama de "conexões obrigatórias de ancoragem": é o campo que a
// Tarefa 2 (verificação do estado final) vai consultar.
// ---------------------------------------------------------------------------

/** Identificador de um tipo de peça da bateria. Um tipo pode ter mais de uma
 * instância na cena (ex.: 4 pratos) — a contagem está em `quantidade`. */
export type PecaId =
  | 'baqueta'
  | 'bumbo'
  | 'caixa'
  | 'tom'
  | 'prato'
  | 'estante'
  | 'pedal'
  | 'bancada';

/**
 * Uma peça (ou grupo de instâncias do mesmo tipo) do domínio.
 * `move` e `exigeAncoragem` não são a mesma pergunta: a baqueta move e nunca
 * ancora; a estante nunca move e nunca ancora (é ela quem recebe); as demais
 * peças da bateria não movem por si, mas precisam ser ancoradas antes de
 * fazer parte do conjunto montado.
 */
export interface Peca {
  readonly id: PecaId;
  readonly nome: string;
  /** Quantas instâncias desse tipo existem na cena (Seção 3, coluna "Quantos"). */
  readonly quantidade: number;
  /** Se a pessoa move a peça durante o uso (Seção 3, coluna "Move"). */
  readonly move: boolean;
  /** Se a peça precisa ser ancorada a uma estante antes de valer como montada
   * (Seção 5, ação "Encaixar Peças"; Seção 6, "conexões obrigatórias"). */
  readonly exigeAncoragem: boolean;
  readonly observacao: string;
}

/**
 * A tarefa que o ambiente suporta, enunciada em uma frase, mais o estado que
 * a caracteriza concluída (Seção 6). Os dois campos andam juntos de
 * propósito: tarefa sem estado final é intenção, e intenção produz cena
 * bonita e vazia.
 */
export interface TarefaDoAmbiente {
  readonly enunciado: string;
  readonly estadoFinal: string;
}

export interface Dominio {
  readonly nome: string;
  readonly descricao: string;
  readonly tarefa: TarefaDoAmbiente;
  readonly pecas: readonly Peca[];
}

export const BATERIA: Dominio = {
  nome: 'Bateria Acústica',
  descricao:
    'Um ambiente com liberdade para expressar e experimentar: a pessoa chega, ' +
    'vê a bateria, se posiciona e interage com o instrumento (Especificação, Seções 1-2).',
  tarefa: {
    enunciado:
      'Montar o conjunto da bateria ancorando cada peça na estante correspondente, ' +
      'em ordem livre, e então tocar cada peça para produzir seu som (Seções 5-6).',
    estadoFinal:
      'Todas as conexões obrigatórias de ancoragem foram feitas — a ordem é livre, ' +
      'mas nenhuma peça marcada como exigeAncoragem pode ficar solta — e, a partir ' +
      'daí, cada peça responde ao toque com o som correspondente (Seção 6).',
  },
  pecas: [
    {
      id: 'baqueta',
      nome: 'Baqueta',
      quantidade: 2,
      move: true,
      exigeAncoragem: false,
      observacao: 'Usada para ativar o som; não se encaixa em suporte algum.',
    },
    {
      id: 'bumbo',
      nome: 'Bumbo',
      quantidade: 1,
      move: false,
      exigeAncoragem: true,
      observacao: 'Parte da bateria.',
    },
    {
      id: 'caixa',
      nome: 'Caixa',
      quantidade: 1,
      move: false,
      exigeAncoragem: true,
      observacao: 'Parte da bateria.',
    },
    {
      id: 'tom',
      nome: 'Tom',
      quantidade: 3,
      move: false,
      exigeAncoragem: true,
      observacao: 'Parte da bateria.',
    },
    {
      id: 'prato',
      nome: 'Prato',
      quantidade: 4,
      move: false,
      exigeAncoragem: true,
      observacao: 'Parte da bateria.',
    },
    {
      id: 'estante',
      nome: 'Estante',
      quantidade: 4,
      move: false,
      exigeAncoragem: false,
      observacao: 'Suporte fixo — recebe outras peças, não é ancorada em nada.',
    },
    {
      id: 'pedal',
      nome: 'Pedal',
      quantidade: 1,
      move: false,
      exigeAncoragem: true,
      observacao: 'Parte da bateria.',
    },
    {
      id: 'bancada',
      nome: 'Bancada',
      quantidade: 1,
      move: false,
      exigeAncoragem: false,
      observacao: 'Apoio fixo da cena.',
    },
  ],
};

/** Soma as instâncias de todas as peças — o inventário total da cena. */
export function totalDeInstancias(dominio: Dominio): number {
  return dominio.pecas.reduce((soma, peca) => soma + peca.quantidade, 0);
}

/**
 * Confere que a tarefa está enunciada, que tem estado final, que nenhuma
 * peça foi declarada com quantidade zero e que existe ao menos uma peça que
 * exige ancoragem — sem isso a tarefa de montagem não teria o que verificar.
 * Devolve a lista de inconsistências, vazia quando o domínio fecha.
 *
 * Por que isto é código e não conferência a olho: o domínio vai ser editado
 * ao longo do percurso (novas peças, ajuste de escala), e uma peça com
 * quantidade zero ou uma tarefa sem estado final sobrevive a qualquer
 * releitura distraída.
 */
export function inconsistenciasDoDominio(dominio: Dominio): string[] {
  const problemas: string[] = [];

  if (dominio.tarefa.enunciado.trim().length === 0) {
    problemas.push('A tarefa não tem enunciado.');
  }
  if (dominio.tarefa.estadoFinal.trim().length === 0) {
    problemas.push('A tarefa não declara estado final.');
  }
  for (const peca of dominio.pecas) {
    if (peca.quantidade <= 0) {
      problemas.push(`A peça "${peca.nome}" está declarada com quantidade zero.`);
    }
  }
  if (!dominio.pecas.some((peca) => peca.exigeAncoragem)) {
    problemas.push(
      'Nenhuma peça exige ancoragem — a tarefa de montagem não teria o que verificar.',
    );
  }

  return problemas;
}
